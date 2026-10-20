// Pixlog profiles, one per friend, in sign-in order. Each module holds days 1–5; `<friend>-week2.ts`
// adds days 6–10 (W2-03).
import { dexPixlog } from './dex';
import { jessPixlog } from './jess';
import { kaylaPixlog } from './kayla';
import { marcoPixlog } from './marco';
import { piaPixlog } from './pia';
import { theoPixlog } from './theo';
import { dexPixlogWeek2 } from './dex-week2';
import { jessPixlogWeek2 } from './jess-week2';
import { kaylaPixlogWeek2 } from './kayla-week2';
import { marcoPixlogWeek2 } from './marco-week2';
import { piaPixlogWeek2 } from './pia-week2';
import { theoPixlogWeek2 } from './theo-week2';
import { withWeek, type PixlogProfile } from './types';

export const PIXLOG_PROFILES: readonly PixlogProfile[] = [
  withWeek(jessPixlog, jessPixlogWeek2),
  withWeek(piaPixlog, piaPixlogWeek2),
  withWeek(kaylaPixlog, kaylaPixlogWeek2),
  withWeek(marcoPixlog, marcoPixlogWeek2),
  withWeek(theoPixlog, theoPixlogWeek2),
  withWeek(dexPixlog, dexPixlogWeek2),
];

/** Screen names of strangers who drop by the player's page (P2-02 `visitors`, seeded per day). */
export const STRANGERS: readonly string[] = [
  'xX_CometGirl_Xx',
  'sk8erboi_4ever',
  'lil_miss_sunshine',
  'DarkAngel_1991',
  'pinkpanda88',
  'gamerdude_x',
  'cupcake_luvr',
  'MrSnuggles07',
  'rockchick_jo',
  'n00b_slayer',
  'sparkle_kitty',
  'emo_kid_93',
];
