// Hen spawning and movement. Hens live in their depth layer's coordinates.
import type { Rand } from '@/os/random';
import {
  DEPTH,
  GOLDEN,
  VIEW_H,
  VIEW_W,
  layerWidth,
  type Depth,
} from './layout';

export type HenState = 'fly' | 'descend' | 'peck' | 'takeoff' | 'fall';

export interface Hen {
  id: number;
  depth: Depth;
  x: number;
  y: number;
  /** Signed horizontal speed, px/s; its sign is the facing direction. */
  vx: number;
  /** Vertical speed while falling. */
  vy: number;
  /** The flight line it bobs around and climbs back to after pecking. */
  baseY: number;
  state: HenState;
  /** Seconds left pecking. */
  timer: number;
  /** Layer x where it will drop down to peck, or null to fly straight through. */
  landX: number | null;
  golden: boolean;
  /** Wing/bob phase in radians. */
  flap: number;
  /** Tumble angle while falling. */
  spin: number;
}

const DESCEND_SPEED = 120;
const CLIMB_SPEED = 140;
const GRAVITY = 700;
/** How far past its layer's edge a hen may fly before it is dropped. */
const MARGIN = 80;

/** A new hen entering just outside the visible part of its layer, at `visibleLeft` (layer px). */
export function spawnHen(
  rand: Rand,
  id: number,
  depth: Depth,
  visibleLeft: number,
  golden = false,
): Hen {
  const spec = DEPTH[depth];
  const right = rand() < 0.5;
  const speed = (golden ? GOLDEN.speed : spec.speed) * (0.85 + rand() * 0.3);
  const top = golden ? spec.skyTop : spec.skyTop + 10;
  const baseY = top + rand() * (spec.skyBottom - top);
  const edge = spec.radius * 2;
  const x = right ? visibleLeft - edge : visibleLeft + VIEW_W + edge;
  // Some hens drop down somewhere in view to peck at the ground.
  const lands = !golden && rand() < 0.3;
  const landX = lands ? visibleLeft + VIEW_W * (0.2 + rand() * 0.6) : null;
  return {
    id,
    depth,
    x,
    y: baseY,
    vx: right ? speed : -speed,
    vy: 0,
    baseY,
    state: 'fly',
    timer: 0,
    landX,
    golden,
    flap: rand() * Math.PI * 2,
    spin: 0,
  };
}

/** Advances one hen by `dt` seconds (`pace` scales speeds). Returns false once it is gone. */
export function moveHen(h: Hen, dt: number, pace: number, rand: Rand): boolean {
  const spec = DEPTH[h.depth];
  const v = h.vx * pace;
  switch (h.state) {
    case 'fly': {
      h.flap += dt * (h.golden ? 26 : 16) * pace;
      h.x += v * dt;
      h.y = h.baseY + Math.sin(h.flap * 0.25) * spec.radius * 0.35;
      if (h.landX !== null && (v > 0 ? h.x >= h.landX : h.x <= h.landX)) {
        h.landX = null;
        h.state = 'descend';
      }
      break;
    }
    case 'descend':
      h.flap += dt * 20 * pace;
      h.x += v * 0.5 * dt;
      h.y += DESCEND_SPEED * pace * dt * (spec.radius / 17);
      if (h.y >= spec.groundY) {
        h.y = spec.groundY;
        h.state = 'peck';
        h.timer = 1.8 + rand() * 2.2;
      }
      break;
    case 'peck':
      h.flap += dt * 10 * pace;
      h.timer -= dt * pace;
      if (h.timer <= 0) h.state = 'takeoff';
      break;
    case 'takeoff':
      h.flap += dt * 24 * pace;
      h.x += v * 0.7 * dt;
      h.y -= CLIMB_SPEED * pace * dt * (spec.radius / 17);
      if (h.y <= h.baseY) {
        h.y = h.baseY;
        h.state = 'fly';
      }
      break;
    case 'fall':
      h.vy += GRAVITY * dt;
      h.y += h.vy * dt;
      h.x += v * 0.15 * dt;
      h.spin += dt * 9 * Math.sign(h.vx || 1);
      return h.y < VIEW_H + spec.radius * 3;
  }
  return h.x > -MARGIN && h.x < layerWidth(h.depth) + MARGIN;
}

/** Can be shot: anything not already tumbling. */
export const isAlive = (h: Hen) => h.state !== 'fall';

/** Hit-test a hen at layer point (x, y): its round body plus its head. */
export function henContains(h: Hen, x: number, y: number): boolean {
  const r = DEPTH[h.depth].radius;
  const dir = h.vx >= 0 ? 1 : -1;
  const hx = h.x + dir * r * 0.85;
  const hy = h.y - r * 0.55;
  return (
    (x - h.x) ** 2 + (y - h.y) ** 2 <= (r * 1.05) ** 2 ||
    (x - hx) ** 2 + (y - hy) ** 2 <= (r * 0.55) ** 2
  );
}
