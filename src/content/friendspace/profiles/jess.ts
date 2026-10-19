// Jess's Friendspace profile: neon chaos, all caps, concert week (sign → outfit → night before →
// front row + the drumstick). The concert is between days 4 and 5.
import { g } from '../../gender';
import type { ProfileContent } from './types';

export const jessProfile: ProfileContent = {
  contactId: 'jess',
  headline: '~*~ FRONT ROW OR BUST!!!1 ~*~',
  mood: { text: 'HYPER', emoticon: ':D' },
  songTrackId: 'voxel-revolution',
  aboutMe:
    'hiiii its JESS!!! :D i like loud music, glitter, my cat (hes sparkly now, long story) and the TINFOIL COMETS. ' +
    'they r the best band in the whole galaxy and if u disagree u can leave a comment and i will delete it :P ' +
    'i play their cd w the robot on it like 40 times a day. my mom says "turn it down" i say "turn it UP". ' +
    'i tell the worst jokes in the world and im proud of it. why did the cd player cry? it had too many skips. ur welcome',
  wantToMeet:
    'ZIGGY. the drummer. obviously. also anyone who knows how to get glitter glue out of a cat',
  interests: [
    {
      label: 'Music',
      text: 'TINFOIL COMETS!!! and anything u can scream along to in the car',
    },
    {
      label: 'Movies',
      text: 'concert dvds. the comets one i have watched like 200 times',
    },
    { label: 'Television', text: 'music videos. ALL of them. at 2am' },
    {
      label: 'Books',
      text: 'the band biography. its signed (by me. but still)',
    },
    {
      label: 'Heroes',
      text: 'Ziggy. and my mom when she drives us places and DOESNT sing',
    },
  ],
  top8: [
    { kind: 'player' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'extra', name: 'xX_CometGirl_Xx', seed: 'cometgirl' },
    { kind: 'contact', id: 'dex' },
    { kind: 'contact', id: 'theo' },
    { kind: 'band', id: 'tinfoil-comets' },
    { kind: 'contact', id: 'marco' },
    { kind: 'contact', id: 'pia' },
  ],
  comments: [
    {
      day: 1,
      from: 'xX_CometGirl_Xx',
      text: 'OMG a fellow COMET!!! sign my guestbook at tinfoilcomets.example!!!!',
    },
    {
      day: 1,
      from: 'kayla',
      contactId: 'kayla',
      text: 'u WON?? jess thats sooo lucky!!! (L)',
      graphic: 'glitterheart',
    },
    {
      day: 1,
      from: 'dex',
      contactId: 'dex',
      text: 'nice. the robot cd is good',
    },
    {
      day: 2,
      from: 'marco',
      contactId: 'marco',
      text: 'heard ur making a sign. check the spelling. trust me',
    },
    {
      day: 2,
      from: 'pia',
      contactId: 'pia',
      text: 'u have glitter on ur pic. can i have some glitter',
    },
    {
      day: 3,
      from: 'kayla',
      contactId: 'kayla',
      text: 'OUTFIT EMERGENCY?? i have like 12 sparkly tops. call me',
    },
    {
      day: 3,
      from: 'theo',
      contactId: 'theo',
      text: 'um hi jess. good luck at the concert. sorry if this is weird',
    },
    {
      day: 4,
      from: 'ZIGGY FAN CLUB',
      text: 'TOMORROW NIGHT!!! bring a sign!!! Ziggy reads EVERY sign!!!',
    },
    { day: 4, from: 'dex', contactId: 'dex', text: 'have fun. bring earplugs' },
    {
      day: 5,
      from: 'kayla',
      contactId: 'kayla',
      text: 'U CAUGHT THE DRUMSTICK??? pics or it didnt happen',
    },
    {
      day: 5,
      from: 'marco',
      contactId: 'marco',
      text: 'front row. respect. derek is jealous',
    },
    {
      day: 5,
      from: 'pia',
      contactId: 'pia',
      text: 'can i touch the drumstick. i will be careful. mostly',
    },
    {
      day: 5,
      from: 'xX_CometGirl_Xx',
      text: 'U CAUGHT IT??? ur my HERO!!! i am crying!!!',
      graphic: 'glitterheart',
    },
  ],
  commentsOnPlayer: [
    {
      day: 2,
      text: '{name}!!! ur on friendspace!!! ur in my top 8. #1. obviously :D',
      graphic: 'thanks',
    },
    {
      day: 3,
      text: g(
        'what r u wearing friday?? DONT say a sweater. i mean it',
        'what r u wearing friday?? DONT say the hoodie w/ the hole. i mean it',
      ),
    },
    { day: 4, text: 'TOMORROW!!! i cant sleep. i cant eat. i can only scream' },
    {
      day: 5,
      text: `best. night. EVER. ur the best concert buddy in the galaxy ${g('(L)', '(Y)')}`,
    },
  ],
  theme: {
    background:
      'repeating-linear-gradient(45deg, #ff2fd1 0 22px, #39ff14 22px 44px, #00e5ff 44px 66px, #fff200 66px 88px)',
    text: '#1a0033',
    accent: '#d4009c',
    glitter: true,
    font: "'Comic Sans MS', 'Chalkboard', cursive",
    panel: 'rgba(255, 255, 255, 0.9)',
  },
  layout: {
    cursor: 'sparkle',
    stickers: [
      { id: 'star', pos: 'top-right' },
      { id: 'music', pos: 'bottom-left' },
    ],
  },
};
