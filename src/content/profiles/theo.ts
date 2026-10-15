// Theo's Spaceport profile: the plain default look (he never customised it), short and apologetic.
// The cell project: jello (2), the earthquake cell (3), presentation nerves (4), the B+ (5).
import type { ProfileContent } from './types';

export const theoProfile: ProfileContent = {
  contactId: 'theo',
  headline: 'um. hi',
  mood: { text: 'ok i guess', emoticon: ':)' },
  songTrackId: 'surf-shimmy',
  aboutMe:
    'i draw stuff. mostly frogs. i sit in the back in bio. i play piano bc my mom says so. ' +
    'sorry this is short. i dont really know what to put here. i will add more later. probably',
  wantToMeet: 'people who like drawing. or frogs. or both. sorry',
  interests: [
    {
      label: 'Music',
      text: 'piano. and whatever song this is. it came with the page',
    },
    { label: 'Movies', text: 'anything with dinosaurs' },
    { label: 'Television', text: 'nature shows. the frog ones' },
    {
      label: 'Books',
      text: 'the bio textbook. its actually kind of interesting. sorry',
    },
    { label: 'Heroes', text: 'people who always know what to say' },
  ],
  top8: [
    { kind: 'player' },
    { kind: 'extra', name: 'Mom', seed: 'theomom' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'contact', id: 'jess' },
    { kind: 'contact', id: 'dex' },
    { kind: 'extra', name: 'frogfan_02', seed: 'frogfan02' },
    { kind: 'contact', id: 'marco' },
    { kind: 'contact', id: 'pia' },
  ],
  comments: [
    {
      day: 1,
      from: 'Mom',
      text: 'Theodore, remember your piano lesson Wednesday. Love, Mom',
    },
    {
      day: 1,
      from: 'frogfan_02',
      text: 'ur frog drawing is the best thing on spaceport. no joke',
    },
    {
      day: 2,
      from: 'kayla',
      contactId: 'kayla',
      text: 'theo ur drawings r SO good. draw me sometime??',
    },
    {
      day: 3,
      from: 'jess',
      contactId: 'jess',
      text: 'THEO i heard about the jello. RIP jello. u will rise again',
    },
    {
      day: 3,
      from: 'Mom',
      text: 'There is a third box of gelatin in the pantry, sweetie. Love, Mom',
    },
    {
      day: 4,
      from: 'dex',
      contactId: 'dex',
      text: 'good luck tmrw. dont say sorry',
    },
    {
      day: 4,
      from: 'Mom',
      text: 'We are so proud of you for presenting tomorrow! Love, Mom',
    },
    {
      day: 5,
      from: 'marco',
      contactId: 'marco',
      text: 'b plus. thats an a in my book. my book is not very good tho',
    },
    {
      day: 5,
      from: 'pia',
      contactId: 'pia',
      text: 'theo can u draw a pony. a QUEEN pony. with a star',
    },
  ],
  commentsOnPlayer: [
    { day: 2, text: 'um hi {name}. i made a page. sorry if thats weird' },
    { day: 3, text: 'sorry about the jello. again. it was my fault' },
    { day: 4, text: 'i wrote NO SORRY on my hand for tmrw. ok bye' },
    { day: 5, text: 'B+. thanks for being my partner. sorry. i mean. thanks' },
  ],
  theme: {
    background: '#e5ecf9',
    text: '#000000',
    accent: '#336699',
    glitter: false,
    font: 'Verdana, Tahoma, sans-serif',
    panel: '#ffffff',
  },
};
