// German kickflipkings.example, days 6–10 (`src/content/sites/kickflipkings-week2`): Kevs News (eine
// am Tag), die Shoutbox (3–4 am Tag), der Aufrufe-Zähler auf `/video` (41 → 212) und Kevs 6-Sekunden-
// Clip von Dex beim Westfield Jam (Tag 9). Gleiche Tage, Autoren und Zahlen wie im Englischen; die
// Änderungen an Crew und Konzerten stehen an ihren Einträgen in `kickflipkings.ts`.
import type { NewsPost, Shout, SkateVideo } from '../../sites/types';

export const KICKFLIP_NEWS_WEEK2: readonly NewsPost[] = [
  {
    day: 6,
    title: '41 AUFRUFE',
    author: 'Kickflip_Kev',
    body: 'das dex-video hat 41 aufrufe!!! dex sagt, so 30 davon is er selber. bleiben immer noch 11 fremde. 11!! das is ein ganzer bean cellar. sagts euren freunden. sagts euren müttern',
  },
  {
    day: 7,
    title: 'DER WESTFIELD JAM: übermorgen, im park',
    author: 'Kickflip_Kev',
    body: 'n echter skate-contest in unserem park!!! crew-liste: kev, sam, rico, dex. big mike aus riverside kommt auch. klassen: street und rampe. rico wollte ne manual-klasse. es gibt keine manual-klasse. helm mitbringen, sonst lässt sam euch nich rein',
  },
  {
    day: 8,
    title: 'konzert-alarm: velvet lantern im juz (dex filmt)',
    author: 'Kickflip_Kev',
    body: 'samstag im jugendzentrum westfield. einlass ab 6, ohne altersbeschränkung. The Grip Tapes spielen vorher!!! (skate-punk, 3 songs, einer übern regen.) dex filmt das ganze ding (er sagt, er findet noch ne kassette). boards bleiben wieder draußen. alles auf der konzertseite',
  },
  {
    day: 9,
    title: 'JAM-ERGEBNISSE: sam 1., big mike 2., DEX 3.',
    author: 'Kickflip_Kev',
    body: 'was fürn tag. sam hat das ganze ding mit nem ollie über 3 boards gewonnen. big mike hat nen 360 flip gemacht, da musste rico sich hinsetzen. und DEX HAT DEN KICKFLIP GESTANDEN. vor allen. UND ICH HABS GEFILMT. deckel AB. 3. platz = n sticker-pack und ne leere kassette. der clip is auf der videoseite',
  },
  {
    day: 10,
    title: 'das juz. dex hats gefilmt. auf ner kassette von 2007',
    author: 'Kickflip_Kev',
    body: 'velvet lantern hat heute abend im jugendzentrum gespielt. 83 leute. passen 80 rein. der schlagzeuger hat auf nem farbeimer gespielt. der sänger hat das mikro nen ganzen song lang verkehrt rum gehalten. dex hat alles auf seine neue jam-kassette gefilmt. ich hab nix gefilmt. ich hab getanzt. bereu nix',
  },
];

export const KICKFLIP_SHOUTS_WEEK2: readonly Shout[] = [
  { day: 6, user: 'sam_grabs', text: '30 davon is dex' },
  { day: 6, user: 'dex.kickflip', text: 'so 30. vllt 31' },
  { day: 6, user: 'grindrail_gary', text: 'lädt immer noch. 99%. tag 2' },
  { day: 6, user: 'Kickflip_Kev', text: '41!!! die kings sind BERÜHMT' },
  {
    day: 7,
    user: 'Kickflip_Kev',
    text: 'JAM!!! wer sich einträgt, kommt auch',
  },
  { day: 7, user: 'rico.manual', text: 'manual-klasse oder ich bin raus' },
  {
    day: 7,
    user: 'sam_grabs',
    text: 'big mike aus riverside kommt. der is riesig. aber nett',
  },
  { day: 8, user: 'dex.kickflip', text: 'üb grad. nich anschreien' },
  {
    day: 8,
    user: 'skaterboi_14',
    text: 'hab dex um 7 uhr morgens im park gesehen. er mich nich. er hat geflippt',
  },
  {
    day: 8,
    user: 'Kickflip_Kev',
    text: 'jam is MORGEN. wasser mitbringen. und euren helm (sam hat gesagt, ich muss das hinschreiben)',
  },
  { day: 9, user: 'Kickflip_Kev', text: 'ICH HABS GEFILMT. deckel AB' },
  {
    day: 9,
    user: 'sam_grabs',
    text: '1.!!! big mike wurde beschissen. dex wurde NICH beschissen. dex war der hammer',
  },
  { day: 9, user: 'PizzaRolls4Life', text: 'is der jam ein spiel' },
  {
    day: 9,
    user: 'rico.manual',
    text: 'es gab keine manual-klasse. ich bin raus. (ich war den ganzen tag da)',
  },
  { day: 10, user: 'dex.kickflip', text: '83 leute. 1 plektrum' },
  { day: 10, user: 'sam_grabs', text: 'war da. laut. gut' },
  {
    day: 10,
    user: 'grindrail_gary',
    text: '212 aufrufe und ich häng immer noch bei 99%',
  },
];

/** Was Woche zwei auf der `/video`-Seite dazubringt. */
export const KICKFLIP_VIDEO_WEEK2: Pick<SkateVideo, 'views' | 'clip'> = {
  views: [
    { day: 6, views: 41 },
    { day: 7, views: 58 },
    { day: 8, views: 77 },
    { day: 9, views: 140 },
    { day: 10, views: 212 },
  ],
  clip: {
    day: 9,
    title: 'NEU: kevs clip. dex beim westfield jam',
    length: '0:06',
    text: '6 sekunden. deckel AB. man sieht den pop, den flip, die landung und dann wackelt die kamera, weil ich FETT geschrien hab. lädt nich mal. is zu kurz zum laden',
  },
};
