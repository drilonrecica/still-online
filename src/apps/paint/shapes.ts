// Lines and shapes on a PixelBuffer: Bresenham lines, and rect/ellipse/rounded rect drawn by
// testing pixel centres against the shape (outline = inside the shape but not inside its inset).
import {
  rectFrom,
  setPixel,
  stamp,
  type PixelBuffer,
  type Point,
  type Rect,
  type Rgba,
} from './pixels';

/** Every integer point from `a` to `b` (inclusive), Bresenham. */
export function linePoints(a: Point, b: Point): Point[] {
  const points: Point[] = [];
  let { x, y } = a;
  const dx = Math.abs(b.x - x);
  const dy = -Math.abs(b.y - y);
  const sx = x < b.x ? 1 : -1;
  const sy = y < b.y ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    points.push({ x, y });
    if (x === b.x && y === b.y) return points;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

/** A line of `size`-wide dabs; `round` dabs for the brush, square for pencil/eraser/line. */
export function drawLine(
  buf: PixelBuffer,
  a: Point,
  b: Point,
  c: Rgba,
  size = 1,
  round = false,
): void {
  for (const p of linePoints(a, b)) {
    if (size <= 1) setPixel(buf, p.x, p.y, c);
    else stamp(buf, p.x, p.y, size, c, round);
  }
}

export type ShapeKind = 'rect' | 'ellipse' | 'roundrect';

/** Outline only, outline (primary) + fill (secondary), or fill only (primary). */
export type ShapeMode = 'outline' | 'both' | 'fill';

export interface ShapeStyle {
  stroke: Rgba | null;
  fill: Rgba | null;
  /** Outline width in px. */
  width: number;
}

type Inside = (px: number, py: number, r: Rect) => boolean;

function insideRect(px: number, py: number, r: Rect): boolean {
  return px >= r.x && py >= r.y && px < r.x + r.w && py < r.y + r.h;
}

function insideEllipse(px: number, py: number, r: Rect): boolean {
  const rx = r.w / 2;
  const ry = r.h / 2;
  if (rx <= 0 || ry <= 0) return false;
  const nx = (px - (r.x + rx)) / rx;
  const ny = (py - (r.y + ry)) / ry;
  return nx * nx + ny * ny <= 1;
}

/** Corner radius scales with the shape like the classic tool, capped at 12 px. */
export function cornerRadius(r: Rect): number {
  return Math.min(12, r.w / 2, r.h / 2);
}

function insideRoundRect(px: number, py: number, r: Rect): boolean {
  if (!insideRect(px, py, r)) return false;
  const rad = cornerRadius(r);
  const cx = Math.min(Math.max(px, r.x + rad), r.x + r.w - rad);
  const cy = Math.min(Math.max(py, r.y + rad), r.y + r.h - rad);
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= rad * rad;
}

const INSIDE: Record<ShapeKind, Inside> = {
  rect: insideRect,
  ellipse: insideEllipse,
  roundrect: insideRoundRect,
};

/** Draws `kind` filling the box between two corner points. */
export function drawShape(
  buf: PixelBuffer,
  kind: ShapeKind,
  a: Point,
  b: Point,
  style: ShapeStyle,
): void {
  const outer = rectFrom(a, b);
  const inside = INSIDE[kind];
  const wd = Math.max(1, style.width);
  const inner: Rect = {
    x: outer.x + wd,
    y: outer.y + wd,
    w: outer.w - 2 * wd,
    h: outer.h - 2 * wd,
  };
  const hasInner = inner.w > 0 && inner.h > 0;
  for (let y = outer.y; y < outer.y + outer.h; y++) {
    if (y < 0 || y >= buf.h) continue;
    for (let x = outer.x; x < outer.x + outer.w; x++) {
      if (x < 0 || x >= buf.w) continue;
      const px = x + 0.5;
      const py = y + 0.5;
      if (!inside(px, py, outer)) continue;
      const inInner = hasInner && inside(px, py, inner);
      if (!inInner && style.stroke) setPixel(buf, x, y, style.stroke);
      else if (style.fill) setPixel(buf, x, y, style.fill);
    }
  }
}

/** Colours for a shape mode: outline in the drawing colour, fill in the other one. */
export function shapeStyle(
  mode: ShapeMode,
  color: Rgba,
  other: Rgba,
  width: number,
): ShapeStyle {
  if (mode === 'outline') return { stroke: color, fill: null, width };
  if (mode === 'both') return { stroke: color, fill: other, width };
  return { stroke: null, fill: color, width };
}
