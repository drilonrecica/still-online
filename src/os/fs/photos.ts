// Procedural "digicam photos": a scene drawn from shapes, then washed out like a 2007 point-and-shoot
// (warm tint, faded blacks, vignette, orange date stamp). Same spec → same pixels, every run.
import { mulberry32, randInt } from '@/os/random';
import { SCENE_PAINTERS } from './photoScenes';
import type { PhotoSpec } from './types';

/**
 * The stamp printed in the corner: `'07 6 14`-style (yy m d). Story photos (`day` set) are dated
 * October 2007, day 1 = the 8th; the others are picked from the seed.
 */
export function photoDateStamp(seed: number, day?: number): string {
  if (day !== undefined) return `'07 10 ${7 + day}`;
  const rand = mulberry32(seed ^ 0x5eed);
  const year = rand() < 0.7 ? 7 : 6;
  return `'0${year} ${randInt(rand, 1, 12)} ${randInt(rand, 1, 28)}`;
}

/** Draws `spec` onto `canvas` at `w`×`h`. Without a 2D context (jsdom) it does nothing. */
export function renderPhoto(
  spec: PhotoSpec,
  canvas: HTMLCanvasElement,
  w: number,
  h: number,
): void {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.save();
  SCENE_PAINTERS[spec.scene](ctx, mulberry32(spec.seed), w, h, spec.look);
  ctx.restore();

  // Warm tint and lifted blacks.
  ctx.fillStyle = 'rgba(255, 170, 80, 0.12)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(235, 225, 210, 0.1)';
  ctx.fillRect(0, 0, w, h);

  const vignette = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.35,
    w / 2,
    h / 2,
    Math.hypot(w, h) / 2,
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  const size = Math.max(8, Math.round(h * 0.06));
  ctx.font = `bold ${size}px 'Courier New', monospace`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = 'rgba(255, 140, 30, 0.9)';
  ctx.fillText(
    photoDateStamp(spec.seed, spec.day),
    w - size * 0.6,
    h - size * 0.5,
  );
}
