// Dex on Pixlog in German, days 6–10, same structure as `src/content/pixlog/dex-week2`: wenig worte,
// immer abwesend. 41 Aufrufe (Tag 6), die Einladung zum Westfield Jam (7), üben (8), der dritte Platz
// mit Kevs Clip (9; Album) und Velvet Lantern auf der Kassette von 2007 (10).
import type { PixlogWeek } from '../../pixlog/types';

export const dexPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'dex-jam',
      day: 9,
      title: 'der jam. dritter. kev hat die gemacht',
      photos: [
        {
          photo: {
            scene: 'skatepark',
            seed: 5621,
            day: 9,
            caption:
              'der parcours. 1 min pro lauf. bin ihn gestern 30 mal gefahren',
          },
          comments: [
            { day: 9, from: 'Kickflip_Kev', text: 'objektivdeckel: AB' },
          ],
        },
        {
          photo: {
            scene: 'skatepark',
            seed: 5622,
            day: 9,
            caption: 'sam. erster. der grabbt alles',
          },
          comments: [
            { day: 9, from: 'sam_grabs', text: 'ich grabb was ich will' },
          ],
        },
        {
          photo: {
            scene: 'skatepark',
            seed: 5623,
            day: 9,
            caption: 'der kickflip. is n wischer. aber MEIN wischer',
          },
          comments: [
            { day: 9, from: 'jess', text: 'DEX!!!!' },
            {
              day: 9,
              from: 'Ry (mein bruder)',
              text: 'live gesehen. zählt doppelt',
            },
          ],
        },
        {
          photo: {
            scene: 'skatepark',
            seed: 5624,
            day: 9,
            caption: 'dritter. sticker. ne kassette von 2007. die zukunft',
          },
          comments: [{ day: 10, from: 'pia', text: 'is dritter ne medaille' }],
        },
        {
          photo: {
            scene: 'livingroom',
            seed: 5625,
            day: 9,
            caption: 'kevs clip im fernseher. 6 sekunden. 40 mal geguckt',
          },
          comments: [
            {
              day: 9,
              from: 'Ry (mein bruder)',
              text: '41. ich habs noch einmal geguckt',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'dex-the-jam',
      day: 7,
      title: 'der jam',
      body:
        'kevs crew hat mich zum westfield jam eingeladen\n\n' +
        'tag 9. im park. 1 min pro lauf\n\n' +
        'ich. bei nem contest. komisch',
    },
    {
      id: 'dex-third',
      day: 9,
      title: 'dritter',
      body:
        'hab den kickflip gestanden. vor allen\n\n' +
        'sam erster. big mike zweiter. ich dritter\n\n' +
        'preis: sticker und ne leere kassette. da steht 2007 drauf. kev hats gefilmt. 6 sek. objektivdeckel ab',
    },
  ],
  shouts: [
    { day: 6, text: '41 aufrufe. so 30 davon bin ich' },
    { day: 6, text: '11 echte fans. wahrscheinlich' },
    { day: 7, text: 'der westfield jam. ich. da drin??' },
    { day: 8, text: 'am üben. abwesend (diesmal echt)' },
    {
      day: 8,
      text: 'parcours 30 mal gefahren. 1 mal hingefallen. mit absicht',
    },
    { day: 9, text: 'dritter platz. kamera: AN' },
    { day: 10, text: 'filme velvet lantern. neue kassette' },
    { day: 10, text: 'kamera: dex. besonderer dank: du. schon wieder' },
  ],
  kudosToPlayer: [9],
  guestbook: [
    {
      day: 9,
      from: 'Kickflip_Kev',
      text: 'ICH HABS GEFILMT. objektivdeckel AB. 6 sekunden RUHM',
    },
    {
      day: 10,
      from: 'sam_grabs',
      text: 'war auf der show. laut. gut. dein filmarm is stark',
    },
  ],
};
