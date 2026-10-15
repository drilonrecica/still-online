// Fill bucket, airbrush and colour picker on a PixelBuffer.
import {
  getPixel,
  inBounds,
  setPixel,
  type PixelBuffer,
  type Point,
  type Rgba,
} from './pixels';

function sameAt(buf: PixelBuffer, i: number, c: Rgba): boolean {
  const d = buf.data;
  return (
    d[i] === c[0] && d[i + 1] === c[1] && d[i + 2] === c[2] && d[i + 3] === c[3]
  );
}

/**
 * Flood fill with tolerance 0 (exact colour match, 4-connected), scanline style.
 * Returns how many pixels changed.
 */
export function floodFill(buf: PixelBuffer, at: Point, c: Rgba): number {
  const target = getPixel(buf, at.x, at.y);
  if (!target || target.every((v, i) => v === c[i])) return 0;
  const { w, h } = buf;
  let changed = 0;
  const stack: Point[] = [at];
  while (stack.length) {
    const p = stack.pop() as Point;
    let x = p.x;
    const y = p.y;
    while (x > 0 && sameAt(buf, (y * w + x - 1) * 4, target)) x--;
    let up = false;
    let down = false;
    for (; x < w && sameAt(buf, (y * w + x) * 4, target); x++) {
      setPixel(buf, x, y, c);
      changed++;
      if (y > 0) {
        const match = sameAt(buf, ((y - 1) * w + x) * 4, target);
        if (match && !up) stack.push({ x, y: y - 1 });
        up = match;
      }
      if (y < h - 1) {
        const match = sameAt(buf, ((y + 1) * w + x) * 4, target);
        if (match && !down) stack.push({ x, y: y + 1 });
        down = match;
      }
    }
  }
  return changed;
}

/** Airbrush radii in px (small, medium, large). */
export const AIRBRUSH_RADII = [4, 8, 12] as const;

/** One puff of the airbrush: `dots` random pixels inside a disc of `radius`. */
export function spray(
  buf: PixelBuffer,
  at: Point,
  radius: number,
  c: Rgba,
  rand: () => number,
  dots = Math.max(6, Math.round(radius * 1.5)),
): void {
  for (let i = 0; i < dots; i++) {
    const angle = rand() * Math.PI * 2;
    const dist = Math.sqrt(rand()) * radius;
    setPixel(
      buf,
      Math.round(at.x + Math.cos(angle) * dist),
      Math.round(at.y + Math.sin(angle) * dist),
      c,
    );
  }
}

/** The colour picker: the pixel under `at`, opaque; null outside the image. */
export function pickColor(buf: PixelBuffer, at: Point): Rgba | null {
  if (!inBounds(buf, at.x, at.y)) return null;
  const p = getPixel(buf, at.x, at.y);
  return p ? [p[0], p[1], p[2], 255] : null;
}
