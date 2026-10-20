// German Friendspace walls for week two, same days, authors and order as
// `src/content/friendspace/profiles/week2`, appended by `withWallWeek`. Jess: die Stirn → der
// Wettbewerb → Lakeview ausverkauft → 2. Platz → das Plektrum. Kayla: Fransen → die Wahl → 61 zu 61
// → Co-Klassensprecherinnen. Theo: die Kunstwand → das Poster. Marco: die Show im Juz (83). Pia:
// Operation Hamster → Sir Sternenstaub der Zweite. Dex: 41 Aufrufe → der Jam (Dritter). Extras
// heißen wie auf den Profilen (Mama, Tante Rita, derek (schlagzeug), Ry (mein bruder), Keks,
// froschfan_02). Tag 10 ist nach der Show. Zeilen an den Spieler mit `g()`; ein Junge kriegt (Y).
import { g } from '../../../gender';
import type { ProfileWeek } from '../../../friendspace/profiles/types';

export const JESS_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'kayla',
      contactId: 'kayla',
      text: 'deine stirn is LILA. sieht aber echt aus wie n stern. wenn man die augen zukneift',
    },
    {
      day: 6,
      from: 'dex',
      contactId: 'dex',
      text: 'zwei nägel. respekt',
    },
    {
      day: 7,
      from: 'pia',
      contactId: 'pia',
      text: 'darf ich den drumstick JETZT anfassen. er hängt an der wand. wände sind für alle',
    },
    {
      day: 7,
      from: 'xX_CometGirl_Xx',
      text: 'du machst doch beim wettbewerb mit oder??? ich schon!!! möge der beste fan gewinnen!!!',
    },
    {
      day: 8,
      from: 'marco',
      contactId: 'marco',
      text: 'lakeview ist am selben abend. nur so',
    },
    {
      day: 8,
      from: 'kayla',
      contactId: 'kayla',
      text: 'in 9 MIN ausverkauft?? das is ein verbrechen. ich würd für ein gesetz stimmen',
    },
    {
      day: 9,
      from: 'xX_CometGirl_Xx',
      text: '2. PLATZ!!! glückwunsch jess!!! gegen die nudeln zu verlieren war raub aber TROTZDEM!!!',
      graphic: 'thanks',
    },
    {
      day: 9,
      from: 'theo',
      contactId: 'theo',
      text: 'glückwunsch zum 2. platz. die collage war echt gut. sorry. ich mein. glückwunsch',
    },
    {
      day: 10,
      from: 'theo',
      contactId: 'theo',
      text: 'das schild war sehr gut lesbar. sorry',
    },
    {
      day: 10,
      from: 'dex',
      contactId: 'dex',
      text: 'hab den fang auf kassette. man hörts. diesmal mit der hand',
    },
  ],
  commentsOnPlayer: [
    {
      day: 8,
      text: `komm mit mir ins juz!!! NEUES SCHILD ${g('(L)', '(Y)')}`,
    },
    {
      day: 10,
      text: 'DER SCHREIN IS GEWACHSEN!!! drumstick + setlist + PLEKTRUM',
      graphic: 'thanks',
    },
  ],
};

export const KAYLA_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'lipgloss_lexi',
      text: 'NEUE FRANSEN??? kayla die sind perfekt. wer hat die geschnitten',
    },
    {
      day: 6,
      from: 'jess',
      contactId: 'jess',
      text: 'FRANSEN!!! DU SIEHST AUS WIE AUS NEM FILM!!!',
    },
    { day: 7, from: 'Brianna', text: 'schöne fransen ;)' },
    {
      day: 7,
      from: 'dex',
      contactId: 'dex',
      text: 'hab deine plakate gesehen. ostflur. sind ganz schön viele',
    },
    {
      day: 8,
      from: 'jess',
      contactId: 'jess',
      text: 'WÄHLT KAYLA!!! WÄHLT KAYLA!!! (ich hab dir auch ein schild gebastelt)',
    },
    {
      day: 8,
      from: 'marco',
      contactId: 'marco',
      text: 'nie wieder rätsel-hackbraten. der slogan hat meine stimme. ich geh da nicht mal hin',
    },
    { day: 9, from: 'Brianna', text: 'beide 61 lol' },
    {
      day: 9,
      from: 'pia',
      contactId: 'pia',
      text: 'UNENTSCHIEDEN?? in meiner klasse machen wir dann schnick schnack schnuck',
    },
    { day: 10, from: 'Brianna', text: 'du auch' },
    {
      day: 10,
      from: 'theo',
      contactId: 'theo',
      text: 'glückwunsch, co-klassensprecherin. euch beiden. sorry. ich mein. glückwunsch',
    },
  ],
  commentsOnPlayer: [
    { day: 7, text: 'wähl mich. sonst… ;)' },
    {
      day: 9,
      text: g(
        'hilf mir morgen beim outfit aussuchen!! du hast den besten blick ~*~',
        '61 zu 61. eine jungsstimme mehr und ich hätt gewonnen. trotzdem danke fürs wählen (Y)',
      ),
    },
  ],
};

export const THEO_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'froschfan_02',
      text: 'deine frösche hängen jetzt an ner WAND?? in der schule?? legende',
    },
    {
      day: 6,
      from: 'Mama',
      text: 'Herr Dalton hat angerufen. Er hat „stolz“ gesagt. Ich habe ein bisschen geweint. Hab dich lieb, Mama',
    },
    {
      day: 7,
      from: 'marco',
      contactId: 'marco',
      text: 'du zeichnest. ich brauche ein poster. red mit dem zwerg',
    },
    {
      day: 7,
      from: 'jess',
      contactId: 'jess',
      text: 'THEO MACH ES KNALLIG. oder nich. du bist der künstler',
    },
    { day: 8, from: 'kayla', contactId: 'kayla', text: 'entwurf A. ganz klar' },
    {
      day: 8,
      from: 'dex',
      contactId: 'dex',
      text: 'entwurf B. der eimer is was für kenner',
    },
    {
      day: 9,
      from: 'pia',
      contactId: 'pia',
      text: 'ich hab dein poster im einkaufszentrum gesehen. ich hab mama gesagt du bist BERÜHMT',
    },
    {
      day: 9,
      from: 'marco',
      contactId: 'marco',
      text: 'die poster sind gut. es ist eine laterne. keiner hat nach suppe gefragt',
    },
    {
      day: 10,
      from: 'Tante Rita',
      text: 'Ich habe DREI Poster mitgenommen!!! Liebe Grüße, Tante Rita',
    },
    {
      day: 10,
      from: 'Mama',
      text: 'Dein Poster hängt am Kühlschrank. Hab dich lieb, Mama',
    },
  ],
  commentsOnPlayer: [
    {
      day: 9,
      text: g(
        'wir sehen uns weiter hinten. sorry. :)',
        'letzte-reihe-crew. sorry',
      ),
    },
    { day: 10, text: 'danke, dass du mit mir hinten gestanden hast' },
  ],
};

export const MARCO_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'Tante Rita',
      text: 'Das Jugendzentrum!!! Ich bringe auch ein Schild mit!!! Liebe Grüße, Tante Rita',
    },
    {
      day: 6,
      from: 'jess',
      contactId: 'jess',
      text: 'IM JUZ!!! DIESMAL ECHT??? GLÜCKWUNSCH MARCO!!!',
    },
    { day: 7, from: 'derek (schlagzeug)', text: 'in jedem song' },
    {
      day: 7,
      from: 'theo',
      contactId: 'theo',
      text: `ähm. hi. ${g('deine cousine', 'dein cousin')} hat mich wegen nem poster gefragt. ich hab ja gesagt. sorry. ich mein. ja`,
    },
    {
      day: 8,
      from: 'derek (schlagzeug)',
      text: 'ok 3 songs. aber bei nem 4. darf ich ihn umtreten. so is der deal',
    },
    {
      day: 8,
      from: 'dex',
      contactId: 'dex',
      text: 'darf ich die show filmen. wenn ich ne kassette find',
    },
    {
      day: 9,
      from: 'theo',
      contactId: 'theo',
      text: 'das poster ist fertig. sorry, dass es 2 tage gedauert hat',
    },
    {
      day: 9,
      from: 'kayla',
      contactId: 'kayla',
      text: 'in ein kopfüber hängendes mikro singen is SO avantgarde ~*~',
    },
    {
      day: 10,
      from: 'Tante Rita',
      text: '83!!! Ich habe mitgezählt!!! Liebe Grüße, Tante Rita',
    },
    {
      day: 10,
      from: 'pia',
      contactId: 'pia',
      text: 'nächstes jahr komm ich mit. mama hats VERSPROCHEN. so halb',
    },
  ],
  commentsOnPlayer: [
    { day: 8, text: 'dein song. mach es nicht komisch' },
    {
      day: 10,
      text: g(
        'erste reihe. na ja. eine reihe',
        'beste crew im geschäft. einzige crew',
      ),
    },
  ],
};

export const PIA_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'Mama',
      text: 'Ich habe die 10 Gründe gelesen. Wir reden noch. Hab dich lieb, Mama',
    },
    {
      day: 6,
      from: 'dex',
      contactId: 'dex',
      text: 'grund 7 war gut. der mit dem laufrad',
    },
    {
      day: 7,
      from: 'marco',
      contactId: 'marco',
      text: 'ein schloss für einen hamster. das ist mehr als mein wg-zimmer',
    },
    {
      day: 7,
      from: 'Mama',
      text: 'Ein schöner Vortrag. Sehr professionell. Hab dich lieb, Mama',
    },
    { day: 8, from: 'Keks', text: 'wuff (kein hamster)' },
    {
      day: 8,
      from: 'Mama',
      text: 'Das hat Keks nicht geschrieben. Hab dich lieb, Mama',
    },
    {
      day: 9,
      from: 'ponyprincess_99',
      text: 'ein FISCH!!! sir sternenstaub der zweite is der beste name ÜBERHAUPT!!!',
    },
    {
      day: 9,
      from: 'marco',
      contactId: 'marco',
      text: 'sir sternenstaub. guter name. stark',
    },
    {
      day: 10,
      from: 'Mama',
      text: 'Nächstes Jahr, Mäuschen. Hab dich lieb, Mama',
    },
    {
      day: 10,
      from: 'dex',
      contactId: 'dex',
      text: 'du kannst die kassette gucken. is im grunde die show',
    },
  ],
  commentsOnPlayer: [
    { day: 6, text: 'STIMM FÜR DEN HAMSTER' },
    { day: 9, text: 'komm SIR STERNENSTAUB DEN 2. kennenlernen (anklopfen)' },
  ],
};

export const DEX_WEEK2: ProfileWeek = {
  comments: [
    {
      day: 6,
      from: 'Ry (mein bruder)',
      text: '41 aufrufe. 30 davon sind von ihm',
    },
    {
      day: 6,
      from: 'jess',
      contactId: 'jess',
      text: '41 AUFRUFE!!! DEX DU BIST BERÜHMT!!!',
    },
    { day: 7, from: 'Kickflip_Kev', text: 'JAM. DU. TAG 9' },
    {
      day: 7,
      from: 'marco',
      contactId: 'marco',
      text: 'ein contest. fall nicht hin. oder doch. ist kunst',
    },
    {
      day: 8,
      from: 'Ry (mein bruder)',
      text: 'der is seit 7 uhr früh im skatepark. bringt ihm n brot',
    },
    {
      day: 8,
      from: 'kayla',
      contactId: 'kayla',
      text: 'viel glück beim jam dex!! wahlkampf-regel: immer lächeln',
    },
    {
      day: 9,
      from: 'sam_grabs',
      text: 'dritter. nich schlecht für nen filmer',
    },
    {
      day: 9,
      from: 'pia',
      contactId: 'pia',
      text: 'du hast ne KASSETTE?? von 2007?? das is DIESES jahr',
    },
    { day: 10, from: 'Ry (mein bruder)', text: 'die kassette gehört MIR' },
    {
      day: 10,
      from: 'theo',
      contactId: 'theo',
      text: 'danke fürs filmen. sorry, falls ich drauf bin. ich stand ziemlich weit hinten',
    },
  ],
  commentsOnPlayer: [
    { day: 9, text: 'dritter. thx fürs anheizen' },
    { day: 10, text: 'besonderer dank: du' },
  ],
};
