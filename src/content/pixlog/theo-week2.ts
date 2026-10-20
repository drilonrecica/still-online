// Theo on Pixlog, days 6–10 (bible §7): his cell drawings on Room 12's art wall (6; album), the
// poster ask (7), two drafts (8), 30 posters (9) and the show, near the back (10). A girl gets the
// small blush; a boy is his partner and "back row crew".
import { g } from '../gender';
import type { PixlogWeek } from './types';

export const theoPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'theo-art-wall',
      day: 6,
      title: 'the wall (sorry)',
      photos: [
        {
          photo: {
            scene: 'classroom',
            seed: 5521,
            day: 6,
            caption: 'room 12. the wall by the door. those r my cells. sorry',
          },
          comments: [
            { day: 6, from: 'kayla', text: 'THEO ur famous!! ~*art star*~' },
            { day: 6, from: 'frogfan_02', text: 'is that a FROG cell' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5522,
            day: 6,
            caption: 'the mitochondria one. mr dalton put it in the middle',
          },
          comments: [
            { day: 6, from: 'marco', text: 'framed. thats growth' },
            { day: 6, from: 'dex', text: 'nice. good colors' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5523,
            day: 6,
            caption: g(
              'my partner said its good. so. :$',
              'my partner said its good. so. ok',
            ),
          },
          comments: [{ day: 6, from: 'jess', text: 'THEO!!! FRAME IT!!!' }],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5524,
            day: 6,
            look: 'short',
            caption: 'me next to the wall. mom made me. sorry',
          },
          comments: [
            { day: 6, from: 'Mom', text: 'So proud of you. Love, Mom' },
            {
              day: 7,
              from: 'pia',
              text: 'ur famous at MY school too. ok not really',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'theo-a-poster',
      day: 7,
      title: 'a poster??',
      body:
        'marco asked if i could draw a poster for his band. well. he asked my friend to ask me.\n\n' +
        'i said sorry three times. then i said yes.\n\n' +
        'it has to be a lantern. not soup. i dont know why soup came up',
    },
    {
      id: 'theo-the-posters',
      day: 10,
      title: 'the posters',
      body:
        '30 posters. library printer. 10 cents each. me and my mom put them up all over school and at the rec hall.\n\n' +
        'aunt rita took three. i dont know aunt rita. she hugged me.\n\n' +
        g(
          'the show was loud. i stood near the back. with my partner. it was nice. sorry. not sorry :$',
          'the show was loud. i stood near the back. with my partner. marco nodded at me. i think thats a lot for him',
        ),
    },
  ],
  shouts: [
    { day: 6, text: 'mr dalton put my drawings on the wall. sorry' },
    {
      day: 6,
      text: 'ate lunch in the library. people were looking at the wall',
    },
    {
      day: 7,
      text: 'drawing a POSTER?? for a band. sorry in advance to the band',
    },
    { day: 8, text: '2 drafts. both lanterns. marco said "lantern. not soup"' },
    { day: 9, text: '30 posters. library printer. 10 cents each' },
    {
      day: 9,
      text: g(
        'see u at the show (sorry) (not sorry) :$',
        'see u at the show. back row crew (Y)',
      ),
    },
    { day: 10, text: 'the posters r EVERYWHERE. sorry' },
  ],
  kudosToPlayer: [10],
  guestbook: [
    {
      day: 6,
      from: 'frogfan_02',
      text: 'ur cells r on a school wall?? my cousin goes there. LEGEND',
    },
    {
      day: 10,
      from: 'marco',
      text: 'good poster. aunt rita took three. she doesnt take things. thanks',
    },
  ],
};
