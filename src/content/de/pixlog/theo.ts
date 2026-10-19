// Theo on Pixlog in German, same structure as `src/content/pixlog/theo`.
// P4 replaces this with German.
import { theoPixlog as en } from '../../pixlog/theo';
import type { PixlogProfile } from '../../pixlog/types';

export const theoPixlog: PixlogProfile = structuredClone(en);
