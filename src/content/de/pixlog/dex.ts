// Dex on Pixlog in German, same structure as `src/content/pixlog/dex`.
// P4 replaces this with German.
import { dexPixlog as en } from '../../pixlog/dex';
import type { PixlogProfile } from '../../pixlog/types';

export const dexPixlog: PixlogProfile = structuredClone(en);
