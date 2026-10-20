// Where the held tools sit relative to the pointer. Shared by the cursor drawings and the
// engine, so tracers leave the gun's muzzle and flames the nozzle, while damage lands at the
// pointer. Pure.
import type { Point } from './damage';

export interface AimPose {
  /** The grip, below-right of the pointer, and the angle from it to the pointer. */
  x: number;
  y: number;
  angle: number;
  /**
   * -1 when aiming leftwards: the side-view model is mirrored top to bottom then, so its
   * magazine and grip still hang down.
   */
  flip: 1 | -1;
  /** The barrel's end (muzzle or nozzle), pulled back by the recoil. */
  tip: Point;
}

/** The gun is held below-right of the crosshair, like a first-person shooter. */
export const GUN = { dx: 128, dy: 112, muzzle: 88, recoil: 9 } as const;
/** The flamethrower's wand: nearer, so the flame stream is short and fat. */
export const FLAME = { dx: 104, dy: 92, nozzle: 70 } as const;

function aim(
  px: number,
  py: number,
  dx: number,
  dy: number,
  reach: number,
): AimPose {
  const x = px + dx;
  const y = py + dy;
  const angle = Math.atan2(py - y, px - x);
  return {
    x,
    y,
    angle,
    flip: Math.cos(angle) < 0 ? -1 : 1,
    tip: { x: x + Math.cos(angle) * reach, y: y + Math.sin(angle) * reach },
  };
}

/** The machine gun aimed at (px, py); `kick` (0..1) is the recoil of the last shot. */
export function gunPose(px: number, py: number, kick = 0): AimPose {
  return aim(px, py, GUN.dx, GUN.dy, GUN.muzzle - kick * GUN.recoil);
}

export function flamePose(px: number, py: number): AimPose {
  return aim(px, py, FLAME.dx, FLAME.dy, FLAME.nozzle);
}

/**
 * Turns a point in a pose's own frame (x along the barrel, y down on the model) into screen
 * coordinates.
 */
export function local(pose: AimPose, lx: number, ly: number): Point {
  const c = Math.cos(pose.angle);
  const s = Math.sin(pose.angle);
  const y = ly * pose.flip;
  return { x: pose.x + lx * c - y * s, y: pose.y + lx * s + y * c };
}

/** The chainsaw is drawn tilted by this angle with its bar's tip on the pointer. */
export const SAW_ANGLE = -0.6;

/** The chainsaw's exhaust, on the engine housing behind the bar. */
export function sawExhaust(px: number, py: number): Point {
  const c = Math.cos(SAW_ANGLE);
  const s = Math.sin(SAW_ANGLE);
  const lx = 66;
  const ly = 12;
  return { x: px + lx * c - ly * s, y: py + lx * s + ly * c };
}
