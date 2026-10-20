import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/os/random';
import type { HighScore } from '@/os/store/games';
import { henContains, moveHen, spawnHen, type Hen } from './hens';
import {
  DEPTH,
  MAX_CAM,
  ROUND_SECONDS,
  SCARECROW,
  SHELLS,
  VIEW_W,
  WINDMILL,
  layerWidth,
  toScreenX,
  type Depth,
} from './layout';
import {
  STEP,
  createGame,
  drainEvents,
  hitTest,
  panBy,
  qualifies,
  reload,
  setPointer,
  setTouch,
  shoot,
  step,
  type Game,
} from './sim';

/** A quiet game: no spawns, no golden hen, no window hen unless a test asks. */
function quiet(seed = 1): Game {
  const g = createGame(seed);
  g.spawnIn = Infinity;
  g.goldenDone = true;
  g.windowHen.nextIn = Infinity;
  return g;
}

/** Places a hovering hen at screen point (sx, sy) on `depth`. */
function place(g: Game, depth: Depth, sx: number, sy: number, golden = false) {
  const hen: Hen = {
    ...spawnHen(mulberry32(9), g.nextId++, depth, 0, golden),
    x: sx + g.camX * DEPTH[depth].parallax,
    y: sy,
    baseY: sy,
    landX: null,
  };
  g.hens.push(hen);
  return hen;
}

function run(g: Game, seconds: number) {
  for (let t = 0; t < seconds; t += STEP) step(g, STEP);
}

/** Screen position of the scarecrow's hat. */
const hatScreen = (g: Game) => ({
  x: toScreenX(SCARECROW.hat.x, 'mid', g.camX),
  y: SCARECROW.hat.y,
});

describe('Hen Hunt simulation', () => {
  it('starts a 90 s round with 8 shells and nothing scored', () => {
    const g = createGame(42);
    expect(g).toMatchObject({ time: 90, shells: SHELLS, score: 0 });
    expect(SHELLS).toBe(8);
    expect(g.over).toBe(false);
  });

  it('is deterministic for a seed', () => {
    const a = createGame(7);
    const b = createGame(7);
    run(a, 20);
    run(b, 20);
    expect(a.hens.map((h) => [h.depth, h.x, h.y])).toEqual(
      b.hens.map((h) => [h.depth, h.x, h.y]),
    );
    expect(a.hens.length).toBeGreaterThan(0);
  });

  it('spawns hens at all three depths and some land to peck', () => {
    const g = createGame(3);
    const seen = new Set<string>();
    let pecked = false;
    for (let t = 0; t < 60; t += STEP) {
      step(g, STEP);
      for (const h of g.hens) {
        seen.add(h.depth);
        if (h.state === 'peck') {
          pecked = true;
          expect(h.y).toBe(DEPTH[h.depth].groundY);
        }
      }
    }
    expect([...seen].sort()).toEqual(['far', 'mid', 'near']);
    expect(pecked).toBe(true);
    expect(g.hens.filter((h) => h.state !== 'fall').length).toBeLessThanOrEqual(
      9,
    );
  });

  it('flies near hens faster than far ones', () => {
    expect(DEPTH.near.speed).toBeGreaterThan(DEPTH.mid.speed);
    expect(DEPTH.mid.speed).toBeGreaterThan(DEPTH.far.speed);
    expect(DEPTH.near.radius).toBeGreaterThan(DEPTH.far.radius);
  });

  it('scores by depth: far 25, mid 10, near 5', () => {
    const g = quiet();
    place(g, 'far', 100, 100);
    place(g, 'mid', 300, 100);
    place(g, 'near', 500, 120);
    expect(shoot(g, 100, 100)).toBe('hen');
    expect(g.score).toBe(25);
    expect(shoot(g, 300, 100)).toBe('hen');
    expect(g.score).toBe(35);
    expect(shoot(g, 500, 120)).toBe('hen');
    expect(g.score).toBe(40);
    expect(g.hits).toBe(3);
  });

  it('hits only the topmost target where hens overlap', () => {
    const g = quiet();
    const far = place(g, 'far', 200, 150);
    const near = place(g, 'near', 200, 150);
    expect(hitTest(g, 200, 150)).toEqual({ kind: 'hen', hen: near });
    shoot(g, 200, 150);
    expect(near.state).toBe('fall');
    expect(far.state).toBe('fly');
    expect(g.score).toBe(5);
  });

  it('makes a hit hen tumble with a feather burst; it cannot be hit twice', () => {
    const g = quiet();
    const hen = place(g, 'mid', 400, 200);
    shoot(g, 400, 200);
    expect(hen.state).toBe('fall');
    expect(g.feathers.length).toBeGreaterThan(5);
    expect(shoot(g, 400, 200)).toBe('miss');
    run(g, 3);
    expect(g.hens).not.toContain(hen);
    expect(g.feathers).toHaveLength(0);
  });

  it('misses empty sky but still spends a shell', () => {
    const g = quiet();
    expect(shoot(g, 400, 40)).toBe('miss');
    expect(g.shells).toBe(SHELLS - 1);
    expect(g.shots).toBe(1);
  });

  it('runs dry after 8 shots and clicks empty until reloaded', () => {
    const g = quiet();
    for (let i = 0; i < 8; i++) shoot(g, 400, 40);
    drainEvents(g);
    expect(g.shells).toBe(0);
    expect(shoot(g, 400, 40)).toBe('empty');
    expect(drainEvents(g)).toEqual([{ type: 'empty' }]);
    expect(g.shots).toBe(8);
  });

  it('reloads all shells in 1 s and cannot shoot meanwhile', () => {
    const g = quiet();
    shoot(g, 400, 40);
    expect(reload(g)).toBe(true);
    expect(reload(g)).toBe(false);
    expect(shoot(g, 400, 40)).toBe('empty');
    run(g, 0.5);
    expect(g.shells).toBe(0);
    run(g, 0.55);
    expect(g.shells).toBe(SHELLS);
    expect(drainEvents(g).map((e) => e.type)).toEqual([
      'shot',
      'reload',
      'empty',
      'reloaded',
    ]);
  });

  it('does not reload a full gun', () => {
    expect(reload(quiet())).toBe(false);
  });

  it('flies one fast golden hen per round worth 100', () => {
    const g = createGame(11);
    const at = g.goldenAt;
    expect(at).toBeGreaterThanOrEqual(15);
    expect(at).toBeLessThanOrEqual(70);
    run(g, at + 0.1);
    const golden = g.hens.filter((h) => h.golden);
    expect(golden).toHaveLength(1);
    expect(Math.abs(golden[0]!.vx)).toBeGreaterThan(DEPTH.near.speed);
    run(g, 20);
    expect(g.hens.filter((h) => h.golden).length).toBeLessThanOrEqual(1);

    const q = quiet();
    place(q, 'mid', 300, 120, true);
    expect(shoot(q, 300, 120)).toBe('golden');
    expect(q.score).toBe(100);
  });

  it('peeks a hen from the windmill window now and then, worth 50', () => {
    const g = quiet();
    g.windowHen.nextIn = 1;
    const win = {
      x: toScreenX(WINDMILL.window.x, 'far', g.camX),
      y: WINDMILL.window.y,
    };
    expect(hitTest(g, win.x, win.y)).toBeNull();
    run(g, 1.1);
    expect(g.windowHen.showing).toBeGreaterThan(0);
    expect(shoot(g, win.x, win.y)).toBe('window');
    expect(g.score).toBe(50);
    expect(g.windowHen.showing).toBe(0);
    expect(g.windowHen.nextIn).toBeGreaterThan(5);
  });

  it('hides the window hen again if it is not shot', () => {
    const g = quiet();
    g.windowHen.nextIn = 0.1;
    run(g, 3);
    expect(g.windowHen.showing).toBe(0);
  });

  it("costs 25 for the scarecrow's hat, never going below 0", () => {
    const g = quiet();
    g.score = 40;
    const hat = hatScreen(g);
    expect(shoot(g, hat.x, hat.y)).toBe('hat');
    expect(g.score).toBe(15);
    // The hat is gone for a while.
    expect(shoot(g, hat.x, hat.y)).toBe('miss');
    run(g, 3.1);
    expect(shoot(g, hat.x, hat.y)).toBe('hat');
    expect(g.score).toBe(0);
  });

  it('pans when the pointer nears an edge, clamped to the world', () => {
    const g = quiet();
    const start = g.camX;
    setPointer(g, 400, 200);
    run(g, 1);
    expect(g.camX).toBe(start);
    setPointer(g, VIEW_W - 2, 200);
    run(g, 0.2);
    expect(g.camX).toBeGreaterThan(start);
    run(g, 5);
    expect(g.camX).toBe(MAX_CAM);
    setPointer(g, 0, 200);
    run(g, 5);
    expect(g.camX).toBe(0);
    setPointer(g, null);
    run(g, 1);
    expect(g.camX).toBe(0);
  });

  it('drags the view by touch, and a finger never edge-pans (v0.6)', () => {
    const g = quiet();
    const start = g.camX;
    setTouch(g, true);
    setPointer(g, VIEW_W - 2, 200);
    run(g, 1);
    expect(g.camX).toBe(start);
    panBy(g, 120);
    expect(g.camX).toBe(start + 120);
    panBy(g, 99999);
    expect(g.camX).toBe(MAX_CAM);
    panBy(g, -99999);
    expect(g.camX).toBe(0);
    setTouch(g, false);
    run(g, 0.2);
    expect(g.camX).toBeGreaterThan(0);
  });

  it('hit-tests through parallax: a panned layer moves less than the near one', () => {
    const g = quiet();
    g.camX = 0;
    const hen = place(g, 'far', 300, 150);
    g.camX = 400;
    const sx = toScreenX(hen.x, 'far', g.camX);
    expect(sx).toBeCloseTo(300 - 400 * DEPTH.far.parallax);
    expect(hitTest(g, sx, 150)).toMatchObject({ kind: 'hen', hen });
    expect(hitTest(g, 300, 150)).toBeNull();
  });

  it('makes the world twice the view and gives each layer its own width', () => {
    expect(layerWidth('near')).toBe(VIEW_W * 2);
    expect(layerWidth('far')).toBeLessThan(layerWidth('mid'));
  });

  it('sounds the last-10-seconds alarm once and ends after 90 s', () => {
    const g = quiet();
    const seen: string[] = [];
    for (let t = 0; t < ROUND_SECONDS + 1; t += STEP) {
      step(g, STEP);
      seen.push(...drainEvents(g).map((e) => e.type));
    }
    expect(seen.filter((e) => e === 'lastTen')).toHaveLength(1);
    expect(seen.filter((e) => e === 'over')).toHaveLength(1);
    expect(g.over).toBe(true);
    expect(g.time).toBe(0);
    expect(shoot(g, 400, 40)).toBe('over');
    expect(reload(g)).toBe(false);
  });

  it('reports the final score with the over event', () => {
    const g = quiet();
    place(g, 'far', 100, 100);
    shoot(g, 100, 100);
    g.time = STEP / 2;
    drainEvents(g);
    step(g, STEP);
    expect(drainEvents(g)).toContainEqual({ type: 'over', score: 25 });
  });

  it('runs a slower game at a reduced pace', () => {
    const rand = mulberry32(1);
    const a: Hen = { ...spawnHen(rand, 1, 'mid', 0), landX: null };
    const b: Hen = { ...a };
    moveHen(a, 1, 1, rand);
    moveHen(b, 1, 0.6, rand);
    const start = a.x - a.vx;
    expect(Math.abs(b.x - start)).toBeCloseTo(Math.abs(a.x - start) * 0.6);
  });

  it('never runs the clock in attract mode', () => {
    const g = createGame(5, { attract: true });
    run(g, 100);
    expect(g.time).toBe(ROUND_SECONDS);
    expect(g.over).toBe(false);
    expect(g.hens.some((h) => h.golden)).toBe(false);
    expect(shoot(g, 10, 10)).toBe('over');
  });

  it("covers a hen's body and head but not the air around it", () => {
    const hen = spawnHen(mulberry32(2), 1, 'near', 0);
    const r = DEPTH.near.radius;
    expect(henContains(hen, hen.x, hen.y)).toBe(true);
    const dir = Math.sign(hen.vx);
    expect(henContains(hen, hen.x + dir * r * 0.9, hen.y - r * 0.6)).toBe(true);
    expect(henContains(hen, hen.x, hen.y + r * 1.5)).toBe(false);
  });
});

describe('qualifies', () => {
  const table = (n: number, low = 10): HighScore[] =>
    Array.from({ length: n }, (_, i) => ({
      name: 'x',
      score: low + (n - i) * 10,
      date: '2007-01-01',
    }));

  it('accepts any positive score while the table has room', () => {
    expect(qualifies([], 5)).toBe(true);
    expect(qualifies(table(9), 1)).toBe(true);
    expect(qualifies([], 0)).toBe(false);
  });

  it('needs to beat the 10th place on a full table', () => {
    const full = table(10);
    const last = full[9]!.score;
    expect(qualifies(full, last)).toBe(false);
    expect(qualifies(full, last + 1)).toBe(true);
  });
});
