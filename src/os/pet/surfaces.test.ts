import { describe, expect, it } from 'vitest';
import { computeSurfaces, TASKBAR_OWNER } from './surfaces';

const win = (
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  z: number,
  extra: { minimized?: boolean; maximized?: boolean } = {},
) => ({
  id,
  x,
  y,
  w,
  h,
  z,
  minimized: false,
  maximized: false,
  ...extra,
});

const viewport = { w: 1000, h: 700 };

describe('computeSurfaces', () => {
  it('always has the taskbar top edge across the screen', () => {
    expect(
      computeSurfaces({ windows: [], viewport, taskbarHeight: 30 }),
    ).toEqual([
      { owner: TASKBAR_OWNER, x1: 0, x2: 1000, y: 670, ox: 0, oy: 670 },
    ]);
  });

  it("adds each visible window's title bar top edge from its geometry", () => {
    const surfaces = computeSurfaces({
      windows: [win('w1', 100, 50, 300, 200, 1)],
      viewport,
      taskbarHeight: 30,
    });
    expect(surfaces[1]).toEqual({
      owner: 'w1',
      x1: 100,
      x2: 400,
      y: 50,
      ox: 100,
      oy: 50,
    });
  });

  it('ignores minimized, maximized and title-bar-less windows', () => {
    const surfaces = computeSurfaces({
      windows: [
        win('min', 100, 50, 300, 200, 1, { minimized: true }),
        win('max', 100, 80, 300, 200, 2, { maximized: true }),
        win('bare', 100, 120, 300, 200, 3),
      ],
      viewport,
      taskbarHeight: 30,
      hasTitleBar: (id) => id !== 'bare',
    });
    expect(surfaces.map((s) => s.owner)).toEqual([TASKBAR_OWNER]);
  });

  it('clips to the viewport and drops slivers', () => {
    const surfaces = computeSurfaces({
      windows: [
        win('left', -200, 50, 300, 200, 1),
        win('tiny', 990, 90, 300, 200, 2),
      ],
      viewport,
      taskbarHeight: 30,
    });
    expect(surfaces.slice(1)).toEqual([
      { owner: 'left', x1: 0, x2: 100, y: 50, ox: -200, oy: 50 },
    ]);
  });

  it('cuts a title bar where a window in front covers it', () => {
    const surfaces = computeSurfaces({
      windows: [
        win('back', 100, 100, 500, 300, 1),
        win('front', 250, 40, 100, 200, 2),
        // Behind `back`: does not cut it.
        win('under', 400, 20, 100, 200, 0),
      ],
      viewport,
      taskbarHeight: 30,
    });
    expect(
      surfaces.filter((s) => s.owner === 'back').map((s) => [s.x1, s.x2]),
    ).toEqual([
      [100, 250],
      [350, 600],
    ]);
    // A window that starts lower down never covers an edge above it.
    expect(surfaces.some((s) => s.owner === 'under')).toBe(true);
  });
});
