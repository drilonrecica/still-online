// Star Pinball physics: one ball against static shapes and two driven flippers, stepped at a
// fixed 1/240 s and split into substeps so nothing moves more than half a ball radius at once.
import { contact, dot, type Contact, type Shape, type Vec } from './geometry';

export const STEP = 1 / 240;
export const BALL_R = 8;
/** Along the table's tilt (screen down), px/s². */
export const GRAVITY = 820;
export const MAX_SPEED = 2000;
/** Largest distance (ball + surface) covered in one substep. */
export const MAX_SUBSTEP_MOVE = BALL_R / 2;

export interface Material {
  /** Bounciness of the normal velocity, 0..1. */
  restitution: number;
  /** Extra outward speed on a hit hard enough to fire it (bumpers, slingshots). */
  kick?: number;
  /** Impact speed (px/s) needed to fire the kick. */
  kickMin?: number;
}

export const MATERIALS = {
  wall: { restitution: 0.45 },
  post: { restitution: 0.6 },
  gate: { restitution: 0.3 },
  bumper: { restitution: 0.85, kick: 300, kickMin: 0 },
  sling: { restitution: 0.7, kick: 320, kickMin: 60 },
  target: { restitution: 0.35 },
  flipper: { restitution: 0.3 },
} satisfies Record<string, Material>;
export type MaterialName = keyof typeof MATERIALS;

export interface Collider {
  /** Names the part for scoring, e.g. `bumper:0`, `target:2`, `wall`. */
  id: string;
  shape: Shape;
  material: MaterialName;
  /** Dropped targets and dead parts don't collide. */
  enabled?: boolean;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export type Side = 'left' | 'right';

export interface Flipper {
  side: Side;
  pivot: Vec;
  length: number;
  /** Capsule radius. */
  radius: number;
  angle: number;
  /** rad/s, current. */
  omega: number;
  rest: number;
  up: number;
  pressed: boolean;
}

/** rad/s while swinging up and falling back. */
export const FLIP_UP_SPEED = 24;
export const FLIP_DOWN_SPEED = 14;

export function makeFlipper(
  side: Side,
  pivot: Vec,
  length: number,
  radius: number,
  swing: { rest: number; up: number },
): Flipper {
  // The right flipper mirrors the left one: angles measured from the left (π − a).
  const rest = side === 'left' ? swing.rest : Math.PI - swing.rest;
  const up = side === 'left' ? swing.up : Math.PI - swing.up;
  return {
    side,
    pivot,
    length,
    radius,
    angle: rest,
    omega: 0,
    rest,
    up,
    pressed: false,
  };
}

export function flipperTip(f: Flipper): Vec {
  return {
    x: f.pivot.x + Math.cos(f.angle) * f.length,
    y: f.pivot.y + Math.sin(f.angle) * f.length,
  };
}

/** Sets the flipper's angular velocity towards its target and turns it by `dt`. */
export function turnFlipper(f: Flipper, dt: number): void {
  const target = f.pressed ? f.up : f.rest;
  const diff = target - f.angle;
  if (diff === 0) {
    f.omega = 0;
    return;
  }
  const speed = f.pressed ? FLIP_UP_SPEED : FLIP_DOWN_SPEED;
  const turn = Math.sign(diff) * Math.min(Math.abs(diff), speed * dt);
  f.angle += turn;
  f.omega = turn / dt;
}

export function flipperShape(f: Flipper): Shape {
  return {
    kind: 'segment',
    a: f.pivot,
    b: flipperTip(f),
    r: f.radius,
  };
}

/** Bounces the ball off a surface moving at `surface` velocity; returns the impact speed. */
export function bounce(
  ball: Ball,
  c: Contact,
  mat: Material,
  surface: Vec = { x: 0, y: 0 },
): number {
  ball.x += c.n.x * c.depth;
  ball.y += c.n.y * c.depth;
  const rel = { x: ball.vx - surface.x, y: ball.vy - surface.y };
  const vn = dot(rel, c.n);
  if (vn >= 0) return 0;
  const j = -(1 + mat.restitution) * vn;
  ball.vx += c.n.x * j;
  ball.vy += c.n.y * j;
  // A touch of rolling friction along the surface.
  const tx = -c.n.y;
  const ty = c.n.x;
  const vt = dot(rel, { x: tx, y: ty });
  ball.vx -= tx * vt * 0.02;
  ball.vy -= ty * vt * 0.02;
  if (mat.kick && -vn >= (mat.kickMin ?? 0)) {
    ball.vx += c.n.x * mat.kick;
    ball.vy += c.n.y * mat.kick;
  }
  return -vn;
}

export function clampSpeed(ball: Ball): void {
  const s = Math.hypot(ball.vx, ball.vy);
  if (s > MAX_SPEED) {
    ball.vx *= MAX_SPEED / s;
    ball.vy *= MAX_SPEED / s;
  }
}

/** A collision that happened during a step, for scoring and sounds. */
export interface Hit {
  id: string;
  material: MaterialName;
  speed: number;
}

/** How many substeps keep every move under MAX_SUBSTEP_MOVE. */
export function substepsFor(
  ball: Ball,
  flippers: readonly Flipper[],
  dt: number,
) {
  const ballMove = Math.hypot(ball.vx, ball.vy) * dt;
  let flipMove = 0;
  // A flipper away from its target swings this step (at most at the up speed).
  for (const f of flippers)
    if (f.angle !== (f.pressed ? f.up : f.rest))
      flipMove = Math.max(flipMove, FLIP_UP_SPEED * f.length * dt);
  return Math.max(1, Math.ceil((ballMove + flipMove) / MAX_SUBSTEP_MOVE));
}

/** Advances the ball and flippers by `dt`; returns what the ball hit. */
export function stepPhysics(
  ball: Ball,
  colliders: readonly Collider[],
  flippers: readonly Flipper[],
  dt: number = STEP,
  gravity: number = GRAVITY,
): Hit[] {
  const hits: Hit[] = [];
  const n = substepsFor(ball, flippers, dt);
  const h = dt / n;
  for (let i = 0; i < n; i++) {
    ball.vy += gravity * h;
    clampSpeed(ball);
    ball.x += ball.vx * h;
    ball.y += ball.vy * h;
    for (const f of flippers) {
      turnFlipper(f, h);
      const c = contact(ball, BALL_R, flipperShape(f));
      if (!c) continue;
      // The flipper's surface speed at the contact point: ω × (p − pivot).
      const surface = {
        x: -f.omega * (c.point.y - f.pivot.y),
        y: f.omega * (c.point.x - f.pivot.x),
      };
      const speed = bounce(ball, c, MATERIALS.flipper, surface);
      if (speed > 0)
        hits.push({ id: `flipper:${f.side}`, material: 'flipper', speed });
    }
    for (const col of colliders) {
      if (col.enabled === false) continue;
      const one = col.shape.kind === 'segment' ? col.shape.oneWay : undefined;
      // A one-way wall lets a ball moving with its normal pass (e.g. up out of a lane).
      if (one && dot({ x: ball.vx, y: ball.vy }, one) >= 0) continue;
      const c = contact(ball, BALL_R, col.shape);
      if (!c) continue;
      const speed = bounce(ball, c, MATERIALS[col.material]);
      if (speed > 0) hits.push({ id: col.id, material: col.material, speed });
    }
    clampSpeed(ball);
  }
  return hits;
}
