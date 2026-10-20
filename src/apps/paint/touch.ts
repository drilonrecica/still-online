// Paint on touch (v0.6): one finger draws, two fingers scroll the work area; phone canvas size.
import type { Point } from './pixels';

/** A new picture on a phone is never smaller than this (px per side). */
export const PHONE_MIN_SIZE = 200;

/** The size of a new picture on a phone: the work area, in whole pixels, at least 200×200. */
export function phoneCanvasSize(areaW: number, areaH: number) {
  return {
    w: Math.max(PHONE_MIN_SIZE, Math.floor(areaW)),
    h: Math.max(PHONE_MIN_SIZE, Math.floor(areaH)),
  };
}

/** What a touch pointer going down means. */
export type TouchDown =
  /** The only finger: it may draw. */
  | 'draw'
  /** The second finger: cancel the stroke and start panning. */
  | 'pan'
  /** A third finger or more: keep panning. */
  | 'extra';

/**
 * Tracks the touch pointers on the work area (client coordinates). Two or more fingers pan:
 * `move` returns how far to scroll, from the movement of the fingers' midpoint.
 */
export function createTouchTracker() {
  const points = new Map<number, Point>();
  let last: Point | null = null;

  const midpoint = (): Point => {
    let x = 0;
    let y = 0;
    for (const p of points.values()) {
      x += p.x;
      y += p.y;
    }
    return { x: x / points.size, y: y / points.size };
  };

  return {
    /** Fingers down now. */
    get count() {
      return points.size;
    },
    get panning() {
      return last !== null;
    },
    down(id: number, p: Point): TouchDown {
      points.set(id, p);
      if (points.size === 1) return 'draw';
      last = midpoint();
      return points.size === 2 ? 'pan' : 'extra';
    },
    /** The scroll delta for this move (zero when not panning or not a tracked finger). */
    move(id: number, p: Point): Point {
      if (!points.has(id)) return { x: 0, y: 0 };
      points.set(id, p);
      if (!last) return { x: 0, y: 0 };
      const now = midpoint();
      const delta = { x: last.x - now.x, y: last.y - now.y };
      last = now;
      return delta;
    },
    up(id: number) {
      points.delete(id);
      // The pan ends when the fingers lift; a finger left behind does not start drawing.
      if (points.size === 0) last = null;
      else if (last) last = midpoint();
    },
  };
}
