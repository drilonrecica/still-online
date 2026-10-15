// The tool cursors, drawn on the effects canvas at the pointer (the native cursor is hidden).
// Each one's hotspot is where its damage lands. Original cartoon shapes.
import type { ToolId } from './engine';

type Ctx = CanvasRenderingContext2D;

export interface CursorState {
  tool: ToolId;
  x: number;
  y: number;
  /** The tool is held down. */
  held: boolean;
  /** 0..1: how fresh the last hit is (hammer swing, stamp press, muzzle flash). */
  kick: number;
  /** Seconds, for idle wobble and vibration (frozen under reduced motion). */
  clock: number;
}

function outline(ctx: Ctx) {
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#1b1b1b';
  ctx.stroke();
}

function rect(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fill();
  outline(ctx);
}

function hammer(ctx: Ctx, s: CursorState) {
  // Raised and tilted back; a fresh hit swings it flat onto the hotspot.
  ctx.rotate(-0.7 + s.kick * 0.9);
  rect(ctx, 6, -3, 30, 6, '#a0682c');
  rect(ctx, -6, -12, 14, 13, '#8d949c');
  rect(ctx, -6, -12, 14, 4, '#c8cdd2');
}

function chainsaw(ctx: Ctx, s: CursorState) {
  if (s.held)
    ctx.translate(Math.sin(s.clock * 95) * 1.2, Math.cos(s.clock * 80) * 1);
  ctx.rotate(-0.6);
  // Bar with teeth pointing at the hotspot, then the orange motor housing.
  ctx.beginPath();
  ctx.moveTo(0, -4);
  ctx.lineTo(28, -5);
  ctx.lineTo(28, 5);
  ctx.lineTo(0, 4);
  ctx.arc(0, 0, 4, Math.PI / 2, -Math.PI / 2);
  ctx.fillStyle = '#b7bec6';
  ctx.fill();
  outline(ctx);
  ctx.fillStyle = '#2a2a2a';
  const shift = s.held ? (s.clock * 60) % 4 : 0;
  for (let x = 2 + shift; x < 27; x += 4) {
    ctx.fillRect(x, -6, 2, 2);
    ctx.fillRect(x, 4, 2, 2);
  }
  rect(ctx, 26, -9, 18, 18, '#f07d14');
  rect(ctx, 32, -13, 10, 4, '#2a2a2a');
}

function flamethrower(ctx: Ctx, s: CursorState) {
  ctx.rotate(-0.75);
  // Pilot light at the nozzle: small and blue, bigger and orange while firing.
  const r = s.held ? 6 : 3 + Math.sin(s.clock * 12) * 0.6;
  ctx.beginPath();
  ctx.arc(-1, 0, Math.max(1, r), 0, Math.PI * 2);
  ctx.fillStyle = s.held
    ? 'rgba(255, 170, 40, 0.9)'
    : 'rgba(90, 160, 255, 0.85)';
  ctx.fill();
  rect(ctx, 2, -3, 20, 6, '#6c737a');
  rect(ctx, 18, -5, 6, 10, '#3c4248');
  ctx.beginPath();
  ctx.ellipse(32, 0, 10, 7, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#c4231b';
  ctx.fill();
  outline(ctx);
  rect(ctx, 26, -2, 3, 9, '#2e2e2e');
}

function machinegun(ctx: Ctx, s: CursorState) {
  // A crosshair over the spread, with a muzzle-flash star on each shot.
  if (s.kick > 0) {
    ctx.beginPath();
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const r = i % 2 ? 5 : 14 * (0.6 + s.kick * 0.8);
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 220, 90, 0.9)';
    ctx.fill();
  }
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.arc(0, 0, 13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ff3b2f';
  ctx.stroke();
  ctx.beginPath();
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const) {
    ctx.moveTo(dx * 6, dy * 6);
    ctx.lineTo(dx * 19, dy * 19);
  }
  ctx.stroke();
}

function stamp(ctx: Ctx, s: CursorState) {
  // A rubber stamp above the hotspot that presses down on a fresh hit.
  ctx.translate(0, -4 + s.kick * 4 - (s.held ? 0 : 6));
  rect(ctx, -14, -6, 28, 6, '#b31f2a');
  rect(ctx, -11, -11, 22, 5, '#7b4a22');
  rect(ctx, -3, -24, 6, 13, '#9a6431');
  ctx.beginPath();
  ctx.arc(0, -28, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#c0392b';
  ctx.fill();
  outline(ctx);
}

const DRAW: Record<ToolId, (ctx: Ctx, s: CursorState) => void> = {
  hammer,
  chainsaw,
  flamethrower,
  machinegun,
  stamp,
};

export function drawCursor(ctx: Ctx, s: CursorState): void {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.lineJoin = 'round';
  DRAW[s.tool](ctx, s);
  ctx.restore();
}
