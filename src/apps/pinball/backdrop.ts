// The static layer of Star Pinball, drawn once per resolution: deep space with a seeded
// nebula and stars, the neon walls, slingshot bodies and the printed labels.
import { mulberry32 } from '@/os/random';
import type { Shape } from './geometry';
import { TABLE_X, TABLE_Y, VIEW_H, VIEW_W } from './display';
import { RANKS } from './sim';
import { RAMP, SLINGS, buildColliders } from './table';

export const FONT = "Tahoma, Verdana, 'Segoe UI', sans-serif";
export const NEON = '#3fe0ff';
/** The rank ladder in the middle of the table: top-left of its first row, and row height. */
export const LADDER = { x: 166, y: 292, row: 15 };
export const MULT_LIGHT = { x: 211, y: 380 };
export const SAVE_LIGHT = { x: 206, y: 480 };

const STATIC_SKIP = /^(bumper|target|sling|plunger|gate)/;

export function traceShape(c: CanvasRenderingContext2D, s: Shape) {
  if (s.kind === 'segment') {
    c.moveTo(s.a.x, s.a.y);
    c.lineTo(s.b.x, s.b.y);
  } else if (s.kind === 'arc') {
    c.moveTo(
      s.c.x + Math.cos(s.a0) * s.radius,
      s.c.y + Math.sin(s.a0) * s.radius,
    );
    c.arc(s.c.x, s.c.y, s.radius, s.a0, s.a1);
  } else {
    c.moveTo(s.c.x + s.radius, s.c.y);
    c.arc(s.c.x, s.c.y, s.radius, 0, Math.PI * 2);
  }
}

function space(c: CanvasRenderingContext2D, seed: number) {
  const rand = mulberry32(seed);
  const bg = c.createLinearGradient(0, 0, 0, VIEW_H);
  bg.addColorStop(0, '#05030f');
  bg.addColorStop(0.6, '#0b0724');
  bg.addColorStop(1, '#140a2e');
  c.fillStyle = bg;
  c.fillRect(0, 0, VIEW_W, VIEW_H);
  const hues = [290, 200, 330, 250, 180];
  for (let i = 0; i < 6; i++) {
    const x = rand() * VIEW_W;
    const y = 80 + rand() * (VIEW_H - 120);
    const r = 90 + rand() * 140;
    const h = hues[i % hues.length]!;
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `hsl(${h} 80% 55% / 22%)`);
    g.addColorStop(0.5, `hsl(${h} 70% 40% / 9%)`);
    g.addColorStop(1, `hsl(${h} 70% 30% / 0%)`);
    c.fillStyle = g;
    c.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  for (let i = 0; i < 240; i++) {
    const x = rand() * VIEW_W;
    const y = rand() * VIEW_H;
    const big = rand() < 0.08;
    c.globalAlpha = 0.35 + rand() * 0.65;
    c.fillStyle =
      rand() < 0.2 ? '#ffe2b0' : rand() < 0.3 ? '#b8d4ff' : '#ffffff';
    c.beginPath();
    c.arc(x, y, big ? 1.4 : 0.5 + rand() * 0.6, 0, Math.PI * 2);
    c.fill();
  }
  c.globalAlpha = 1;
}

function labels(c: CanvasRenderingContext2D) {
  c.textAlign = 'left';
  c.textBaseline = 'middle';
  c.font = `bold 9px ${FONT}`;
  c.fillStyle = 'rgb(200 230 255 / 70%)';
  RANKS.forEach((name, i) =>
    c.fillText(
      name.toUpperCase(),
      LADDER.x + 14,
      LADDER.y + (RANKS.length - 1 - i) * LADDER.row,
    ),
  );
  c.textAlign = 'center';
  c.fillText('SHOOT AGAIN', SAVE_LIGHT.x, SAVE_LIGHT.y + 14);
  c.save();
  c.translate((RAMP.x0 + RAMP.x1) / 2, (RAMP.gateY1 + RAMP.bottom) / 2 - 12);
  c.rotate(-Math.PI / 2);
  c.fillText('HYPERSPACE', 0, 0);
  c.restore();
  c.font = `italic 900 26px ${FONT}`;
  c.fillStyle = 'rgb(255 200 80 / 16%)';
  c.fillText('STAR PINBALL', 206, 430);
}

/** Renders the static layer at `res` device pixels per logical pixel; null without canvas 2D. */
export function buildBackdrop(
  seed: number,
  res: number,
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(VIEW_W * res);
  canvas.height = Math.round(VIEW_H * res);
  const c = canvas.getContext('2d');
  if (!c) return null;
  c.scale(res, res);
  space(c, seed);
  c.translate(TABLE_X, TABLE_Y);

  // Slingshot bodies.
  for (const [a, b, d] of SLINGS) {
    c.fillStyle = 'rgb(255 70 170 / 22%)';
    c.beginPath();
    c.moveTo(a.x, a.y);
    c.lineTo(b.x, b.y);
    c.lineTo(d.x, d.y);
    c.closePath();
    c.fill();
  }
  // Neon walls: a wide soft glow under a crisp core.
  const walls = buildColliders().filter((col) => !STATIC_SKIP.test(col.id));
  c.lineCap = 'round';
  c.lineJoin = 'round';
  for (const [width, style] of [
    [7, 'rgb(63 224 255 / 18%)'],
    [3.5, 'rgb(63 224 255 / 45%)'],
    [1.5, '#d8f8ff'],
  ] as const) {
    c.lineWidth = width;
    c.strokeStyle = style;
    c.beginPath();
    for (const col of walls) traceShape(c, col.shape);
    c.stroke();
  }
  // Gates: thin dashed lines.
  c.setLineDash([3, 3]);
  c.lineWidth = 1.5;
  c.strokeStyle = 'rgb(255 220 120 / 80%)';
  c.beginPath();
  for (const col of buildColliders())
    if (col.id.startsWith('gate:')) traceShape(c, col.shape);
  c.stroke();
  c.setLineDash([]);
  labels(c);
  return canvas;
}
