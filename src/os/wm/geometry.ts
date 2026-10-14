// Pure resize math for the Window component. The store clamps the result afterwards.
import type { Size } from '@/os/types';

export type ResizeEdge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export const RESIZE_EDGES: readonly ResizeEdge[] = [
  'n',
  's',
  'e',
  'w',
  'ne',
  'nw',
  'se',
  'sw',
];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Geometry after dragging `edge` by (dx, dy) from `start`. The opposite edge stays
 * fixed, also when the size hits `min`; the top edge never goes above 0.
 */
export function resizeRect(
  start: Rect,
  edge: ResizeEdge,
  dx: number,
  dy: number,
  min: Size,
): Rect {
  let { x, y, w, h } = start;
  if (edge.includes('e')) w = Math.max(min.w, start.w + dx);
  if (edge.includes('s')) h = Math.max(min.h, start.h + dy);
  if (edge.includes('w')) {
    w = Math.max(min.w, start.w - dx);
    x = start.x + start.w - w;
  }
  if (edge.includes('n')) {
    const bottom = start.y + start.h;
    y = Math.max(0, Math.min(start.y + dy, bottom - min.h));
    h = bottom - y;
  }
  return { x, y, w, h };
}
