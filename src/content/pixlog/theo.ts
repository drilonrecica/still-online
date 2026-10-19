// Theo on Pixlog: shy, apologises, draws frogs. Camp pics from last summer (day 1; album), the lime
// jello (2), the jello "had a day" (3; worded for both day-3 outcomes, cracked or set), 14 index
// cards (4), and the B+ (5; album). On the girl side he blushes about his partner; a boy gets no crush.
import { g } from '../gender';
import type { PixlogProfile } from './types';

export const theoPixlog: PixlogProfile = {
  contactId: 'theo',
  skin: 'ocean',
  about:
    'um hi. this is my pixlog. i draw frogs mostly. and other stuff. but mostly frogs. ' +
    'my mom says i should "put myself out there". so this is me. out there. ' +
    'sorry theres not much yet',
  albums: [
    {
      id: 'theo-camp',
      day: 1,
      title: 'camp (last summer. sorry its late)',
      photos: [
        {
          photo: {
            scene: 'camp',
            seed: 5501,
            caption: 'the lake. i drew it too. the drawing is better',
          },
          comments: [
            {
              day: 1,
              from: 'frogfan_02',
              text: 'r there frogs in that lake??',
            },
            { day: 2, from: 'kayla', text: 'so pretty!! draw it 4 me?? (L)' },
          ],
        },
        {
          photo: {
            scene: 'camp',
            seed: 5502,
            caption:
              'our cabin was called "bullfrog". i didnt pick it. but i liked it',
          },
          comments: [],
        },
        {
          photo: {
            scene: 'camp',
            seed: 5503,
            caption: 'the frog i found. i named him mr dalton. sorry mr dalton',
          },
          comments: [
            { day: 1, from: 'frogfan_02', text: 'LEGEND frog' },
            {
              day: 1,
              from: 'jess',
              text: 'THEO!!! LOL!!! DOES MR DALTON KNOW!!!',
            },
            { day: 2, from: 'marco', text: 'same posture' },
          ],
        },
        {
          photo: {
            scene: 'camp',
            seed: 5504,
            caption:
              'the campfire. i burned 3 marshmallows. on purpose. i like them burnt',
          },
          comments: [{ day: 1, from: 'dex', text: 'burnt is the only way' }],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5505,
            look: 'short',
            caption: 'me. mom said smile. this is me smiling',
          },
          comments: [
            {
              day: 1,
              from: 'Mom',
              text: 'Very handsome, sweetie. Love, Mom',
            },
          ],
        },
      ],
    },
    {
      id: 'theo-cell-project',
      day: 5,
      title: 'the cell project (B+)',
      photos: [
        {
          photo: {
            scene: 'party',
            seed: 5511,
            day: 5,
            caption: 'the jello cell. it has been through a lot',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'THE JELLO!!! IT LIVES!!! (sort of)',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5512,
            day: 5,
            caption: 'the labels. i drew them at 1am. sorry mom',
          },
          comments: [
            {
              day: 5,
              from: 'frogfan_02',
              text: 'the mitochondria has a FACE. best thing ever',
            },
            { day: 5, from: 'kayla', text: 'theo these r SO cute (L)' },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5513,
            day: 5,
            caption:
              'our camping cooler. it still smells a bit like fish. sorry',
          },
          comments: [
            { day: 5, from: 'dex', text: 'fish jello. new flavor' },
            {
              day: 5,
              from: 'pia',
              text: 'i would NOT eat that. i would tell mom',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5514,
            day: 5,
            look: 'short',
            caption: 'me after. i only said sorry 2 times',
          },
          comments: [
            { day: 5, from: 'marco', text: 'two. thats growth' },
            {
              day: 5,
              from: 'Mom',
              text: 'A B+, Theodore. We are so proud. Love, Mom',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5515,
            day: 5,
            caption:
              'mr dalton said the jello was "memorable". i think thats good',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'MEMORABLE IS THE BEST GRADE THERE IS!!!',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'theo-jello-part-1',
      day: 2,
      title: 'jello (part 1)',
      body:
        'we made the jello. me and my mom. 2 boxes of lime.\n\n' +
        'i put the grapes in too early. they all sank. maybe they are tired mitochondria.\n\n' +
        'sorry. bad joke. it has to set overnight',
    },
    {
      id: 'theo-jello-had-a-day',
      day: 3,
      title: 'the jello had a day',
      body:
        'a lot happened to the jello today. i wont go into it.\n\n' +
        'my partner had a plan. my partner always has a plan.\n\n' +
        'so we have a cell. i think. sorry this is short',
    },
    {
      id: 'theo-index-cards',
      day: 4,
      title: 'index cards',
      body:
        'we present tmrw. first period.\n\n' +
        'i wrote my part on index cards. i practiced in the mirror. i said sorry 6 times. to the mirror.\n\n' +
        'mom says i will be fine. mom says that a lot',
    },
    {
      id: 'theo-b-plus',
      day: 5,
      title: 'B+',
      body:
        'mr dalton put the grades up. we got a B+.\n\n' +
        'he said the drawings were the best in the class. i said sorry. he said "dont be sorry, be proud".\n\n' +
        'so. im proud. sorry. i mean. im proud',
    },
  ],
  survey: {
    surveyId: 'about-me',
    answers: [
      'theo. theodore if ur my mom',
      'just theo. sorry',
      'march. sorry its not more exciting',
      'frog green',
      'the one on my friendspace. it came with the page',
      'grilled cheese. my little sister steals half',
      'the gray hoodie. i have 3 of the same one',
      '"at piano. sorry"',
      g(
        'my bio partner. about bio. only about bio :$',
        'my bio partner. about bio. we r a good team (Y)',
      ),
      'presenting in front of the whole class',
      'a nature illustrator. or a frog. sorry. illustrator',
      'quiet. draws. sorry',
    ],
  },
  shouts: [
    {
      day: 1,
      text: 'got a partner for the cell project. sorry in advance to them',
    },
    {
      day: 1,
      text: 'drew a frog in bio. mr dalton saw. he didnt say anything. thats good i think',
    },
    { day: 2, text: '2 boxes of lime jello. sorry mom' },
    { day: 3, text: 'the jello is... wobbly' },
    { day: 4, text: 'presenting tmrw. 14 index cards' },
    {
      day: 4,
      text: 'wrote NO SORRY on my hand. it washed off. writing it again',
    },
    { day: 5, text: 'B+ :) (sorry for bragging)' },
    {
      day: 5,
      text: g(
        'B+. and the best partner. sorry. that was a lot to say :$',
        'B+. best partner. we should do the frog project next. if there is one',
      ),
    },
  ],
  kudosToPlayer: [3, 5],
  guestbook: [
    {
      day: 1,
      from: 'frogfan_02',
      text: 'ur frogs r the best thing on pixlog 2. no joke',
    },
    {
      day: 2,
      from: 'Mom',
      text: 'Theodore, the kitchen is still green. Love, Mom',
    },
    {
      day: 2,
      from: 'kayla',
      text: 'theo draw me a frog in a tiara?? pls pls (L)',
    },
    {
      day: 4,
      from: 'dex',
      text: 'dont say sorry tmrw. or do. its ur presentation',
    },
    {
      day: 5,
      from: 'pia',
      text: 'theo u r the official artist of the pony club now. draw stardust. that is an ORDER',
    },
  ],
};
