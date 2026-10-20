// German cheatcave.example, days 6–10 (`src/content/sites/cheatcave-week2`): CaveKings News (ein oder
// zwei am Tag), zwei neue Clips (Omas Bingo-Serie an Tag 7, Dereks verkehrtes Mikro aus dem Juz an
// Tag 10, der neue Platz 1) und Antworten im Forum: Marcos LAN-Revanche (7), Theos Poster (8), Dex
// auf Kassette beim Jam (9), Kev war dabei (10). Gleiche Tage, Ids, Aufrufe, Szenen und Nicknames.
import type { ForumPost, FunnyClip, NewsPost } from '../../sites/types';

export const CHEATCAVE_NEWS_WEEK2: readonly NewsPost[] = [
  {
    day: 6,
    title: 'Galaxy Raiders 3: der BIGBRAIN-code geht IMMER NOCH',
    author: 'CaveKing',
    body: 'ein leser wollte wissen, ob BIGBRAIN nach dem patch noch geht. wir habens getestet. ZWEIMAL. titelbildschirm, eintippen, alle kriegen nen riesenkopf. wenns bei euch nich geht, habt ihr BIGBRIAN getippt. jeder tippt BIGBRIAN',
  },
  {
    day: 7,
    title: 'Zombie-Mensa 2?!',
    author: 'CaveKing',
    body: 'der typ, der Zombie-Mensa gemacht hat, hat ein bild auf seine seite gestellt. da is ein mensa-tablett drauf. mit ner 2. mehr wissen wir nich. das REICHT. das sind die größten news seit den kühen in Tiny Tank Takedown 2',
  },
  {
    day: 7,
    title: 'neuer clip: oma gewinnt VIER mal hintereinander beim bingo',
    author: 'CaveKing',
    body: 'im saal wirds still. sie ruft bingo. schon wieder. ein mann hinten wirft seinen kuli weg. guckts euch auf der clips-seite an. bingo gewinnt immer. wir machen die regeln nich',
  },
  {
    day: 8,
    title: 'Thunder Kart: die regenbogen-strecke is FAKE',
    author: 'CaveKing',
    body: 'wisst ihr noch, der leser mit der 13. strecke aus regenbogen? er hat die fotos geschickt. das war sein kleiner bruder mit ner taschenlampe vorm fernseher. netter versuch. immer noch 12 strecken. die abkürzung bei der palme gibts aber echt',
  },
  {
    day: 9,
    title: 'FLASH-SPIEL DER WOCHE: Goldfisch-Ausbruch',
    author: 'CaveKing',
    body: 'ihr seid ein goldfisch. ihr brecht aus. das glas is sehr klein. is schwerer als es klingt und lädt mit modem in unter einer minute. tipp: springen, wenn die katze blinzelt',
  },
  {
    day: 9,
    title: 'OFFIZIELL: Galaxy Raiders 4 kommt NICH',
    author: 'CaveKing',
    body: 'mein cousin kennt nen typen, der in nem laden arbeitet, der spiele verkauft. der typ sagt nein. also hört auf zu fragen. wir haben alle 40 threads mit dem titel „GR4??“ zugemacht, außer dem lustigen',
  },
  {
    day: 10,
    title: 'neuer platz 1: band-mikro geht nur verkehrt rum',
    author: 'CaveKing',
    body: 'heute abend hat ne band im jugendzentrum westfield gespielt und der sänger hat nen ganzen song VERKEHRT RUM ins mikro gesungen. wie ne fledermaus. das publikum hat zurückgesungen. die ära der pfütze is VORBEI. guckt euch die neuen top 10 an',
  },
  {
    day: 10,
    title: 'Oma Ninja hat ne geheime VERHÖHNUNG',
    author: 'CaveKing',
    body: 'Ninja Turbo Kombat: im kampf unten + tritt gedrückt halten und Oma Ninja setzt sich hin und strickt. macht 0 schaden. is der beste move im ganzen spiel',
  },
];

export const CHEATCAVE_CLIPS_WEEK2: readonly FunnyClip[] = [
  {
    id: 'bingo-grandma',
    day: 7,
    title: 'oma gewinnt 4 mal hintereinander beim bingo',
    length: '1:12',
    views: 31_337,
    uploader: 'b1ngo_barbara',
    photo: { scene: 'party', seed: 7312, caption: 'BINGO (schon wieder)' },
  },
  {
    id: 'upside-down-mic',
    day: 10,
    title: 'band-mikro geht nur verkehrt rum',
    length: '3:41',
    views: 131_072,
    uploader: 'derek_drums',
    photo: {
      scene: 'stage',
      seed: 7313,
      day: 10,
      caption: 'wie ne fledermaus. ne sehr laute fledermaus',
    },
  },
];

/** Antworten in den Threads aus Woche eins, nach Thread-Id, die ältesten zuerst. */
export const CHEATCAVE_FORUM_WEEK2: Readonly<
  Record<string, readonly ForumPost[]>
> = {
  'pc-vs-console': [
    {
      day: 6,
      user: 'DarkFlame2007',
      text: 'seit 2 tagen hat keiner was geschrieben, also gewinnt die KONSOLE. so is die regel. hab ich gemacht',
    },
    {
      day: 7,
      user: 'marco.bassline',
      text: 'heute abend lan-revanche. pc. also gewinnt diese woche der pc',
    },
    {
      day: 7,
      user: 'DarkFlame2007',
      text: 'wer bist du überhaupt (schon wieder)',
    },
  ],
  'ntk-level-4': [
    {
      day: 8,
      user: 'theo_k',
      text: 'sorry. ich kann diese woche nicht spielen. ich zeichne ein poster für eine band. sorry',
    },
    {
      day: 8,
      user: 'PizzaRolls4Life',
      text: 'ne BAND?? theo is jetzt berühmt. vergiss uns kleine leute nich',
    },
  ],
  'best-trick-irl': [
    {
      day: 9,
      user: 'dex.kickflip',
      text: 'kickflip. beim jam. diesmal auf kassette. kev hat sie',
    },
    {
      day: 9,
      user: 'Kickflip_Kev',
      text: 'ICH HAB SIE. 6 sekunden. deckel AB. kickflipkings.example/video',
    },
    {
      day: 10,
      user: 'Kickflip_Kev',
      text: 'der platz-1-clip mit dem verkehrten mikro? ich war da. dex hats von vorne gefilmt. derek von hinterm eimer',
    },
  ],
};
