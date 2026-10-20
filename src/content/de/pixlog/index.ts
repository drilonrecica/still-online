// German Pixlog profiles, same contact ids and order as `src/content/pixlog`: days 1–5 in
// `<friend>.ts`, days 6–10 (W3-02) in `<friend>-week2.ts`, appended with `withWeek`.
import { withWeek, type PixlogProfile } from '../../pixlog/types';
import { dexPixlog } from './dex';
import { dexPixlogWeek2 } from './dex-week2';
import { jessPixlog } from './jess';
import { jessPixlogWeek2 } from './jess-week2';
import { kaylaPixlog } from './kayla';
import { kaylaPixlogWeek2 } from './kayla-week2';
import { marcoPixlog } from './marco';
import { marcoPixlogWeek2 } from './marco-week2';
import { piaPixlog } from './pia';
import { piaPixlogWeek2 } from './pia-week2';
import { theoPixlog } from './theo';
import { theoPixlogWeek2 } from './theo-week2';

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
