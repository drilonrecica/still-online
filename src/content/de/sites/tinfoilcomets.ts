// German tinfoilcomets.example, same exports as `src/content/sites/tinfoilcomets`: xX_CometGirl_Xx's
// fan page in German fan-girl voice („ihr“, CAPS, „!!!“, ~*~). Band, members and song titles stay
// as they are (fictional English band); friends sign on their story days in their German voices.
import type {
  Album,
  BandMember,
  ConcertPic,
  DayText,
  TourDate,
} from '../../sites/tinfoilcomets';
import type { GuestbookEntry, SiteMeta } from '../../sites/types';
import {
  TINFOIL_GUESTBOOK_WEEK2,
  TINFOIL_NEWS_WEEK2,
  TINFOIL_PICS_WEEK2,
} from './tinfoilcomets-week2';

export const TINFOIL_HOST = 'tinfoilcomets.example';

export const COUNTER_START = 4203;

export const SITE_META: SiteMeta = {
  title: 'Die OFFIZIELLE INOFFIZIELLE Tinfoil Comets Fanseite!!!1',
  description:
    'Die Nr. 1 Tinfoil Comets Fanseite von xX_CometGirl_Xx: Band-News, Tourdaten, Konzertfotos und ein Gästebuch. Tragt euch ein!!!',
  keywords: [
    'tinfoil',
    'comets',
    'band',
    'fan',
    'fanseite',
    'musik',
    'konzert',
    'ziggy',
    'lakeview',
  ],
  pages: {
    '/': {
      title: 'Tinfoil Comets Fanseite - START',
      keywords: ['hamster', 'news', 'webring', 'midi'],
    },
    '/band': {
      title: 'Tinfoil Comets Fanseite - Die Band',
      keywords: ['mitglieder', 'alben', 'tour', 'tourdaten', 'roboter'],
    },
    '/guestbook': {
      title: 'Tinfoil Comets Fanseite - Gästebuch',
      keywords: ['gästebuch', 'eintragen'],
    },
    '/pics': {
      title: 'Tinfoil Comets Fanseite - Fotos',
      keywords: [
        'fotos',
        'bilder',
        'galerie',
        'fan-art',
        'wettbewerb',
        'gewinner',
      ],
    },
  },
};

export const TINFOIL_SITE_TEXT = {
  title: 'Die OFFIZIELLE INOFFIZIELLE Tinfoil Comets Fanseite!!!1',
  owner: 'xX_CometGirl_Xx',
  welcome:
    'WILLKOMMEN auf der Nr. 1 Tinfoil Comets Fanseite im GANZEN INTERNET!!! (das is kein fakt aber in meinem herzen is es WAHR)',
  bestViewed: 'Optimiert für 800x600 mit Web Explorer 6',
  sinceLine: 'diese seite wurde',
  sinceLineEnd: 'mal besucht, seit ich sie in der 7. klasse gebaut hab',
  midiOn: 'Hintergrund-MIDI abspielen',
  midiOff: 'MIDI stoppen',
  midiMuted: 'dein ton is aus!! mach ihn an, sonst hörst du mein lied nich',
  footer:
    'alle fotos + texte (c) xX_CometGirl_Xx. MEIN LAYOUT NICHT KLAUEN. ich merk das.',
  updated: 'zuletzt aktualisiert: so ungefähr gestern',
  picsIntro:
    'alle mit meiner einwegkamera gemacht!!! (außer die, die nich von mir sind)',
  construction: 'BAUSTELLE',
  constructionNote: 'entschuldigt den staub!!! bald kommt mehr',
  signThanks: 'DANKE FÜRS EINTRAGEN!!! ♥',
  errorNoName: 'du hast deinen namen vergessen!!!',
  errorNoMessage: 'du musst schon WAS schreiben!!!',
};

export const TINFOIL_NEWS: readonly DayText[] = [
  { day: 1, text: '*~* TINFOIL COMETS LIVE DIESEN FREITAG!!! *~*' },
  { day: 1, text: 'NEU: ich hab ein gästebuch!!! TRAGT EUCH EIN!!!' },
  {
    day: 1,
    text: 'die hamster sind zurück, auf vielfachen wunsch (meiner mama)',
  },
  { day: 2, text: 'NEUE FOTOS in der fotogalerie!!!' },
  {
    day: 3,
    text: 'gerücht: sie spielen SPACE GIRL als erstes. von mir BESTÄTIGT',
  },
  {
    day: 4,
    text: 'es is MORGEN. nein warte es is HEUTE ABEND. ich kann keine kalender lesen',
  },
  { day: 5, text: 'konzertbericht kommt bald!!! (baustelle)' },
  {
    day: 5,
    text: 'jemand hat ziggys drumstick gefangen. MIT DEM GESICHT. legende',
  },
  ...TINFOIL_NEWS_WEEK2,
];

export const TINFOIL_MEMBERS: readonly BandMember[] = [
  {
    name: 'Nova Reyes',
    role: 'gesang + keytar',
    facts: [
      'kann einen ton 22 sekunden halten (hab gestoppt)',
      'ihr keytar heißt Gerald',
      'lieblingsessen: cornflakes zum abendbrot',
    ],
  },
  {
    name: 'Buzz Kowalczyk',
    role: 'gitarre',
    facts: [
      'trägt auf der bühne nen echten alu-hut. bei jedem konzert. auch im sommer',
      'hat gitarre mit nem buch aus der bücherei gelernt',
      'hat mal 3 saiten in 1 song zerrissen und einfach weitergespielt!!!',
    ],
  },
  {
    name: 'Mo Pebbles',
    role: 'bass',
    facts: [
      'der stille',
      'spielt mit dem rücken zum publikum, weil er schüchtern is (süß)',
      'hat ne schildkröte namens Donner',
    ],
  },
  {
    name: 'Ziggy Voltz',
    role: 'schlagzeug',
    facts: [
      'macht den DRUMSTICK-WIRBEL!!! (das beste an jedem konzert)',
      'is so 28 (alter is nur ne zahl!!!)',
      'wirft am ende nen drumstick in die menge. eines tages fang ICH ihn',
    ],
  },
];

export const TINFOIL_ALBUMS: readonly Album[] = [
  {
    title: 'Hello, Robot',
    year: 2006,
    note: 'die mit dem ROBOTER auf dem cover!!! der roboter heißt Kevin (den namen hab ich ihm gegeben)',
    tracks: [
      'Space Girl',
      'Tinfoil Heart',
      'Meteor Shower (In My Room)',
      'Robot Prom',
      'Gravity Is A Suggestion',
      'Orbit Me',
      'Kevin (Reprise)',
    ],
  },
  {
    title: 'Comet Juice EP',
    year: 2004,
    note: 'mega selten. ich hab 2 stück. 1 zum hören und 1 zum NIEMALS ANFASSEN',
    tracks: ['Comet Juice', 'Satellite Sweetheart', 'Basement Launch'],
  },
];

export const TINFOIL_TOUR: readonly TourDate[] = [
  {
    date: 'DIESEN FREITAG!!!',
    venue: 'Riverside Arena',
    note: 'AUSVERKAUFT. ich hab keine karten bekommen. mir gehts GUT',
    after: {
      day: 5,
      date: 'letzten freitag',
      note: 'es is passiert. ich war nich da. bitte tragt alle details ins gästebuch ein',
    },
  },
  {
    date: 'nächsten samstag',
    venue: 'Lakeview Festwiese',
    note: 'open air!!! regencape mitnehmen',
    soon: { day: 6, date: 'DIESEN SAMSTAG!!!' },
    soldOut: {
      day: 8,
      note: 'AUSVERKAUFT. 9 minuten. ich hab keine karten bekommen. SCHON WIEDER',
    },
    after: {
      day: 10,
      date: 'samstag',
      note: 'es is passiert. ich habs im radio gehört. es war windig. buzz hat seinen hut verloren',
    },
  },
  {
    date: 'in 2 wochen',
    venue: 'The Rocket Room',
    note: 'ohne altersbeschränkung!!! (mama hat vielleicht gesagt)',
    soon: { day: 6, date: 'nächste woche' },
  },
  {
    date: 'dezember',
    venue: 'Winter Jingle Jam',
    note: 'mit anderen bands aber egal',
  },
];

export const TINFOIL_PICS: readonly ConcertPic[] = [
  {
    day: 1,
    seed: 7101,
    caption: 'ziggy mitten im WIRBEL (unscharf weil er so SCHNELL is)',
  },
  {
    day: 1,
    seed: 7102,
    caption: 'buzz + sein alu-hut (blick aus reihe 31)',
  },
  { day: 1, seed: 7103, caption: 'nova + gerald das keytar!!!' },
  { day: 1, seed: 7104, caption: 'das is entweder mo oder ne box' },
  {
    day: 2,
    seed: 7105,
    caption: 'NEU!!! das publikum. ich bin da irgendwo drin',
  },
  {
    day: 2,
    seed: 7106,
    caption: 'NEU!!! das licht bei space girl (ich hab geheult)',
  },
  {
    day: 5,
    seed: 7107,
    caption: 'freitag!!! von nem fan eingeschickt. danke fürs einschicken',
  },
  {
    day: 5,
    seed: 7108,
    caption: 'freitag!!! die erste reihe hat SO ein glück',
  },
  ...TINFOIL_PICS_WEEK2,
];

export const TINFOIL_GUESTBOOK: readonly GuestbookEntry[] = [
  {
    day: 1,
    name: 'xX_CometGirl_Xx',
    message:
      'erste!!! willkommen in meinem gästebuch!!! seid nett. kein spam. KEINE SPACE GIRL HATER',
  },
  {
    day: 1,
    name: 'spacegirl4eva',
    message:
      'space girl is der beste song, der je geschrieben wurde. keine fragen bitte',
  },
  {
    day: 1,
    name: 'dave_k',
    message:
      'schöne seite. ich glaub dein zähler is kaputt, der geht immer weiter hoch',
  },
  {
    day: 1,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      'OMG OMG ICH HAB IM RADIO KARTEN GEWONNEN!!!!! 2 KARTEN!!! FREITAG!!! ZIGGY WENN DU DAS LIEST ICH BIN DIE DIE SCHREIT (L) (L) (L)',
  },
  {
    day: 2,
    name: 'robot_cover_guy',
    message:
      'wer hat den roboter auf hello robot gemalt. ich muss das wissen. der hat mein leben verändert',
  },
  {
    day: 2,
    name: 'xX_CometGirl_Xx',
    message: '@robot_cover_guy er heißt KEVIN. neue fotos sind auch online!!!',
  },
  {
    day: 3,
    name: 'pia (L) ponys (L)',
    message:
      'die band is ok aber PONYS sind besser. ps ich darf nich zum konzert. ich hab mama gesagt das is UNFAIR!!',
  },
  {
    day: 3,
    name: '~*ambr*~',
    message:
      'deine seite is SO toll!!! die hamster sind SO süß. trag dich bei mir auch ein!!!',
  },
  {
    day: 4,
    name: 'marco',
    message:
      'solide rhythmusgruppe. der bassist wird sträflich unterschätzt. der hintergrund tut in den augen weh. die hamster sind in ordnung. 6/10',
  },
  {
    day: 4,
    name: 'ticketlose_tina',
    message:
      'hat jemand noch ne karte für freitag übrig. tausche dafür meine komplette gelstift-sammlung',
  },
  {
    day: 5,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      'ICH WAR DA!!!! ERSTE REIHE!!!! ziggy hat den drumstick-wirbel gemacht und ihn GEWORFEN und ICH HAB IHN GEFANGEN. ok erst hat er mich im gesicht getroffen. ZÄHLT TROTZDEM. beste nacht ALLER ZEITEN (L)',
  },
  {
    day: 5,
    name: 'xX_CometGirl_Xx',
    message:
      '@jess DU HAST DEN DRUMSTICK GEFANGEN??? ich bin so neidisch ich muss mich hinlegen',
  },
  ...TINFOIL_GUESTBOOK_WEEK2,
];
