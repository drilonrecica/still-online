// Hen Hunt scenery: a fixed sky and three parallax layers (far hills + windmill, mid fields +
// haystacks + scarecrow, near fence + grass), painted once into offscreen canvases with seeded
// randomness. The windmill sails and the scarecrow's hat move, so they are drawn per frame.
import { mulberry32, type Rand } from '@/os/random';
import {
  SCARECROW,
  VIEW_H,
  VIEW_W,
  WINDMILL,
  layerWidth,
  type Depth,
} from './layout';

import { windowFrame } from './props';

export type Ctx = CanvasRenderingContext2D;

export interface Scenery {
  sky: HTMLCanvasElement;
  layers: Record<Depth, HTMLCanvasElement>;
}

/** An offscreen canvas `w`×VIEW_H logical px at `res` device px per px, or null without 2D. */
function layer(
  w: number,
  res: number,
  paint: (ctx: Ctx, w: number) => void,
): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w * res);
  canvas.height = Math.ceil(VIEW_H * res);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(res, res);
  paint(ctx, w);
  return canvas;
}

/** Paints all scenery. Returns null where canvas 2D is unavailable (jsdom). */
export function buildScenery(seed: number, res = 1): Scenery | null {
  const sky = layer(VIEW_W, res, (c) => paintSky(c, mulberry32(seed)));
  const far = layer(layerWidth('far'), res, (c, w) =>
    paintFar(c, w, mulberry32(seed + 1)),
  );
  const mid = layer(layerWidth('mid'), res, (c, w) =>
    paintMid(c, w, mulberry32(seed + 2)),
  );
  const near = layer(layerWidth('near'), res, (c, w) =>
    paintNear(c, w, mulberry32(seed + 3)),
  );
  if (!sky || !far || !mid || !near) return null;
  return { sky, layers: { far, mid, near } };
}

function cloud(c: Ctx, x: number, y: number, s: number) {
  c.beginPath();
  for (const [dx, dy, r] of [
    [0, 0, 22],
    [24, -10, 26],
    [52, -2, 20],
    [30, 8, 22],
    [-20, 6, 16],
  ] as const) {
    c.moveTo(x + (dx + r) * s, y + dy * s);
    c.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2);
  }
  c.fill();
}

function paintSky(c: Ctx, rand: Rand) {
  const g = c.createLinearGradient(0, 0, 0, 320);
  g.addColorStop(0, '#3f8fdc');
  g.addColorStop(1, '#cde8f6');
  c.fillStyle = g;
  c.fillRect(0, 0, VIEW_W, VIEW_H);
  // The sun, with a soft halo.
  const sun = c.createRadialGradient(660, 70, 10, 660, 70, 70);
  sun.addColorStop(0, '#fff8d0');
  sun.addColorStop(0.35, 'rgb(255 244 190 / 70%)');
  sun.addColorStop(1, 'rgb(255 244 190 / 0%)');
  c.fillStyle = sun;
  c.fillRect(560, 0, 200, 160);
  c.fillStyle = 'rgb(255 255 255 / 85%)';
  for (let i = 0; i < 6; i++)
    cloud(c, 40 + i * 135 + rand() * 50, 50 + rand() * 120, 0.6 + rand() * 0.6);
}

/** A rolling ridge line across `w`, filled down to the bottom. */
function hills(
  c: Ctx,
  w: number,
  base: number,
  amp: number,
  rand: Rand,
  fill: string | CanvasGradient,
  flat?: { x: number; y: number; r: number },
) {
  const waves = [0.004 + rand() * 0.003, 0.011 + rand() * 0.006];
  const phase = [rand() * 6, rand() * 6];
  c.beginPath();
  c.moveTo(0, VIEW_H);
  for (let x = 0; x <= w; x += 8) {
    let y =
      base +
      Math.sin(x * waves[0]! + phase[0]!) * amp +
      Math.sin(x * waves[1]! + phase[1]!) * amp * 0.35;
    // Level the ground where something stands.
    if (flat) {
      const k = Math.max(0, 1 - Math.abs(x - flat.x) / flat.r);
      y = y * (1 - k) + flat.y * k;
    }
    c.lineTo(x, y);
  }
  c.lineTo(w, VIEW_H);
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}

function paintFar(c: Ctx, w: number, rand: Rand) {
  hills(c, w, 250, 22, rand, '#a9c9a0');
  const { x, baseY, hubY } = WINDMILL;
  hills(c, w, 282, 14, rand, '#86b072', { x, y: baseY - 2, r: 120 });
  // Little trees dotted along the hills.
  c.fillStyle = '#5f8f55';
  for (let i = 0; i < 24; i++) {
    const tx = rand() * w;
    if (Math.abs(tx - x) < 60) continue;
    const ty = 292 + rand() * 30;
    c.beginPath();
    c.arc(tx, ty, 4 + rand() * 4, 0, Math.PI * 2);
    c.fill();
  }
  // The windmill tower: a tapered whitewashed tower with a dark cap and door.
  c.fillStyle = '#efe6d2';
  c.strokeStyle = '#8c7b62';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(x - 26, baseY);
  c.lineTo(x - 15, hubY + 6);
  c.lineTo(x + 15, hubY + 6);
  c.lineTo(x + 26, baseY);
  c.closePath();
  c.fill();
  c.stroke();
  c.fillStyle = '#7a4a2c';
  c.beginPath();
  c.moveTo(x - 20, hubY + 8);
  c.quadraticCurveTo(x, hubY - 22, x + 20, hubY + 8);
  c.closePath();
  c.fill();
  c.fillStyle = '#6b4a30';
  c.fillRect(x - 6, baseY - 18, 12, 18);
  windowFrame(c, false);
}

function haystack(c: Ctx, x: number, y: number, s: number) {
  c.fillStyle = '#e2bd52';
  c.beginPath();
  c.moveTo(x - 34 * s, y);
  c.quadraticCurveTo(x - 30 * s, y - 52 * s, x, y - 56 * s);
  c.quadraticCurveTo(x + 30 * s, y - 52 * s, x + 34 * s, y);
  c.closePath();
  c.fill();
  c.strokeStyle = '#b48a2c';
  c.lineWidth = 1;
  for (let i = -3; i <= 3; i++) {
    c.beginPath();
    c.moveTo(x + i * 8 * s, y - 2);
    c.lineTo(x + i * 5 * s, y - 40 * s);
    c.stroke();
  }
}

function paintMid(c: Ctx, w: number, rand: Rand) {
  const g = c.createLinearGradient(0, 330, 0, VIEW_H);
  g.addColorStop(0, '#7fb24e');
  g.addColorStop(1, '#5d9636');
  hills(c, w, 338, 8, rand, g);
  // Patchwork fields: alternating crop strips with furrows.
  const strips = ['#97c25a', '#c9c26a', '#76a948', '#b9b25a'];
  let x = 0;
  for (let i = 0; x < w; i++) {
    const sw = 120 + rand() * 160;
    c.fillStyle = strips[i % strips.length]!;
    c.globalAlpha = 0.3;
    c.beginPath();
    c.moveTo(x, 352);
    c.lineTo(x + sw, 352);
    c.lineTo(x + sw * 1.25, VIEW_H);
    c.lineTo(x - sw * 0.25, VIEW_H);
    c.closePath();
    c.fill();
    c.globalAlpha = 1;
    x += sw;
  }
  c.strokeStyle = 'rgb(60 90 30 / 25%)';
  c.lineWidth = 1;
  for (let y = 360; y < VIEW_H; y += 10 + (y - 350) / 8) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(w, y);
    c.stroke();
  }
  for (let i = 0; i < 6; i++) {
    const hx = 60 + (i / 6) * w + rand() * 80;
    if (Math.abs(hx - SCARECROW.x) < 90) continue;
    haystack(c, hx, 390 + rand() * 30, 0.8 + rand() * 0.4);
  }
  scarecrow(c);
}

function scarecrow(c: Ctx) {
  const { x, groundY } = SCARECROW;
  c.strokeStyle = '#6b4a2b';
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(x, groundY);
  c.lineTo(x, 300);
  c.moveTo(x - 46, 330);
  c.lineTo(x + 46, 330);
  c.stroke();
  // A patched shirt, a straw-stuffed sack head.
  c.fillStyle = '#b5482f';
  c.fillRect(x - 22, 322, 44, 46);
  c.fillRect(x - 46, 324, 28, 12);
  c.fillRect(x + 18, 324, 28, 12);
  c.fillStyle = '#d9a441';
  c.fillRect(x - 6, 336, 12, 10);
  c.fillStyle = '#e9d6a0';
  c.beginPath();
  c.arc(x, 308, 15, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#3a2a1a';
  c.fillRect(x - 7, 304, 4, 4);
  c.fillRect(x + 3, 304, 4, 4);
  c.fillRect(x - 6, 314, 12, 2);
}

function paintNear(c: Ctx, w: number, rand: Rand) {
  // Fence: posts and two rails.
  c.fillStyle = '#8a5a34';
  c.strokeStyle = '#5c3a1f';
  c.lineWidth = 1.5;
  for (const y of [462, 490]) {
    c.fillRect(0, y, w, 9);
    c.strokeRect(-1, y, w + 2, 9);
  }
  for (let px = 30; px < w; px += 150 + rand() * 30) {
    c.fillStyle = '#7a4c2a';
    c.fillRect(px, 446, 14, VIEW_H - 446);
    c.strokeRect(px, 446, 14, VIEW_H - 446);
    c.beginPath();
    c.moveTo(px, 446);
    c.lineTo(px + 7, 438);
    c.lineTo(px + 14, 446);
    c.fill();
  }
  // Tall grass along the bottom.
  const g = c.createLinearGradient(0, 480, 0, VIEW_H);
  g.addColorStop(0, '#4f8f2c');
  g.addColorStop(1, '#2f6a1a');
  c.fillStyle = g;
  c.fillRect(0, 506, w, VIEW_H - 506);
  c.strokeStyle = '#3f7f22';
  c.lineWidth = 2;
  for (let gx = 0; gx < w; gx += 5) {
    const h = 14 + rand() * 30;
    c.beginPath();
    c.moveTo(gx, VIEW_H);
    c.quadraticCurveTo(
      gx + 2,
      VIEW_H - h / 2,
      gx + (rand() - 0.5) * 12,
      VIEW_H - h,
    );
    c.stroke();
  }
}
