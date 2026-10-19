// Kayla on Pixlog in German, same structure as `src/content/pixlog/kayla`.
// P4 replaces this with German.
import { kaylaPixlog as en } from '../../pixlog/kayla';
import type { PixlogProfile } from '../../pixlog/types';

export const kaylaPixlog: PixlogProfile = structuredClone(en);
