// Jess on Pixlog, days 6–10 (bible §7): the purple forehead and the drumstick on the wall (6), the
// fan art contest (7), Lakeview sold out (8), 2nd place and the signed setlist (9; album) and the
// pick she caught with her hand (10). Her shrine: drumstick, setlist, pick.
import { g } from '../gender';
import type { PixlogWeek } from './types';

export const jessPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'jess-second-place',
      day: 9,
      title: '2ND PLACE!!! (the collage)',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5121,
            day: 6,
            look: 'long',
            caption: 'MY FOREHEAD. day 6. purple. its a STAR if u squint',
          },
          comments: [
            { day: 9, from: 'kayla', text: 'still purple?? ICE. pls' },
            { day: 9, from: 'dex', text: 'battle scar' },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5122,
            day: 8,
            caption:
              'the cat walked thru the glitter AGAIN. hes part of the collage now',
          },
          comments: [{ day: 9, from: 'pia', text: 'can ur cat be in MY pics' }],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5123,
            day: 8,
            look: 'long',
            caption:
              'the collage. 40% glitter 60% LOVE. ziggys drumstick spin + my ticket stub',
          },
          comments: [
            { day: 9, from: 'xX_CometGirl_Xx', text: 'IT WAS SO GOOD!!!' },
            {
              day: 9,
              from: 'theo',
              text: 'the stars r really good. sorry. i mean they r good',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5124,
            day: 9,
            look: 'long',
            caption: 'me finding out. 2ND!!!!!',
          },
          comments: [{ day: 9, from: 'kayla', text: 'ur face lol ~*iconic*~' }],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5125,
            day: 9,
            caption: 'the SIGNED SETLIST. all 4 of them. ziggy signed TWICE',
          },
          comments: [
            { day: 9, from: 'marco', text: 'pasta is a strong medium' },
            {
              day: 10,
              from: 'pia',
              text: 'can i touch it. or is it like the drumstick',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'jess-the-bruise',
      day: 6,
      title: 'THE BRUISE (an update)',
      body:
        'its purple now. my mom says its "healing". i say its a STAR.\n\n' +
        'the drumstick moved. from under my pillow to TWO NAILS over my bed. label: ZIGGY TOUCHED THIS.\n\n' +
        'my mom asked "why is there a nail in the wall". i said "two nails". she left',
    },
    {
      id: 'jess-2nd-place',
      day: 9,
      title: 'I GOT 2ND!!!',
      body:
        'FAN ART CONTEST RESULTS: 1st spacegirl4eva. a KEYTAR. made of MACARONI. 2nd ME!!! 3rd robot_cover_guy (kevin the robot)\n\n' +
        'i lost to pasta. i am ok.\n\n' +
        'my prize: the riverside setlist. SIGNED BY ALL FOUR. ziggy signed TWICE. it goes next to the drumstick. its a SHRINE now',
    },
  ],
  shouts: [
    { day: 6, text: 'ZIGGY TOUCHED THIS (its over my bed now)' },
    { day: 6, text: 'forehead: purple. heart: ZIGGY' },
    { day: 7, text: 'FAN ART CONTEST!!!!! (i WILL win)' },
    { day: 7, text: 'collage: 40% glitter 60% LOVE' },
    { day: 8, text: 'LAKEVIEW SOLD OUT!!!!!!!!! :(' },
    { day: 8, text: 'in mourning. (velvet lantern tho??)' },
    { day: 9, text: `2ND PLACE!!!!! signed setlist ${g('(L)', '(Y)')}` },
    { day: 9, text: 'NEW SIGN: MARCO THROW A PICK' },
    { day: 10, text: 'MARCO THREW A PICK. I CAUGHT IT. W MY HAND' },
    {
      day: 10,
      text: `best week EVER. u know who u r ${g('(L)', '(Y)')}`,
    },
  ],
  kudosToPlayer: [9],
  guestbook: [
    {
      day: 7,
      from: 'kayla',
      text: 'good luck in the contest!! ~*u got this*~',
    },
    {
      day: 9,
      from: 'xX_CometGirl_Xx',
      text: '2ND!!! ur collage was the BEST one. pasta doesnt count!!!',
    },
  ],
};
