// German Pixlog profiles, same contact ids and order as `src/content/pixlog`.
import type { PixlogProfile } from '../../pixlog/types';
import { STRANGERS as EN_STRANGERS } from '../../pixlog';
import { dexPixlog } from './dex';
import { jessPixlog } from './jess';
import { kaylaPixlog } from './kayla';
import { marcoPixlog } from './marco';
import { piaPixlog } from './pia';
import { theoPixlog } from './theo';

export const PIXLOG_PROFILES: readonly PixlogProfile[] = [
  jessPixlog,
  piaPixlog,
  kaylaPixlog,
  marcoPixlog,
  theoPixlog,
  dexPixlog,
];

/** Same count as English. P4 replaces this with German screen names. */
export const STRANGERS: readonly string[] = [...EN_STRANGERS];
