// Every desktop wallpaper. Original procedural art "in the spirit of" famous ones; see tasks.md §P1-01; names are catalog keys.
import type { WallpaperDef } from './types';

export const CLASSIC_WALLPAPER_ID = 'classic';

export const WALLPAPERS: readonly WallpaperDef[] = [
  { id: CLASSIC_WALLPAPER_ID, nameKey: 'wallpapers.classic' },
  { id: 'hill', nameKey: 'wallpapers.hill', painted: true },
  { id: 'ripple', nameKey: 'wallpapers.ripple', painted: true },
  { id: 'autumn', nameKey: 'wallpapers.autumn', painted: true },
  { id: 'dunes', nameKey: 'wallpapers.dunes', painted: true },
  { id: 'stones', nameKey: 'wallpapers.stones', painted: true },
  { id: 'tulips', nameKey: 'wallpapers.tulips', painted: true },
  { id: 'orbit', nameKey: 'wallpapers.orbit', painted: true },
  { id: 'bloom', nameKey: 'wallpapers.bloom', painted: true },
  { id: 'peaks', nameKey: 'wallpapers.peaks', painted: true },
  {
    id: 'ponies',
    nameKey: 'wallpapers.ponies',
    hidden: true,
    unlock: 'ponies',
    painted: true,
  },
  {
    id: 'retro',
    nameKey: 'wallpapers.retro',
    hidden: true,
    unlock: 'konami',
    painted: true,
  },
  {
    id: 'lantern-poster',
    nameKey: 'wallpapers.lanternPoster',
    hidden: true,
    unlock: 'lantern-poster',
    painted: true,
  },
];

export function getWallpaper(id: string): WallpaperDef | undefined {
  return WALLPAPERS.find((w) => w.id === id);
}

export function isWallpaperUnlocked(
  def: WallpaperDef,
  unlocks: readonly string[],
): boolean {
  return !def.unlock || unlocks.includes(def.unlock);
}

/** The wallpapers to offer the player: hidden ones only once unlocked. */
export function listWallpapers(unlocks: readonly string[]): WallpaperDef[] {
  return WALLPAPERS.filter((w) => !w.hidden || isWallpaperUnlocked(w, unlocks));
}

/** The wallpaper to actually show for `id`: unknown or still-locked ids fall back to `classic`. */
export function resolveWallpaperId(
  id: string,
  unlocks: readonly string[],
): string {
  const def = getWallpaper(id);
  return def && isWallpaperUnlocked(def, unlocks)
    ? def.id
    : CLASSIC_WALLPAPER_ID;
}
