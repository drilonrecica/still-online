// Jess on Pixlog. Sample data for now: P3-02 writes her real albums, blog, shouts and guestbook.
import type { PixlogProfile } from './types';

export const jessPixlog: PixlogProfile = {
  contactId: 'jess',
  skin: 'night',
  about: 'TINFOIL COMETS 4 LIFE. thats it thats my about',
  albums: [
    {
      id: 'jess-comets-show',
      day: 5,
      title: 'COMETS LIVE!!!',
      photos: [
        {
          photo: { scene: 'concert', seed: 5101, caption: 'FRONT ROW!!!!' },
          comments: [{ day: 5, from: 'kayla', text: 'omg jealous!!' }],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'jess-countdown',
      day: 1,
      title: 'the countdown',
      body: 'friday friday friday. thats the post',
    },
  ],
  survey: {
    surveyId: 'this-or-that',
    answers: ['pizza', 'IM duh', 'summer', 'mp3 player (comets on repeat)'],
  },
  shouts: [{ day: 1, text: 'cant sleep. too excited' }],
  kudosToPlayer: [2],
  guestbook: [{ day: 2, from: 'xX_CometGirl_Xx', text: 'luv ur page!!' }],
};
