// Jess on Pixlog in German, days 6–10, same structure as `src/content/pixlog/jess-week2`: die lila
// Stirn und der Drumstick an der Wand (Tag 6), der Fan-Art-Wettbewerb (7), Lakeview ausverkauft (8),
// der 2. Platz und die signierte Setlist (9; Album) und das Plektrum, mit der Hand gefangen (10).
// Ihr Schrein: Drumstick, Setlist, Plektrum.
import { g } from '../../gender';
import type { PixlogWeek } from '../../pixlog/types';

export const jessPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'jess-second-place',
      day: 9,
      title: '2. PLATZ!!! (die collage)',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5121,
            day: 6,
            look: 'long',
            caption:
              'MEINE STIRN. tag 6. lila. is ein STERN wenn man die augen zukneift',
          },
          comments: [
            {
              day: 9,
              from: 'kayla',
              text: 'immer noch lila?? EIS DRAUF. bitte',
            },
            { day: 9, from: 'dex', text: 'kampfnarbe' },
          ],
        },
        {
          photo: {
            scene: 'pet',
            seed: 5122,
            day: 8,
            caption:
              'die katze is SCHON WIEDER durch den glitzer gelaufen. er gehört jetzt zur collage',
          },
          comments: [
            { day: 9, from: 'pia', text: 'darf deine katze auf MEINE fotos' },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5123,
            day: 8,
            look: 'long',
            caption:
              'ich + die collage. 40% glitzer 60% LIEBE. ziggys drumstick-dreher. IM WELTALL',
          },
          comments: [
            { day: 9, from: 'xX_CometGirl_Xx', text: 'DIE WAR SO GUT!!!' },
            {
              day: 9,
              from: 'theo',
              text: 'die sterne sind richtig gut. sorry. ich meine… die sind gut',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5124,
            day: 9,
            look: 'long',
            caption: 'ich in dem moment wo ichs erfahre. ZWEITE!!!!!',
          },
          comments: [
            { day: 9, from: 'kayla', text: 'dein gesicht lol ~*kult*~' },
          ],
        },
        {
          photo: {
            scene: 'concert',
            seed: 5125,
            day: 9,
            caption:
              'die SIGNIERTE SETLIST. von allen 4. ziggy hat ZWEIMAL unterschrieben',
          },
          comments: [
            { day: 9, from: 'marco', text: 'nudeln sind ein starkes medium' },
            {
              day: 10,
              from: 'pia',
              text: 'darf ich die anfassen. oder is das wie beim drumstick',
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
      title: 'DIE BEULE (ein update)',
      body:
        'die is jetzt lila. mama sagt das „heilt“. ich sag das is ein STERN.\n\n' +
        'der drumstick is umgezogen. von unterm kopfkissen an ZWEI NÄGEL überm bett. mit schild: ZIGGY HAT DAS ANGEFASST.\n\n' +
        'mama hat gefragt „warum is da ein nagel in der wand“. ich hab gesagt „zwei nägel“. sie is rausgegangen',
    },
    {
      id: 'jess-2nd-place',
      day: 9,
      title: 'ICH BIN ZWEITE!!!',
      body:
        'ERGEBNISSE VOM FAN-ART-WETTBEWERB: 1. spacegirl4eva. ne KEYTAR. aus MAKKARONI. 2. ICH!!! 3. robot_cover_guy (kevin der roboter)\n\n' +
        'ICH HAB GEGEN NUDELN VERLOREN. mir gehts gut.\n\n' +
        'mein preis: die setlist aus der riverside arena. SIGNIERT VON ALLEN VIER. ziggy hat ZWEIMAL unterschrieben. die kommt neben den drumstick. das MUSEUM wächst',
    },
  ],
  shouts: [
    { day: 6, text: 'ZIGGY HAT DAS ANGEFASST (hängt jetzt überm bett)' },
    { day: 6, text: 'stirn: lila. herz: ZIGGY' },
    { day: 7, text: 'FAN-ART-WETTBEWERB!!!!! (ich WERDE gewinnen)' },
    { day: 7, text: 'collage: 40% glitzer 60% LIEBE' },
    { day: 8, text: 'LAKEVIEW AUSVERKAUFT!!!!!!!!! :(' },
    { day: 8, text: 'in trauer. (aber velvet lantern??)' },
    { day: 9, text: `2. PLATZ!!!!! signierte setlist ${g('(L)', '(Y)')}` },
    { day: 9, text: 'NEUES SCHILD: MARCO WIRF EIN PLEKTRUM' },
    {
      day: 10,
      text: 'MARCO HAT EIN PLEKTRUM GEWORFEN. ICH HABS GEFANGEN. MIT DER HAND',
    },
    {
      day: 10,
      text: `beste woche ÜBERHAUPT. du weißt wer gemeint is ${g('(L) hdgdl', '(Y)')}`,
    },
  ],
  kudosToPlayer: [9],
  guestbook: [
    {
      day: 7,
      from: 'kayla',
      text: 'viel glück beim wettbewerb!! ~*du schaffst das*~',
    },
    {
      day: 9,
      from: 'xX_CometGirl_Xx',
      text: 'ZWEITE!!! deine collage war die BESTE. nudeln zählen nich!!!',
    },
  ],
};
