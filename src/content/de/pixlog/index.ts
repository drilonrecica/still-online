// German Pixlog profiles, same contact ids and order as `src/content/pixlog`.
import type { PixlogProfile } from '../../pixlog/types';
import { STRANGERS as EN_STRANGERS } from '../../pixlog';
import { jessPixlog } from './jess';
import { kaylaPixlog } from './kayla';
import { piaPixlog } from './pia';

export const PIXLOG_PROFILES: readonly PixlogProfile[] = [
  jessPixlog,
  piaPixlog,
  kaylaPixlog,
];

/** Same count as English. P4 replaces this with German screen names. */
export const STRANGERS: readonly string[] = [...EN_STRANGERS];
