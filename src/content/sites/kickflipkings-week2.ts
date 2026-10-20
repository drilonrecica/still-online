// kickflipkings.example, days 6–10 (bible §5): Kev's news (one a day), the shoutbox (3–4 a day),
// the `/video` view counter (41 → 212) and Kev's 6-second clip of Dex at the Westfield Jam (day 9).
// The crew's and the gigs' day-gated changes sit on their entries in `kickflipkings.ts`.
import type { NewsPost, Shout, SkateVideo } from './types';

export const KICKFLIP_NEWS_WEEK2: readonly NewsPost[] = [
  {
    day: 6,
    title: '41 VIEWS',
    author: 'Kickflip_Kev',
    body: 'the dex video has 41 views!!! dex says like 30 of them r him. that still leaves 11 strangers. 11!! thats a whole bean cellar. tell ur friends. tell ur moms',
  },
  {
    day: 7,
    title: 'THE WESTFIELD JAM: the day after tomorrow, at the park',
    author: 'Kickflip_Kev',
    body: 'a real skate contest at our park!!! crew list: kev, sam, rico, dex. big mike from riverside is coming 2. divisions: street and ramp. rico asked for a manual division. there is no manual division. bring a helmet or sam wont let u in',
  },
  {
    day: 8,
    title: 'show alert: velvet lantern @ the rec hall (dex is filming)',
    author: 'Kickflip_Kev',
    body: 'saturday at the westfield rec hall. doors at 6, all ages. The Grip Tapes open!!! (skate punk, 3 songs, one about rain.) dex is filming the whole thing (he says he will find a tape). boards stay outside again. check the gigs page',
  },
  {
    day: 9,
    title: 'JAM RESULTS: sam 1st, big mike 2nd, DEX 3RD',
    author: 'Kickflip_Kev',
    body: 'what a day. sam won the whole thing with a 3-board ollie. big mike did a 360 flip that made rico sit down. and DEX LANDED THE KICKFLIP. in front of everyone. AND I FILMED IT. lens cap OFF. 3rd place = a sticker pack and a blank tape. the clip is on the video page',
  },
  {
    day: 10,
    title: 'the rec hall. dex filmed it. on a tape from 2007',
    author: 'Kickflip_Kev',
    body: 'velvet lantern played the rec hall tonight. 83 ppl. the room fits 80. the drummer played a paint bucket. the singer held the mic upside down for a whole song. dex filmed everything on his new jam tape. i filmed nothing. i was dancing. no regrets',
  },
];

export const KICKFLIP_SHOUTS_WEEK2: readonly Shout[] = [
  { day: 6, user: 'sam_grabs', text: '30 of those r dex' },
  { day: 6, user: 'dex.kickflip', text: 'like 30. maybe 31' },
  { day: 6, user: 'grindrail_gary', text: 'still buffering. 99%. day 2' },
  { day: 6, user: 'Kickflip_Kev', text: '41!!! the kings r FAMOUS' },
  { day: 7, user: 'Kickflip_Kev', text: 'JAM!!! signing up = showing up' },
  { day: 7, user: 'rico.manual', text: 'manual division or im out' },
  {
    day: 7,
    user: 'sam_grabs',
    text: 'big mike from riverside is coming. hes huge. hes nice tho',
  },
  { day: 8, user: 'dex.kickflip', text: 'practicing. dont shout at me' },
  {
    day: 8,
    user: 'skaterboi_14',
    text: 'saw dex at the park at 7am. he didnt see me. he was flipping',
  },
  {
    day: 8,
    user: 'Kickflip_Kev',
    text: 'jam is TOMORROW. bring water. and ur helmet (sam made me write that)',
  },
  { day: 9, user: 'Kickflip_Kev', text: 'I FILMED IT. lens cap OFF' },
  {
    day: 9,
    user: 'sam_grabs',
    text: '1st!!! big mike was robbed. dex was NOT robbed. dex was awesome',
  },
  { day: 9, user: 'PizzaRolls4Life', text: 'is the jam a game' },
  {
    day: 9,
    user: 'rico.manual',
    text: 'there was no manual division. i am out. (i was there all day)',
  },
  { day: 10, user: 'dex.kickflip', text: '83 ppl. 1 pick' },
  { day: 10, user: 'sam_grabs', text: 'went. loud. good' },
  {
    day: 10,
    user: 'grindrail_gary',
    text: '212 views and i am still at 99%',
  },
];

/** What week two adds to the `/video` page. */
export const KICKFLIP_VIDEO_WEEK2: Pick<SkateVideo, 'views' | 'clip'> = {
  views: [
    { day: 6, views: 41 },
    { day: 7, views: 58 },
    { day: 8, views: 77 },
    { day: 9, views: 140 },
    { day: 10, views: 212 },
  ],
  clip: {
    day: 9,
    title: 'NEW: kevs clip. dex at the westfield jam',
    length: '0:06',
    text: '6 seconds. lens cap OFF. u see the pop, the flip, the landing and then the camera shakes bc i was yelling SICK. it doesnt even buffer. its too short to buffer',
  },
};
