// Every wallpaper painter by id. Only ever imported dynamically (see `loadPainters` in render.ts),
// so the painting code stays out of the initial bundle.
import { paintOrbit, paintRipple } from './abstract';
import { paintPonies, paintRetro } from './hidden';
import { paintAutumn, paintDunes, paintHill, paintStones } from './landscapes';
import { paintBloom, paintPeaks, paintTulips } from './nature';
import type { Painter } from './types';

export const PAINTERS: Readonly<Record<string, Painter>> = {
  hill: paintHill,
  ripple: paintRipple,
  autumn: paintAutumn,
  dunes: paintDunes,
  stones: paintStones,
  tulips: paintTulips,
  orbit: paintOrbit,
  bloom: paintBloom,
  peaks: paintPeaks,
  ponies: paintPonies,
  retro: paintRetro,
};
