// German tinfoilcomets.example, days 6–10 (`src/content/sites/tinfoilcomets-week2`): CometGirl's
// marquee, the Fan-Art-Wettbewerb winners on `/pics` (day 9) and the guestbook, in the same German
// fan-girl voice (lowercase, CAPS, „!!!“). Lakeview Festwiese sells out on day 8 („ausverkauft“) and
// is played on day 10; friends sign in their German voices (Marco: lowercase, never „!“).
import type { GuestbookEntry } from '../../sites/types';
import type { ConcertPic, DayText } from '../../sites/tinfoilcomets';

export const TINFOIL_NEWS_WEEK2: readonly DayText[] = [
  {
    day: 6,
    text: 'konzertbericht: IMMER NOCH baustelle (steht aber im KOMETEN-KLATSCH)',
  },
  {
    day: 7,
    text: 'FAN-ART-WETTBEWERB!!! thema: die comets im weltall. abgabe MORGEN',
  },
  {
    day: 8,
    text: 'LAKEVIEW: AUSVERKAUFT in 9 MIN. ich hab keine karten bekommen. SCHON WIEDER',
  },
  {
    day: 8,
    text: 'wettbewerb: 14 einsendungen!!! ich bin die ganze nacht jury',
  },
  { day: 9, text: 'DIE GEWINNER!!! siehe fotos' },
  { day: 10, text: 'lakeview war HEUTE ABEND. ich habs im radio gehört' },
  {
    day: 10,
    text: 'buzz hat seinen hut im wind verloren. ICH hätte ihn gefangen',
  },
];

/** The three winning fan art entries, photographed at home (not concert pics). */
export const TINFOIL_PICS_WEEK2: readonly ConcertPic[] = [
  {
    day: 9,
    seed: 7109,
    scene: 'livingroom',
    caption:
      '1. PLATZ!!! das makkaroni-keytar von spacegirl4eva (24 tasten. hab gezählt)',
  },
  {
    day: 9,
    seed: 7110,
    scene: 'party',
    caption:
      '2. PLATZ!!! die glitzer-collage von jess (ziggys drumstick-wirbel. IM WELTALL)',
  },
  {
    day: 9,
    seed: 7111,
    scene: 'classroom',
    caption: '3. PLATZ!!! kevin der roboter von robot_cover_guy (er piept)',
  },
];

export const TINFOIL_GUESTBOOK_WEEK2: readonly GuestbookEntry[] = [
  {
    day: 6,
    name: 'pia (L) ponys (L)',
    message:
      'DEINE HAMSTER SIND SÜSS. ich krieg auch einen (vielleicht). ich schreib grad auf warum ich einen brauche. das sind schon 3 seiten!!',
  },
  {
    day: 6,
    name: 'dave_k',
    message:
      'dein zähler is schon wieder hochgegangen. ich glaub das bin ich. ich guck dauernd nach',
  },
  {
    day: 7,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      'ICH MACH MIT!!! GLITZER-COLLAGE. ZIGGY WIRD SIE SEHEN. (WIRD ER NICH ABER IN MEINEM HERZEN SCHON)',
  },
  {
    day: 7,
    name: 'spacegirl4eva',
    message: 'ich mach auch mit. mehr sag ich nich. holt schon ma ne gabel',
  },
  {
    day: 8,
    name: 'ticketlose_tina',
    message:
      '9 MINUTEN. ich hatte das telefon schon in der hand. ich tausch meine gelstifte UND meine schwester',
  },
  {
    day: 8,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      'AUSVERKAUFT. ICH TRAG SCHWARZ. (MEINE SOCKEN GLITZERN ABER DER REST IS SCHWARZ.) ES IS DIESELBE NACHT WIE DIE SHOW IM JUZ, UND DA GEH ICH HIN. ABER ICH BIN TROTZDEM TRAURIG. IN GROSSBUCHSTABEN',
  },
  {
    day: 9,
    name: 'xX~JeSs~Xx :D',
    homepage: 'friendspace.example/jess',
    message:
      '2. PLATZ!!! ICH HAB GEGEN NUDELN VERLOREN UND MIR GEHTS GUT. NE SIGNIERTE SETLIST!!! ZIGGY HAT SEINEN NAMEN ZWEIMAL DRAUFGESCHRIEBEN. DER DRUMSTICK HAT JETZT NEN FREUND (L)',
  },
  {
    day: 9,
    name: 'robot_cover_guy',
    message:
      '3. platz. kevin piept vor freude. glückwunsch ans keytar. sah lecker aus',
  },
  {
    day: 10,
    name: 'marco',
    message:
      'das plektrum war meins. ich hab erst nein gesagt. der drumstick ist trotzdem besser. 7/10',
  },
  {
    day: 10,
    name: 'xX_CometGirl_Xx',
    message:
      '@jess nen DRUMSTICK und ne SETLIST und jetzt auch noch n PLEKTRUM??? dein schrein is größer als meine seite',
  },
];
