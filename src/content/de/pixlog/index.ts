// German Pixlog profiles, same contact ids and order as `src/content/pixlog`.
import { withWeek, type PixlogProfile } from '../../pixlog/types';
// Days 6–10 (W2-03): the English weeks as placeholders until W3.
// W3 replaces this with German
import { dexPixlogWeek2 } from '../../pixlog/dex-week2';
import { jessPixlogWeek2 } from '../../pixlog/jess-week2';
import { kaylaPixlogWeek2 } from '../../pixlog/kayla-week2';
import { marcoPixlogWeek2 } from '../../pixlog/marco-week2';
import { piaPixlogWeek2 } from '../../pixlog/pia-week2';
import { theoPixlogWeek2 } from '../../pixlog/theo-week2';
import { dexPixlog } from './dex';
import { jessPixlog } from './jess';
import { kaylaPixlog } from './kayla';
import { marcoPixlog } from './marco';
import { piaPixlog } from './pia';
import { theoPixlog } from './theo';

export const PIXLOG_PROFILES: readonly PixlogProfile[] = [
  withWeek(jessPixlog, jessPixlogWeek2),
  withWeek(piaPixlog, piaPixlogWeek2),
  withWeek(kaylaPixlog, kaylaPixlogWeek2),
  withWeek(marcoPixlog, marcoPixlogWeek2),
  withWeek(theoPixlog, theoPixlogWeek2),
  withWeek(dexPixlog, dexPixlogWeek2),
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
