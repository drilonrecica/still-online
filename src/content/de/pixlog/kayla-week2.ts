// Kayla on Pixlog in German, days 6–10, same structure as `src/content/pixlog/kayla-week2`:
// ~*drama-prinzessin*~ im Wahlkampf. Der Pony (Tag 6), Klassensprecherwahl gegen Brianna (7; Album),
// die Rede (8), 61 zu 61 (9) und Co-Klassensprecherinnen, aus Versehen im Partnerlook (10).
// „Pony" (die Frisur) nur in ihren eigenen Zeilen; die anderen sagen „frisur".
import { g } from '../../gender';
import type { PixlogWeek } from '../../pixlog/types';

export const kaylaPixlogWeek2: PixlogWeek = {
  albums: [
    {
      id: 'kayla-campaign',
      day: 7,
      title: '~*pony + wahlkampf*~',
      photos: [
        {
          photo: {
            scene: 'selfportrait',
            seed: 5231,
            day: 6,
            look: 'long',
            caption: '~*pony. tag 1. ich bereue nix*~',
          },
          comments: [
            { day: 7, from: 'lipgloss_lexi', text: 'die FRISUR. kult' },
            {
              day: 7,
              from: 'jess',
              text: 'DU SIEHST AUS WIE NE POPSÄNGERIN!!!',
            },
          ],
        },
        {
          photo: {
            scene: 'selfportrait',
            seed: 5232,
            day: 7,
            look: 'long',
            caption: '~*pony. tag 2. bereue immer noch nix. ok n bisschen*~',
          },
          comments: [
            { day: 7, from: 'Brianna', text: 'schicke frisur ;)' },
            { day: 7, from: 'kayla', text: 'ich WEISS' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5233,
            day: 7,
            caption:
              'die liste zum eintragen. 4 minuten vor schluss. SCHICKSAL',
          },
          comments: [
            { day: 7, from: 'pia', text: 'darf ich wählen. ich bin fast 10' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5234,
            day: 7,
            caption:
              'meine plakate. ostflur. briannas hängen direkt neben meinen. zufall?? NEIN',
          },
          comments: [
            { day: 7, from: 'dex', text: 'ganz schön viele plakate' },
            { day: 8, from: 'marco', text: 'wählt den hackbraten' },
          ],
        },
        {
          photo: {
            scene: 'classroom',
            seed: 5235,
            day: 7,
            caption: '~*wahlkampfzentrale*~ (mein tisch in der ersten stunde)',
          },
          comments: [
            {
              day: 7,
              from: 'theo',
              text: 'schöne schrift. sorry. mir fällt schrift immer auf',
            },
            { day: 8, from: 'jess', text: 'WÄHLT KAYLA!!!' },
          ],
        },
      ],
    },
  ],
  blog: [
    {
      id: 'kayla-politics',
      day: 7,
      title: '~*politik*~',
      body:
        'also. brianna kommt rein. mit PONY. MEINEM pony. und trägt sich für die klassensprecherwahl ein.\n\n' +
        'also hab ich mich auch eingetragen. 4 minuten vor schluss.\n\n' +
        'friedensvertrag: ausgesetzt. das nennt man POLITIK. kannste nachschlagen *seufz*',
    },
    {
      id: 'kayla-co-reps',
      day: 10,
      title: '~*co-klassensprecherinnen*~',
      body:
        'es stand 61 zu 61. dr. hargrove hat gesagt wir sind jetzt CO-KLASSENSPRECHERINNEN. alle beide. 1 job.\n\n' +
        'dann sind wir zur show. im GENAU gleichen zeug. bis zum HAARGUMMI. brianna hat gesagt „du auch“.\n\n' +
        'wir sind keine freundinnen. wir sind co-klassensprecherinnen.\n\n' +
        '...ok wir sind freundinnen ~*überraschende wendung*~',
    },
  ],
  shouts: [
    { day: 6, text: '~*neue frisur. neues ich*~' },
    { day: 6, text: '~*pony: eine lebenseinstellung*~' },
    { day: 7, text: '~*es geht LOS*~' },
    { day: 8, text: '~*schreib ne rede. bitte nich stören*~' },
    {
      day: 8,
      text: 'pony UND köpfchen oder NIE WIEDER RÄTSEL-HACKBRATEN. ~*das volk entscheidet*~',
    },
    { day: 9, text: '~*wahltag. bitte warten*~' },
    { day: 9, text: '~*61 zu 61. ich kann nich mehr*~' },
    { day: 10, text: '~*co-klassensprecherin*~ (lange geschichte)' },
    {
      day: 10,
      text: g(
        '~*partnerlook. frag nich*~ danke für die hilfe gestern (L)',
        '~*partnerlook. frag nich*~ (Y)',
      ),
    },
  ],
  kudosToPlayer: [10],
  guestbook: [
    {
      day: 7,
      from: 'Brianna',
      text: 'schicke frisur. möge die bessere frisur gewinnen ;)',
    },
    {
      day: 10,
      from: 'jess',
      text: 'CO-KLASSENSPRECHERINNEN!!! UND IHR WART IM PARTNERLOOK!!! DAS UNIVERSUM IS SO KOMISCH!!!',
    },
  ],
};
