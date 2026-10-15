// Hen Hunt geometry and tuning, shared by the simulation and the renderer.
// The view is VIEW_W×VIEW_H logical pixels; the near layer is WORLD_W wide (2× the view).
// Every layer scrolls with its own parallax factor, so a layer is narrower the farther it is.

export const VIEW_W = 800;
export const VIEW_H = 540;
export const WORLD_W = VIEW_W * 2;
/** The camera's largest x (near-layer pixels). */
export const MAX_CAM = WORLD_W - VIEW_W;

export const ROUND_SECONDS = 90;
export const LAST_SECONDS = 10;
export const SHELLS = 8;
export const RELOAD_SECONDS = 1;

/** Pointer within this many pixels of a side edge pans the view. */
export const PAN_EDGE = 90;
/** Near-layer pixels per second at the very edge. */
export const PAN_SPEED = 720;

export type Depth = 'far' | 'mid' | 'near';
/** Back to front: the order layers are drawn in. */
export const DEPTHS: readonly Depth[] = ['far', 'mid', 'near'];

export interface DepthSpec {
  /** How much of the camera movement this layer follows (0 = fixed sky, 1 = foreground). */
  parallax: number;
  /** Hen body radius. */
  radius: number;
  /** Flying speed, px/s. */
  speed: number;
  points: number;
  /** Flight band (y of the body centre). */
  skyTop: number;
  skyBottom: number;
  /** Where a landed hen's body centre sits. */
  groundY: number;
}

export const DEPTH: Record<Depth, DepthSpec> = {
  far: {
    parallax: 0.35,
    radius: 9,
    speed: 48,
    points: 25,
    skyTop: 70,
    skyBottom: 220,
    groundY: 286,
  },
  mid: {
    parallax: 0.65,
    radius: 17,
    speed: 90,
    points: 10,
    skyTop: 60,
    skyBottom: 250,
    groundY: 372,
  },
  near: {
    parallax: 1,
    radius: 30,
    speed: 155,
    points: 5,
    skyTop: 110,
    skyBottom: 340,
    groundY: 436,
  },
};

export const GOLDEN = { points: 100, speed: 330, depth: 'mid' as Depth };
export const WINDOW_HEN = { points: 50, showSeconds: 2.4, radius: 9 };
export const HAT_PENALTY = 25;
/** Seconds a shot-off hat takes to come back. */
export const HAT_AWAY_SECONDS = 3;

/** Width of a depth's layer in its own pixels. */
export function layerWidth(depth: Depth): number {
  return VIEW_W + MAX_CAM * DEPTH[depth].parallax;
}

/** Layer x → screen x for a camera at `camX`. */
export function toScreenX(x: number, depth: Depth, camX: number): number {
  return x - camX * DEPTH[depth].parallax;
}

/** Screen x → layer x for a camera at `camX`. */
export function toLayerX(sx: number, depth: Depth, camX: number): number {
  return sx + camX * DEPTH[depth].parallax;
}

/** The windmill stands on the far hills; a hen sometimes peeks from its window. */
export const WINDMILL = {
  x: 660,
  baseY: 292,
  hubY: 168,
  sailLength: 74,
  window: { x: 660, y: 214 },
};

/** The scarecrow stands in the mid fields; its hat is a (penalised) target. */
export const SCARECROW = {
  x: 1010,
  groundY: 392,
  hat: { x: 1010, y: 286, w: 46, h: 24 },
};
