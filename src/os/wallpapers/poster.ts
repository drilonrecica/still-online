// Theo's Velvet Lantern show poster (Theo's day-10 gift, v0.5): a hand-drawn lantern under
// stars and hand-lettered type, like a library-printer copy of a pencil-and-marker original.
import { t } from '@/i18n/t';
import type { Rand } from '@/os/random';
import type { Painter } from './types';
import { disc, ellipse, fillVertical, glow, type Rgb, vignette } from './paint';

const INK = '#1a1230';
const CREAM = '#f6e7c1';
const WARM: Rgb = [255, 196, 92];

/** A slightly shaky polyline, drawn twice like a pencil going over its own line. */
function sketch(
  ctx: CanvasRenderingContext2D,
  rand: Rand,
  points: readonly (readonly [number, number])[],
  width: number,
  color: string,
  closed = false,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (let pass = 0; pass < 2; pass++) {
    const wobble = width * 0.6;
    ctx.beginPath();
    points.forEach(([x, y], i) => {
      const jx = x + (rand() - 0.5) * wobble;
      const jy = y + (rand() - 0.5) * wobble;
      if (i) ctx.lineTo(jx, jy);
      else ctx.moveTo(jx, jy);
    });
    if (closed) ctx.closePath();
    ctx.stroke();
  }
}

/** A five-pointed doodle star, outlined. */
function star(
  ctx: CanvasRenderingContext2D,
  rand: Rand,
  x: number,
  y: number,
  r: number,
): void {
  const tilt = rand() * Math.PI;
  const points: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const a = tilt + (i * Math.PI) / 5;
    const d = i % 2 ? r * 0.45 : r;
    points.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
  }
  sketch(ctx, rand, points, Math.max(1, r * 0.14), CREAM, true);
}

/** Rough advance widths, in font sizes; enough for hand lettering, which is uneven anyway. */
function advance(ch: string): number {
  if (ch === ' ') return 0.4;
  if ('I1·.'.includes(ch)) return 0.38;
  if ('MW'.includes(ch)) return 0.9;
  return 0.72;
}

/** Hand-lettered capitals centred on `cx`: each letter a little tilted and off the line. */
function letters(
  ctx: CanvasRenderingContext2D,
  rand: Rand,
  text: string,
  cx: number,
  y: number,
  size: number,
  fill: string,
): void {
  const chars = [...text];
  const total = chars.reduce((sum, ch) => sum + advance(ch) * size, 0);
  ctx.font = `bold ${Math.round(size)}px 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', cursive`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  let x = cx - total / 2;
  for (const ch of chars) {
    const dy = (rand() - 0.5) * size * 0.12;
    const tilt = (rand() - 0.5) * 0.14;
    ctx.save();
    ctx.translate(x, y + dy);
    ctx.rotate(tilt);
    // A dark marker outline first, offset a touch, then the letter itself.
    ctx.fillStyle = INK;
    ctx.fillText(ch, size * 0.05, size * 0.05);
    ctx.fillStyle = fill;
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    x += advance(ch) * size;
  }
}

/** The lantern, standing on its base at (cx, base); `s` is its body height. */
function lantern(
  ctx: CanvasRenderingContext2D,
  rand: Rand,
  cx: number,
  base: number,
  s: number,
): void {
  const half = s * 0.32;
  const top = base - s;
  glow(ctx, cx, top + s * 0.55, s * 2.4, WARM, 0.55);
  // The handle ring.
  ctx.strokeStyle = CREAM;
  ctx.lineWidth = Math.max(1.5, s * 0.03);
  for (let pass = 0; pass < 2; pass++) {
    ctx.beginPath();
    ctx.arc(
      cx + (rand() - 0.5) * s * 0.02,
      top - s * 0.2,
      s * 0.16,
      Math.PI * 1.05,
      Math.PI * 1.95,
    );
    ctx.stroke();
  }
  // Glass, filled with warm light.
  const glass = ctx.createLinearGradient(0, top, 0, base);
  glass.addColorStop(0, 'rgba(255, 214, 130, 0.85)');
  glass.addColorStop(1, 'rgba(255, 150, 60, 0.85)');
  ctx.fillStyle = glass;
  ctx.fillRect(cx - half, top, half * 2, s);
  // The flame: a teardrop with a hot core.
  const fy = top + s * 0.62;
  ctx.fillStyle = '#fff1c0';
  ctx.beginPath();
  ctx.moveTo(cx, fy - s * 0.3);
  ctx.bezierCurveTo(
    cx + s * 0.14,
    fy - s * 0.08,
    cx + s * 0.12,
    fy + s * 0.1,
    cx,
    fy + s * 0.1,
  );
  ctx.bezierCurveTo(
    cx - s * 0.12,
    fy + s * 0.1,
    cx - s * 0.14,
    fy - s * 0.08,
    cx,
    fy - s * 0.3,
  );
  ctx.fill();
  ellipse(ctx, cx, fy, s * 0.04, s * 0.07, '#ff9a3a');
  // Frame, cap and base, all in pencil-and-marker lines.
  const line = Math.max(1.5, s * 0.035);
  sketch(
    ctx,
    rand,
    [
      [cx - half, top],
      [cx + half, top],
      [cx + half, base],
      [cx - half, base],
    ],
    line,
    INK,
    true,
  );
  for (const fx of [-half * 0.35, half * 0.35])
    sketch(
      ctx,
      rand,
      [
        [cx + fx, top],
        [cx + fx, base],
      ],
      line * 0.7,
      INK,
    );
  sketch(
    ctx,
    rand,
    [
      [cx - half * 1.25, top],
      [cx - half * 0.55, top - s * 0.16],
      [cx + half * 0.55, top - s * 0.16],
      [cx + half * 1.25, top],
    ],
    line,
    CREAM,
    true,
  );
  sketch(
    ctx,
    rand,
    [
      [cx - half * 1.2, base],
      [cx + half * 1.2, base],
      [cx + half, base + s * 0.1],
      [cx - half, base + s * 0.1],
    ],
    line,
    CREAM,
    true,
  );
}

/** Night-blue paper, the lantern under stars, the title above and the venue below. */
export const paintLanternPoster: Painter = (ctx, w, h, rand) => {
  fillVertical(ctx, w, 0, h, [
    [0, '#151a3e'],
    [0.6, '#24285a'],
    [1, '#2e2350'],
  ]);
  // Library-printer speckle.
  for (let i = 0; i < 500; i++) {
    ctx.fillStyle =
      rand() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.08)';
    ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5);
  }
  const u = Math.min(w, h);
  // Doodled stars, kept out of the lettering's way, plus tiny dots between them.
  for (let i = 0; i < 26; i++) {
    const x = rand() * w;
    const y = h * (0.2 + rand() * 0.48);
    if (Math.abs(x - w / 2) < u * 0.22) continue;
    star(ctx, rand, x, y, u * (0.012 + rand() * 0.018));
  }
  for (let i = 0; i < 70; i++)
    disc(
      ctx,
      rand() * w,
      rand() * h * 0.75,
      u * 0.002 + rand() * 1.2,
      'rgba(246,231,193,0.7)',
    );

  lantern(ctx, rand, w / 2, h * 0.68, u * 0.3);

  letters(ctx, rand, 'VELVET LANTERN', w / 2, h * 0.17, u * 0.11, CREAM);
  sketch(
    ctx,
    rand,
    [
      [w / 2 - u * 0.45, h * 0.2],
      [w / 2, h * 0.205],
      [w / 2 + u * 0.45, h * 0.198],
    ],
    Math.max(1.5, u * 0.006),
    '#ffc45c',
  );
  const venue = t('wallpapers.lanternPosterVenue');
  letters(ctx, rand, `· ${venue} ·`, w / 2, h * 0.85, u * 0.055, '#ffc45c');

  // The artist's corner: a small frog and his initials.
  const fx = w - u * 0.12;
  const fy = h - u * 0.07;
  ellipse(ctx, fx, fy, u * 0.025, u * 0.017, '#6abf5a');
  disc(ctx, fx - u * 0.012, fy - u * 0.016, u * 0.008, '#6abf5a');
  disc(ctx, fx + u * 0.012, fy - u * 0.016, u * 0.008, '#6abf5a');
  disc(ctx, fx - u * 0.012, fy - u * 0.016, u * 0.003, INK);
  disc(ctx, fx + u * 0.012, fy - u * 0.016, u * 0.003, INK);
  ctx.font = `${Math.max(9, Math.round(u * 0.022))}px 'Comic Sans MS', 'Chalkboard SE', cursive`;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(246,231,193,0.8)';
  ctx.fillText('theo k.', fx - u * 0.04, fy);

  // Folded once each way before it went on the wall.
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(w / 2 - 1, 0, 2, h);
  ctx.fillRect(0, h / 2 - 1, w, 2);
  vignette(ctx, w, h, 0.4);
};
