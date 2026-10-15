// Draws Desktop Wrecker: marks are painted once onto the persistent damage canvas; particles
// and Repair's sweep are redrawn every frame on the effects canvas. Coordinates are CSS px.
import { t } from '@/i18n/t';
import type { Mark, Point } from './damage';
import type { Particle } from './particles';

type Ctx = CanvasRenderingContext2D;

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

function cut(ctx: Ctx, points: readonly Point[]) {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  // Torn edge, then the dark gash, then a faint highlight along one lip.
  ctx.strokeStyle = 'rgba(120, 82, 40, 0.9)';
  ctx.lineWidth = 10;
  polyline(ctx, points);
  ctx.strokeStyle = '#120a04';
  ctx.lineWidth = 5.5;
  polyline(ctx, points);
  ctx.save();
  ctx.translate(-1.5, -2);
  ctx.strokeStyle = 'rgba(255, 240, 210, 0.35)';
  ctx.lineWidth = 1;
  polyline(ctx, points);
  ctx.restore();
}

function scorch(ctx: Ctx, m: Extract<Mark, { kind: 'scorch' }>) {
  // Low alpha: puffs pile up into a black core with a brown body and an orange rim.
  const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
  g.addColorStop(0, 'rgba(8, 4, 0, 0.16)');
  g.addColorStop(0.45, 'rgba(50, 24, 8, 0.12)');
  g.addColorStop(0.78, 'rgba(110, 50, 10, 0.07)');
  g.addColorStop(0.9, 'rgba(255, 120, 20, 0.06)');
  g.addColorStop(1, 'rgba(255, 140, 30, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
  ctx.fill();
}

function hole(ctx: Ctx, m: Extract<Mark, { kind: 'hole' }>) {
  cracks(ctx, m.cracks, 0.7);
  ctx.fillStyle = 'rgba(235, 240, 245, 0.9)';
  ctx.beginPath();
  ctx.arc(m.x, m.y, m.r + 1.8, 0, Math.PI * 2);
  ctx.fill();
  const g = ctx.createRadialGradient(m.x - 1, m.y - 1, 0, m.x, m.y, m.r);
  g.addColorStop(0, '#000');
  g.addColorStop(0.7, '#111');
  g.addColorStop(1, '#3a3a3a');
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
  if (m.stamp === 'tread') tread(ctx);
  else boom(ctx);
  ctx.restore();
}

/** Paints one mark onto the damage canvas. */
export function paintMark(ctx: Ctx, m: Mark): void {
  ctx.save();
  if (m.kind === 'crack') crack(ctx, m);
  else if (m.kind === 'cut') cut(ctx, m.points);
  else if (m.kind === 'scorch') scorch(ctx, m);
  else if (m.kind === 'hole') hole(ctx, m);
  else stamp(ctx, m);
  ctx.restore();
}

function particle(ctx: Ctx, p: Particle) {
  const t = p.age / p.life;
  if (p.kind === 'sawdust') {
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = '#d9b27a';
    ctx.fillRect(p.x, p.y, p.size, p.size);
  } else if (p.kind === 'flame') {
    // Yellow-white when fresh, through orange to a smoky red.
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
    const hot =
      t < 0.3 ? '255, 240, 160' : t < 0.6 ? '255, 150, 30' : '200, 50, 20';
    g.addColorStop(0, `rgba(${hot}, ${0.9 * (1 - t)})`);
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
    ctx.fillStyle = '#c99a2e';
    ctx.fillRect(-4, -1.6, 8, 3.2);
    ctx.fillStyle = '#f3d47a';
    ctx.fillRect(-4, -1.6, 8, 1);
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

/** Repair's sweep: a glinting band of "glass being swept" at `x`. */
export function drawSweep(ctx: Ctx, x: number, h: number): void {
  const g = ctx.createLinearGradient(x - 60, 0, x + 8, 0);
  g.addColorStop(0, 'rgba(255, 255, 255, 0)');
  g.addColorStop(0.8, 'rgba(220, 240, 255, 0.35)');
  g.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 60, 0, 68, h);
}
