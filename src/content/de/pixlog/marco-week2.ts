// Marco on Pixlog in German, days 6–10, same structure as `src/content/pixlog/marco-week2`: trocken,
// klein, nie „!". Das Jugendzentrum, diesmal echt (Tag 6), die Setlist (7), der Song vom Zwerg (8),
// das Mikro verkehrt rum (9) und die Show: 83 Leute, passen 80 rein (10; Album, alles `stage`). Der
// Spieler ist „der zwerg": erste Reihe (na ja, eine Reihe) oder die Crew; Tante Rita schreibt mit „!!!".
import { g } from '../../gender';
import type { PixlogWeek } from '../../pixlog/types';

export const marcoPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'marco-rec-hall',
      day: 10,
      title: 'juz. platz für 80. (83)',
      photos: [
        {
          photo: {
            scene: 'stage',
            seed: 5421,
            day: 10,
            caption:
              'der raum. passen 80 rein. 83 kamen. brandschutz ist eher ein vorschlag',
          },
          comments: [
            {
              day: 10,
              from: 'Tante Rita',
              text: '83!!! Ich hab zweimal gezählt!!! Liebe Grüße, Tante Rita',
            },
            { day: 10, from: 'kayla', text: '~*partnerlook. frag nich*~' },
          ],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5422,
            day: 10,
            caption: 'der farbeimer. in 3 songs. im 4. umgetreten',
          },
          comments: [
            { day: 10, from: 'derek (schlagzeug)', text: 'der 4. war kunst' },
          ],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5423,
            day: 10,
            caption: 'das mikro. verkehrt rum. ich auch',
          },
          comments: [{ day: 10, from: 'dex', text: 'hab ich auf kassette' }],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5424,
            day: 10,
            caption:
              'ein schild in reihe 1. MARCO WIRF EIN PLEKTRUM. ich hab nein gesagt',
          },
          comments: [{ day: 10, from: 'jess', text: 'ER HATS GEWORFEN' }],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5425,
            day: 10,
            caption: 'das plektrum. ein wischer. es war nicht gezielt',
          },
          comments: [{ day: 10, from: 'pia', text: 'UNFAIR!!' }],
        },
        {
          photo: {
            scene: 'stage',
            seed: 5426,
            day: 10,
            caption: g(
              'theos poster an der tür. erste reihe: der zwerg. na ja. eine reihe',
              'theos poster an der tür. crew: der zwerg. hat den verstärker geschleppt',
            ),
          },
          comments: [
            {
              day: 10,
              from: 'theo',
              text: 'mein poster ist auf einem foto. sorry',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'marco-new-song',
      day: 8,
      title: 'neuer song',
      body:
        `neuer song im set am samstag. ${g('„laternenherz“', '„56k“')}.\n\n` +
        `text von ${g('meiner cousine', 'meinem cousin')}. kleingeschrieben. wie der abspann in dex' video.\n\n` +
        'ich hab ein wort geändert. ok vier. mach kein ding draus.',
    },
    {
      id: 'marco-83',
      day: 10,
      title: '83 leute',
      body:
        'ich hab gesagt so 12. lag um 71 daneben.\n\n' +
        'das mikro ging nur verkehrt rum. derek hats festgeklebt. ich hab reingesungen wie ne fledermaus. keiner hat nach suppe gefragt.\n\n' +
        'jemand hat ein plektrum geworfen. das war ich.\n\n' +
        '…\n\n' +
        'ok, es war gut. es war richtig gut.',
    },
  ],
  shouts: [
    { day: 6, text: 'das jugendzentrum. diesmal echt. samstag' },
    { day: 6, text: 'gesucht: poster. keine suppe' },
    { day: 7, text: 'setlist-besprechung. 3 stunden. 8 songs' },
    { day: 7, text: 'der eimer: 3 songs. verhandelt' },
    { day: 8, text: 'neuer song im set. mach kein ding draus' },
    { day: 9, text: 'soundcheck. betet für uns' },
    { day: 9, text: 'mikro geht nur verkehrt rum. wir auch' },
    { day: 10, text: '83 leute. lag um 71 daneben' },
  ],
  kudosToPlayer: [10],
  guestbook: [
    {
      day: 6,
      from: 'Tante Rita',
      text: 'Das JUGENDZENTRUM!!! Das erzähl ich allen beim Bingo!!! Liebe Grüße, Tante Rita',
    },
    {
      day: 10,
      from: 'derek (schlagzeug)',
      text: 'offizielle erklärung nr. 3: beste show aller zeiten. der eimer sieht das genauso',
    },
  ],
};
