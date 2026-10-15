// Fluff and the pointer: grab, drag, and release as a click (a bleat) or a throw.
import {
  baa,
  clamp,
  HALF_W,
  isGrounded,
  PET_H,
  startFall,
  type PetState,
  type PetWorld,
  type Rng,
} from './machine';

export const MAX_THROW_SPEED = 1200;
/** Pointer travel below this is a click, not a drag. */
export const CLICK_SLOP = 4;
/** A release this long after the last pointer move is a drop, not a throw. */
const THROW_WINDOW_MS = 100;

/** The pointer grabbed Fluff at (px, py) at time `t` ms. */
export function grab(
  state: PetState,
  px: number,
  py: number,
  t: number,
): PetState {
  const before = state.drag ? state.drag.before : state;
  return {
    ...state,
    mode: 'drag',
    modeMs: 0,
    modeLimit: Infinity,
    stillMs: 0,
    vx: 0,
    vy: 0,
    anchor: null,
    drag: {
      offX: px - state.x,
      offY: py - state.y,
      startX: px,
      startY: py,
      lastX: px,
      lastY: py,
      lastT: t,
      moved: false,
      before,
    },
  };
}

/** The pointer moved to (px, py) at time `t` ms while holding Fluff. */
export function dragTo(
  state: PetState,
  px: number,
  py: number,
  t: number,
  world: PetWorld,
): PetState {
  const d = state.drag;
  if (state.mode !== 'drag' || !d) return state;
  const sec = Math.max(1, t - d.lastT) / 1000;
  // Smoothed pointer velocity, so the throw follows the last flick.
  const vx = clamp(
    0.5 * state.vx + (0.5 * (px - d.lastX)) / sec,
    -MAX_THROW_SPEED,
    MAX_THROW_SPEED,
  );
  const vy = clamp(
    0.5 * state.vy + (0.5 * (py - d.lastY)) / sec,
    -MAX_THROW_SPEED,
    MAX_THROW_SPEED,
  );
  const moved =
    d.moved || Math.hypot(px - d.startX, py - d.startY) > CLICK_SLOP;
  return {
    ...state,
    x: clamp(px - d.offX, HALF_W, Math.max(HALF_W, world.width - HALF_W)),
    y: clamp(py - d.offY, PET_H, Math.max(PET_H, world.height)),
    vx,
    vy,
    dir: vx > 20 ? 1 : vx < -20 ? -1 : state.dir,
    drag: { ...d, lastX: px, lastY: py, lastT: t, moved },
  };
}

/** The pointer let go at time `t` ms: a click bleats, a drag throws. */
export function release(state: PetState, t: number, rng: Rng): PetState {
  const d = state.drag;
  if (state.mode !== 'drag' || !d) return state;
  if (!d.moved) {
    const before = { ...d.before, t: state.t, drag: null };
    return isGrounded(before.mode) ? baa(before, rng) : before;
  }
  const fresh = t - d.lastT <= THROW_WINDOW_MS;
  return startFall(
    { ...state, drag: null },
    fresh ? state.vx : 0,
    fresh ? state.vy : 0,
  );
}
