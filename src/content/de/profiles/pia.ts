// Pia's German Friendspace profile: bossy, Ponys (never „Ponies“), Sternenstaub is the queen, Keks the
// dog is a suspect. Same days and theme colours; the stickers are German.
import { piaProfile as en } from '../../profiles/pia';
import type { ProfileContent } from '../../profiles/types';

export const piaProfile: ProfileContent = {
  ...en,
  headline: 'PONYS SIND DIE BESTEN. das is ein FAKT',
  mood: { text: 'bestimmerisch', emoticon: ':P' },
  aboutMe:
    'das is PIAS seite. ich hab 23 ponys und alle haben namen. sternenstaub is die KÖNIGIN. ' +
    'papa hat mir die seite gemacht und den rest hab ich gemacht. das is die beste seite auf friendspace. ' +
    '{name} wohnt im zimmer neben mir. leider. NICHT in mein zimmer gehen. NICHT meine seite nachmachen',
  wantToMeet:
    'ein ECHTES pony. kein spielzeug. ein echtes das bei uns im garten wohnt',
  interests: [
    {
      label: 'Musik',
      text: 'pony-lieder und was in papas auto im radio kommt',
    },
    { label: 'Filme', text: 'alle ponyfilme. manche zweimal' },
    {
      label: 'Fernsehen',
      text: 'zeichentrick. du hast mir nich zu sagen was ich gucke',
    },
    {
      label: 'Bücher',
      text: 'pferde-quiz-bücher. ich weiß wie ein baby-pferd heißt. weißt du das',
    },
    {
      label: 'Helden',
      text: 'Sternenstaub. und papa wenn ich an den laptop darf',
    },
  ],
  top8: [
    { kind: 'extra', name: 'Sternenstaub', seed: 'stardust' },
    { kind: 'contact', id: 'jess' },
    { kind: 'contact', id: 'kayla' },
    { kind: 'contact', id: 'marco' },
    { kind: 'contact', id: 'theo' },
    { kind: 'contact', id: 'dex' },
    { kind: 'extra', name: 'Keks', seed: 'biscuit' },
    { kind: 'player' },
  ],
  comments: [
    {
      day: 1,
      from: 'jess',
      contactId: 'jess',
      text: 'PIA deine seite is SO süß!!! der glitzer!!!',
    },
    {
      day: 1,
      from: 'ponyprinzessin_99',
      text: 'ich hab das lila auch!!! wir sind pony-zwillinge!!!',
    },
    {
      day: 2,
      from: 'ponyprinzessin_99',
      text: 'sternenstaub is VERMISST?? ich hoffe sie kommt nach hause :(',
    },
    {
      day: 2,
      from: 'kayla',
      contactId: 'kayla',
      text: 'pia ich liebe deine ponys. das mit sternenstaub tut mir leid :(',
    },
    {
      day: 3,
      from: 'Keks',
      text: 'wuff. (hier is papa. keks sagt er wars nicht)',
    },
    {
      day: 3,
      from: 'marco',
      contactId: 'marco',
      text: 'unschuldig bis zum beweis des gegenteils, zwerg. auch hunde',
    },
    {
      day: 4,
      from: 'dex',
      contactId: 'dex',
      text: 'im wäschekorb gefunden? kenn ich',
    },
    {
      day: 4,
      from: 'ponyprinzessin_99',
      text: 'SIE IS WIEDER DA!!! bester tag überhaupt!!!',
    },
    {
      day: 5,
      from: 'theo',
      contactId: 'theo',
      text: 'ich hab dir ein pony mit nem stern gemalt. is in meinem heft. sorry wegen der beine',
    },
    {
      day: 5,
      from: 'Keks',
      text: 'wuff. (wieder papa. keks nimmt das entschuldigungs-leckerli an)',
    },
  ],
  commentsOnPlayer: [
    {
      day: 2,
      text: 'STERNENSTAUB IS VERMISST. hast du sie genommen. antworte EHRLICH',
    },
    { day: 3, text: 'es war keks. fall abgeschlossen' },
    {
      day: 4,
      text: 'ich hab sie gefunden. NICHT fragen wo. und nich mama sagen',
    },
    {
      day: 5,
      text: 'guck dir deine hintergrundbilder an!!! das musst du jetzt FÜR IMMER nehmen',
    },
  ],
  theme: {
    ...en.theme,
    stickers: ['PONYS 4 EVER', '★ STERNENSTAUB ★', 'BETRETEN VERBOTEN'],
  },
};
