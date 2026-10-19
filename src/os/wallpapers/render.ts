// Renders wallpapers to JPEG data URLs on an offscreen canvas, cached per id, locale (the poster
// has lettering) and bucketed size.
import { useSyncExternalStore } from 'react';
import { getLocale } from '@/i18n/t';
import { mulberry32, seedFrom } from '@/os/random';
import { getWallpaper } from './registry';
import type { Painter, WallpaperDef } from './types';

/** Sizes are rounded to this, so small resizes reuse the cached image. */
export const SIZE_BUCKET = 256;
/** Enough for every wallpaper at the desktop size plus Display Properties previews. */
const CACHE_LIMIT = 32;

export function bucketSize(n: number): number {
  return Math.max(SIZE_BUCKET, Math.round(n / SIZE_BUCKET) * SIZE_BUCKET);
}

let painters: Readonly<Record<string, Painter>> | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

/** Loads the painter chunk once; resolves when `wallpaperUrl` can paint. */
export function loadPainters(): Promise<void> {
  loading ??= import('./painters').then((m) => {
    painters = m.PAINTERS;
    listeners.forEach((fn) => fn());
  });
  return loading;
}

/** Re-renders the caller once the painters have loaded (false until then, true forever after). */
export function usePaintersReady(): boolean {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => painters !== null,
  );
}

/** Paints `def` at `w`×`h`, seeded by its id, so the same size always gives the same picture. */
export function renderWallpaper(
  def: WallpaperDef,
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const paint = painters?.[def.id];
  if (!paint) return;
  ctx.save();
  paint(ctx, w, h, mulberry32(seedFrom(def.id)));
  ctx.restore();
}

const cache = new Map<string, string>();

/**
 * A `data:image/jpeg` URL of wallpaper `id` at about `w`×`h` (bucketed), in the current locale.
 * Callers re-render on a language switch (`useLocale`). Null for `classic` (CSS),
 * unknown ids, and where there is no canvas backend (jsdom).
 */
export function wallpaperUrl(id: string, w: number, h: number): string | null {
  const def = getWallpaper(id);
  if (!def?.painted || typeof document === 'undefined') return null;
  if (!painters) {
    void loadPainters();
    return null;
  }
  const bw = bucketSize(w);
  const bh = bucketSize(h);
  const key = `${id}@${getLocale()}@${bw}x${bh}`;
  const hit = cache.get(key);
  if (hit) {
    // Refresh its place in the least-recently-used order.
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const canvas = document.createElement('canvas');
  canvas.width = bw;
  canvas.height = bh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  renderWallpaper(def, ctx, bw, bh);
  let url: string;
  try {
    url = canvas.toDataURL('image/jpeg', 0.9);
  } catch {
    return null;
  }
  cache.set(key, url);
  for (const old of cache.keys()) {
    if (cache.size <= CACHE_LIMIT) break;
    cache.delete(old);
  }
  return url;
}
