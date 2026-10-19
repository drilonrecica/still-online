// Marco on Pixlog in German, same structure as `src/content/pixlog/marco`.
// P4 replaces this with German.
import { marcoPixlog as en } from '../../pixlog/marco';
import type { PixlogProfile } from '../../pixlog/types';

export const marcoPixlog: PixlogProfile = structuredClone(en);
