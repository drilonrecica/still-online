// Short-lived light effects: muzzle flashes, tracers, impact flashes, shockwave rings and the
// glow of fresh scorch cooling down. Pure data, stepped by the engine and drawn each frame on
// the effects canvas (never painted onto the damage).

export type FxKind = 'muzzle' | 'tracer' | 'flash' | 'ring' | 'glow';

export interface Fx {
  kind: FxKind;
  x: number;
  y: number;
  /** A tracer's far end; unused otherwise. */
  x2: number;
  y2: number;
  /** Radius (flash, glow), the ring's final radius, or the muzzle flame's length. */
  r: number;
  /** Which way a muzzle flash points. */
  angle: number;
  age: number;
  life: number;
}

/** Most effects alive at once; the oldest are dropped first. */
export const MAX_FX = 300;

function make(
  kind: FxKind,
  x: number,
  y: number,
  r: number,
  life: number,
  extra: Partial<Pick<Fx, 'x2' | 'y2' | 'angle'>> = {},
): Fx {
  return {
    kind,
    x,
    y,
    x2: extra.x2 ?? x,
    y2: extra.y2 ?? y,
    r,
    angle: extra.angle ?? 0,
    age: 0,
    life,
  };
}

/** The flame out of a gun's muzzle, pointing along `angle`. */
export const muzzle = (x: number, y: number, angle: number, length: number) =>
  make('muzzle', x, y, length, 0.05, { angle });

/** A bullet's bright streak from the muzzle to where it hit. */
export const tracer = (x: number, y: number, x2: number, y2: number) =>
  make('tracer', x, y, 0, 0.07, { x2, y2 });

/** A burst of light where something hit. */
export const flash = (x: number, y: number, r: number, life = 0.08) =>
  make('flash', x, y, r, life);

/** A shockwave ring growing out to `r`. */
export const ring = (x: number, y: number, r: number, life = 0.32) =>
  make('ring', x, y, r, life);

/** Fresh scorch glowing orange, cooling over `life` seconds. */
export const glow = (x: number, y: number, r: number, life = 1.4) =>
  make('glow', x, y, r, life);

export function addFx(list: Fx[], added: Fx[]): void {
  list.push(...added);
  if (list.length > MAX_FX) list.splice(0, list.length - MAX_FX);
}

/** Ages every effect by `dt` seconds and removes the finished ones. */
export function stepFx(list: Fx[], dt: number): void {
  let w = 0;
  for (const f of list) {
    f.age += dt;
    if (f.age < f.life) list[w++] = f;
  }
  list.length = w;
}
