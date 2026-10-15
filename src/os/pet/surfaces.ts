// Where Fluff can stand: the taskbar's top edge and the top edges of window title bars.
// Pure geometry, recomputed every tick from the windows store.
import type { WindowState } from '@/os/types';

/** A horizontal segment Fluff can stand on, in viewport px. */
export interface Surface {
  /** `taskbar` or the window id that owns the edge (a title bar may split into several segments). */
  owner: string;
  x1: number;
  x2: number;
  y: number;
  /** The owner's origin; Fluff follows its movement while standing on it. */
  ox: number;
  oy: number;
}

export const TASKBAR_OWNER = 'taskbar';

/** Segments narrower than this are not worth standing on. */
export const MIN_SURFACE_WIDTH = 24;

export interface SurfaceInput {
  windows: readonly Pick<
    WindowState,
    'id' | 'x' | 'y' | 'w' | 'h' | 'z' | 'minimized' | 'maximized'
  >[];
  viewport: { w: number; h: number };
  taskbarHeight: number;
  /** Windows without a title bar (`chrome: 'none'`) are skipped. */
  hasTitleBar?: (id: string) => boolean;
}

type Range = readonly [number, number];

/** `range` minus every range in `cuts`, keeping pieces in order. */
function subtract(range: Range, cuts: readonly Range[]): Range[] {
  let pieces: Range[] = [range];
  for (const [c1, c2] of cuts) {
    pieces = pieces.flatMap(([a, b]): Range[] => {
      if (c2 <= a || c1 >= b) return [[a, b]];
      const out: Range[] = [];
      if (c1 > a) out.push([a, c1]);
      if (c2 < b) out.push([c2, b]);
      return out;
    });
  }
  return pieces;
}

/**
 * The taskbar first, then each visible, non-maximized window's title bar, clipped to the
 * viewport and cut where a window in front covers it. Window coordinates are relative to the
 * work area, which starts at the top of the viewport.
 */
export function computeSurfaces({
  windows,
  viewport,
  taskbarHeight,
  hasTitleBar = () => true,
}: SurfaceInput): Surface[] {
  const taskbarY = viewport.h - taskbarHeight;
  const surfaces: Surface[] = [
    {
      owner: TASKBAR_OWNER,
      x1: 0,
      x2: viewport.w,
      y: taskbarY,
      ox: 0,
      oy: taskbarY,
    },
  ];
  const shown = windows.filter((w) => !w.minimized && !w.maximized);
  for (const win of shown) {
    if (!hasTitleBar(win.id)) continue;
    if (win.y <= 0 || win.y >= taskbarY) continue;
    const covers = shown
      .filter(
        (o) =>
          o.id !== win.id &&
          o.z > win.z &&
          o.y <= win.y &&
          win.y < o.y + o.h &&
          hasTitleBar(o.id),
      )
      .map((o): Range => [o.x, o.x + o.w]);
    const clipped: Range = [
      Math.max(0, win.x),
      Math.min(viewport.w, win.x + win.w),
    ];
    for (const [x1, x2] of subtract(clipped, covers)) {
      if (x2 - x1 < MIN_SURFACE_WIDTH) continue;
      surfaces.push({ owner: win.id, x1, x2, y: win.y, ox: win.x, oy: win.y });
    }
  }
  return surfaces;
}
