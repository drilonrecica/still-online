// Pia on Pixlog in German, same structure as `src/content/pixlog/pia`.
// P4 replaces this with German.
import { piaPixlog as en } from '../../pixlog/pia';
import type { PixlogProfile } from '../../pixlog/types';

export const piaPixlog: PixlogProfile = structuredClone(en);
