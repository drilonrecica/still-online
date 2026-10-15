import { describe, expect, it } from 'vitest';
import type { HighScore } from '@/os/store/games';
import {
  BALL_SAVE_SECONDS,
  DRAIN_PAUSE,
  MAX_WARNINGS,
  POINTS,
  RANKS,
  STEP,
  TARGET_RESET,
  WARNING_DECAY,
  createGame,
  drainEvents,
  nudge,
  onPlunger,
  qualifies,
  rankUp,
  setFlipper,
  setPlunger,
  step,
  type Game,
  type GameEvent,
} from './sim';
import {
  BUMPERS,
  DRAIN_Y,
  LAUNCH_MAX,
  ROLLOVER_X,
  TARGETS,
  TARGET_X,
} from './table';

function run(g: Game, seconds: number): GameEvent[] {
  const out: GameEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += STEP) {
    step(g);
    out.push(...drainEvents(g));
  }
  return out;
}
const types = (evs: GameEvent[]) => evs.map((e) => e.type);

/** Starts a game and launches the first ball. */
function launched(seed = 1): Game {
  const g = createGame(seed);
  setPlunger(g, true);
  run(g, 1);
  setPlunger(g, false);
  drainEvents(g);
  return g;
}

/** Puts the ball at a spot with a velocity, as if it got there in play. */
function place(g: Game, x: number, y: number, vx = 0, vy = 0) {
  g.ball = { x, y, vx, vy };
}

describe('Star Pinball game', () => {
  it('serves ball 1 of 3 on the plunger', () => {
    const g = createGame(1);
    expect(g.ballNo).toBe(1);
    expect(onPlunger(g)).toBe(true);
    run(g, 2);
    expect(onPlunger(g)).toBe(true);
  });

  it('pulls the plunger while held and launches on release', () => {
    const g = createGame(1);
    setPlunger(g, true);
    run(g, 0.5);
    expect(g.plunger.pull).toBeCloseTo(0.5, 1);
    run(g, 1);
    expect(g.plunger.pull).toBe(1);
    setPlunger(g, false);
    expect(types(drainEvents(g))).toEqual(['launch']);
    expect(g.ball!.vy).toBe(-LAUNCH_MAX);
    expect(g.plunger.pull).toBe(0);
    // A full pull sends the ball round the arch into the top of the table.
    let top = Infinity;
    for (let t = 0; t < 1.5; t += STEP) {
      step(g);
      top = Math.min(top, g.ball!.y);
    }
    expect(top).toBeLessThan(60);
    expect(g.ball!.x).toBeLessThan(400);
  });

  it('saves a ball that drains within 5 s of the launch, once', () => {
    const g = launched();
    place(g, 200, DRAIN_Y + 1, 0, 300);
    expect(types(run(g, STEP))).toEqual(['saved']);
    expect(g.ballNo).toBe(1);
    expect(onPlunger(g) || g.ball!.x > 400).toBe(true);
    setPlunger(g, true);
    run(g, 0.2);
    setPlunger(g, false);
    drainEvents(g);
    place(g, 200, DRAIN_Y + 1, 0, 300);
    expect(types(run(g, STEP))).toEqual(['drain']);
  });

  it('does not save a ball after the save time', () => {
    const g = launched();
    run(g, BALL_SAVE_SECONDS + 0.1);
    place(g, 200, DRAIN_Y + 1, 0, 300);
    expect(types(run(g, STEP))).toContain('drain');
    expect(g.ball).toBeNull();
  });

  it('plays three balls, then ends with the score', () => {
    const g = launched();
    g.score = 1234;
    for (let n = 1; n <= 3; n++) {
      expect(g.ballNo).toBe(n);
      g.saveUsed = true;
      place(g, 200, DRAIN_Y + 1, 0, 300);
      const evs = run(g, DRAIN_PAUSE + 0.1);
      expect(types(evs)[0]).toBe('drain');
      if (n < 3) expect(onPlunger(g)).toBe(true);
      else expect(evs).toContainEqual({ type: 'over', score: 1234 });
    }
    expect(g.over).toBe(true);
    expect(g.ball).toBeNull();
  });

  it('scores pop bumpers and lights them', () => {
    const g = launched();
    const b = BUMPERS[0]!;
    place(g, b.x, b.y - 50, 0, 200);
    const evs = run(g, 0.2);
    expect(evs).toContainEqual({ type: 'bumper', index: 0 });
    expect(g.score).toBeGreaterThanOrEqual(POINTS.bumper);
    expect(g.score % POINTS.bumper).toBe(0);
  });

  it('lights rollovers; all three give a 2× multiplier', () => {
    const g = launched();
    for (const [i, x] of ROLLOVER_X.entries()) {
      place(g, x, 60, 0, 150);
      expect(run(g, 0.2)).toContainEqual({ type: 'rollover', index: i });
      if (i < 2) expect(g.lanes[i]).toBe(true);
    }
    expect(g.multiplier).toBe(2);
    expect(g.lanes).toEqual([false, false, false]);
    expect(g.score).toBe(3 * POINTS.rollover + POINTS.lanesComplete);
    // Everything scores double now.
    const before = g.score;
    const b = BUMPERS[2]!;
    place(g, b.x, b.y - 50, 0, 200);
    run(g, 0.2);
    expect(g.score - before).toBeGreaterThan(0);
    expect((g.score - before) % (2 * POINTS.bumper)).toBe(0);
  });

  it('shifts the lit rollovers with the flippers (lane change)', () => {
    const g = launched();
    g.lanes = [true, false, false];
    setFlipper(g, 'right', true);
    expect(g.lanes).toEqual([false, true, false]);
    setFlipper(g, 'right', false);
    setFlipper(g, 'left', true);
    expect(g.lanes).toEqual([true, false, false]);
  });

  it('drops S-T-A-R targets; the full bank ranks up and resets', () => {
    const g = launched();
    for (const [i, t] of TARGETS.entries()) {
      place(g, TARGET_X - 40, (t.y0 + t.y1) / 2, 500, 0);
      expect(run(g, 0.15)).toContainEqual({ type: 'target', index: i });
      expect(g.colliders.find((c) => c.id === `target:${i}`)?.enabled).toBe(
        false,
      );
    }
    expect(g.rank).toBe(1);
    expect(RANKS[g.rank]).toBe('Ensign');
    expect(g.score).toBe(4 * POINTS.target + POINTS.rankUp);
    place(g, 200, 200);
    run(g, TARGET_RESET + 0.1);
    expect(g.targets).toEqual([false, false, false, false]);
    expect(
      g.colliders
        .filter((c) => c.id.startsWith('target:'))
        .every((c) => c.enabled),
    ).toBe(true);
  });

  it('ranks Cadet → Ensign → Lieutenant → Captain → Admiral, then pays a bonus', () => {
    const g = createGame(1);
    expect(RANKS[g.rank]).toBe('Cadet');
    const seen = [];
    for (let i = 0; i < 4; i++) {
      rankUp(g);
      seen.push(RANKS[g.rank]);
    }
    expect(seen).toEqual(['Ensign', 'Lieutenant', 'Captain', 'Admiral']);
    expect(g.score).toBe(POINTS.rankUp * (1 + 2 + 3 + 4));
    rankUp(g);
    expect(RANKS[g.rank]).toBe('Admiral');
    expect(g.score).toBe(POINTS.rankUp * 10 + POINTS.admiralBank);
  });

  it('scores the ramp only on the way up', () => {
    const g = launched();
    place(g, 34, 320, 0, -900);
    expect(types(run(g, 0.3))).toContain('ramp');
    expect(g.score).toBe(POINTS.ramp);
    const g2 = launched();
    place(g2, 34, 180, 0, 100);
    expect(types(run(g2, 0.3))).not.toContain('ramp');
  });

  it('warns on nudges and tilts on one too many', () => {
    const g = launched();
    place(g, 200, 300);
    for (let i = 1; i <= MAX_WARNINGS; i++) {
      nudge(g);
      expect(drainEvents(g)).toEqual([{ type: 'warning', count: i }]);
    }
    expect(g.ball!.vy).toBeLessThan(0);
    nudge(g);
    expect(types(drainEvents(g))).toEqual(['tilt']);
    expect(g.tilted).toBe(true);
    // Tilted: dead flippers, no scoring, no ball save.
    setFlipper(g, 'left', true);
    expect(g.flippers[0].pressed).toBe(false);
    const b = BUMPERS[0]!;
    place(g, b.x, b.y - 50, 0, 200);
    run(g, 0.2);
    expect(g.score).toBe(0);
    place(g, 200, DRAIN_Y + 1, 0, 300);
    expect(types(run(g, STEP))).toEqual(['drain']);
    // The next ball is no longer tilted.
    run(g, DRAIN_PAUSE + 0.1);
    expect(g.tilted).toBe(false);
    expect(g.ballNo).toBe(2);
  });

  it('lets warnings wear off over time', () => {
    const g = launched();
    place(g, 200, 300);
    nudge(g);
    nudge(g);
    g.ball = { x: 200, y: 300, vx: 0, vy: 0 };
    g.warnTimer = WARNING_DECAY;
    for (let t = 0; t < WARNING_DECAY + 0.1; t += STEP) {
      step(g);
      g.ball = { x: 200, y: 300, vx: 0, vy: 0 };
    }
    expect(g.warnings).toBe(1);
  });

  it('knows when a score makes the top 10', () => {
    const ten: HighScore[] = Array.from({ length: 10 }, (_, i) => ({
      name: 'X',
      score: 1000 - i * 10,
      date: '2007-01-01',
    }));
    expect(qualifies([], 0)).toBe(false);
    expect(qualifies([], 10)).toBe(true);
    expect(qualifies(ten, 910)).toBe(false);
    expect(qualifies(ten, 911)).toBe(true);
  });

  it('is deterministic for a seed', () => {
    const play = () => {
      const g = launched(42);
      for (let i = 0; i < 4; i++) {
        setFlipper(g, i % 2 ? 'left' : 'right', true);
        run(g, 0.3);
        setFlipper(g, i % 2 ? 'left' : 'right', false);
        run(g, 0.7);
      }
      return { ...g.ball, score: g.score };
    };
    expect(play()).toEqual(play());
  });
});
