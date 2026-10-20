// Pia on Pixlog, days 6–10 (bible §7): Operation Hamster (6–8), the compromise goldfish Sir
// Stardust the Second (9) and the show she wasn't allowed to go to (10; album). She names the
// player by gender ("my big sister/brother").
import { g } from '../gender';
import type { PixlogWeek } from './types';

export const piaPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'pia-sir-stardust',
      day: 10,
      title: 'SIR STARDUST THE SECOND',
      photos: [
        {
          photo: {
            scene: 'livingroom',
            seed: 5331,
            day: 7,
            caption:
              'THE PRESENTATION. professor nibbles in a castle. mom: thinking',
          },
          comments: [
            {
              day: 10,
              from: 'Mom',
              text: 'It was a very good presentation. Love, Mom',
            },
            { day: 10, from: 'marco', text: 'professional' },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5332,
            day: 9,
            caption: 'SIR STARDUST THE SECOND. bc stardust is the FIRST',
          },
          comments: [
            { day: 10, from: 'dex', text: 'the fish has a good spot' },
            { day: 10, from: 'marco', text: 'sir' },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5333,
            day: 10,
            caption:
              'his bowl. on my desk. next to the ponies. stardust is still in the middle',
          },
          comments: [{ day: 10, from: 'jess', text: 'HE IS SO ROYAL!!!' }],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5334,
            day: 10,
            look: 'long',
            caption: 'my face about not going to the show. UNFAIR',
          },
          comments: [
            { day: 10, from: 'Mom', text: 'Next year. I promise. Love, Mom' },
            { day: 10, from: 'theo', text: 'sorry. it was very loud. sorry' },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'pia-hamster-reasons',
      day: 6,
      title: 'WHY I NEED A HAMSTER',
      body:
        'there r 10 reasons. i mailed them to everyone. here r the best ones.\n\n' +
        '1. professor nibbles needs a home. 4. biscuit needs a friend. 7. a wheel is exercise. for him. 10. i am VERY responsible. ask biscuit.\n\n' +
        'the end. vote YES',
    },
    {
      id: 'pia-the-fish',
      day: 9,
      title: 'THE FISH',
      body:
        'mom said no hamster. mom said yes FISH. thats called a COMPROMISE.\n\n' +
        'we got him at the pet store at the mall. he is orange and he is VERY fast.\n\n' +
        `my big ${g('sister', 'brother')} said "nibbles junior" or "goldie". NO. his name is SIR STARDUST THE SECOND. bc stardust is the FIRST`,
    },
  ],
  shouts: [
    { day: 6, text: 'I NEED A HAMSTER (not a joke)' },
    { day: 6, text: 'WHY I NEED A HAMSTER: 10 reasons' },
    { day: 7, text: 'presenting to mom TONIGHT' },
    { day: 7, text: 'presentation: DONE. mom: thinking' },
    { day: 8, text: "mom said WE'LL SEE :(" },
    { day: 8, text: 'operation hamster: phase 2' },
    { day: 9, text: 'FISH. (not a hamster) (still a pet)' },
    { day: 10, text: 'NOT ALLOWED AT THE SHOW. UNFAIR' },
    { day: 10, text: 'sir stardust the 2nd is my show now' },
  ],
  kudosToPlayer: [8],
  guestbook: [
    {
      day: 9,
      from: 'ponyprincess_99',
      text: 'a FISH!!! does stardust like him',
    },
    {
      day: 10,
      from: 'dex',
      text: 'heard u did a show for the fish. respect',
    },
  ],
};
