// Short-lived effect particles. Pure: spawned from a seeded Rand, stepped with plain physics.
// They are drawn each frame, never painted.
//
// sawdust: chips off the chainsaw · flame: the flamethrower's stream · casing: spent shells that
// bounce on the screen's bottom edge · shard: glass, from Repair's sweep or a hammer blow ·
// spark: a hot streak · smoke: a grey or dusty puff that grows and fades · ember: a glowing speck
// that floats up and cools · chip: a tumbling flake of broken screen.
import type { Rand } from '@/os/random';

export type ParticleKind =
  | 'sawdust'
  | 'flame'
  | 'casing'
  | 'shard'
  | 'spark'
  | 'smoke'
  | 'ember'
  | 'chip';

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
  /** 0..1, per kind: smoke from dark (0) to dusty (1), a chip's brightness. */
  shade: number;
}

/** Most particles alive at once; the oldest are dropped first. */
export const MAX_PARTICLES = 1200;

const GRAVITY: Record<ParticleKind, number> = {
  sawdust: 700,
  // Flames, smoke and embers rise: negative gravity.
  flame: -260,
  casing: 1500,
  shard: 1100,
  spark: 900,
  smoke: -40,
  ember: -70,
  chip: 1300,
};

/** Air drag per second, and how fast a particle grows (1 = doubles in a second). */
const DRAG: Partial<Record<ParticleKind, number>> = {
  flame: 3.2,
  smoke: 1.6,
  ember: 1.2,
  spark: 1.5,
};
const GROW: Partial<Record<ParticleKind, number>> = {
  flame: 1.6,
  smoke: 1.3,
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
  shade = 0,
): Particle {
  return {
    kind,
    x,
    y,
    vx,
    vy,
    age: 0,
    life,
    size,
    rot: 0,
    spin,
    bounces: 0,
    shade,
  };
}

const TAU = Math.PI * 2;

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

/**
 * Sawdust thrown hard along `angle` (radians), as the chain flings it out behind the cut.
 */
export function sawdustSpray(
  rand: Rand,
  x: number,
  y: number,
  angle: number,
): Particle {
  const a = angle + (rand() - 0.5) * 0.9;
  const speed = 160 + rand() * 280;
  return make(
    'sawdust',
    x,
    y,
    Math.cos(a) * speed,
    Math.sin(a) * speed - 60,
    0.45 + rand() * 0.5,
    1 + rand() * 2.4,
  );
}

/**
 * A tongue of flame. Without a velocity it licks upwards where it starts; the flamethrower
 * gives it one, from the nozzle towards the target.
 */
export function flame(
  rand: Rand,
  x: number,
  y: number,
  vx = (rand() - 0.5) * 90,
  vy = -60 - rand() * 120,
): Particle {
  return make(
    'flame',
    x + (rand() - 0.5) * 6,
    y + (rand() - 0.5) * 6,
    vx,
    vy,
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

/** A glass shard blown out of a hammer blow, in any direction, mostly upwards. */
export function glassBurst(rand: Rand, x: number, y: number): Particle {
  const a = rand() * TAU;
  const speed = 120 + rand() * 340;
  return make(
    'shard',
    x,
    y,
    Math.cos(a) * speed,
    Math.sin(a) * speed - 160,
    0.6 + rand() * 0.5,
    2 + rand() * 5,
    (rand() - 0.5) * 30,
  );
}

/** A hot spark flying out along `angle` ± `spread` / 2. */
export function spark(
  rand: Rand,
  x: number,
  y: number,
  angle = rand() * TAU,
  spread = TAU,
): Particle {
  const a = angle + (rand() - 0.5) * spread;
  const speed = 220 + rand() * 520;
  return make(
    'spark',
    x,
    y,
    Math.cos(a) * speed,
    Math.sin(a) * speed,
    0.12 + rand() * 0.3,
    0.8 + rand() * 1.2,
  );
}

/** A puff of smoke (`dusty` 0: dark smoke, 1: pale dust) drifting up from (x, y). */
export function smoke(rand: Rand, x: number, y: number, dusty = 0): Particle {
  return make(
    'smoke',
    x + (rand() - 0.5) * 8,
    y + (rand() - 0.5) * 8,
    (rand() - 0.5) * 50,
    -15 - rand() * 45,
    0.8 + rand() * 0.9,
    5 + rand() * 7,
    (rand() - 0.5) * 2,
    dusty,
  );
}

/** A glowing ember floating up and cooling. */
export function ember(rand: Rand, x: number, y: number): Particle {
  return make(
    'ember',
    x + (rand() - 0.5) * 20,
    y + (rand() - 0.5) * 20,
    (rand() - 0.5) * 120,
    -60 - rand() * 160,
    0.6 + rand() * 0.8,
    0.9 + rand() * 1.4,
    0,
    rand(),
  );
}

/** A flake of broken screen, tumbling. */
export function chip(rand: Rand, x: number, y: number): Particle {
  const a = rand() * TAU;
  const speed = 80 + rand() * 260;
  return make(
    'chip',
    x,
    y,
    Math.cos(a) * speed,
    Math.sin(a) * speed - 140,
    0.7 + rand() * 0.5,
    1.5 + rand() * 3.5,
    (rand() - 0.5) * 26,
    rand(),
  );
}

/** Adds particles, dropping the oldest beyond MAX_PARTICLES. */
export function addParticles(list: Particle[], added: Particle[]): void {
  list.push(...added);
  if (list.length > MAX_PARTICLES) list.splice(0, list.length - MAX_PARTICLES);
}

/**
 * Advances every particle by `dt` seconds and removes the dead. Casings bounce on `floor`
 * (the bottom edge of the screen) and come to rest there; flames and smoke slow and swell.
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
    const drag = DRAG[p.kind];
    if (drag) {
      const k = Math.max(0, 1 - drag * dt);
      p.vx *= k;
      p.vy *= k;
    }
    const grow = GROW[p.kind];
    if (grow) p.size *= 1 + grow * dt;
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
