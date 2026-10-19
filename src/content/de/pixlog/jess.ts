// Jess on Pixlog in German, same structure as `src/content/pixlog/jess`.
// P4 replaces this with German.
import { jessPixlog as en } from '../../pixlog/jess';
import type { PixlogProfile } from '../../pixlog/types';

export const jessPixlog: PixlogProfile = structuredClone(en);
