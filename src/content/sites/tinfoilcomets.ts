// tinfoilcomets.example: "The OFFICIAL UNOFFICIAL Tinfoil Comets Fan Page!!!1" by xX_CometGirl_Xx.
// Everything is fictional: the band, its songs and every signer. Day-gated entries show when
// `day <= currentDay`. Friends sign on their story days (Jess 1 + 5, Pia 3, Marco 4); days 6–10
// (the fan art contest, Lakeview) live in `tinfoilcomets-week2.ts`.
import type { PhotoScene } from '@/os/fs/types';
import {
  TINFOIL_GUESTBOOK_WEEK2,
  TINFOIL_NEWS_WEEK2,
  TINFOIL_PICS_WEEK2,
} from './tinfoilcomets-week2';
import type { GuestbookEntry, SiteMeta } from './types';

export const TINFOIL_HOST = 'tinfoilcomets.example';

export const SITE_META: SiteMeta = {
  title: 'The OFFICIAL UNOFFICIAL Tinfoil Comets Fan Page!!!1',
  description:
    'The #1 Tinfoil Comets fan page by xX_CometGirl_Xx: band news, tour dates, concert pics and a guestbook. Sign it!!!',
  keywords: [
    'tinfoil',
    'comets',
    'band',
    'fan',
    'music',
    'concert',
    'ziggy',
    'lakeview',
  ],
  pages: {
    '/': {
      title: 'Tinfoil Comets Fan Page - HOME',
      keywords: ['hamsters', 'news', 'webring', 'midi'],
    },
    '/band': {
      title: 'Tinfoil Comets Fan Page - The Band',
      keywords: ['members', 'albums', 'tour', 'dates', 'robot'],
    },
    '/guestbook': {
      title: 'Tinfoil Comets Fan Page - Guestbook',
      keywords: ['guestbook', 'sign'],
    },
    '/pics': {
      title: 'Tinfoil Comets Fan Page - Pics',
      keywords: ['pics', 'photos', 'gallery', 'fan art', 'contest', 'winners'],
    },
  },
};

/** The hit counter shows this on the very first visit, then +1 per visit. */
export const COUNTER_START = 4203;

export interface DayText {
  day: number;
  text: string;
}

export interface BandMember {
  name: string;
  role: string;
  facts: readonly string[];
}

export interface Album {
  title: string;
  year: number;
  note: string;
  tracks: readonly string[];
}

export interface TourDate {
  date: string;
  venue: string;
  note: string;
  /** From this day on (until `after`), the date reads this one (the show is close now). */
  soon?: { day: number; date: string };
  /** From this day on (until `after`), the note reads this one (the show sold out). */
  soldOut?: { day: number; note: string };
  /** From this day on, `date`/`note` are replaced (the show already happened). */
  after?: { day: number; date: string; note: string };
}

export interface ConcertPic {
  day: number;
  seed: number;
  /** The photo scene; without it, a concert pic. */
  scene?: PhotoScene;
  caption: string;
}

export const TINFOIL_SITE_TEXT = {
  title: 'The OFFICIAL UNOFFICIAL Tinfoil Comets Fan Page!!!1',
  owner: 'xX_CometGirl_Xx',
  welcome:
    'WELCOME 2 the #1 Tinfoil Comets fan page on the WHOLE INTERNET!!! (that is not a fact but it is TRUE in my heart)',
  bestViewed: 'Best viewed in 800x600 with Web Explorer 6',
  sinceLine: 'this site has been visited',
  sinceLineEnd: 'times since i made it in 7th grade',
  midiOn: 'Play background MIDI',
  midiOff: 'Stop the MIDI',
  midiMuted: 'ur sound is turned off!! turn it on 2 hear my song',
  footer:
    'all pics + words (c) xX_CometGirl_Xx. DO NOT STEAL MY LAYOUT. i will know.',
  updated: 'last updated: like yesterday',
  picsIntro:
    'all taken by me w my disposable camera!!! (except the ones that r not)',
  construction: 'UNDER CONSTRUCTION',
  constructionNote: 'pardon our dust!!! more stuff coming soon',
  signThanks: 'THANK U 4 SIGNING!!! ♥',
  errorNoName: 'u forgot ur name!!!',
  errorNoMessage: 'u have 2 write SOMETHING!!!',
};

/** The scrolling news marquee on the home page. */
export const TINFOIL_NEWS: readonly DayText[] = [
  { day: 1, text: '*~* TINFOIL COMETS LIVE THIS FRIDAY!!! *~*' },
  { day: 1, text: 'NEW: i got a guestbook!!! SIGN IT!!!' },
  { day: 1, text: 'the hamsters r back by popular demand (my mom)' },
  { day: 2, text: 'NEW PICS in the pic gallery!!!' },
  { day: 3, text: 'rumor: they r playing SPACE GIRL first. CONFIRMED by me' },
  { day: 4, text: 'its TOMORROW. no wait its TONIGHT. i cant read calendars' },
  { day: 5, text: 'show review coming soon!!! (under construction)' },
  { day: 5, text: 'some1 caught ziggys drumstick. WITH THEIR FACE. legend' },
  ...TINFOIL_NEWS_WEEK2,
];

export const TINFOIL_MEMBERS: readonly BandMember[] = [
  {
    name: 'Nova Reyes',
    role: 'vocals + keytar',
    facts: [
      'can hold a note for 22 seconds (i timed it)',
      'her keytar is named Gerald',
      'fave food: cereal for dinner',
    ],
  },
  {
    name: 'Buzz Kowalczyk',
    role: 'guitar',
    facts: [
      'wears an actual tinfoil hat on stage. every show. even in summer',
      'learned guitar from a library book',
      'once broke 3 strings in 1 song and kept going!!!',
    ],
  },
  {
    name: 'Mo Pebbles',
    role: 'bass',
    facts: [
      'the quiet one',
      'plays with his back to the crowd bc he is shy (cute)',
      'has a pet tortoise named Thunder',
    ],
  },
  {
    name: 'Ziggy Voltz',
    role: 'drums',
    facts: [
      'does the DRUMSTICK SPIN!!! (the best part of every show)',
      'is like 28 (age is just a number!!!)',
      'throws a drumstick into the crowd at the end. 1 day it will be ME',
    ],
  },
];

export const TINFOIL_ALBUMS: readonly Album[] = [
  {
    title: 'Hello, Robot',
    year: 2006,
    note: 'the one w the ROBOT on the cover!!! the robot is named Kevin (i named him)',
    tracks: [
      'Space Girl',
      'Tinfoil Heart',
      'Meteor Shower (In My Room)',
      'Robot Prom',
      'Gravity Is A Suggestion',
      'Orbit Me',
      'Kevin (Reprise)',
    ],
  },
  {
    title: 'Comet Juice EP',
    year: 2004,
    note: 'super rare. i have 2 copies. 1 to listen 2 and 1 to NEVER TOUCH',
    tracks: ['Comet Juice', 'Satellite Sweetheart', 'Basement Launch'],
  },
];

export const TINFOIL_TOUR: readonly TourDate[] = [
  {
    date: 'THIS FRIDAY!!!',
    venue: 'Riverside Arena',
    note: 'SOLD OUT. i did not get tickets. i am FINE',
    after: {
      day: 5,
      date: 'last friday',
      note: 'it happened. i was not there. pls sign my guestbook w details',
    },
  },
  {
    date: 'next saturday',
    venue: 'Lakeview Fairgrounds',
    note: 'outdoor show!!! bring a poncho',
    soon: { day: 6, date: 'THIS SATURDAY!!!' },
    soldOut: {
      day: 8,
      note: 'SOLD OUT. 9 minutes. i did not get tickets. AGAIN',
    },
    after: {
      day: 10,
      date: 'saturday',
      note: 'it happened. i listened on the radio. it was windy. buzz lost his hat',
    },
  },
  {
    date: 'in 2 weeks',
    venue: 'The Rocket Room',
    note: 'all ages!!! (my mom said maybe)',
    soon: { day: 6, date: 'next week' },
  },
  {
    date: 'december',
    venue: 'Winter Jingle Jam',
    note: 'with other bands but who cares',
  },
];

/** Concert "photos" drawn by `renderPhoto({ scene: 'concert', seed })`. */
export const TINFOIL_PICS: readonly ConcertPic[] = [
  { day: 1, seed: 7101, caption: 'ziggy mid-SPIN (blurry bc he is FAST)' },
  { day: 1, seed: 7102, caption: 'buzz + his tinfoil hat (row 31 view)' },
  { day: 1, seed: 7103, caption: 'nova + gerald the keytar!!!' },
  { day: 1, seed: 7104, caption: 'this is either mo or a speaker' },
  { day: 2, seed: 7105, caption: 'NEW!!! the crowd. i am in there somewhere' },
  {
    day: 2,
    seed: 7106,
    caption: 'NEW!!! the lights during space girl (i cried)',
  },
  { day: 5, seed: 7107, caption: 'friday!!! sent in by a fan. thx 4 sharing' },
  { day: 5, seed: 7108, caption: 'friday!!! front row is SO lucky' },
  ...TINFOIL_PICS_WEEK2,
];

export const TINFOIL_GUESTBOOK: readonly GuestbookEntry[] = [
  {
    day: 1,
    name: 'xX_CometGirl_Xx',
    message:
      'first!!! welcome 2 my guestbook!!! pls be nice. no spam. NO SPACE GIRL HATERS',
  },
  {
    day: 1,
    name: 'spacegirl4eva',
    message:
      'space girl is the best song ever written. i will not be taking questions',
  },
  {
    day: 1,
    name: 'dave_k',
    message: 'nice site. i think ur counter is broken it keeps going up',
  },
  {
    day: 1,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      'OMG OMG I WON TICKETS ON THE RADIO!!!!! 2 TICKETS!!! FRIDAY!!! ZIGGY IF U READ THIS I WILL BE THE ONE SCREAMING (L) (L) (L)',
  },
  {
    day: 2,
    name: 'robot_cover_guy',
    message:
      'who drew the robot on hello robot. i need to know. it has changed my life',
  },
  {
    day: 2,
    name: 'xX_CometGirl_Xx',
    message: '@robot_cover_guy his name is KEVIN. new pics r up 2!!!',
  },
  {
    day: 3,
    name: 'pia (L) ponies (L)',
    message:
      'this band is ok but PONIES r better. ps i am not allowed 2 go 2 the concert. i told mom it is UNFAIR',
  },
  {
    day: 3,
    name: '~*ambr*~',
    message: 'luv ur site!!! the hamsters r SO cute. sign mine back!!!',
  },
  {
    day: 4,
    name: 'marco',
    message:
      'solid rhythm section. the bassist is criminally underrated. the background hurt my eyes. the hamsters are fine. 6/10',
  },
  {
    day: 4,
    name: 'ticketless_tina',
    message:
      'anyone have an extra ticket 4 friday. will trade my whole gel pen collection',
  },
  {
    day: 5,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      'I WAS THERE!!!! FRONT ROW!!!! ziggy did the drumstick spin and THREW IT and I CAUGHT IT. ok it hit me in the face first. IT COUNTS. best night EVER (L)',
  },
  {
    day: 5,
    name: 'xX_CometGirl_Xx',
    message:
      '@jess U CAUGHT THE DRUMSTICK??? i am so jealous i have 2 lie down',
  },
  ...TINFOIL_GUESTBOOK_WEEK2,
];
