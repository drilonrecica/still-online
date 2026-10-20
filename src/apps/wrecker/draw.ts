// Draws Desktop Wrecker: marks are painted once onto the persistent damage canvas; particles,
// light effects and Repair's sweep are redrawn every frame on the effects canvas. Coordinates
// are CSS px. No shadowBlur anywhere: it is slow, and gradients look the same here.
import { t } from '@/i18n/t';
import type { Mark, Point } from './damage';
import type { Fx } from './fx';
import type { Particle } from './particles';

type Ctx = CanvasRenderingContext2D;

function shape(ctx: Ctx, points: readonly Point[]) {
  ctx.beginPath();
  points.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.closePath();
}

function polyline(ctx: Ctx, points: readonly Point[]) {
  const [first, ...rest] = points;
  if (!first) return;
  ctx.beginPath();
  ctx.moveTo(first.x, first.y);
  for (const p of rest) ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

/** Glass cracks: a dark shadow line under a bright hairline, offset by a pixel. */
function cracks(ctx: Ctx, lines: readonly Point[][], width = 1) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)';
  ctx.lineWidth = width * 2.2;
  for (const line of lines) polyline(ctx, line);
  ctx.save();
  ctx.translate(-0.7, -0.7);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = width;
  for (const line of lines) polyline(ctx, line);
  ctx.restore();
}

function crack(ctx: Ctx, m: Extract<Mark, { kind: 'crack' }>) {
  cracks(ctx, m.lines);
  if (m.crater) {
    // Crushed glass: a frosted, jagged patch with a dark rim and broken sparkle inside.
    shape(ctx, m.crater);
    const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 18);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    g.addColorStop(0.55, 'rgba(210, 225, 240, 0.7)');
    g.addColorStop(1, 'rgba(150, 170, 190, 0.45)');
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = 'rgba(20, 25, 35, 0.6)';
    ctx.stroke();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(40, 50, 70, 0.55)';
    for (const p of m.crater) {
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    return;
  }
  // The crushed spot where the hammer landed.
  const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 12);
  g.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
  g.addColorStop(0.5, 'rgba(200, 215, 230, 0.45)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(m.x, m.y, 12, 0, Math.PI * 2);
  ctx.fill();
}

function cut(ctx: Ctx, m: Extract<Mark, { kind: 'cut' }>) {
  const { points } = m;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Friction burn either side, the torn pale edge, the deep gash, its shadowed floor, then a
  // glint along the upper lip.
  ctx.strokeStyle = 'rgba(40, 20, 6, 0.28)';
  ctx.lineWidth = 17;
  polyline(ctx, points);
  ctx.strokeStyle = 'rgba(196, 150, 96, 0.95)';
  ctx.lineWidth = 11;
  polyline(ctx, points);
  if (m.tears) {
    ctx.strokeStyle = 'rgba(214, 176, 120, 0.95)';
    ctx.lineWidth = 1.6;
    for (const tear of m.tears) polyline(ctx, tear);
  }
  ctx.strokeStyle = '#0d0703';
  ctx.lineWidth = 6.5;
  polyline(ctx, points);
  ctx.save();
  ctx.translate(1, 1.5);
  ctx.strokeStyle = 'rgba(70, 36, 14, 0.9)';
  ctx.lineWidth = 2;
  polyline(ctx, points);
  ctx.restore();
  ctx.save();
  ctx.translate(-2, -3);
  ctx.strokeStyle = 'rgba(255, 244, 220, 0.55)';
  ctx.lineWidth = 1;
  polyline(ctx, points);
  ctx.restore();
}

function scorch(ctx: Ctx, m: Extract<Mark, { kind: 'scorch' }>) {
  // Low alpha: puffs pile up into a charred black core with a brown body and a singed rim.
  const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
  g.addColorStop(0, 'rgba(4, 2, 0, 0.22)');
  g.addColorStop(0.4, 'rgba(36, 16, 4, 0.16)');
  g.addColorStop(0.72, 'rgba(96, 44, 10, 0.09)');
  g.addColorStop(0.88, 'rgba(200, 96, 20, 0.06)');
  g.addColorStop(1, 'rgba(255, 140, 30, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  ctx.fill();
  // Char flecks: a few dark specks, placed from the puff's own numbers (marks are repainted
  // after a resize, so no randomness here).
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  for (let i = 0; i < 3; i++) {
    const a = (m.x * 7.3 + m.y * 3.1 + i * 2.4) % (Math.PI * 2);
    const d = m.r * (0.2 + ((m.r * (i + 1) * 13.7) % 1) * 0.45);
    ctx.fillRect(m.x + Math.cos(a) * d, m.y + Math.sin(a) * d, 1.6, 1.6);
  }
}

function hole(ctx: Ctx, m: Extract<Mark, { kind: 'hole' }>) {
  if (m.halo) {
    // Glass chipped away around the hole: a frosted, jagged ring.
    shape(ctx, m.halo);
    ctx.fillStyle = 'rgba(225, 235, 245, 0.55)';
    ctx.fill();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = 'rgba(30, 35, 45, 0.5)';
    ctx.stroke();
  }
  cracks(ctx, m.cracks, 0.7);
  // A metal-grey rim around a deep, black core.
  ctx.fillStyle = 'rgba(120, 126, 134, 0.95)';
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r + 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(245, 248, 250, 0.9)';
  ctx.beginPath();
  ctx.arc(m.x - 0.6, m.y - 0.6, m.r + 0.9, Math.PI * 0.9, Math.PI * 1.7);
  ctx.lineTo(m.x - 0.6, m.y - 0.6);
  ctx.fill();
  const g = ctx.createRadialGradient(m.x - 1, m.y - 1, 0, m.x, m.y, m.r);
  g.addColorStop(0, '#000');
  g.addColorStop(0.7, '#0b0b0b');
  g.addColorStop(1, '#2e2e2e');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  ctx.fill();
}

/** A cartoon tank-tread print: a dark band of chunky cleats. */
function tread(ctx: Ctx) {
  const w = 190;
  const h = 46;
  ctx.fillStyle = 'rgba(30, 30, 34, 0.82)';
  ctx.fillRect(-w / 2, -h / 2, w, 6);
  ctx.fillRect(-w / 2, h / 2 - 6, w, 6);
  for (let x = -w / 2 + 4; x < w / 2 - 10; x += 17) {
    ctx.beginPath();
    ctx.moveTo(x, -h / 2 + 8);
    ctx.lineTo(x + 11, -h / 2 + 8);
    ctx.lineTo(x + 6, 0);
    ctx.lineTo(x + 11, h / 2 - 8);
    ctx.lineTo(x, h / 2 - 8);
    ctx.lineTo(x + 5, 0);
    ctx.closePath();
    ctx.fill();
  }
}

/** A comic "BOOM!" burst: a spiky yellow star with a red outline and bold lettering. */
function boom(ctx: Ctx) {
  const spikes = 14;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 ? 42 : 72 + (i % 4 ? 0 : 10);
    ctx.lineTo(Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.8);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffd21f';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#d6200f';
  ctx.stroke();
  ctx.font = 'bold 34px Impact, "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#7a0d05';
  const word = t('wrecker.boom');
  ctx.strokeText(word, 0, 2);
  ctx.fillStyle = '#ff4a1c';
  ctx.fillText(word, 0, 2);
}

function stamp(ctx: Ctx, m: Extract<Mark, { kind: 'stamp' }>) {
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.rotate(m.angle);
  if (m.dots) {
    ctx.fillStyle = m.stamp === 'tread' ? 'rgba(30, 30, 34, 0.75)' : '#d6200f';
    for (const d of m.dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (m.stamp === 'tread') tread(ctx);
  else boom(ctx);
  ctx.restore();
}

/** Paints one mark onto the damage canvas. */
export function paintMark(ctx: Ctx, m: Mark): void {
  ctx.save();
  if (m.kind === 'crack') crack(ctx, m);
  else if (m.kind === 'cut') cut(ctx, m);
  else if (m.kind === 'scorch') scorch(ctx, m);
  else if (m.kind === 'hole') hole(ctx, m);
  else stamp(ctx, m);
  ctx.restore();
}

function particle(ctx: Ctx, p: Particle) {
  const t = p.age / p.life;
  if (p.kind === 'sawdust') {
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = p.size > 2.4 ? '#c99a5c' : '#e3c08a';
    ctx.fillRect(p.x, p.y, p.size, p.size);
  } else if (p.kind === 'flame') {
    // White-yellow at the core of a fresh tongue, through orange to a smoky red.
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    const hot =
      t < 0.25 ? '255, 246, 190' : t < 0.55 ? '255, 160, 40' : '210, 60, 20';
    g.addColorStop(0, `rgba(${hot}, ${0.95 * (1 - t)})`);
    g.addColorStop(0.5, `rgba(${hot}, ${0.5 * (1 - t)})`);
    g.addColorStop(1, `rgba(${hot}, 0)`);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  } else if (p.kind === 'casing') {
    ctx.globalAlpha = Math.min(1, (1 - t) * 4);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = '#b9862a';
    ctx.fillRect(-4.5, -1.8, 9, 3.6);
    ctx.fillStyle = '#f6dc8a';
    ctx.fillRect(-4.5, -1.8, 9, 1.1);
    ctx.fillStyle = '#7a5418';
    ctx.fillRect(-4.5, -1.8, 1.4, 3.6);
    ctx.restore();
  } else if (p.kind === 'spark') {
    // A streak along the spark's motion, white-hot to orange.
    const len = 0.022;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1 - t * t;
    ctx.strokeStyle = t < 0.4 ? '#fff6c8' : '#ffa53a';
    ctx.lineWidth = p.size;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x - p.vx * len, p.y - p.vy * len);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
  } else if (p.kind === 'smoke') {
    const shade = Math.round(70 + p.shade * 120);
    const tint = Math.round(shade * (0.9 + p.shade * 0.05));
    const alpha = (p.shade > 0.5 ? 0.3 : 0.4) * (1 - t) * Math.min(1, t * 6);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    g.addColorStop(0, `rgba(${shade}, ${shade}, ${tint}, ${alpha})`);
    g.addColorStop(1, `rgba(${shade}, ${shade}, ${tint}, 0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.kind === 'ember') {
    // Flickers as it cools from yellow to a dull red.
    const flicker = 0.6 + 0.4 * Math.abs(Math.sin(p.age * 30 + p.shade * 9));
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = (1 - t) * flicker;
    ctx.fillStyle = t < 0.4 ? '#ffd65a' : t < 0.75 ? '#ff7a1c' : '#b8300e';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  } else if (p.kind === 'chip') {
    ctx.globalAlpha = Math.min(1, (1 - t) * 3);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    const light = Math.round(150 + p.shade * 100);
    ctx.fillStyle = `rgb(${light}, ${Math.min(255, light + 4)}, 255)`;
    ctx.strokeStyle = 'rgba(20, 30, 50, 0.6)';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(-p.size, -p.size * 0.5);
    ctx.lineTo(p.size * 0.8, -p.size * 0.7);
    ctx.lineTo(p.size * 0.4, p.size * 0.8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.globalAlpha = 1 - t;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = 'rgba(210, 235, 255, 0.8)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-p.size, -p.size * 0.4);
    ctx.lineTo(p.size, 0);
    ctx.lineTo(-p.size * 0.3, p.size * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
}

export function drawParticles(ctx: Ctx, list: readonly Particle[]): void {
  for (const p of list) particle(ctx, p);
}

function effect(ctx: Ctx, f: Fx, reduced: boolean) {
  const t = f.age / f.life;
  // Reduced motion keeps every effect but tones the bright bursts down.
  const bright = reduced ? 0.45 : 1;
  ctx.globalCompositeOperation = 'lighter';
  if (f.kind === 'muzzle') {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.angle);
    ctx.globalAlpha = bright * (1 - t);
    // A forward flame cone with side petals, around a white-hot core.
    const len = f.r * (0.8 + 0.4 * (1 - t));
    const g = ctx.createLinearGradient(0, 0, len, 0);
    g.addColorStop(0, '#fffbe0');
    g.addColorStop(0.35, '#ffd24a');
    g.addColorStop(1, 'rgba(255, 110, 20, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(len * 0.45, -9);
    ctx.lineTo(len, 0);
    ctx.lineTo(len * 0.45, 9);
    ctx.lineTo(0, 5);
    ctx.closePath();
    ctx.fill();
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(2, 0);
      ctx.lineTo(len * 0.25, side * len * 0.38);
      ctx.lineTo(len * 0.32, side * 3);
      ctx.closePath();
      ctx.fill();
    }
    const core = ctx.createRadialGradient(0, 0, 0, 0, 0, 14);
    core.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
    core.addColorStop(1, 'rgba(255, 200, 80, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (f.kind === 'tracer') {
    // The bullet's streak: its back half fades first, so it seems to fly.
    const from = Math.min(1, t * 1.6);
    const sx = f.x + (f.x2 - f.x) * from;
    const sy = f.y + (f.y2 - f.y) * from;
    const g = ctx.createLinearGradient(sx, sy, f.x2, f.y2);
    g.addColorStop(0, 'rgba(255, 200, 80, 0)');
    g.addColorStop(1, `rgba(255, 250, 210, ${0.9 * bright})`);
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(f.x2, f.y2);
    ctx.stroke();
  } else if (f.kind === 'flash') {
    const r = f.r * (0.7 + 0.5 * t);
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
    g.addColorStop(0, `rgba(255, 255, 235, ${0.95 * bright * (1 - t)})`);
    g.addColorStop(0.35, `rgba(255, 210, 120, ${0.55 * bright * (1 - t)})`);
    g.addColorStop(1, 'rgba(255, 160, 60, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.fill();
  } else if (f.kind === 'ring') {
    ctx.globalCompositeOperation = 'source-over';
    const r = f.r * (0.15 + 0.85 * Math.sqrt(t));
    ctx.globalAlpha = (1 - t) * 0.7;
    ctx.lineWidth = 6 * (1 - t) + 1;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.arc(f.x, f.y, r + 3, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Hot scorch: a dull orange glow that dies away.
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
    g.addColorStop(0, `rgba(255, 120, 20, ${0.28 * (1 - t)})`);
    g.addColorStop(0.6, `rgba(200, 50, 10, ${0.16 * (1 - t)})`);
    g.addColorStop(1, 'rgba(120, 20, 0, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

export function drawFx(ctx: Ctx, list: readonly Fx[], reduced = false): void {
  for (const f of list) effect(ctx, f, reduced);
}

/** Repair's sweep: a glinting band of "glass being swept" at `x`. */
export function drawSweep(ctx: Ctx, x: number, h: number): void {
  const g = ctx.createLinearGradient(x - 60, 0, x + 8, 0);
  g.addColorStop(0, 'rgba(255, 255, 255, 0)');
  g.addColorStop(0.8, 'rgba(220, 240, 255, 0.35)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 60, 0, 68, h);
}
