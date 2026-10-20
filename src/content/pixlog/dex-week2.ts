// Dex on Pixlog, days 6–10 (bible §7): 41 views (6), the Westfield Jam invite (7), practice (8),
// 3rd place with Kev's clip (9; album) and filming Velvet Lantern on the 2007 tape (10).
import type { PixlogWeek } from './types';

export const dexPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'dex-jam',
      day: 9,
      title: 'the jam. 3rd. kev took these',
      photos: [
        {
          photo: {
            scene: 'skatepark',
            seed: 5621,
            day: 9,
            caption: 'the course. 1 min runs. i ran it 30 times yesterday',
          },
          comments: [{ day: 9, from: 'Kickflip_Kev', text: 'lens cap: OFF' }],
        },
        {
          photo: {
            scene: 'skatepark',
            seed: 5622,
            day: 9,
            caption: 'sam. 1st. he grabs everything',
          },
          comments: [{ day: 9, from: 'sam_grabs', text: 'i grab what i want' }],
        },
        {
          photo: {
            scene: 'skatepark',
            seed: 5623,
            day: 9,
            caption: 'the kickflip. its a blur. but its MY blur',
          },
          comments: [
            { day: 9, from: 'jess', text: 'DEX!!!' },
            {
              day: 9,
              from: 'Ry (my bro)',
              text: 'saw it live. it counts double',
            },
          ],
        },
        {
          photo: {
            scene: 'skatepark',
            seed: 5624,
            day: 9,
            caption: '3rd. stickers. a tape from 2007. the future',
          },
          comments: [{ day: 10, from: 'pia', text: 'is 3rd a medal' }],
        },
        {
          photo: {
            scene: 'livingroom',
            seed: 5625,
            day: 9,
            caption: 'kevs clip on the tv. 6 seconds. we watched it 40 times',
          },
          comments: [
            { day: 9, from: 'Ry (my bro)', text: '41. i watched it once more' },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'dex-the-jam',
      day: 7,
      title: 'the jam',
      body:
        'kevs crew invited me to the westfield jam\n\n' +
        'day 9. at the park. 1 min runs\n\n' +
        'me. in a contest. weird',
    },
    {
      id: 'dex-third',
      day: 9,
      title: '3rd',
      body:
        'landed the kickflip. in front of everyone\n\n' +
        'sam 1st. big mike 2nd. me 3rd\n\n' +
        'prize: stickers and a blank tape. it says 2007 on it. kev filmed it. 6 sec. lens cap off',
    },
  ],
  shouts: [
    { day: 6, text: '41 views. like 30 r me' },
    { day: 6, text: '11 real fans. probably' },
    { day: 7, text: 'the westfield jam. me. in it??' },
    { day: 8, text: 'practicing. away (for real this time)' },
    { day: 8, text: 'ran the course 30 times. fell once. on purpose' },
    { day: 9, text: '3rd place. camera: ON' },
    { day: 10, text: 'filming velvet lantern. new tape' },
    { day: 10, text: 'camera: dex. special thanks: u. again' },
  ],
  kudosToPlayer: [9],
  guestbook: [
    {
      day: 9,
      from: 'Kickflip_Kev',
      text: 'I FILMED IT. lens cap OFF. 6 seconds of GLORY',
    },
    {
      day: 10,
      from: 'sam_grabs',
      text: 'went to the show. loud. good. ur filming arm is strong',
    },
  ],
};
