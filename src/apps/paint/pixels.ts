// Paint's image model: a plain RGBA pixel buffer (same layout as ImageData), testable without a canvas.

export interface PixelBuffer {
  w: number;
  h: number;
  /** RGBA, row-major, `w * h * 4` bytes. */
  data: Uint8ClampedArray;
}

export type Rgba = readonly [number, number, number, number];

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const WHITE: Rgba = [255, 255, 255, 255];
export const BLACK: Rgba = [0, 0, 0, 255];

/** Canvas size limits for Image → Attributes. */
export const MIN_SIDE = 1;
export const MAX_SIDE = 1600;

export function createBuffer(w: number, h: number, fill: Rgba = WHITE) {
  const buf: PixelBuffer = { w, h, data: new Uint8ClampedArray(w * h * 4) };
  fillAll(buf, fill);
  return buf;
}

export function cloneBuffer(buf: PixelBuffer): PixelBuffer {
  return { w: buf.w, h: buf.h, data: new Uint8ClampedArray(buf.data) };
}

/** Replaces `target`'s size and pixels with `source`'s (in place, so refs stay valid). */
export function assignBuffer(target: PixelBuffer, source: PixelBuffer): void {
  target.w = source.w;
  target.h = source.h;
  target.data = new Uint8ClampedArray(source.data);
}

export function sameBuffer(a: PixelBuffer, b: PixelBuffer): boolean {
  if (a.w !== b.w || a.h !== b.h) return false;
  for (let i = 0; i < a.data.length; i++)
    if (a.data[i] !== b.data[i]) return false;
  return true;
}

export function inBounds(buf: PixelBuffer, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < buf.w && y < buf.h;
}

export function getPixel(buf: PixelBuffer, x: number, y: number): Rgba | null {
  if (!inBounds(buf, x, y)) return null;
  const i = (y * buf.w + x) * 4;
  const d = buf.data;
  return [d[i] ?? 0, d[i + 1] ?? 0, d[i + 2] ?? 0, d[i + 3] ?? 0];
}

/** Writes one pixel; out-of-bounds writes are ignored (shapes clip for free). */
export function setPixel(buf: PixelBuffer, x: number, y: number, c: Rgba) {
  if (!inBounds(buf, x, y)) return;
  const i = (y * buf.w + x) * 4;
  buf.data[i] = c[0];
  buf.data[i + 1] = c[1];
  buf.data[i + 2] = c[2];
  buf.data[i + 3] = c[3];
}

export function fillAll(buf: PixelBuffer, c: Rgba): void {
  for (let i = 0; i < buf.data.length; i += 4) {
    buf.data[i] = c[0];
    buf.data[i + 1] = c[1];
    buf.data[i + 2] = c[2];
    buf.data[i + 3] = c[3];
  }
}

export function fillRect(buf: PixelBuffer, r: Rect, c: Rgba): void {
  const x0 = Math.max(0, r.x);
  const y0 = Math.max(0, r.y);
  const x1 = Math.min(buf.w, r.x + r.w);
  const y1 = Math.min(buf.h, r.y + r.h);
  for (let y = y0; y < y1; y++)
    for (let x = x0; x < x1; x++) setPixel(buf, x, y, c);
}

/** A `size`×`size` dab centred on (cx, cy); `round` trims the corners (brush). */
export function stamp(
  buf: PixelBuffer,
  cx: number,
  cy: number,
  size: number,
  c: Rgba,
  round = false,
): void {
  const start = -Math.floor((size - 1) / 2);
  const r = size / 2;
  for (let dy = start; dy < start + size; dy++) {
    for (let dx = start; dx < start + size; dx++) {
      if (round && size > 2) {
        const ox = dx - start + 0.5 - r;
        const oy = dy - start + 0.5 - r;
        if (ox * ox + oy * oy > r * r) continue;
      }
      setPixel(buf, cx + dx, cy + dy, c);
    }
  }
}

/** The rectangle spanned by two corner points, both inclusive. */
export function rectFrom(a: Point, b: Point): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.abs(a.x - b.x) + 1, h: Math.abs(a.y - b.y) + 1 };
}

/** `r` clipped to the buffer; null when nothing is left. */
export function clipRect(buf: PixelBuffer, r: Rect): Rect | null {
  const x = Math.max(0, r.x);
  const y = Math.max(0, r.y);
  const w = Math.min(buf.w, r.x + r.w) - x;
  const h = Math.min(buf.h, r.y + r.h) - y;
  return w > 0 && h > 0 ? { x, y, w, h } : null;
}

/** Image → Attributes: keeps the top-left pixels, new area gets `fill`. */
export function resizeBuffer(
  buf: PixelBuffer,
  w: number,
  h: number,
  fill: Rgba = WHITE,
): PixelBuffer {
  const out = createBuffer(w, h, fill);
  const cw = Math.min(w, buf.w);
  for (let y = 0; y < Math.min(h, buf.h); y++) {
    const from = y * buf.w * 4;
    out.data.set(buf.data.subarray(from, from + cw * 4), y * w * 4);
  }
  return out;
}

export function clampSide(n: number): number {
  if (!Number.isFinite(n)) return MIN_SIDE;
  return Math.min(MAX_SIDE, Math.max(MIN_SIDE, Math.round(n)));
}

export function hexToRgba(hex: string): Rgba {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m?.[1]) return BLACK;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

export function rgbaToHex(c: Rgba): string {
  return `#${[c[0], c[1], c[2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}
