// German Pixlog profiles, same contact ids and order as `src/content/pixlog`.
import type { PixlogProfile } from '../../pixlog/types';
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

/** Screen names of strangers in the visitors box; same count as English, German 2007 handles. */
export const STRANGERS: readonly string[] = [
  'xX_CometGirl_Xx',
  'sk8erjunge_4ever',
  'kleiner_sonnenschein',
  'DarkAngel_1991',
  'pinker_panda88',
  'zockerjunge_x',
  'muffin_maus',
  'HerrKuschel07',
  'rockgirl_jo',
  'n00b_schreck',
  'glitzer_kitty',
  'emo_kind_93',
];
