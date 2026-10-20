// Theo on Pixlog in German, days 6–10, same structure as `src/content/pixlog/theo-week2`: schüchtern,
// „ähm", „sorry", „…". Seine Zellzeichnungen an der Kunstwand in Raum 12 (Tag 6; Album), die
// Poster-Frage (7), zwei Entwürfe (8), 30 Poster (9) und die Show, ganz hinten (10). Bio-Partnerin/
// Bio-Partner per `g()`; als Mädchen wird er rot (:$), ein Junge ist „crew aus der letzten reihe".
import { g } from '../../gender';
import type { PixlogWeek } from '../../pixlog/types';

export const theoPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'theo-art-wall',
      day: 6,
      title: 'die wand (sorry)',
      photos: [
        {
          photo: {
            scene: 'classroom',
            seed: 5521,
            day: 6,
            caption:
              'raum 12. die wand neben der tür. das sind meine zellen. sorry',
          },
          comments: [
            {
              day: 6,
              from: 'kayla',
              text: 'THEO du bist berühmt!! ~*kunst-star*~',
            },
            { day: 6, from: 'froschfan_02', text: 'is das ne FROSCHzelle' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5522,
            day: 6,
            caption:
              'die mit den mitochondrien. herr dalton hat sie in die mitte gehängt',
          },
          comments: [
            { day: 6, from: 'marco', text: 'eingerahmt. das ist fortschritt' },
            { day: 6, from: 'dex', text: 'schön. gute farben' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5523,
            day: 6,
            caption: g(
              'meine bio-partnerin hat gesagt, die ist gut. also… :$',
              'mein bio-partner hat gesagt, die ist gut. also… ok',
            ),
          },
          comments: [{ day: 6, from: 'jess', text: 'THEO!!! RAHM DIE EIN!!!' }],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5524,
            day: 6,
            look: 'short',
            caption: 'ich neben der wand. mama wollte das. sorry',
          },
          comments: [
            {
              day: 6,
              from: 'Mama',
              text: 'Ich bin so stolz auf dich. Hab dich lieb, Mama',
            },
            {
              day: 7,
              from: 'pia',
              text: 'du bist auch an MEINER schule berühmt. ok nich wirklich',
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
      title: 'ein poster??',
      body:
        g(
          'marco hat gefragt, ob ich ein poster für seine band zeichnen kann. also… er hat meine bio-partnerin gefragt, ob sie mich fragt.\n\n',
          'marco hat gefragt, ob ich ein poster für seine band zeichnen kann. also… er hat meinen bio-partner gefragt, ob er mich fragt.\n\n',
        ) +
        'ich hab dreimal sorry gesagt. dann hab ich ja gesagt.\n\n' +
        'es muss eine laterne sein. keine suppe. ich weiß nicht, wie die suppe da reinkam',
    },
    {
      id: 'theo-the-posters',
      day: 10,
      title: 'die poster',
      body:
        '30 poster. drucker in der bibliothek. 10 cent pro stück. meine mama und ich haben sie in der ganzen schule und im jugendzentrum aufgehängt.\n\n' +
        'tante rita hat drei mitgenommen. ich kenne tante rita nicht. sie hat mich umarmt.\n\n' +
        g(
          'die show war laut. ich stand ziemlich weit hinten. mit meiner bio-partnerin. es war schön. sorry. nicht sorry :$',
          'die show war laut. ich stand ziemlich weit hinten. mit meinem bio-partner. marco hat mir zugenickt. ich glaub, das ist viel für ihn',
        ),
    },
  ],
  shouts: [
    { day: 6, text: 'herr dalton hat meine zeichnungen aufgehängt. sorry' },
    {
      day: 6,
      text: 'hab in der großen pause in der bibliothek gegessen. die leute haben die wand angeguckt',
    },
    {
      day: 7,
      text: 'ich zeichne ein POSTER?? für eine band. sorry schon mal an die band',
    },
    {
      day: 8,
      text: '2 entwürfe. beide laternen. marco hat gesagt „laterne. keine suppe“',
    },
    { day: 9, text: '30 poster. drucker in der bibliothek. 10 cent pro stück' },
    {
      day: 9,
      text: g(
        'bis zur show (sorry) (nicht sorry) :$',
        'bis zur show. crew aus der letzten reihe (Y)',
      ),
    },
    { day: 10, text: 'die poster hängen ÜBERALL. sorry' },
  ],
  kudosToPlayer: [10],
  guestbook: [
    {
      day: 6,
      from: 'froschfan_02',
      text: 'deine zellen hängen an ner schulwand?? mein cousin geht da hin. LEGENDE',
    },
    {
      day: 10,
      from: 'marco',
      text: 'gutes poster. tante rita hat drei mitgenommen. sie nimmt nie was mit. danke',
    },
  ],
};
