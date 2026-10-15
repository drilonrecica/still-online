// Fluff's behaviour: a pure state machine ticked at 20 Hz. Positions are viewport px; (x, y) is
// the middle of Fluff's feet. See docs/architecture-v0.2.md → "Fluff".
import { TASKBAR_OWNER, type Surface } from './surfaces';

export type PetMode =
  'walk' | 'fall' | 'sit' | 'sleep' | 'graze' | 'baa' | 'drag';

export const TICK_MS = 50;
export const PET_W = 40;
export const PET_H = 32;
export const HALF_W = PET_W / 2;
/** px/s */
export const WALK_SPEED = 30;
/** px/s² */
export const GRAVITY = 1400;
export const MAX_FALL_SPEED = 900;
/** Time spent still (sitting, grazing) before Fluff dozes off. */
export const SLEEP_AFTER_MS = 30_000;
export const BAA_MS = 900;
/** Chance per walking tick of turning around for no reason. */
export const TURN_CHANCE = 0.004;
/** A side wall keeps this share of the horizontal speed when a thrown Fluff bounces off it. */
const WALL_BOUNCE = 0.5;

/** Random durations per mode, [min, max] in ms. */
const DURATIONS: Record<'walk' | 'sit' | 'graze' | 'sleep', [number, number]> =
  {
    walk: [3000, 9000],
    sit: [4000, 40_000],
    graze: [2000, 6000],
    sleep: [15_000, 45_000],
  };

export type Rng = () => number;

export interface Anchor {
  owner: string;
  ox: number;
  oy: number;
}

export interface DragInfo {
  /** Pointer minus Fluff's position at the grab. */
  offX: number;
  offY: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastT: number;
  moved: boolean;
  /** Fluff as it was when grabbed; a click (no drag) resumes from it. */
  before: PetState;
}

export interface PetState {
  mode: PetMode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  dir: 1 | -1;
  /** The surface stood on; null while falling or dragged. */
  anchor: Anchor | null;
  modeMs: number;
  /** When the current mode ends on its own. */
  modeLimit: number;
  /** Time spent without moving, for the sleep timer. */
  stillMs: number;
  /** The mode a bleat returns to. */
  resume: PetMode;
  /** Total ticked time, for frame animations. */
  t: number;
  drag: DragInfo | null;
}

export interface PetWorld {
  surfaces: readonly Surface[];
  width: number;
  height: number;
}

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const between = ([min, max]: [number, number], rng: Rng) =>
  min + rng() * (max - min);

export const isGrounded = (mode: PetMode) => mode !== 'fall' && mode !== 'drag';

function enter(state: PetState, mode: PetMode, rng: Rng): PetState {
  const modeLimit =
    mode === 'baa'
      ? BAA_MS
      : mode === 'fall' || mode === 'drag'
        ? Infinity
        : between(DURATIONS[mode], rng);
  const moving = mode === 'walk' || mode === 'fall' || mode === 'drag';
  return {
    ...state,
    mode,
    modeMs: 0,
    modeLimit,
    stillMs: moving || mode === 'baa' ? 0 : state.stillMs,
  };
}

/** Fluff drops in from the top of the screen at a random spot. */
export function spawn(world: PetWorld, rng: Rng): PetState {
  const x = HALF_W + rng() * Math.max(0, world.width - PET_W);
  return {
    mode: 'fall',
    x,
    y: 0,
    vx: 0,
    vy: 0,
    dir: rng() < 0.5 ? -1 : 1,
    anchor: null,
    modeMs: 0,
    modeLimit: Infinity,
    stillMs: 0,
    resume: 'walk',
    t: 0,
    drag: null,
  };
}

const floorOf = (world: PetWorld): Surface | undefined =>
  world.surfaces.find((s) => s.owner === TASKBAR_OWNER) ??
  world.surfaces.reduce<Surface | undefined>(
    (low, s) => (!low || s.y > low.y ? s : low),
    undefined,
  );

const supports = (s: Surface, x: number) => x >= s.x1 && x <= s.x2;

export function startFall(state: PetState, vx: number, vy: number): PetState {
  return {
    ...state,
    mode: 'fall',
    modeMs: 0,
    modeLimit: Infinity,
    stillMs: 0,
    anchor: null,
    vx,
    vy,
  };
}

function land(state: PetState, s: Surface, x: number, rng: Rng): PetState {
  const dir = state.vx > 0 ? 1 : state.vx < 0 ? -1 : state.dir;
  return enter(
    {
      ...state,
      x,
      y: s.y,
      vx: 0,
      vy: 0,
      dir,
      anchor: { owner: s.owner, ox: s.ox, oy: s.oy },
    },
    'walk',
    rng,
  );
}

function fall(state: PetState, world: PetWorld, dt: number, rng: Rng) {
  const sec = dt / 1000;
  let vx = state.vx;
  let vy = Math.min(state.vy + GRAVITY * sec, MAX_FALL_SPEED);
  let x = state.x + vx * sec;
  let y = state.y + vy * sec;
  if (x < HALF_W || x > world.width - HALF_W) {
    x = clamp(x, HALF_W, Math.max(HALF_W, world.width - HALF_W));
    vx = -vx * WALL_BOUNCE;
  }
  if (vy < 0 && y < PET_H) {
    y = PET_H;
    vy = 0;
  }
  const moved = { ...state, x, y, vx, vy };
  if (vy > 0) {
    // The first surface crossed on the way down (never one Fluff started below).
    const hit = world.surfaces
      .filter((s) => s.y >= state.y && s.y <= y && supports(s, x))
      .sort((a, b) => a.y - b.y)[0];
    if (hit) return land(moved, hit, x, rng);
  }
  const floor = floorOf(world);
  if (floor && y >= floor.y) return land(moved, floor, x, rng);
  return moved;
}

/** What comes after a grounded mode runs out. */
function next(state: PetState, rng: Rng): PetState {
  const r = rng();
  switch (state.mode) {
    case 'walk':
      if (r < 0.35) return enter(state, 'sit', rng);
      if (r < 0.65) return enter(state, 'graze', rng);
      return enter(
        rng() < 0.5 ? { ...state, dir: state.dir === 1 ? -1 : 1 } : state,
        'walk',
        rng,
      );
    case 'graze':
      return enter(state, r < 0.5 ? 'sit' : 'walk', rng);
    case 'baa':
      return enter(
        state,
        state.resume === 'sleep' || !isGrounded(state.resume)
          ? 'walk'
          : state.resume,
        rng,
      );
    default:
      return enter(state, 'walk', rng);
  }
}

function grounded(state: PetState, world: PetWorld, dt: number, rng: Rng) {
  const own = world.surfaces.filter((s) => s.owner === state.anchor?.owner);
  const first = own[0];
  if (!first || !state.anchor) return startFall(state, 0, 0);
  // Ride along with a window that moved.
  let x = state.x + (first.ox - state.anchor.ox);
  const y = state.y + (first.oy - state.anchor.oy);
  let dir = state.dir;
  if (state.mode === 'walk') {
    if (rng() < TURN_CHANCE) dir = dir === 1 ? -1 : 1;
    x += (dir * WALK_SPEED * dt) / 1000;
    // Screen edges turn Fluff around; the end of a title bar does not.
    if (x < HALF_W) {
      x = HALF_W;
      dir = 1;
    } else if (x > world.width - HALF_W) {
      x = world.width - HALF_W;
      dir = -1;
    }
  }
  let state2: PetState = {
    ...state,
    x,
    y,
    dir,
    anchor: { owner: first.owner, ox: first.ox, oy: first.oy },
    modeMs: state.modeMs + dt,
    stillMs: state.mode === 'walk' ? 0 : state.stillMs + dt,
  };
  if (!own.some((s) => supports(s, x))) {
    return startFall(state2, state.mode === 'walk' ? dir * WALK_SPEED : 0, 0);
  }
  if (
    (state2.mode === 'sit' || state2.mode === 'graze') &&
    state2.stillMs >= SLEEP_AFTER_MS
  ) {
    return enter(state2, 'sleep', rng);
  }
  if (state2.modeMs >= state2.modeLimit) state2 = next(state2, rng);
  return state2;
}

/** Advances Fluff by `dt` ms against the current surfaces. */
export function tick(
  state: PetState,
  world: PetWorld,
  dt: number,
  rng: Rng,
): PetState {
  const aged = { ...state, t: state.t + dt };
  if (state.mode === 'drag') return aged;
  if (state.mode === 'fall') {
    return fall({ ...aged, modeMs: aged.modeMs + dt }, world, dt, rng);
  }
  return grounded(aged, world, dt, rng);
}

/** A click: a bleat, if Fluff has its feet on something. */
export function baa(state: PetState, rng: Rng): PetState {
  if (!isGrounded(state.mode)) return state;
  return enter(
    { ...state, resume: state.mode === 'baa' ? state.resume : state.mode },
    'baa',
    rng,
  );
}

/**
 * Reduced motion: Fluff sits still on the taskbar near the tray, following it when the
 * screen resizes. Time still passes (for blinking) and a bleat still ends.
 */
export function rest(
  prev: PetState | null,
  world: PetWorld,
  dt: number,
): PetState {
  const floor = floorOf(world);
  const modeMs = (prev?.modeMs ?? 0) + dt;
  const bleating = prev?.mode === 'baa' && modeMs < BAA_MS;
  return {
    mode: bleating ? 'baa' : 'sit',
    x: Math.max(HALF_W, world.width - 160),
    y: floor?.y ?? world.height,
    vx: 0,
    vy: 0,
    dir: -1,
    anchor: floor ? { owner: floor.owner, ox: floor.ox, oy: floor.oy } : null,
    modeMs: bleating ? modeMs : 0,
    modeLimit: Infinity,
    stillMs: 0,
    resume: 'sit',
    t: (prev?.t ?? 0) + dt,
    drag: null,
  };
}
