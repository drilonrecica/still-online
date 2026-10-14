// Shape helpers shared by the photo scene painters. Everything random comes from the seeded `rand`.
import { pick, type Rand } from '@/os/random';

export type Ctx = CanvasRenderingContext2D;
export type Painter = (ctx: Ctx, rand: Rand, w: number, h: number) => void;

export const between = (rand: Rand, min: number, max: number) =>
  min + rand() * (max - min);

export function vertical(
  ctx: Ctx,
  y0: number,
  y1: number,
  stops: readonly string[],
) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  stops.forEach((c, i) => g.addColorStop(i / Math.max(1, stops.length - 1), c));
  return g;
}

export function rect(
  ctx: Ctx,
  fill: string | CanvasGradient,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

export function ellipse(
  ctx: Ctx,
  fill: string,
  x: number,
  y: number,
  rx: number,
  ry: number,
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.5, rx), Math.max(0.5, ry), 0, 0, Math.PI * 2);
  ctx.fill();
}

export function poly(
  ctx: Ctx,
  fill: string,
  points: readonly [number, number][],
) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
}

/** A row of round heads and shoulders along the bottom edge (crowds, audiences). */
export function crowd(
  ctx: Ctx,
  rand: Rand,
  w: number,
  h: number,
  top: number,
  tones: readonly [string, ...string[]],
) {
  const size = h * 0.07;
  for (let row = 0; row < 3; row++) {
    for (let x = -size; x < w + size; x += size * between(rand, 1.1, 1.8)) {
      const y = top + row * size * 0.9 + between(rand, -size * 0.2, size * 0.2);
      const tone = pick(rand, tones);
      ellipse(ctx, tone, x, y + size * 1.3, size * 1.1, size * 0.9);
      ellipse(ctx, tone, x, y, size * 0.55, size * 0.65);
    }
  }
}
