// Pia on Pixlog in German, days 6–10, same structure as `src/content/pixlog/pia-week2`: Operation
// Hamster (Tag 6–8), der Kompromiss-Goldfisch Sir Sternenstaub der Zweite (9) und die Show, zu der sie
// nicht durfte (10; Album). Sie nennt den Spieler per `g()` „meine große schwester"/„mein großer bruder".
import { g } from '../../gender';
import type { PixlogWeek } from '../../pixlog/types';

export const piaPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'pia-sir-stardust',
      day: 10,
      title: 'SIR STERNENSTAUB DER ZWEITE',
      photos: [
        {
          photo: {
            scene: 'livingroom',
            seed: 5331,
            day: 7,
            caption:
              'DER VORTRAG. professor knabber in seiner burg. mama: denkt nach',
          },
          comments: [
            {
              day: 10,
              from: 'Mama',
              text: 'Das war ein sehr guter Vortrag. Hab dich lieb, Mama',
            },
            { day: 10, from: 'marco', text: 'professionell' },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5332,
            day: 9,
            caption:
              'SIR STERNENSTAUB DER ZWEITE. weil sternenstaub die ERSTE is',
          },
          comments: [
            { day: 10, from: 'dex', text: 'der fisch hat n guten platz' },
            { day: 10, from: 'marco', text: 'sehr wohl, sir' },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5333,
            day: 10,
            caption:
              'sein glas. auf meinem schreibtisch. neben den ponys. sternenstaub is immer noch in der MITTE',
          },
          comments: [{ day: 10, from: 'jess', text: 'ER IS SO KÖNIGLICH!!!' }],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5334,
            day: 10,
            look: 'long',
            caption: 'mein gesicht weil ich nich zur show durfte. UNFAIR!!',
          },
          comments: [
            {
              day: 10,
              from: 'Mama',
              text: 'Nächstes Jahr. Versprochen. Hab dich lieb, Mama',
            },
            {
              day: 10,
              from: 'theo',
              text: 'tut mir leid. es war sehr laut. sorry',
            },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'pia-hamster-reasons',
      day: 6,
      title: 'WARUM ICH EINEN HAMSTER BRAUCHE',
      body:
        'es gibt 10 gründe. ich hab sie allen gemailt. hier sind die besten.\n\n' +
        '1. hamster sind klein. er kann auf meinem schreibtisch wohnen. 4. als sternenstaub weg war hab ich ein PLAKAT gemacht. 7. keks braucht einen freund. 10. ich bin fast 10.\n\n' +
        'ende. stimmt mit JA',
    },
    {
      id: 'pia-the-fish',
      day: 9,
      title: 'DER FISCH',
      body:
        'mama hat nein zum hamster gesagt. mama hat ja zum FISCH gesagt. das nennt man KOMPROMISS.\n\n' +
        'wir haben ihn in der zoohandlung im einkaufszentrum geholt. er is orange und er is SEHR schnell.\n\n' +
        `${g('meine große schwester', 'mein großer bruder')} hat „knabber junior“ oder „goldi“ gesagt. NEIN. er heißt SIR STERNENSTAUB DER ZWEITE. weil sternenstaub die ERSTE is`,
    },
  ],
  shouts: [
    { day: 6, text: 'ICH BRAUCH NEN HAMSTER (kein witz)' },
    { day: 6, text: 'WARUM ICH EINEN HAMSTER BRAUCHE: 10 gründe' },
    { day: 7, text: 'HEUTE ABEND vortrag bei mama' },
    { day: 7, text: 'vortrag: FERTIG. mama: denkt nach' },
    { day: 8, text: 'mama hat MAL SEHEN gesagt :(' },
    { day: 8, text: 'operation hamster: phase 2 läuft' },
    { day: 9, text: 'FISCH. (kein hamster) (trotzdem ein haustier)' },
    { day: 10, text: 'DARF NICH ZUR SHOW. UNFAIR!!' },
    { day: 10, text: 'sir sternenstaub der 2. is jetzt meine show' },
  ],
  kudosToPlayer: [8],
  guestbook: [
    {
      day: 9,
      from: 'ponyprincess_99',
      text: 'ein FISCH!!! mag sternenstaub ihn',
    },
    {
      day: 10,
      from: 'dex',
      text: 'hab gehört du hast für den fisch ne show gemacht. respekt',
    },
  ],
};
