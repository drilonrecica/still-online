// German band pages, same ids and order as `src/content/friendspace/bands`. Band names, track ids
// and themes stay; the bands talk like 2007 band pages („danke fürs adden!!“), Velvet Lantern like
// Marco (lowercase, never „!“).
import { BANDS as EN_BANDS } from '../../friendspace/bands';
import type { Band } from '../../friendspace/types';

const theme = (id: string): Band['theme'] =>
  EN_BANDS.find((b) => b.id === id)!.theme;

export const BANDS: readonly Band[] = [
  {
    id: 'tinfoil-comets',
    name: 'Tinfoil Comets',
    genre: 'Space-Rock / Indie / Roboter',
    hometown: 'die Garage hinter dem Haus von Ziggys Mama',
    bio:
      'wir sind die Tinfoil Comets. wir spielen laute lieder über den weltraum und roboter. danke fürs adden!! ' +
      'Nova am mikro + keytar (das keytar heißt Gerald), Buzz an der gitarre + alufolienhut, Mo am bass, Ziggy am schlagzeug. ' +
      'auf unserer cd is ein roboter. ein fan hat ihn Kevin getauft. na gut. Kevin',
    trackIds: ['voxel-revolution', 'newer-wave'],
    shows: [
      {
        day: 1,
        text: 'FREITAG - Riverside Arena - AUSVERKAUFT!!! gewinner vom radio-gewinnspiel: wir sehen euch',
      },
      { day: 1, text: 'nächsten samstag - Lakeview Festwiese' },
      { day: 1, text: 'in 2 wochen - The Rocket Room' },
      {
        day: 4,
        text: 'MORGEN ABEND die große show. Riverside. bringt eure schilder mit, Ziggy liest ALLE',
      },
      {
        day: 5,
        text: 'RIVERSIDE IHR WART DER WAHNSINN. wer auch immer den drumstick gefangen hat: Ziggy sagt sorry wegen deiner stirn',
      },
    ],
    blog: [
      {
        day: 1,
        title: 'riverside!!!',
        body: 'freitag is AUSVERKAUFT. ein radiosender hat 2 karten verlost. falls du das bist: hi. bring ohrstöpsel mit',
      },
      {
        day: 3,
        title: 'neues aus dem proberaum',
        body: 'ziggy hat schon wieder nen drumstick zerbrochen. uns gehts gut. der neue song is SO GUT WIE fertig',
      },
      {
        day: 5,
        title: 'bestes. publikum. überhaupt.',
        body: 'da war ein schild mit TINFOIL COMTES und nem pfotenabdruck drauf. das is unser lieblingsschild aller zeiten',
      },
    ],
    theme: theme('tinfoil-comets'),
  },
  {
    id: 'velvet-lantern',
    name: 'Velvet Lantern',
    genre: 'Indie / Keller / Langsam',
    hometown: 'der bean cellar (der keller unterm café)',
    bio:
      'velvet lantern. marco (bass). derek (schlagzeug, meistens). ' +
      'wir spielen mit absicht in kleinen räumen. das nennt man exklusiv. ' +
      'das ding auf unserem flyer ist eine laterne. wir verkaufen keine suppe',
    trackIds: ['cool-rock'],
    shows: [
      {
        day: 2,
        text: 'der bean cellar. nur eine nacht. höchstens 11 leute. brandschutz ist eine empfehlung (seine worte)',
      },
      { day: 5, text: 'nächste show: steht noch nicht fest. größer. 12 leute' },
    ],
    blog: [
      {
        day: 2,
        title: 'flyer',
        body: 'die flyer hängen. café, waschsalon, bushaltestelle. derek hat auf einen draufgemalt. es ist eine laterne',
      },
      {
        day: 4,
        title: 'besetzungswechsel',
        body: 'derek ist gestern ausgestiegen. derek ist heute wieder eingestiegen. er hat einen farbeimer mitgebracht. der eimer ist jetzt eine trommel. wir haben abgestimmt',
      },
      {
        day: 5,
        title: 'ausverkauft',
        body: '11 leute. in den laden passen 11. derek hat beim letzten lied den eimer umgetreten. das gehört jetzt zur show. danke an alle. alle 11',
      },
    ],
    theme: theme('velvet-lantern'),
  },
  {
    id: 'grip-tapes',
    name: 'The Grip Tapes',
    genre: 'Skate-Punk / Surf / Laut',
    hometown: 'die halfpipe im skatepark',
    bio:
      'wir sind The Grip Tapes. 3 jungs, 3 songs, alle übers skaten. einer is über regen. ' +
      'wir spielen an der halfpipe wenns nich regnet. wenns regnet spielen wir den regensong in ner garage',
    trackIds: ['surf-shimmy'],
    shows: [
      {
        day: 1,
        text: 'die halfpipe im skatepark - immer wenns nich regnet',
      },
      {
        day: 5,
        text: 'der bean cellar?? das is n keller. „keine boards drinnen“. wir überlegens uns',
      },
    ],
    blog: [
      {
        day: 1,
        title: 'song nr. 3 is fertig',
        body: 'er heißt „grip tape > leute“. er is 58 sekunden lang. das is lang für uns',
      },
      {
        day: 2,
        title: 'wir sind in nem film',
        body: 'heute hat einer im park mit nem camcorder von ca. 1998 gefilmt. wir waren hinten drauf. sieht aus wie n urlaubsvideo. perfekt',
      },
      {
        day: 4,
        title: 'musste man dabei sein',
        body: 'heute hat einer im park nen sauberen kickflip gestanden und KEINER hats gefilmt. neue songidee: „fotos oder es is nie passiert“',
      },
    ],
    theme: theme('grip-tapes'),
  },
  {
    id: 'sugarcube-parade',
    name: 'The Sugarcube Parade',
    genre: 'Sonnenschein-Pop / Frühstück / Fröhlich',
    hometown: 'ein gelbes haus am ententeich',
    bio:
      'hallo!! wir sind The Sugarcube Parade :) wir spielen fröhliche lieder über frühstück, sonnenschein und lieb sein zur familie. ' +
      'wir haben ein glockenspiel und wir haben keine angst, es zu benutzen. ' +
      'unser größter fan hat 23 ponys und einen hund namens Keks. hallo Pia!!',
    trackIds: ['pleasant-porridge'],
    shows: [
      {
        day: 1,
        text: 'samstag vormittag - pfannkuchen-picknick am ententeich. eintritt frei!! löffel mitbringen',
      },
      {
        day: 3,
        text: 'sonntag - die kinderecke in der stadtbücherei. wir sind auch so halbwegs leise',
      },
    ],
    blog: [
      {
        day: 1,
        title: 'neues lied!!',
        body: 'es geht um haferbrei. schon wieder. wir können nicht anders, haferbrei is TOLL',
      },
      {
        day: 2,
        title: 'eine traurige nachricht',
        body: 'ein fan hat uns geschrieben, dass ihre pony-königin vermisst wird :( wer ein pony mit nem stern sieht: sie wohnt in Pias regal',
      },
      {
        day: 4,
        title: 'GUTE NACHRICHTEN',
        body: 'die pony-königin is wieder DA!!! sie war die ganze zeit in der wäsche. wir haben zur feier 3 mal das haferbrei-lied gespielt',
      },
    ],
    theme: theme('sugarcube-parade'),
  },
];
