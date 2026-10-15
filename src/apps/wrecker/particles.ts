// Short-lived effect particles (sawdust, flames, shell casings, glass shards). Pure: spawned
// from a seeded Rand, stepped with plain physics. They are drawn each frame, never painted.
import type { Rand } from '@/os/random';

export type ParticleKind = 'sawdust' | 'flame' | 'casing' | 'shard';

export interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Seconds lived and seconds to live. */
  age: number;
  life: number;
  size: number;
  rot: number;
  spin: number;
  /** Times a casing has hit the floor. */
  bounces: number;
}

/** Most particles alive at once; the oldest are dropped first. */
export const MAX_PARTICLES = 700;

const GRAVITY: Record<ParticleKind, number> = {
  sawdust: 700,
  // Flames rise: negative gravity.
  flame: -260,
  casing: 1500,
  shard: 1100,
};

/** Speed kept on a floor bounce, and the horizontal friction then. */
const BOUNCE = 0.42;
const FLOOR_FRICTION = 0.72;

function make(
  kind: ParticleKind,
  x: number,
  y: number,
  vx: number,
  vy: number,
  life: number,
  size: number,
  spin = 0,
): Particle {
  return { kind, x, y, vx, vy, age: 0, life, size, rot: 0, spin, bounces: 0 };
}

export function sawdust(rand: Rand, x: number, y: number): Particle {
  return make(
    'sawdust',
    x,
    y,
    (rand() - 0.5) * 260,
    -40 - rand() * 160,
    0.5 + rand() * 0.5,
    1 + rand() * 2,
  );
}

export function flame(rand: Rand, x: number, y: number): Particle {
  return make(
    'flame',
    x + (rand() - 0.5) * 6,
    y + (rand() - 0.5) * 6,
    (rand() - 0.5) * 90,
    -60 - rand() * 120,
    0.3 + rand() * 0.35,
    5 + rand() * 6,
  );
}

/** A spent shell kicked out to the right of the gun; it bounces along the screen's bottom edge. */
export function casing(rand: Rand, x: number, y: number): Particle {
  return make(
    'casing',
    x + 10,
    y,
    70 + rand() * 120,
    -260 - rand() * 160,
    2.4 + rand() * 0.8,
    1,
    (rand() < 0.5 ? -1 : 1) * (8 + rand() * 10),
  );
}

/** A glass shard knocked loose by Repair's sweep (moving right). */
export function shard(rand: Rand, x: number, y: number): Particle {
  return make(
    'shard',
    x,
    y,
    90 + rand() * 160,
    (rand() - 0.5) * 140,
    0.6 + rand() * 0.4,
    3 + rand() * 5,
    (rand() - 0.5) * 20,
  );
}

/** Adds particles, dropping the oldest beyond MAX_PARTICLES. */
export function addParticles(list: Particle[], added: Particle[]): void {
  list.push(...added);
  if (list.length > MAX_PARTICLES) list.splice(0, list.length - MAX_PARTICLES);
}

/**
 * Advances every particle by `dt` seconds and removes the dead. Casings bounce on `floor`
 * (the bottom edge of the screen) and come to rest there; flames slow down as they rise.
 */
export function stepParticles(
  list: Particle[],
  dt: number,
  floor: number,
): void {
  let w = 0;
  for (const p of list) {
    p.age += dt;
    if (p.age >= p.life) continue;
    p.vy += GRAVITY[p.kind] * dt;
    if (p.kind === 'flame') {
      p.vx *= 1 - 2 * dt;
      p.size *= 1 + 1.6 * dt;
    }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.rot += p.spin * dt;
    if (p.kind === 'casing' && p.y >= floor) {
      p.y = floor;
      if (p.vy >= 60) {
        p.vy = -p.vy * BOUNCE;
        p.vx *= FLOOR_FRICTION;
        p.spin *= 0.6;
        p.bounces++;
      } else {
        // Resting: it rolls to a stop.
        p.vy = 0;
        p.vx *= Math.max(0, 1 - 4 * dt);
        p.spin *= Math.max(0, 1 - 4 * dt);
      }
    }
    list[w++] = p;
  }
  list.length = w;
}
