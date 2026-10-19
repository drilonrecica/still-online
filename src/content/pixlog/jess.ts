// Jess on Pixlog: concert week in ALL CAPS. The glitter sign with the paw print (day 2), the outfit
// crisis (3), the checklist (4), front row and Ziggy's drumstick (5; the "NEW PICS" bulletin).
import { g } from '../gender';
import type { PixlogProfile } from './types';

export const jessPixlog: PixlogProfile = {
  contactId: 'jess',
  skin: 'lime',
  about:
    'HIIII its JESS!!! :D TINFOIL COMETS 4 LIFE. thats it thats my about. ' +
    'ok also: i scream, i glitter, i tell the WORST jokes. my cat is sparkly (long story). ' +
    'give me kudos or ZIGGY WILL KNOW',
  albums: [
    {
      id: 'jess-the-sign',
      day: 2,
      title: 'OPERATION SIGN!!!',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5111,
            look: 'long',
            caption: 'me. glitter on my FACE. its fine',
          },
          comments: [
            { day: 2, from: 'kayla', text: 'glitter is ur color tbh (L)' },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5112,
            caption: 'the co-artist. he is NOT sorry',
          },
          comments: [
            { day: 2, from: 'pia', text: 'can i have the sparkly cat' },
            {
              day: 3,
              from: 'marco',
              text: 'he signed it. thats legally his sign now',
            },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5113,
            caption: 'the PAW PRINT. its art now. dont argue',
          },
          comments: [
            {
              day: 2,
              from: 'xX_CometGirl_Xx',
              text: 'a PAW PRINT!!! ziggy has a cat 2!!!',
            },
            { day: 2, from: 'dex', text: 'paw print is a good logo' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5114,
            look: 'long',
            caption: 'the sign is behind me. trust me its there',
          },
          comments: [],
        },
      ],
    },
    {
      id: 'jess-comets-show',
      day: 5,
      title: 'COMETS LIVE!!!',
      photos: [
        {
          photo: { scene: 'concert', seed: 5101, caption: 'FRONT ROW!!!!' },
          comments: [
            { day: 5, from: 'kayla', text: 'omg jealous!!' },
            {
              day: 5,
              from: 'xX_CometGirl_Xx',
              text: 'I WAS THERE 2!!! row 4!!! did u hear me scream',
            },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5102,
            caption: 'ZIGGY!!!!!! (the blur is ziggy)',
          },
          comments: [{ day: 5, from: 'marco', text: 'the blur has good form' }],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5103,
            caption: 'the drumstick spin. 1 second before it HIT ME',
          },
          comments: [
            {
              day: 5,
              from: 'theo',
              text: 'um. is ur forehead ok. sorry, thats probably a weird question',
            },
            { day: 5, from: 'dex', text: 'whoa' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5104,
            look: 'long',
            caption: 'me + THE DRUMSTICK + the bump',
          },
          comments: [
            {
              day: 5,
              from: 'pia',
              text: 'can i touch it. i will be careful. mostly',
            },
            {
              day: 5,
              from: 'ZIGGY FAN CLUB',
              text: 'LEGEND!!! the face catch!!!',
            },
            {
              day: 5,
              from: 'kayla',
              text: 'the bump is kind of cute actually',
            },
          ],
        },
        {
          photo: {
            scene: 'trip',
            seed: 5105,
            caption: 'the car ride. mom sang. ALL of it',
          },
          comments: [
            { day: 5, from: 'marco', text: 'did she do the high part' },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5106,
            caption: 'last song. no voice left. WORTH IT',
          },
          comments: [],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'jess-countdown',
      day: 1,
      title: 'the countdown',
      body:
        'I WON THE RADIO CONTEST. 2 TICKETS. TINFOIL COMETS. NEXT FRIDAY.\n\n' +
        'i called in 47 times. my mom says thats "a lot". i say thats DEDICATION.\n\n' +
        'friday friday friday. thats the post',
    },
    {
      id: 'jess-outfit',
      day: 3,
      title: 'WHAT DO I WEAR (a crisis)',
      body:
        'my closet is a LIE. i own 40 shirts and none of them r concert shirts.\n\n' +
        'i tried on EVERYTHING. my bed is a mountain now. a clothes mountain.\n\n' +
        'update: outfit SOLVED. my brother says i look like a disco ball. thats a COMPLIMENT',
    },
    {
      id: 'jess-checklist',
      day: 4,
      title: 'the CHECKLIST',
      body:
        'tickets: mom has them. SAFE\n\n' +
        'sign: paw print and all. PERFECT\n\n' +
        'outfit: on my chair. staring at me\n\n' +
        'disposable camera: CHECK. 27 pics. i will use ALL of them\n\n' +
        'sleep: no',
    },
    {
      id: 'jess-front-row',
      day: 5,
      title: 'I WAS IN THE FRONT ROW',
      body:
        'the crowd just PUSHED me. all the way up. FRONT. ROW.\n\n' +
        'ziggy did the drumstick spin and then he THREW it and it hit me in the forehead and then I CAUGHT IT.\n\n' +
        'it lives under my pillow now. the bump lives on my head. best. night. EVER. (L)',
    },
  ],
  survey: {
    surveyId: 'this-or-that',
    answers: [
      'pizza',
      'IM duh',
      'summer',
      'CDs!!! the robot one. 40 times a day',
      'CATS. sparkly ones',
      'night owl. i dont sleep. ask my mom',
      'funny. i scream at scary ones and get kicked out',
      'pool!!! cannonball',
      'sneakers. u cant jump in flip flops',
      'CAPS. OBVIOUSLY',
    ],
  },
  shouts: [
    { day: 1, text: 'cant sleep. too excited' },
    { day: 1, text: 'I WON THE RADIO CONTEST!!!! 2 TICKETS!!!!!' },
    { day: 2, text: 'SIGN EMERGENCY. dont ask' },
    { day: 2, text: 'my cat is a co-artist now. he signed it. with his FOOT' },
    { day: 3, text: 'CODE PINK. my closet is a LIE' },
    { day: 4, text: '1 MORE SLEEP!!!!! (L) (L)' },
    {
      day: 5,
      text: 'I CAUGHT ZIGGYS DRUMSTICK!!!!! (w my face)',
    },
    {
      day: 5,
      text: `best concert buddy in the galaxy. u know who u r ${g('(L)', '(Y)')}`,
    },
  ],
  kudosToPlayer: [2, 5],
  guestbook: [
    {
      day: 1,
      from: 'pia',
      text: 'jess can u put glitter on my page. pls. mom said to say pls',
    },
    { day: 2, from: 'xX_CometGirl_Xx', text: 'luv ur page!!' },
    {
      day: 3,
      from: 'kayla',
      text: 'i can lend u a sparkly top. or 12. call me!!',
    },
    {
      day: 4,
      from: 'ZIGGY FAN CLUB',
      text: 'TOMORROW!!! Ziggy reads EVERY sign!!! even the ones w paw prints!!!',
    },
    {
      day: 5,
      from: 'theo',
      text: 'um. congrats on the drumstick. and sorry about ur head',
    },
    { day: 5, from: 'dex', text: 'front row. sick' },
  ],
};
