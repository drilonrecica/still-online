// Marco on Pixlog, days 6–10 (bible §7): dry, lowercase, never "!". The rec hall for real (6), the
// setlist (7), the player's song (8), the upside-down mic (9) and the show: 83 people in a room for
// 80 (10; album, all `stage`). The player is "the kid": front row (well, a row) or the crew.
import { g } from '../gender';
import type { PixlogWeek } from './types';

export const marcoPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'marco-rec-hall',
      day: 10,
      title: 'rec hall. capacity 80. (83)',
      photos: [
        {
          photo: {
            scene: 'stage',
            seed: 5421,
            day: 10,
            caption: 'the room. fits 80. 83 came. fire code is a suggestion',
          },
          comments: [
            {
              day: 10,
              from: 'Aunt Rita',
              text: '83!!! I counted twice!!! Love, Aunt Rita',
            },
            { day: 10, from: 'kayla', text: '~*matching. dont ask*~' },
          ],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5422,
            day: 10,
            caption: 'the bucket. in 3 songs. kicked over in a 4th',
          },
          comments: [
            { day: 10, from: 'derek (drums)', text: 'the 4th was art' },
          ],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5423,
            day: 10,
            caption: 'the mic. upside down. so was i',
          },
          comments: [{ day: 10, from: 'dex', text: 'i have this on tape' }],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5424,
            day: 10,
            caption: 'a sign in row 1. MARCO THROW A PICK. i said no',
          },
          comments: [{ day: 10, from: 'jess', text: 'HE THREW IT' }],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5425,
            day: 10,
            caption: 'the pick. its a blur. it was not aimed',
          },
          comments: [{ day: 10, from: 'pia', text: 'UNFAIR' }],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5426,
            day: 10,
            caption: g(
              'theos poster on the door. front row: the kid. well. a row',
              'theos poster on the door. crew: the kid. carried the amp',
            ),
          },
          comments: [
            { day: 10, from: 'theo', text: 'my poster is in a photo. sorry' },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'marco-new-song',
      day: 8,
      title: 'new song',
      body:
        `new song in the set saturday. ${g('"lantern heart"', '"56k"')}.\n\n` +
        'lyrics by my cousin. small letters. like the credits in dexs video.\n\n' +
        'i changed one word. ok four. dont make it weird.',
    },
    {
      id: 'marco-83',
      day: 10,
      title: '83',
      body:
        'i said like 12. i was off by 71.\n\n' +
        'the mic only worked upside down. derek taped it. i sang like a bat. nobody asked about soup.\n\n' +
        'someone threw a pick. it was me.\n\n' +
        '...\n\n' +
        'ok it was good. it was really good.',
    },
  ],
  shouts: [
    { day: 6, text: 'the rec hall. for real now. saturday' },
    { day: 6, text: 'need: poster. not soup' },
    { day: 7, text: 'setlist meeting. 3 hours. 8 songs' },
    { day: 7, text: 'the bucket: 3 songs. negotiated' },
    { day: 8, text: 'new song in the set. dont make it weird' },
    { day: 9, text: 'sound check. pray for us' },
    { day: 9, text: 'mic works upside down. so do we' },
    { day: 10, text: '83 people. i was off by 71' },
  ],
  kudosToPlayer: [10],
  guestbook: [
    {
      day: 6,
      from: 'Aunt Rita',
      text: 'The REC HALL!!! I am telling everyone at bingo!!! Love, Aunt Rita',
    },
    {
      day: 10,
      from: 'derek (drums)',
      text: 'official statement #3: best show ever. the bucket agrees',
    },
  ],
};
