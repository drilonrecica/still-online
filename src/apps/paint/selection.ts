// The rectangular selection: lift a region off the image, move it around, drop or delete it.
import {
  clipRect,
  cloneBuffer,
  createBuffer,
  fillRect,
  setPixel,
  type PixelBuffer,
  type Rect,
  type Rgba,
} from './pixels';

export interface Selection {
  /** Where the selection sits now, in image pixels. */
  rect: Rect;
  /** Lifted pixels while being moved; null for a plain marquee. */
  float: PixelBuffer | null;
  /** The image with the lifted area cleared, which moves are drawn over. */
  under: PixelBuffer | null;
}

export function copyRegion(buf: PixelBuffer, r: Rect): PixelBuffer {
  const out = createBuffer(r.w, r.h);
  for (let y = 0; y < r.h; y++) {
    const sy = r.y + y;
    if (sy < 0 || sy >= buf.h) continue;
    for (let x = 0; x < r.w; x++) {
      const sx = r.x + x;
      if (sx < 0 || sx >= buf.w) continue;
      const from = (sy * buf.w + sx) * 4;
      out.data.set(buf.data.subarray(from, from + 4), (y * r.w + x) * 4);
    }
  }
  return out;
}

export function pasteRegion(
  buf: PixelBuffer,
  region: PixelBuffer,
  x: number,
  y: number,
): void {
  for (let ry = 0; ry < region.h; ry++) {
    for (let rx = 0; rx < region.w; rx++) {
      const i = (ry * region.w + rx) * 4;
      const d = region.data;
      setPixel(buf, x + rx, y + ry, [
        d[i] ?? 0,
        d[i + 1] ?? 0,
        d[i + 2] ?? 0,
        d[i + 3] ?? 0,
      ]);
    }
  }
}

/** A marquee over `r` (clipped to the image); null when it misses the image. */
export function select(buf: PixelBuffer, r: Rect): Selection | null {
  const rect = clipRect(buf, r);
  return rect ? { rect, float: null, under: null } : null;
}

/** Lifts the marquee's pixels so they can move; the hole is filled with `bg`. */
export function lift(buf: PixelBuffer, sel: Selection, bg: Rgba): Selection {
  if (sel.float) return sel;
  const float = copyRegion(buf, sel.rect);
  const under = cloneBuffer(buf);
  fillRect(under, sel.rect, bg);
  return { ...sel, float, under };
}

/** Moves a lifted selection to (x, y) and redraws `buf` = under + float. */
export function moveTo(
  buf: PixelBuffer,
  sel: Selection,
  x: number,
  y: number,
): Selection {
  if (!sel.float || !sel.under) return sel;
  buf.data.set(sel.under.data);
  pasteRegion(buf, sel.float, x, y);
  return { ...sel, rect: { ...sel.rect, x, y } };
}

/** Delete: a lifted selection vanishes, a marquee's area is filled with `bg`. */
export function clearSelection(
  buf: PixelBuffer,
  sel: Selection,
  bg: Rgba,
): void {
  if (sel.under) buf.data.set(sel.under.data);
  else fillRect(buf, sel.rect, bg);
}

export function containsPoint(r: Rect, x: number, y: number): boolean {
  return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
}
