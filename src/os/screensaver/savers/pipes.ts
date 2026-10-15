// Pipes: shaded cylinders with ball joints, growing through a 3D grid seen in perspective.
// The picture accumulates; each step only paints what it adds.
import type { Saver, SaverFactory } from './types';
import {
  GRID,
  initialPipes,
  stepPipes,
  type Cell,
  type PipeOp,
} from './pipesGrowth';

/** Growth steps per second. */
const STEPS_PER_S = 30;
/** Hues of the pipe colours (index = PipeOp color). */
const HUES = [0, 32, 55, 120, 190, 220, 290];
const YAW = 0.55;
const PITCH = 0.32;
/** Camera distance, in cells. */
const DISTANCE = 22;
const RADIUS = 0.2;

interface Point {
  x: number;
  y: number;
  /** Pixels per grid unit at this depth. */
  scale: number;
}

function projector(w: number, h: number): (c: Cell) => Point {
  const focal = Math.min(w, h) * 1.4;
  const [cy, sy] = [Math.cos(YAW), Math.sin(YAW)];
  const [cp, sp] = [Math.cos(PITCH), Math.sin(PITCH)];
  return ([gx, gy, gz]) => {
    // Grid centred on the origin, y up.
    const x = gx - (GRID[0] - 1) / 2;
    const y = (GRID[1] - 1) / 2 - gy;
    const z = gz - (GRID[2] - 1) / 2;
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const y2 = y * cp - z1 * sp;
    const z2 = y * sp + z1 * cp + DISTANCE;
    const scale = focal / z2;
    return { x: w / 2 + x1 * scale, y: h / 2 - y2 * scale, scale };
  };
}

function shade(color: number, light: number): string {
  return `hsl(${HUES[color % HUES.length] ?? 0} 75% ${light}%)`;
}

function drawSegment(
  ctx: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  color: number,
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const ra = a.scale * RADIUS;
  const rb = b.scale * RADIUS;
  const r = (ra + rb) / 2;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  // Lit from the top-left: the side facing up/left is bright.
  const flip = nx + ny > 0 ? -1 : 1;
  const g = ctx.createLinearGradient(
    mx - nx * r * flip,
    my - ny * r * flip,
    mx + nx * r * flip,
    my + ny * r * flip,
  );
  g.addColorStop(0, shade(color, 18));
  g.addColorStop(0.3, shade(color, 45));
  g.addColorStop(0.75, shade(color, 78));
  g.addColorStop(1, shade(color, 30));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(a.x + nx * ra, a.y + ny * ra);
  ctx.lineTo(b.x + nx * rb, b.y + ny * rb);
  ctx.lineTo(b.x - nx * rb, b.y - ny * rb);
  ctx.lineTo(a.x - nx * ra, a.y - ny * ra);
  ctx.closePath();
  ctx.fill();
}

function drawJoint(ctx: CanvasRenderingContext2D, p: Point, color: number) {
  const r = p.scale * RADIUS * 1.45;
  const g = ctx.createRadialGradient(
    p.x - r * 0.35,
    p.y - r * 0.4,
    r * 0.1,
    p.x,
    p.y,
    r,
  );
  g.addColorStop(0, shade(color, 88));
  g.addColorStop(0.45, shade(color, 50));
  g.addColorStop(1, shade(color, 16));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
}

export function drawPipeOp(
  ctx: CanvasRenderingContext2D,
  op: PipeOp,
  project: (c: Cell) => Point,
  w: number,
  h: number,
) {
  if (op.kind === 'reset') {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
  } else if (op.kind === 'joint') {
    drawJoint(ctx, project(op.at), op.color);
  } else {
    drawSegment(ctx, project(op.from), project(op.to), op.color);
  }
}

export const createPipes: SaverFactory = ({ w, h, rand }): Saver => {
  const project = projector(w, h);
  let state = initialPipes();
  let pending = 0;
  return {
    frame(ctx, dtMs) {
      pending = Math.min(pending + (dtMs * STEPS_PER_S) / 1000, 8);
      while (pending >= 1) {
        pending -= 1;
        const next = stepPipes(state, rand);
        state = next.state;
        for (const op of next.ops) drawPipeOp(ctx, op, project, w, h);
      }
    },
  };
};
