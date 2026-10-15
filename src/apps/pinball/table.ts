// The Star Pinball table: walls, posts, bumpers ("planets"), slingshots, drop targets, the
// plunger lane, sensors and flippers, in table pixels (TW×TH, origin top-left, y down).
import type { Shape, Vec } from './geometry';
import {
  makeFlipper,
  type Collider,
  type Flipper,
  type MaterialName,
} from './physics';

export const TW = 440;
export const TH = 556;
/** The playfield's walls: x 10..402; the plunger lane is x 402..430. */
const PLAY_RIGHT = 402;
const LANE_RIGHT = 430;
/** Mirrors an x across the playfield's centre line. */
const mx = (x: number) => PLAY_RIGHT + 10 - x;

export const ARCH = { c: { x: 220, y: 220 }, radius: 210 };
export const LANE_X = (PLAY_RIGHT + LANE_RIGHT) / 2;
/** The plunger's top at rest, and how far it pulls back. */
export const PLUNGER_REST = 528;
export const PLUNGER_TRAVEL = 24;
/** Launch speed (px/s) with no pull and with a full pull. */
export const LAUNCH_MIN = 520;
export const LAUNCH_MAX = 1400;
/** A ball below this has left the table. */
export const DRAIN_Y = TH + 24;

export const BUMPERS: readonly Vec[] = [
  { x: 160, y: 172 },
  { x: 262, y: 172 },
  { x: 211, y: 244 },
];
export const BUMPER_R = 20;

/** Top rollover lanes: centre x of each; guides sit between them. */
export const ROLLOVER_X = [165, 215, 265] as const;
export const LANE_GUIDES_X = [140, 190, 240, 290] as const;
export const LANE_TOP = 62;
export const LANE_BOTTOM = 100;

/** The S-T-A-R drop targets: a vertical bank on the right, facing left. */
export const TARGET_X = 392;
export const TARGETS: readonly { y0: number; y1: number }[] = [
  { y0: 258, y1: 280 },
  { y0: 284, y1: 306 },
  { y0: 310, y1: 332 },
  { y0: 336, y1: 358 },
];

/** The left ramp: a lane between the outer wall and an inner wall, with a one-way gate. */
export const RAMP = { x0: 10, x1: 58, gateY0: 238, gateY1: 252, bottom: 340 };
const RAMP_GATE_N = (() => {
  const dx = RAMP.x1 - RAMP.x0;
  const dy = RAMP.gateY1 - RAMP.gateY0;
  const l = Math.hypot(dx, dy);
  return { x: dy / l, y: -dx / l };
})();

/** Slingshot triangles: [top, bottom, inner corner]; the kicking face runs top → inner. */
const SLING_LEFT: [Vec, Vec, Vec] = [
  { x: 64, y: 396 },
  { x: 64, y: 440 },
  { x: 106, y: 464 },
];
export const SLINGS: readonly [Vec, Vec, Vec][] = [
  SLING_LEFT,
  SLING_LEFT.map((p) => ({ x: mx(p.x), y: p.y })) as [Vec, Vec, Vec],
];

/** Inlane guides: from the outlane post down to just beside the flipper pivot. */
const GUIDE_LEFT: Vec[] = [
  { x: 38, y: 425 },
  { x: 38, y: 462 },
  { x: 132, y: 510 },
];
export const GUIDES: readonly Vec[][] = [
  GUIDE_LEFT,
  GUIDE_LEFT.map((p) => ({ x: mx(p.x), y: p.y })),
];

export const FLIPPER_PIVOTS: readonly [Vec, Vec] = [
  { x: 140, y: 512 },
  { x: mx(140), y: 512 },
];
export const FLIPPER_LENGTH = 52;
export const FLIPPER_RADIUS = 7;
export const FLIPPER_SWING = { rest: 0.5, up: -0.45 };

export function makeFlippers(): [Flipper, Flipper] {
  return [
    makeFlipper(
      'left',
      FLIPPER_PIVOTS[0],
      FLIPPER_LENGTH,
      FLIPPER_RADIUS,
      FLIPPER_SWING,
    ),
    makeFlipper(
      'right',
      FLIPPER_PIVOTS[1],
      FLIPPER_LENGTH,
      FLIPPER_RADIUS,
      FLIPPER_SWING,
    ),
  ];
}

/** A rectangle that fires when the ball's centre enters it. */
export interface Sensor {
  id: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export const SENSORS: readonly Sensor[] = [
  ...ROLLOVER_X.map((x, i) => ({
    id: `rollover:${i}`,
    x0: x - 20,
    y0: 70,
    x1: x + 20,
    y1: 92,
  })),
  { id: 'ramp', x0: RAMP.x0, y0: 196, x1: RAMP.x1, y1: RAMP.gateY0 - 4 },
];

const seg = (
  id: string,
  a: Vec,
  b: Vec,
  material: MaterialName = 'wall',
  r = 2,
): Collider => ({ id, shape: { kind: 'segment', a, b, r }, material });

const poly = (id: string, pts: Vec[], material: MaterialName = 'wall') =>
  pts.slice(1).map((p, i) => seg(id, pts[i]!, p, material, 3));

/** The plunger's top surface at a given pull (0..1). */
export function plungerShape(pull: number): Shape {
  const y = PLUNGER_REST + pull * PLUNGER_TRAVEL;
  return {
    kind: 'segment',
    a: { x: PLAY_RIGHT, y },
    b: { x: LANE_RIGHT, y },
    // One-way, so a plunger snapping back up never shoves a launched ball down.
    oneWay: { x: 0, y: -1 },
  };
}

/** A fresh set of colliders (targets are enabled; the game toggles them as they drop). */
export function buildColliders(): Collider[] {
  const gateDir = { x: LANE_RIGHT - PLAY_RIGHT, y: -16 };
  const gl = Math.hypot(gateDir.x, gateDir.y);
  return [
    // Outer shell: the left wall runs past the bottom so outlane balls fall out cleanly.
    seg('wall', { x: 10, y: ARCH.c.y }, { x: 10, y: DRAIN_Y + 20 }),
    {
      id: 'wall',
      shape: { kind: 'arc', ...ARCH, a0: Math.PI, a1: Math.PI * 2 },
      material: 'wall',
    },
    seg('wall', { x: LANE_RIGHT, y: ARCH.c.y }, { x: LANE_RIGHT, y: TH }),
    seg('wall', { x: PLAY_RIGHT, y: 250 }, { x: PLAY_RIGHT, y: DRAIN_Y + 20 }),
    seg('wall', { x: PLAY_RIGHT, y: TH }, { x: LANE_RIGHT, y: TH }),
    // The lane gate: the launched ball passes up; a falling ball rolls off it to the left.
    {
      id: 'gate:lane',
      shape: {
        kind: 'segment',
        a: { x: PLAY_RIGHT, y: 250 },
        b: { x: LANE_RIGHT, y: 234 },
        oneWay: { x: gateDir.y / gl, y: -gateDir.x / gl },
      },
      material: 'gate',
    },
    { id: 'plunger', shape: plungerShape(0), material: 'gate' },
    // Top rollover lane guides.
    ...LANE_GUIDES_X.map((x) =>
      seg('post', { x, y: LANE_TOP }, { x, y: LANE_BOTTOM }, 'post', 3),
    ),
    // The ramp: inner wall and a slanted gate that lets the ball out the top only.
    seg(
      'wall',
      { x: RAMP.x1, y: RAMP.gateY1 },
      { x: RAMP.x1, y: RAMP.bottom },
      'wall',
      3,
    ),
    {
      id: 'gate:ramp',
      shape: {
        kind: 'segment',
        a: { x: RAMP.x0, y: RAMP.gateY0 },
        b: { x: RAMP.x1, y: RAMP.gateY1 },
        oneWay: RAMP_GATE_N,
      },
      material: 'gate',
    },
    // Keeps a ball falling out of the ramp from going straight down the left outlane.
    seg('wall', { x: 10, y: 370 }, { x: 30, y: 386 }, 'wall', 3),
    ...BUMPERS.map((c, i): Collider => ({
      id: `bumper:${i}`,
      shape: { kind: 'circle', c, radius: BUMPER_R },
      material: 'bumper',
    })),
    ...SLINGS.flatMap(([top, bottom, inner], i) => [
      seg('wall', top, bottom, 'wall', 3),
      seg('wall', bottom, inner, 'wall', 3),
      seg(`sling:${i}`, top, inner, 'sling', 3),
    ]),
    ...GUIDES.flatMap((pts) => poly('wall', pts)),
    // The drop-target bank, capped above and below so the ball can't get behind it.
    seg('wall', { x: TARGET_X, y: 254 }, { x: PLAY_RIGHT, y: 254 }),
    seg('wall', { x: TARGET_X, y: 362 }, { x: PLAY_RIGHT, y: 362 }),
    ...TARGETS.map((t, i) =>
      seg(
        `target:${i}`,
        { x: TARGET_X, y: t.y0 },
        { x: TARGET_X, y: t.y1 },
        'target',
        3,
      ),
    ),
  ];
}
