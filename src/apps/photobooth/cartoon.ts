// The "cartoon me" fallback: a procedurally drawn face on a 2D canvas, so the filters apply to it
// exactly like they do to a webcam frame.

import type { Gender } from '@/os/types';

export const HAIR = ['spiky', 'bob', 'curly', 'bald', 'long'] as const;
export const EYES = ['round', 'sleepy', 'wink', 'stars'] as const;
export const MOUTHS = ['smile', 'grin', 'oh', 'smirk'] as const;

export interface CartoonLook {
  hair: number;
  eyes: number;
  mouth: number;
}

/** The look the booth starts with: long hair for a girl, spiky for a boy. */
export const DEFAULT_LOOK: Readonly<Record<Gender, CartoonLook>> = {
  girl: { hair: HAIR.indexOf('long'), eyes: 0, mouth: 0 },
  boy: { hair: HAIR.indexOf('spiky'), eyes: 0, mouth: 0 },
};

/** Next index in a list of `count` choices. */
export function cycle(index: number, count: number): number {
  return (index + 1) % count;
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  style: number,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.fillStyle = '#5a3418';
  if (style === 0) {
    ctx.beginPath();
    for (let i = 0; i <= 8; i++) {
      const a = Math.PI + (Math.PI * i) / 8;
      const rad = i % 2 === 0 ? r * 1.3 : r * 0.95;
      ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
  } else if (style === 1) {
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.08, Math.PI * 0.9, Math.PI * 2.1);
    ctx.lineTo(cx + r * 1.08, cy + r * 0.7);
    ctx.lineTo(cx - r * 1.08, cy + r * 0.7);
    ctx.closePath();
    ctx.fill();
  } else if (style === 4) {
    // Long: a crown of hair that falls down both sides past the chin.
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.12, Math.PI, Math.PI * 2);
    ctx.lineTo(cx + r * 1.18, cy + r * 1.35);
    ctx.quadraticCurveTo(cx, cy + r * 1.5, cx - r * 1.18, cy + r * 1.35);
    ctx.closePath();
    ctx.fill();
  } else if (style === 2) {
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (Math.PI * i) / 6;
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(a) * r * 0.95,
        cy + Math.sin(a) * r * 0.95,
        r * 0.28,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

/** Draws the whole scene (backdrop + head + features) filling `w × h`. */
export function drawCartoon(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  look: CartoonLook,
): void {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#9ed4f5');
  bg.addColorStop(1, '#f6e7a8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h * 0.5;
  const r = h * 0.32;

  // Shoulders.
  ctx.fillStyle = '#d4513f';
  ctx.beginPath();
  ctx.ellipse(cx, h * 1.02, r * 1.5, r * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  drawHair(ctx, look.hair, cx, cy, r);

  // Head and ears.
  ctx.fillStyle = '#f4c79b';
  ctx.strokeStyle = '#7a4a1e';
  ctx.lineWidth = 3;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(cx + side * r, cy + r * 0.05, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.95, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes.
  const ex = r * 0.38;
  const ey = cy - r * 0.15;
  ctx.fillStyle = '#222';
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 4;
  for (const side of [-1, 1]) {
    const x = cx + side * ex;
    if (look.eyes === 0) {
      ctx.beginPath();
      ctx.arc(x, ey, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (look.eyes === 1) {
      ctx.beginPath();
      ctx.arc(x, ey, r * 0.13, 0, Math.PI);
      ctx.stroke();
    } else if (look.eyes === 2 && side === 1) {
      ctx.beginPath();
      ctx.moveTo(x - r * 0.12, ey);
      ctx.lineTo(x + r * 0.12, ey);
      ctx.stroke();
    } else if (look.eyes === 3) {
      ctx.fillStyle = '#e8b800';
      star(ctx, x, ey, r * 0.17);
      ctx.fillStyle = '#222';
    } else {
      ctx.beginPath();
      ctx.arc(x, ey, r * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cheeks and nose.
  ctx.fillStyle = 'rgb(240 120 120 / 55%)';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(
      cx + side * r * 0.6,
      cy + r * 0.28,
      r * 0.13,
      r * 0.09,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.strokeStyle = '#a2643a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.02);
  ctx.lineTo(cx - r * 0.07, cy + r * 0.2);
  ctx.lineTo(cx + r * 0.05, cy + r * 0.2);
  ctx.stroke();

  // Mouth.
  const my = cy + r * 0.45;
  ctx.strokeStyle = '#7a1e1e';
  ctx.fillStyle = '#7a1e1e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (look.mouth === 0) {
    ctx.arc(cx, my - r * 0.12, r * 0.28, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  } else if (look.mouth === 1) {
    ctx.arc(cx, my - r * 0.1, r * 0.3, 0, Math.PI);
    ctx.closePath();
    ctx.fill();
  } else if (look.mouth === 2) {
    ctx.ellipse(cx, my, r * 0.1, r * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.moveTo(cx - r * 0.22, my);
    ctx.quadraticCurveTo(
      cx + r * 0.1,
      my + r * 0.12,
      cx + r * 0.26,
      my - r * 0.08,
    );
    ctx.stroke();
  }
}
