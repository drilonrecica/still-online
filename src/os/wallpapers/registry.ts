// Every desktop wallpaper. Original procedural art "in the spirit of" famous ones; see tasks.md §P1-01.
import { paintOrbit, paintRipple } from './abstract';
import { paintPonies, paintRetro } from './hidden';
import { paintAutumn, paintDunes, paintHill, paintStones } from './landscapes';
import { paintBloom, paintPeaks, paintTulips } from './nature';
import type { WallpaperDef } from './types';

export const CLASSIC_WALLPAPER_ID = 'classic';

export const WALLPAPERS: readonly WallpaperDef[] = [
  { id: CLASSIC_WALLPAPER_ID, name: 'Rolling Hill' },
  { id: 'hill', name: 'Green Hill Sky', render: paintHill },
  { id: 'ripple', name: 'Blue Ripple', render: paintRipple },
  { id: 'autumn', name: 'Autumn Lane', render: paintAutumn },
  { id: 'dunes', name: 'Red Moon Dunes', render: paintDunes },
  { id: 'stones', name: 'Stone Circle', render: paintStones },
  { id: 'tulips', name: 'Tulip Field', render: paintTulips },
  { id: 'orbit', name: 'Home Orbit', render: paintOrbit },
  { id: 'bloom', name: 'Violet Bloom', render: paintBloom },
  { id: 'peaks', name: 'Crystal Peaks', render: paintPeaks },
  {
    id: 'ponies',
    name: 'Pony Paradise',
    hidden: true,
    unlock: 'ponies',
    render: paintPonies,
  },
  {
    id: 'retro',
    name: 'Retro Grid',
    hidden: true,
    unlock: 'konami',
    render: paintRetro,
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
