// German Friendspace bulletins, same ids, days and order as `src/content/friendspace/bulletins`.
// "repost" is „weiterschicken" (how German chain letters said it), "fw:" is „WG:".
import { g } from '../../gender';
import type { Bulletin } from '../../friendspace/types';

export const BULLETINS: readonly Bulletin[] = [
  // Tag 1: die Karten vom Radio-Gewinnspiel, Briannas Spruch, das Bio-Referat geht los.
  {
    id: 'd1-jess-comets-countdown',
    day: 1,
    from: { contactId: 'jess' },
    subject: 'COUNTDOWN ZU DEN TINFOIL COMETS!!!',
    body: 'nur noch n paar tage!!! wer kommt alles?? schickt das weiter wenn ihr DABEI seid ~*~',
    link: 'http://tinfoilcomets.example/',
  },
  {
    id: 'd1-kayla-survey',
    day: 1,
    from: { contactId: 'kayla' },
    subject: '~*bulletin-umfrage: 20 fragen über mich*~',
    body: [
      'schickt das mit euren antworten weiter!! ich LESE das',
      '1. name: kayla. logisch',
      '2. spitznamen: K, kay, drama-prinzessin (NICHT queen)',
      '3. augen: braun',
      '4. haare: heute perfekt. danke der nachfrage',
      '5. lieblingsfarbe: pink. offensichtlich',
      '6. lieblingslipgloss: der mit erdbeere',
      '7. lieblingslied grad: alles was traurig is',
      '8. lieblingshoodie: der gestreifte. ICH HATTE IHN ZUERST',
      '9. haustiere: Prinzessin (meine katze). der name is programm',
      '10. wen hast du zuletzt angeschrieben: {name}',
      '11. was hast du zuletzt gegessen: popcorn zum abendbrot. nich urteilen',
      '12. größte angst: dass wer meinen style kopiert',
      '13. kannst du geheimnisse behalten: ja. meistens',
      '14. schon mal im unterricht geheult: nein. (ja)',
      '15. beste freundin: leute die TREU sind',
      '16. schlimmste angewohnheit: alle 5 min mein profil checken',
      '17. lieblingsfach: große pause',
      '18. hassfach: bio. der froschgeruch *seufz*',
      '19. was hast du grad an: KEINE streifen. lange geschichte',
      '20. wer schickt das weiter: du. weil du treu bist ;)',
    ].join('\n'),
  },
  {
    id: 'd1-pia-pony-club',
    day: 1,
    from: { contactId: 'pia' },
    subject: 'PIAS PONYCLUB!!! (offiziell)',
    body:
      'PIAS PONYCLUB is jetzt OFFEN. treffen sind nach der schule in meinem zimmer. ' +
      'regeln: 1. man braucht ein pony. 2. sternenstaub NICHT anfassen. 3. nicht rennen. 4. pia is die chefin. ' +
      'papa is ehrenmitglied. keks is auf probe. {name} darf NICHT mitmachen. du weißt warum',
  },
  // Tag 2: Schild-Notfall, die Zwillings-Hoodies, der Velvet-Lantern-Flyer, Dex fängt an zu filmen.
  {
    id: 'd2-lexi-luck-chain',
    day: 2,
    from: { extra: 'lipgloss_lexi', seed: 'lipglosslexi' },
    subject: 'WG: WG: WG: VIEL GLÜCK',
    body: `schick das in 5 min weiter und ${g('du hast morgen den BESTEN haartag deines lebens', 'du stehst morgen deinen ersten kickflip')}. wenn nich hast du 7 tage pech. ich habs gemacht und es hat GEKLAPPT!!!`,
  },
  {
    id: 'd2-marco-not-a-chain-letter',
    day: 2,
    from: { contactId: 'marco' },
    subject: 'das ist kein kettenbrief',
    body:
      'nicht weiterschicken. dir passiert nichts. ' +
      'velvet lantern. live im bean cellar. nur eine nacht. der keller unterm café. ' +
      'das ding auf dem flyer ist eine laterne. keine suppe. das war das bulletin',
  },
  {
    id: 'd2-dex-new-pics',
    day: 2,
    from: { contactId: 'dex' },
    subject: 'neue fotos auf pixlog',
    body: 'filmen im park. ry hat die fotos gemacht. ich bin der wischer',
    link: 'http://pixlog.example/dex',
  },
  // Tag 3: Outfit-Krise, Kayla nicht eingeladen, Derek steigt aus, der Wackelpudding wackelt.
  {
    id: 'd3-kayla-repost-or-else',
    day: 3,
    from: { contactId: 'kayla' },
    subject: '~*wer das nich weiterschickt is nich mit mir befreundet*~',
    body:
      'ECHTE freunde schicken das weiter. falsche freunde scrollen weiter. ' +
      'manche leute verteilen rosa umschläge und vergessen bestimmte leute. ich sag nich wer. ' +
      'schick das in 10 min weiter wenn du zu den ECHTEN gehörst. ich merk wer weitergescrollt hat. ich merk das immer *seufz*',
  },
  {
    id: 'd3-cometgirl-crush-chain',
    day: 3,
    from: { extra: 'xX_CometGirl_Xx', seed: 'cometgirl' },
    subject: `WG: WG: WG: WG: ${g('SCHWARM-TEST!!!', 'HIGHSCORE-TEST!!!')}`,
    body: g(
      'Das ist KEIN Fake!!! schick das in 10 min weiter und dein schwarm bemerkt dich bis freitag!!! wenn nich sitzt er in JEDEM fach neben deiner SCHLIMMSTEN FEINDIN. ich habs weitergeschickt und er hat an der bushaltestelle hallo zu mir gesagt!!!',
      'Das ist KEIN Fake!!! schick das in 10 min weiter und du knackst bis freitag deinen highscore!!! wenn nich gibt dein controller im letzten level den geist auf. mein kleiner bruder hats weitergeschickt und den endgegner beim ersten versuch geschafft!!!',
    ),
  },
  {
    id: 'd3-jess-survey',
    day: 3,
    from: { contactId: 'jess' },
    subject: 'BULLETIN-UMFRAGE: 20 FRAGEN ÜBER MICH!!!',
    body: [
      'MACHT MIT!!! WEITERSCHICKEN!!! :D',
      '1. name: JESS',
      '2. alter: alt genug für konzerte',
      '3. lieblingsband: TINFOIL COMETS. nächste frage',
      '4. lieblingsmitglied: ZIGGY',
      '5. lieblingslied: alle. ok SPACE GIRL',
      '6. lieblingsfarbe: glitzer',
      '7. haustiere: ne katze. er glitzert jetzt. lange geschichte',
      '8. letztes konzert: noch keins. FREITAG!!!',
      '9. was ziehst du freitag an: NIX. ich hab NIX ZUM ANZIEHEN',
      '10. ok was ziehst du WIRKLICH an: kp!!! hilfe!!!',
      '11. schlechtester witz: warum musste die cd zum arzt? sie hatte nen sprung',
      '12. schlimmstes diese woche: ich hab COMETS falsch geschrieben. mit glitzerkleber',
      '13. bestes diese woche: ich hab KARTEN gewonnen!!! im RADIO!!!',
      `14. mit wem gehst du hin: {name}. ${g('BESTE KONZERTPARTNERIN DER WELT (L)', 'BESTER KONZERTPARTNER DER WELT (Y)')}`,
      '15. kannst du singen: ja. meine mama sagt nein',
      '16. lieblingsessen: nachos',
      '17. größte angst: die karten NOCHMAL verlieren',
      '18. dein zimmer is: voller poster. und glitzer',
      '19. was hast du zuletzt laut gesagt: „MAMA WO IS MEINE STERNCHENJEANS“',
      '20. deine stimmung grad: ALARMSTUFE PINK',
    ].join('\n'),
  },
  // Tag 4: noch einmal schlafen, Sternenstaub ist zurück, Derek steigt wieder ein, Referats-Nerven.
  {
    id: 'd4-jess-one-more-sleep',
    day: 4,
    from: { contactId: 'jess' },
    subject: 'NOCH 1 MAL SCHLAFEN!!!!!',
    body:
      'TINFOIL COMETS. MORGEN ABEND. RIVERSIDE ARENA. ' +
      'schild: FERTIG (mit pfotenabdruck). karten: hat meine mama. outfit: discokugel-modus. ' +
      'ich werd nich schlafen. ich werd nich essen. ich werd nur KREISCHEN. weiterschicken wenn ihr dabei seid!!!',
    link: 'http://friendspace.example/band/tinfoil-comets',
  },
  {
    id: 'd4-pia-new-pics',
    day: 4,
    from: { contactId: 'pia' },
    subject: 'NEUE FOTOS auf pixlog!! SIE IS WIEDER DA!!!',
    body: 'STERNENSTAUB IS WIEDER DA. es gibt fotos. NICHT fragen wo ich sie gefunden hab. der fall is ABGESCHLOSSEN',
    link: 'http://pixlog.example/pia',
  },
  {
    id: 'd4-derek-back',
    day: 4,
    from: { extra: 'derek (schlagzeug)', seed: 'derekdrums' },
    subject: 'AW: AW: AW: ich bin raus',
    body: 'ok ich bin wieder dabei. velvet lantern is AN. eine snare und ein eimer. der eimer is ne trommel. das tamburin bleibt',
    link: 'http://friendspace.example/band/velvet-lantern',
  },
  {
    id: 'd4-theo-luck-repost',
    day: 4,
    from: { contactId: 'theo' },
    subject: 'WG: VIEL GLÜCK',
    body:
      'ähm. tschuldigung. ich schick sowas sonst nie weiter. ' +
      'aber wir halten morgen unser bio-referat. also… nur für alle fälle. sorry für das bulletin',
  },
  // Tag 5: erste Reihe, der Drumstick, Übernachtungsparty überlebt, 11 Leute.
  {
    id: 'd5-jess-new-pics',
    day: 5,
    from: { contactId: 'jess' },
    subject: 'NEUE FOTOS auf pixlog!!! ERSTE REIHE!!!!!',
    body: 'ICH WAR IN DER ERSTEN REIHE. ICH HAB ZIGGYS DRUMSTICK GEFANGEN. es gibt FOTOS. (vom drumstick. und von meiner stirn)',
    link: 'http://pixlog.example/jess',
  },
  {
    id: 'd5-cometgirl-aftermath',
    day: 5,
    from: { extra: 'xX_CometGirl_Xx', seed: 'cometgirl' },
    subject: 'RIVERSIDE WAR DIE BESTE NACHT MEINES LEBENS!!!',
    body: 'JESS hat ziggys drumstick MIT DEM GESICHT gefangen!!! du bist ne LEGENDE jess. neue konzertfotos sind auf meiner seite!!!',
    link: 'http://tinfoilcomets.example/pics',
  },
  {
    id: 'd5-kayla-new-pics',
    day: 5,
    from: { contactId: 'kayla' },
    subject: '~*NEUE FOTOS auf pixlog: übernachtungsparty überlebt*~',
    body: 'die fotos von der übernachtungsparty sind drin. ja brianna is drauf. ja wir haben das gleiche eis. nein ich erklär das nich',
    link: 'http://pixlog.example/kayla',
  },
];
