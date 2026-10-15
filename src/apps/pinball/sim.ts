// Star Pinball game: three balls, the plunger, ball save, tilt and sensors, around one mutable
// `Game` stepped at the physics' fixed 1/240 s. What scores what lives in `scoring.ts`.
import { mulberry32, type Rand } from '@/os/random';
import {
  BALL_R,
  STEP,
  stepPhysics,
  turnFlipper,
  type Ball,
  type Collider,
  type Flipper,
  type Side,
} from './physics';
import {
  DRAIN_Y,
  LANE_X,
  LAUNCH_MAX,
  LAUNCH_MIN,
  PLUNGER_REST,
  PLUNGER_TRAVEL,
  SENSORS,
  buildColliders,
  makeFlippers,
  plungerShape,
} from './table';
import {
  POINTS,
  RANKS,
  TARGET_RESET,
  onHit,
  onSensor,
  qualifies,
  rankUp,
  resetTargets,
  say,
} from './scoring';

export { POINTS, RANKS, STEP, TARGET_RESET, qualifies, rankUp };

export const BALLS = 3;
export const BALL_SAVE_SECONDS = 5;
/** Nudges that only warn; the next one tilts. */
export const MAX_WARNINGS = 3;
/** A warning wears off after this long without nudging. */
export const WARNING_DECAY = 8;
/** Seconds to pull the plunger all the way back. */
export const PULL_SECONDS = 1;
/** Pause after a drain before the next ball is served. */
export const DRAIN_PAUSE = 1.2;

export type GameEvent =
  | { type: 'bumper'; index: number }
  | { type: 'sling'; index: number }
  | { type: 'flipper'; side: Side }
  | { type: 'launch' }
  | { type: 'target'; index: number }
  | { type: 'rollover'; index: number }
  | { type: 'multiplier'; value: number }
  | { type: 'ramp' }
  | { type: 'rankUp'; rank: number }
  | { type: 'saved' }
  | { type: 'drain' }
  | { type: 'warning'; count: number }
  | { type: 'tilt' }
  | { type: 'over'; score: number };

export interface Game {
  rand: Rand;
  time: number;
  /** Null between balls, after the game, and on the attract-mode table. */
  ball: Ball | null;
  flippers: [Flipper, Flipper];
  colliders: Collider[];
  plunger: { pull: number; held: boolean };
  score: number;
  /** 1-based number of the ball in play. */
  ballNo: number;
  multiplier: number;
  rank: number;
  lanes: boolean[];
  /** true = dropped. */
  targets: boolean[];
  targetResetIn: number;
  /** Ball save runs until this game time. */
  saveUntil: number;
  saveUsed: boolean;
  warnings: number;
  warnTimer: number;
  tilted: boolean;
  /** Counts down to the next ball after a drain. */
  drainWait: number;
  over: boolean;
  /** Sensors the ball is currently inside (they fire on entry). */
  inside: Set<string>;
  /** Per-part light flashes in seconds, e.g. `bumper:1`, `rollover:0`. */
  flash: Record<string, number>;
  /** A dot-matrix message shown over the score. */
  message: { text: string; ttl: number } | null;
  stillFor: number;
  events: GameEvent[];
}

export function createGame(
  seed: number,
  opts: { attract?: boolean } = {},
): Game {
  const g: Game = {
    rand: mulberry32(seed),
    time: 0,
    ball: null,
    flippers: makeFlippers(),
    colliders: buildColliders(),
    plunger: { pull: 0, held: false },
    score: 0,
    ballNo: 1,
    multiplier: 1,
    rank: 0,
    lanes: [false, false, false],
    targets: [false, false, false, false],
    targetResetIn: 0,
    saveUntil: 0,
    saveUsed: false,
    warnings: 0,
    warnTimer: 0,
    tilted: false,
    drainWait: 0,
    over: !!opts.attract,
    inside: new Set(),
    flash: {},
    message: null,
    stillFor: 0,
    events: [],
  };
  if (!opts.attract) serveBall(g);
  return g;
}

/** Puts a fresh ball on the plunger. */
export function serveBall(g: Game): void {
  g.ball = { x: LANE_X, y: PLUNGER_REST - BALL_R, vx: 0, vy: 0 };
  g.multiplier = 1;
  g.saveUsed = false;
  g.saveUntil = 0;
  g.warnings = 0;
  g.tilted = false;
  g.inside.clear();
  say(g, `BALL ${g.ballNo}`, 1.5);
}

export function drainEvents(g: Game): GameEvent[] {
  const out = g.events;
  g.events = [];
  return out;
}

/** The ball sits on the plunger, ready to launch. */
export function onPlunger(g: Game): boolean {
  const b = g.ball;
  if (!b || b.x < LANE_X - 12) return false;
  const top = PLUNGER_REST + g.plunger.pull * PLUNGER_TRAVEL;
  return b.y >= top - BALL_R - 3 && b.y <= top;
}

export function setFlipper(g: Game, side: Side, pressed: boolean): void {
  const f = g.flippers[side === 'left' ? 0 : 1];
  if (g.tilted || g.over) pressed = false;
  if (f.pressed === pressed) return;
  f.pressed = pressed;
  if (!pressed) return;
  g.events.push({ type: 'flipper', side });
  // Lane change: the lit rollovers shift with the flipper.
  const [a, b, c] = g.lanes as [boolean, boolean, boolean];
  g.lanes = side === 'left' ? [b, c, a] : [c, a, b];
}

export function setPlunger(g: Game, held: boolean): void {
  if (g.plunger.held === held) return;
  g.plunger.held = held;
  if (held || g.over) return;
  const pull = g.plunger.pull;
  if (g.ball && onPlunger(g)) {
    g.ball.vy = -(LAUNCH_MIN + (LAUNCH_MAX - LAUNCH_MIN) * pull);
    g.ball.vx = 0;
    g.saveUntil = g.time + BALL_SAVE_SECONDS;
    g.events.push({ type: 'launch' });
  }
  g.plunger.pull = 0;
}

/** T: shoves the table. Gives the ball a bump; too many in a row tilts. */
export function nudge(g: Game): void {
  const b = g.ball;
  if (!b || g.tilted || g.over) return;
  const dir = g.rand() < 0.5 ? -1 : 1;
  b.vx += dir * 70;
  b.vy -= 110;
  g.warnings++;
  g.warnTimer = WARNING_DECAY;
  if (g.warnings > MAX_WARNINGS) {
    g.tilted = true;
    for (const f of g.flippers) f.pressed = false;
    g.events.push({ type: 'tilt' });
    say(g, 'TILT', 99);
  } else {
    g.events.push({ type: 'warning', count: g.warnings });
    say(g, `WARNING ${g.warnings}`, 1.2);
  }
}

function drain(g: Game) {
  g.inside.clear();
  if (!g.tilted && !g.saveUsed && g.time < g.saveUntil) {
    g.saveUsed = true;
    g.ball = { x: LANE_X, y: PLUNGER_REST - BALL_R, vx: 0, vy: 0 };
    g.events.push({ type: 'saved' });
    say(g, 'BALL SAVED', 1.6);
    return;
  }
  g.ball = null;
  g.drainWait = DRAIN_PAUSE;
  g.events.push({ type: 'drain' });
  if (!g.tilted) say(g, g.ballNo < BALLS ? 'BALL LOST' : 'GAME OVER', 1.6);
}

function tickTimers(g: Game, dt: number) {
  for (const k of Object.keys(g.flash)) {
    const left = (g.flash[k] ?? 0) - dt;
    if (left > 0) g.flash[k] = left;
    else delete g.flash[k];
  }
  if (g.message && (g.message.ttl -= dt) <= 0) g.message = null;
  if (g.targetResetIn > 0 && (g.targetResetIn -= dt) <= 0) resetTargets(g);
  if (g.warnings > 0 && !g.tilted && (g.warnTimer -= dt) <= 0) {
    g.warnings--;
    g.warnTimer = WARNING_DECAY;
  }
}

/** Advances the game by one fixed step. */
export function step(g: Game, dt: number = STEP): void {
  g.time += dt;
  tickTimers(g, dt);
  if (g.plunger.held)
    g.plunger.pull = Math.min(1, g.plunger.pull + dt / PULL_SECONDS);
  const plunger = g.colliders.find((c) => c.id === 'plunger');
  if (plunger) plunger.shape = plungerShape(g.plunger.pull);

  const ball = g.ball;
  if (!ball) {
    for (const f of g.flippers) turnFlipper(f, dt);
    if (g.drainWait > 0 && (g.drainWait -= dt) <= 0 && !g.over) {
      if (g.ballNo < BALLS) {
        g.ballNo++;
        serveBall(g);
      } else {
        g.over = true;
        g.events.push({ type: 'over', score: g.score });
      }
    }
    return;
  }

  for (const hit of stepPhysics(ball, g.colliders, g.flippers, dt))
    onHit(g, hit);

  for (const s of SENSORS) {
    const inside =
      ball.x >= s.x0 && ball.x <= s.x1 && ball.y >= s.y0 && ball.y <= s.y1;
    if (inside && !g.inside.has(s.id)) {
      g.inside.add(s.id);
      onSensor(g, s.id, ball);
    } else if (!inside) g.inside.delete(s.id);
  }

  // A ball that sits still in the playfield (not cradled) gets a little shove.
  const slow = Math.hypot(ball.vx, ball.vy) < 6;
  const held = g.flippers.some((f) => f.pressed);
  g.stillFor = slow && !held && !onPlunger(g) ? g.stillFor + dt : 0;
  if (g.stillFor > 4) {
    ball.vy = -220;
    ball.vx = (g.rand() - 0.5) * 200;
    g.stillFor = 0;
  }

  if (ball.y > DRAIN_Y) drain(g);
}
