// Dex's Friendspace profile: grey with skate stickers, few words, always away. The skate video:
// filming (2), the camcorder eats the tape (3), the kickflip with no camera (4), the 30-second blur (5).
import type { ProfileContent } from './types';

export const dexProfile: ProfileContent = {
  contactId: 'dex',
  headline: 'away. as usual',
  mood: { text: 'chillin', emoticon: '(Y)' },
  songTrackId: 'cool-rock',
  aboutMe:
    'dex. skate. eat. sleep. fall. repeat. if im not online im at the park. im not online. ' +
    'my board and me have a complicated relationship. i left it in the rain once. it remembers. ' +
    'my bro made me this page so dont blame me for the colors',
  wantToMeet:
    'whoever keeps leaving bike tire marks on the ramp. we need to talk',
  interests: [
    { label: 'Music', text: 'whatever my bro plays in the car' },
    { label: 'Movies', text: 'skate videos. the old ones on tape' },
    { label: 'Television', text: 'dont really watch it. im outside' },
    { label: 'Books', text: 'the camcorder manual. its a page turner' },
    { label: 'Heroes', text: 'anyone who lands it first try' },
  ],
  top8: [
    { kind: 'extra', name: 'Ry (my bro)', seed: 'dexbro' },
    { kind: 'player' },
    { kind: 'contact', id: 'jess' },
    { kind: 'contact', id: 'theo' },
    { kind: 'extra', name: 'the board', seed: 'dexboard' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'contact', id: 'marco' },
    { kind: 'contact', id: 'pia' },
  ],
  comments: [
    {
      day: 1,
      from: 'jess',
      contactId: 'jess',
      text: 'DEX!!! answer ur IMs!!! ur ALWAYS away!!!',
    },
    {
      day: 1,
      from: 'Ry (my bro)',
      text: 'mom says come home for dinner. she means NOW',
    },
    {
      day: 2,
      from: 'theo',
      contactId: 'theo',
      text: 'i saw u filming at the park. it looked cool. i didnt want to walk in the shot',
    },
    {
      day: 2,
      from: 'Ry (my bro)',
      text: 'u owe me for the camcorder. it was in the closet for a REASON',
    },
    {
      day: 3,
      from: 'marco',
      contactId: 'marco',
      text: 'camcorders eat tapes. its what they do. sorry man',
    },
    {
      day: 3,
      from: 'kayla',
      contactId: 'kayla',
      text: 'dex r u ok?? jess said ur camcorder ATE ur movie',
    },
    {
      day: 4,
      from: 'lil_shredder',
      text: 'WHOA. u did it. i saw it!!! my mom says hi',
    },
    {
      day: 4,
      from: 'pia',
      contactId: 'pia',
      text: 'is it true u can do a kickflip. i dont believe u',
    },
    {
      day: 5,
      from: 'jess',
      contactId: 'jess',
      text: 'I WATCHED THE VIDEO 50 TIMES. 0:22 IS ART!!!',
    },
    {
      day: 5,
      from: 'Ry (my bro)',
      text: 'took me an hour to hook that tape up. ur welcome',
    },
  ],
  commentsOnPlayer: [
    { day: 2, text: 'oh hey. u got a page. nice' },
    { day: 4, text: 'landed it. no camera. classic' },
    { day: 5, text: 'watch 0:22. thats all im saying' },
  ],
  theme: {
    background:
      'repeating-linear-gradient(0deg, #8a8d91 0 2px, #9da0a4 2px 4px), linear-gradient(#9da0a4, #7d8085)',
    text: '#1d1f21',
    accent: '#e07b22',
    glitter: false,
    font: 'Verdana, Tahoma, sans-serif',
    panel: 'rgba(235, 236, 238, 0.95)',
    stickers: [
      'SKATE',
      'kickflip club',
      'grip tape > ppl',
      'BOARD IS MAD AT ME',
    ],
  },
};
