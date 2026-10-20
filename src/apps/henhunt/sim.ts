// Hen Hunt simulation: one round's state, stepped with a fixed dt. Pure TS, seeded, no drawing.
// The renderer reads the state; sounds and popups react to the queued `events`.
import type { HighScore } from '@/os/store/games';
import { MAX_HIGH_SCORES } from '@/os/store/games';
import { mulberry32, type Rand } from '@/os/random';
import {
  DEPTH,
  GOLDEN,
  HAT_AWAY_SECONDS,
  HAT_PENALTY,
  LAST_SECONDS,
  MAX_CAM,
  PAN_EDGE,
  PAN_SPEED,
  RELOAD_SECONDS,
  ROUND_SECONDS,
  SCARECROW,
  SHELLS,
  VIEW_W,
  WINDMILL,
  WINDOW_HEN,
  toLayerX,
  type Depth,
} from './layout';
import { isAlive, moveHen, spawnHen, type Hen } from './hens';
import { hitTest } from './hittest';

export { hitTest, type Target } from './hittest';

export const STEP = 1 / 60;
const MAX_HENS = 9;

export type TargetKind = 'hen' | 'golden' | 'window' | 'hat';

export type GameEvent =
  | { type: 'shot' }
  | { type: 'empty' }
  | { type: 'reload' }
  | { type: 'reloaded' }
  | { type: 'hit'; target: TargetKind; points: number }
  | { type: 'lastTen' }
  | { type: 'over'; score: number };

/** A small flying feather (layer coordinates of `depth`). */
export interface Feather {
  depth: Depth;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  /** Seconds left. */
  life: number;
}

/** A floating "+25" over a hit (layer coordinates of `depth`). */
export interface Popup {
  depth: Depth;
  x: number;
  y: number;
  points: number;
  life: number;
}

export interface GameOptions {
  /** Hen speed/spawn multiplier; reduced motion plays a slower game. */
  pace?: number;
  /** Attract mode (the menu backdrop): hens fly, the clock never runs. */
  attract?: boolean;
}

export interface Game {
  rand: Rand;
  pace: number;
  attract: boolean;
  /** Seconds left in the round. */
  time: number;
  score: number;
  shells: number;
  /** Seconds of reloading left; 0 = not reloading. */
  reloading: number;
  shots: number;
  hits: number;
  /** Camera x in near-layer pixels, 0..MAX_CAM. */
  camX: number;
  /** Aim point in screen pixels, or null when the pointer is outside. */
  pointer: { x: number; y: number } | null;
  /** The last aim came from a finger: no edge pan (a drag pans instead), tap-to-reload hint. */
  touch: boolean;
  hens: Hen[];
  feathers: Feather[];
  popups: Popup[];
  nextId: number;
  spawnIn: number;
  /** Round second (elapsed) when the golden hen flies; it flies once. */
  goldenAt: number;
  goldenDone: boolean;
  /** Seconds the window hen still shows (0 = hidden), and seconds until it next peeks. */
  windowHen: { showing: number; nextIn: number };
  /** Seconds until the scarecrow's hat is back on (0 = on, shootable). */
  hatAway: number;
  over: boolean;
  events: GameEvent[];
}

export function createGame(seed: number, opts: GameOptions = {}): Game {
  const rand = mulberry32(seed);
  return {
    rand,
    pace: opts.pace ?? 1,
    attract: opts.attract ?? false,
    time: ROUND_SECONDS,
    score: 0,
    shells: SHELLS,
    reloading: 0,
    shots: 0,
    hits: 0,
    camX: MAX_CAM / 2,
    pointer: null,
    touch: false,
    hens: [],
    feathers: [],
    popups: [],
    nextId: 1,
    spawnIn: 0.4,
    goldenAt: 15 + rand() * 55,
    goldenDone: false,
    windowHen: { showing: 0, nextIn: 8 + rand() * 10 },
    hatAway: 0,
    over: false,
    events: [],
  };
}

/** Takes the queued events (for sounds) and clears the queue. */
export function drainEvents(g: Game): GameEvent[] {
  const out = g.events;
  g.events = [];
  return out;
}

export function setPointer(g: Game, x: number | null, y = 0): void {
  g.pointer = x === null ? null : { x, y };
}

/** Marks where the aim comes from: a finger (true) or a mouse / the keys (false). */
export function setTouch(g: Game, touch: boolean): void {
  g.touch = touch;
}

/** Drags the view by `dx` near-layer pixels (positive looks right), clamped to the world. */
export function panBy(g: Game, dx: number): void {
  g.camX = Math.min(MAX_CAM, Math.max(0, g.camX + dx));
}

/** The visible part of a depth's layer starts here (layer px). */
export const visibleLeft = (g: Game, depth: Depth) =>
  toLayerX(0, depth, g.camX);

function addHen(g: Game, depth: Depth, golden = false): Hen {
  const hen = spawnHen(
    g.rand,
    g.nextId++,
    depth,
    visibleLeft(g, depth),
    golden,
  );
  g.hens.push(hen);
  return hen;
}

function pickDepth(r: number): Depth {
  return r < 0.35 ? 'far' : r < 0.75 ? 'mid' : 'near';
}

function pan(g: Game, dt: number): void {
  const p = g.pointer;
  if (!p || g.touch) return;
  let push = 0;
  if (p.x < PAN_EDGE) push = -(PAN_EDGE - Math.max(0, p.x)) / PAN_EDGE;
  else if (p.x > VIEW_W - PAN_EDGE)
    push = (Math.min(VIEW_W, p.x) - (VIEW_W - PAN_EDGE)) / PAN_EDGE;
  g.camX = Math.min(MAX_CAM, Math.max(0, g.camX + push * PAN_SPEED * dt));
}

/** Advances the round by `dt` seconds. A finished round only lets its feathers settle. */
export function step(g: Game, dt: number): void {
  stepParticles(g, dt);
  if (g.over) return;
  pan(g, dt);

  if (g.reloading > 0) {
    g.reloading = Math.max(0, g.reloading - dt);
    if (g.reloading === 0) {
      g.shells = SHELLS;
      g.events.push({ type: 'reloaded' });
    }
  }

  const elapsed = ROUND_SECONDS - g.time;
  if (!g.attract) {
    const before = g.time;
    g.time = Math.max(0, g.time - dt);
    if (before > LAST_SECONDS && g.time <= LAST_SECONDS)
      g.events.push({ type: 'lastTen' });
  }

  g.spawnIn -= dt * g.pace;
  if (g.spawnIn <= 0) {
    if (g.hens.filter(isAlive).length < MAX_HENS)
      addHen(g, pickDepth(g.rand()));
    g.spawnIn = 0.45 + g.rand() * 1.05;
  }
  if (!g.goldenDone && !g.attract && elapsed >= g.goldenAt) {
    g.goldenDone = true;
    addHen(g, GOLDEN.depth, true);
  }

  const w = g.windowHen;
  if (w.showing > 0) {
    w.showing = Math.max(0, w.showing - dt * g.pace);
    if (w.showing === 0) w.nextIn = 10 + g.rand() * 12;
  } else {
    w.nextIn -= dt * g.pace;
    if (w.nextIn <= 0) w.showing = WINDOW_HEN.showSeconds;
  }
  g.hatAway = Math.max(0, g.hatAway - dt);

  g.hens = g.hens.filter((h) => moveHen(h, dt, g.pace, g.rand));

  if (!g.attract && g.time === 0) {
    g.over = true;
    g.reloading = 0;
    g.events.push({ type: 'over', score: g.score });
  }
}

function stepParticles(g: Game, dt: number): void {
  for (const f of g.feathers) {
    f.vy += 260 * dt;
    f.vx *= 1 - 1.5 * dt;
    f.vy *= 1 - 1.8 * dt;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    f.angle += f.vx * 0.02 * dt;
    f.life -= dt;
  }
  g.feathers = g.feathers.filter((f) => f.life > 0);
  for (const p of g.popups) {
    p.y -= 40 * dt;
    p.life -= dt;
  }
  g.popups = g.popups.filter((p) => p.life > 0);
}

function burst(g: Game, depth: Depth, x: number, y: number, n: number): void {
  const r = DEPTH[depth].radius;
  for (let i = 0; i < n; i++) {
    const a = g.rand() * Math.PI * 2;
    const s = (40 + g.rand() * 120) * (r / 17);
    g.feathers.push({
      depth,
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 40,
      angle: g.rand() * Math.PI,
      life: 0.9 + g.rand() * 0.6,
    });
  }
}

function award(g: Game, depth: Depth, x: number, y: number, points: number) {
  g.score = Math.max(0, g.score + points);
  g.popups.push({ depth, x, y: y - 20, points, life: 1 });
}

/** Fires at screen point (sx, sy). Returns what was hit, or 'miss' / 'empty' / 'over'. */
export function shoot(
  g: Game,
  sx: number,
  sy: number,
): TargetKind | 'miss' | 'empty' | 'over' {
  if (g.over || g.attract) return 'over';
  if (g.reloading > 0 || g.shells === 0) {
    g.events.push({ type: 'empty' });
    return 'empty';
  }
  g.shells--;
  g.shots++;
  g.events.push({ type: 'shot' });
  const target = hitTest(g, sx, sy);
  if (!target) return 'miss';

  let points: number;
  if (target.kind === 'hat') {
    points = -HAT_PENALTY;
    g.hatAway = HAT_AWAY_SECONDS;
    award(g, 'mid', SCARECROW.hat.x, SCARECROW.hat.y, points);
  } else if (target.kind === 'window') {
    points = WINDOW_HEN.points;
    g.windowHen = { showing: 0, nextIn: 12 + g.rand() * 12 };
    burst(g, 'far', WINDMILL.window.x, WINDMILL.window.y, 8);
    award(g, 'far', WINDMILL.window.x, WINDMILL.window.y, points);
    g.hits++;
  } else {
    const h = target.hen;
    points = h.golden ? GOLDEN.points : DEPTH[h.depth].points;
    h.state = 'fall';
    h.vy = -120 * (DEPTH[h.depth].radius / 17);
    burst(g, h.depth, h.x, h.y, h.depth === 'near' ? 14 : 10);
    award(g, h.depth, h.x, h.y, points);
    g.hits++;
  }
  g.events.push({ type: 'hit', target: target.kind, points });
  return target.kind;
}

/** Starts the 1 s reload, unless the gun is full or already reloading. */
export function reload(g: Game): boolean {
  if (g.over || g.attract || g.reloading > 0 || g.shells === SHELLS)
    return false;
  g.reloading = RELOAD_SECONDS;
  g.shells = 0;
  g.events.push({ type: 'reload' });
  return true;
}

/** Whether `score` earns a place in a top-10 table. */
export function qualifies(high: readonly HighScore[], score: number): boolean {
  if (score <= 0) return false;
  if (high.length < MAX_HIGH_SCORES) return true;
  return score > (high[high.length - 1]?.score ?? 0);
}
