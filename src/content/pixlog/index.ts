// Pixlog profiles, one per friend, in sign-in order. Sample data for now: P3-02/P3-03 add the
// rest.
import { jessPixlog } from './jess';
import type { PixlogProfile } from './types';

export const PIXLOG_PROFILES: readonly PixlogProfile[] = [jessPixlog];

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
