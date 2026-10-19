// Marco on Pixlog: dry, lowercase, never "!". The flyer that looks like soup (day 2), Derek quits (3),
// practice with a bucket (4; album), and the Bean Cellar, capacity 11 (5; album). The player is "kid".
import { g } from '../gender';
import type { PixlogProfile } from './types';

export const marcoPixlog: PixlogProfile = {
  contactId: 'marco',
  skin: 'night',
  about:
    'marco. bass. velvet lantern. college. ' +
    'aunt rita found my friendspace so now i also have this. hi aunt rita. ' +
    'pics of practice mostly. practice is in my roommates kitchen. the neighbors have opinions',
  albums: [
    {
      id: 'marco-practice',
      day: 4,
      title: 'practice. ft. a bucket',
      photos: [
        {
          photo: {
            scene: 'concert',
            seed: 5401,
            caption:
              'the stage. its a kitchen. the light is a lamp with a red shirt on it',
          },
          comments: [
            { day: 4, from: 'derek (drums)', text: 'the shirt was MY idea' },
            { day: 4, from: 'jess', text: 'MARCO THE LIGHTING IS SO ROCK!!!' },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5402,
            caption:
              'the bucket. derek calls it "a second drum". its a paint bucket',
          },
          comments: [
            {
              day: 4,
              from: 'pia',
              text: 'mom has that bucket. is it moms bucket',
            },
            { day: 4, from: 'dex', text: 'bucket sounds good tho' },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5403,
            caption: 'derek. back after 26 hours. a new record',
          },
          comments: [
            {
              day: 4,
              from: 'derek (drums)',
              text: 'i never left. spiritually',
            },
            { day: 4, from: 'kayla', text: 'omg derek is BACK ~*reunion*~' },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5404,
            caption: 'the tambourine. the band has voted. it stays',
          },
          comments: [
            {
              day: 4,
              from: 'theo',
              text: 'um. i like the tambourine. sorry if that counts as a vote',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5405,
            look: 'short',
            caption: 'me. not nervous. go away',
          },
          comments: [
            {
              day: 4,
              from: 'Aunt Rita',
              text: 'Marco you look so thin!!! Are you eating??? Love, Aunt Rita',
            },
            { day: 4, from: 'marco', text: 'yes. pizza. cold' },
          ],
        },
      ],
    },
    {
      id: 'marco-bean-cellar',
      day: 5,
      title: 'velvet lantern live. capacity 11',
      photos: [
        {
          photo: {
            scene: 'concert',
            seed: 5411,
            caption:
              'the bean cellar. one row. its the front row and the back row',
          },
          comments: [
            {
              day: 5,
              from: 'jess',
              text: 'NEXT TIME I COME!!! i was busy getting hit by a drumstick',
            },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5412,
            caption: 'six songs. five originals and a cover nobody knows',
          },
          comments: [
            { day: 5, from: 'derek (drums)', text: 'so six originals' },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5413,
            caption:
              'last song. derek kicked the bucket over. its in the act now',
          },
          comments: [
            { day: 5, from: 'dex', text: 'nice' },
            { day: 5, from: 'kayla', text: 'iconic. truly ~*iconic*~' },
            {
              day: 5,
              from: 'marco',
              text: 'he says it was on purpose. it was not',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5414,
            caption:
              'after. the coffee guy upstairs gave us muffins. day old. still counts',
          },
          comments: [
            {
              day: 5,
              from: 'Aunt Rita',
              text: 'So proud!!! Your mother wants copies of ALL the pictures!!! Love, Aunt Rita',
            },
          ],
        },
        {
          photo: {
            scene: 'party',
            seed: 5415,
            caption: 'the napkin. i signed it. its about the principle',
          },
          comments: [
            {
              day: 5,
              from: 'theo',
              text: 'um. could i have one too. a napkin i mean. sorry',
            },
            { day: 5, from: 'pia', text: 'i want one. with a pony on it' },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'marco-flyer',
      day: 2,
      title: 'about the flyer',
      body:
        'the flyer is up. coffee place, laundromat, bus stop.\n\n' +
        'derek "improved" it with a marker. the thing in the middle is a lantern. ' +
        'it looks like a jar of soup. three people have asked about the soup.\n\n' +
        'there is no soup. velvet lantern. the bean cellar. one night only.',
    },
    {
      id: 'marco-drummer-wanted',
      day: 3,
      title: 'drummer wanted',
      body:
        'derek quit. thats 4 this year.\n\n' +
        'the bean cellar fits one snare. derek says his art needs cymbals.\n\n' +
        'he left his sticks here. thats usually a good sign. or he forgot them.',
    },
    {
      id: 'marco-eleven',
      day: 5,
      title: 'eleven',
      body:
        'the show happened. 11 people came. a sold out show, if the venue held 11. which it did.\n\n' +
        'derek kicked the bucket over in the last song. everyone thought it was on purpose. its in the act now.\n\n' +
        '...\n\n' +
        'ok it was good. it was really good.',
    },
  ],
  survey: {
    surveyId: 'this-or-that',
    answers: [
      'pizza. cold. from yesterday',
      'neither. leave a note',
      'winter. less people outside',
      'vinyl. i know its not an option',
      'the cat at the coffee place. that one',
      'night owl. practice ends at 2',
      'neither. subtitles',
      'basement',
      'boots. its a look',
      'lowercase. caps is yelling. ask jess',
    ],
  },
  shouts: [
    { day: 1, text: 'practice. the neighbors knocked twice. good review' },
    { day: 2, text: 'flyers up. its a lantern. not soup' },
    {
      day: 2,
      text: g(
        'the kid has a pixlog now. too much glitter. its fine',
        'the kid has a pixlog now. dark. good taste. dont let it go to ur head',
      ),
    },
    { day: 3, text: 'drummer wanted. must fit in a backpack' },
    { day: 4, text: 'derek is back. so is the bucket' },
    { day: 5, text: 'sold out show. venue capacity: 11' },
    { day: 5, text: 'signed a napkin. its about the principle' },
  ],
  kudosToPlayer: [2, 5],
  guestbook: [
    {
      day: 1,
      from: 'Aunt Rita',
      text: 'Marco is this the internet place your mother told me about??? Call her!!! Love, Aunt Rita',
    },
    {
      day: 2,
      from: 'jess',
      text: 'MARCO I SAW THE FLYER!!! the soup is so cute!!! i mean LANTERN',
    },
    {
      day: 3,
      from: 'derek (drums)',
      text: 'im out. this is my official statement',
    },
    {
      day: 4,
      from: 'derek (drums)',
      text: 'official statement #2: im back. bringing the bucket',
    },
    {
      day: 5,
      from: 'kayla',
      text: 'eleven ppl is SO exclusive. thats so u marco ~*rockstar*~',
    },
  ],
};
