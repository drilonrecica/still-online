// Hen Hunt hit-testing: which target sits under a screen point, nearest layer first.
import { henContains, isAlive, type Hen } from './hens';
import {
  SCARECROW,
  WINDMILL,
  WINDOW_HEN,
  toLayerX,
  type Depth,
} from './layout';
import type { Game } from './sim';

export type Target =
  { kind: 'hen' | 'golden'; hen: Hen } | { kind: 'window' } | { kind: 'hat' };

function hensAt(g: Game, depth: Depth, sx: number, sy: number): Hen | null {
  const x = toLayerX(sx, depth, g.camX);
  // Later hens are drawn on top, so test them first.
  for (let i = g.hens.length - 1; i >= 0; i--) {
    const h = g.hens[i]!;
    if (h.depth === depth && isAlive(h) && henContains(h, x, sy)) return h;
  }
  return null;
}

/** The topmost target under screen point (sx, sy): nearest layer first. */
export function hitTest(g: Game, sx: number, sy: number): Target | null {
  const henTarget = (h: Hen | null): Target | null =>
    h && { kind: h.golden ? 'golden' : 'hen', hen: h };
  const near = henTarget(hensAt(g, 'near', sx, sy));
  if (near) return near;
  const mid = henTarget(hensAt(g, 'mid', sx, sy));
  if (mid) return mid;
  const hat = SCARECROW.hat;
  const hx = toLayerX(sx, 'mid', g.camX);
  if (
    g.hatAway === 0 &&
    Math.abs(hx - hat.x) <= hat.w / 2 &&
    Math.abs(sy - hat.y) <= hat.h / 2
  )
    return { kind: 'hat' };
  const far = henTarget(hensAt(g, 'far', sx, sy));
  if (far) return far;
  const win = WINDMILL.window;
  const wx = toLayerX(sx, 'far', g.camX);
  if (
    g.windowHen.showing > 0 &&
    (wx - win.x) ** 2 + (sy - win.y) ** 2 <= (WINDOW_HEN.radius * 1.3) ** 2
  )
    return { kind: 'window' };
  return null;
}
