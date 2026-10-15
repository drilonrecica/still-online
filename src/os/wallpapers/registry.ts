// Every desktop wallpaper. Original procedural art "in the spirit of" famous ones; see tasks.md §P1-01.
import type { WallpaperDef } from './types';

export const CLASSIC_WALLPAPER_ID = 'classic';

export const WALLPAPERS: readonly WallpaperDef[] = [
  { id: CLASSIC_WALLPAPER_ID, name: 'Rolling Hill' },
  { id: 'hill', name: 'Green Hill Sky', painted: true },
  { id: 'ripple', name: 'Blue Ripple', painted: true },
  { id: 'autumn', name: 'Autumn Lane', painted: true },
  { id: 'dunes', name: 'Red Moon Dunes', painted: true },
  { id: 'stones', name: 'Stone Circle', painted: true },
  { id: 'tulips', name: 'Tulip Field', painted: true },
  { id: 'orbit', name: 'Home Orbit', painted: true },
  { id: 'bloom', name: 'Violet Bloom', painted: true },
  { id: 'peaks', name: 'Crystal Peaks', painted: true },
  {
    id: 'ponies',
    name: 'Pony Paradise',
    hidden: true,
    unlock: 'ponies',
    painted: true,
  },
  {
    id: 'retro',
    name: 'Retro Grid',
    hidden: true,
    unlock: 'konami',
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
