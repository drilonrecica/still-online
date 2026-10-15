// Small canvas helpers shared by the wallpaper painters. They only write to the context.
import type { Rand } from '@/os/random';

export type Rgb = readonly [number, number, number];
export type Stops = readonly (readonly [number, string])[];

export const rgba = ([r, g, b]: Rgb, a: number) =>
  `rgba(${r}, ${g}, ${b}, ${a})`;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Fills the band y0..y1 with a vertical gradient. */
export function fillVertical(
  ctx: CanvasRenderingContext2D,
  w: number,
  y0: number,
  y1: number,
  stops: Stops,
): CanvasGradient {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, w, y1 - y0);
  return g;
}

/** A soft round light: `color` at the centre fading to transparent at radius `r`. */
export function glow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: Rgb,
  alpha = 1,
): void {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(0.4, rgba(color, alpha * 0.45));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export function disc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  fill: string | CanvasGradient,
): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function ellipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fill: string | CanvasGradient,
  rotation = 0,
): void {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  ctx.fill();
}

/** A cumulus cloud: a flat-bottomed heap of soft puffs, lit from above. */
export function cloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  rand: Rand,
  alpha = 0.9,
): void {
  const puffs = 7 + Math.floor(rand() * 6);
  for (let i = 0; i < puffs; i++) {
    const t = i / (puffs - 1);
    const px = x + (t - 0.5) * width * (0.8 + rand() * 0.2);
    // Bigger puffs in the middle make the heap.
    const r = width * (0.12 + 0.16 * Math.sin(Math.PI * t) + rand() * 0.05);
    const py = y - r * (0.35 + rand() * 0.35);
    const g = ctx.createRadialGradient(px, py - r * 0.3, 0, px, py, r);
    g.addColorStop(0, rgba([255, 255, 255], alpha));
    g.addColorStop(0.55, rgba([244, 248, 252], alpha * 0.8));
    g.addColorStop(1, rgba([214, 228, 244], 0));
    ctx.fillStyle = g;
    ctx.fillRect(px - r, py - r, r * 2, r * 2);
  }
}

/** Little round stars above `maxY`. */
export function stars(
  ctx: CanvasRenderingContext2D,
  w: number,
  maxY: number,
  count: number,
  rand: Rand,
  scale = 1,
): void {
  for (let i = 0; i < count; i++) {
    const x = rand() * w;
    const y = rand() * maxY;
    const r = (0.3 + rand() * rand() * 1.4) * scale;
    // Fainter towards the horizon.
    const a = (0.35 + rand() * 0.65) * (1 - (y / maxY) * 0.6);
    disc(ctx, x, y, r, rgba([255, 255, 255], a));
  }
}

/**
 * Heights along a ridge: `points + 1` evenly spaced y values around `base`, from a sum of
 * random-phase sines (smooth hills when `rough` is 0, jagged when it is near 1).
 */
export function ridge(
  rand: Rand,
  points: number,
  base: number,
  amp: number,
  rough = 0,
): number[] {
  const waves = [1, 2.3, 4.1, 7.7].map((f, i) => ({
    f,
    phase: rand() * Math.PI * 2,
    a: i === 0 ? 1 : 0.5 / i,
  }));
  const ys: number[] = [];
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    let y = 0;
    for (const { f, phase, a } of waves)
      y += Math.sin(t * f * Math.PI + phase) * a;
    y += (rand() - 0.5) * rough;
    ys.push(base - y * amp);
  }
  return ys;
}

/** Fills the area below a ridge (from `ridge`) down to `bottom`. */
export function fillRidge(
  ctx: CanvasRenderingContext2D,
  w: number,
  ys: readonly number[],
  bottom: number,
  fill: string | CanvasGradient,
): void {
  const step = w / (ys.length - 1);
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(0, bottom);
  ys.forEach((y, i) => ctx.lineTo(i * step, y));
  ctx.lineTo(w, bottom);
  ctx.closePath();
  ctx.fill();
}

/** Darkens the corners a little, like a lens. */
export function vignette(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  alpha = 0.35,
): void {
  const g = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.45,
    w / 2,
    h / 2,
    Math.hypot(w, h) / 2,
  );
  g.addColorStop(0, 'rgba(0, 0, 0, 0)');
  g.addColorStop(1, `rgba(0, 0, 0, ${alpha})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** A four-pointed twinkle. */
export function sparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
): void {
  const k = r * 0.22;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x + k, y - k, x + r, y);
  ctx.quadraticCurveTo(x + k, y + k, x, y + r);
  ctx.quadraticCurveTo(x - k, y + k, x - r, y);
  ctx.quadraticCurveTo(x - k, y - k, x, y - r);
  ctx.fill();
}
