// Friendspace band pages (`/band/<id>`, P1-02), one per artist group on the playlist under an
// original band name. Story ties: the Tinfoil Comets concert (Friday, between days 4 and 5),
// Velvet Lantern at the bean cellar (Marco's band: flyer 2, Derek quits 3 and un-quits 4, 11
// people 5), The Grip Tapes (the skatepark band on kickflipkings.example, Dex's video week) and
// The Sugarcube Parade (Pia's profile song; Stardust goes missing 2, comes home 4).
import { BANDS_WEEK2, withBandWeeks } from './bands-week2';
import type { Band } from './types';

const DAYS_1_TO_5: readonly Band[] = [
  {
    id: 'tinfoil-comets',
    name: 'Tinfoil Comets',
    genre: 'Space Rock / Indie / Robot',
    hometown: 'the garage behind Ziggy’s mom’s house',
    bio:
      'we are the Tinfoil Comets. we play loud songs about space and robots. thx 4 the adds!! ' +
      'Nova on vocals + keytar (the keytar is called Gerald), Buzz on guitar + tinfoil hat, Mo on bass, Ziggy on drums. ' +
      'our cd has a robot on the cover. a fan named him Kevin. ok fine. Kevin',
    trackIds: ['voxel-revolution', 'newer-wave'],
    shows: [
      {
        day: 1,
        text: 'FRIDAY - Riverside Arena - SOLD OUT!!! radio contest winners: we see u',
        until: 5,
      },
      { day: 1, text: 'next saturday - Lakeview Fairgrounds', until: 6 },
      { day: 1, text: 'in 2 weeks - The Rocket Room', until: 6 },
      {
        day: 4,
        text: 'TOMORROW NIGHT the big show. Riverside. bring ur signs, Ziggy reads all of them',
        until: 5,
      },
      {
        day: 5,
        text: 'RIVERSIDE U WERE AMAZING. to whoever caught the drumstick: Ziggy says sorry about ur forehead',
        past: true,
      },
    ],
    blog: [
      {
        day: 1,
        title: 'riverside!!!',
        body: 'friday is SOLD OUT. a radio station gave away 2 tickets. if thats u, hi. bring earplugs',
      },
      {
        day: 3,
        title: 'practice update',
        body: 'ziggy broke another drumstick. we r fine. new song is SO close',
      },
      {
        day: 5,
        title: 'best. crowd. ever.',
        body: 'saw a sign that said TINFOIL COMTES with a paw print on it. it is our favorite sign of all time',
      },
    ],
    theme: {
      background: 'linear-gradient(#0a0a2a, #1c1c4a)',
      text: '#e8e8ff',
      accent: '#9fd0ff',
      glitter: true,
      font: "'Trebuchet MS', Verdana, sans-serif",
      panel: '#14143a',
    },
  },
  {
    id: 'velvet-lantern',
    name: 'Velvet Lantern',
    genre: 'Indie / Basement / Slow',
    hometown: 'the bean cellar (the basement under the coffee place)',
    bio:
      'velvet lantern. marco (bass). derek (drums, most weeks). ' +
      'we play small rooms on purpose. its called exclusive. ' +
      'the thing on our flyer is a lantern. we do not sell soup',
    trackIds: ['cool-rock'],
    shows: [
      {
        day: 2,
        text: 'the bean cellar. one night only. 11 people max. fire code is a suggestion (his words)',
        until: 5,
      },
      {
        day: 5,
        text: 'the bean cellar. 11 people. 6 songs. the bucket is in the act now',
        past: true,
      },
      { day: 5, text: 'next show: tba. bigger. 12 people', until: 6 },
    ],
    blog: [
      {
        day: 2,
        title: 'flyers',
        body: 'flyers are up. coffee place, laundromat, bus stop. derek drew on one. it is a lantern',
      },
      {
        day: 4,
        title: 'lineup change',
        body: 'derek quit yesterday. derek un-quit today. he brought a paint bucket. the bucket is a drum now. we voted',
      },
      {
        day: 5,
        title: 'sold out',
        body: '11 people. the venue holds 11. derek kicked the bucket over in the last song. its in the act now. thanks to everyone. all 11 of u',
      },
    ],
    theme: {
      background: '#0b0b0b',
      text: '#d6d6d6',
      accent: '#c9a45c',
      glitter: false,
      font: "Georgia, 'Times New Roman', serif",
      panel: '#161616',
    },
  },
  {
    id: 'grip-tapes',
    name: 'The Grip Tapes',
    genre: 'Skate Punk / Surf / Loud',
    hometown: 'the half-pipe at the skatepark',
    bio:
      'we r The Grip Tapes. 3 guys, 3 songs, all about skating. one is about rain. ' +
      'we play the half-pipe whenever it doesnt rain. when it rains we play the rain song in a garage',
    trackIds: ['surf-shimmy'],
    shows: [
      {
        day: 1,
        text: 'the half-pipe at the skatepark - whenever it doesnt rain',
      },
      {
        day: 5,
        text: 'the bean cellar?? its a basement. "no boards inside". we r thinking about it',
        until: 8,
      },
    ],
    blog: [
      {
        day: 1,
        title: 'song #3 is done',
        body: 'its called "grip tape > ppl". its 58 seconds long. thats long 4 us',
      },
      {
        day: 2,
        title: 'we r in a movie',
        body: 'some kid filmed at the park today with a camcorder from like 1998. we were in the back. we look like a home video. its perfect',
      },
      {
        day: 4,
        title: 'u had 2 be there',
        body: 'somebody landed a clean kickflip at the park today and NOBODY filmed it. new song idea: "pics or it didnt happen"',
      },
    ],
    theme: {
      background:
        'repeating-linear-gradient(-45deg, #2b2b2b 0 14px, #333 14px 28px)',
      text: '#f2f2f2',
      accent: '#ff8a1f',
      glitter: false,
      font: 'Impact, Haettenschweiler, sans-serif',
      panel: 'rgba(20, 20, 20, 0.9)',
    },
  },
  {
    id: 'sugarcube-parade',
    name: 'The Sugarcube Parade',
    genre: 'Sunshine Pop / Breakfast / Happy',
    hometown: 'a yellow house by the duck pond',
    bio:
      'hello!! we r The Sugarcube Parade :) we play happy songs about breakfast, sunshine and being nice to ur family. ' +
      'we have a glockenspiel and we are not afraid to use it. ' +
      'our biggest fan has 23 ponies and a dog named Biscuit. hi Pia!!',
    trackIds: ['pleasant-porridge'],
    shows: [
      {
        day: 1,
        text: 'saturday morning - pancake picnic at the duck pond. free!! bring a spoon',
        until: 5,
      },
      {
        day: 3,
        text: 'sunday - the library kids corner. we will be quiet-ish',
        until: 5,
      },
      {
        day: 5,
        text: 'the duck pond + the library. best (and quietest) crowd ever. the ducks clapped. kind of',
        past: true,
      },
    ],
    blog: [
      {
        day: 1,
        title: 'new song!!',
        body: 'its about porridge. again. we cant help it, porridge is GREAT',
      },
      {
        day: 2,
        title: 'a sad message',
        body: 'a fan wrote us that her queen pony is missing :( if u see a pony with a star, she lives on Pia’s shelf',
      },
      {
        day: 4,
        title: 'GOOD NEWS',
        body: 'the queen pony is HOME!!! she was in the laundry the whole time. we played the porridge song 3 times to celebrate',
      },
    ],
    theme: {
      background:
        'radial-gradient(circle at 25% 30%, #fff8c4 0 16%, transparent 17%), linear-gradient(180deg, #ffe9a8, #ffc8dd)',
      text: '#5a3b1a',
      accent: '#e8710a',
      glitter: true,
      font: "'Comic Sans MS', 'Chalkboard', cursive",
      panel: 'rgba(255, 252, 240, 0.92)',
    },
  },
];

/** Days 1–5 above, plus week two (`bands-week2.ts`, W2-03). */
export const BANDS = withBandWeeks(DAYS_1_TO_5, BANDS_WEEK2);
