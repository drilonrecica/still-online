// German cheatcave.example, same exports as `src/content/sites/cheatcave`. CaveKing schreibt wie
// in CheatCave Weekly: klein, „ihr“, „is“, „nich“, viele „!!“. Theo entschuldigt sich, Marco bleibt
// klein und trocken, ohne „!“. Spiele, Clips und Nicknames sind erfunden wie im Englischen.
import { g } from '../../gender';
import type {
  CheatGame,
  ForumThread,
  FunnyClip,
  NewsPost,
  SiteMeta,
} from '../../sites/types';

export const CHEATCAVE_HOST = 'cheatcave.example';

export const SITE_META: SiteMeta = {
  title: 'CheatCave - cheats. clips. games.',
  description:
    'CHEATS und Codes für Galaxy Raiders 3, Thunder Kart, Ninja Turbo Kombat, Minen, Hühnerjagd, Sternen-Flipper und MEHR. Flash-Spiele-News, die Top 10 der lustigsten Clips und ein Forum. TÄGLICH NEU!!',
  keywords: [
    'cheats',
    'codes',
    'cheatcodes',
    'spiele',
    'zocken',
    'flash-spiele',
    'tipps',
    'tricks',
    'clips',
    'forum',
    'galaxy raiders',
  ],
  pages: {
    '/': {
      title: 'CheatCave - cheats. clips. games.',
      keywords: ['news', 'neuigkeiten', 'flash', 'startseite'],
    },
    '/cheats': {
      title: 'CheatCave - Cheats + Codes',
      keywords: [
        'komplettlösung',
        'geheim',
        'freischalten',
        'minen',
        'hühnerjagd',
      ],
    },
    '/clips': {
      title: 'CheatCave - Top 10 lustige Clips',
      keywords: ['videos', 'lustig', 'lol', 'top 10'],
    },
    '/forum': {
      title: 'CheatCave - Forum',
      keywords: ['forum', 'brett', 'threads', 'hilfe'],
    },
  },
};

export const CHEATCAVE_TEXT = {
  title: 'CheatCave',
  tagline: 'cheats. clips. games.',
  updated: 'TÄGLICH NEU!!',
  owner: 'CaveKing',
  welcomeHeading: 'WILLKOMMEN IN DER HÖHLE',
  welcome: g(
    'hey zockerin!!! willkommen in der höhle. du bist offiziell cooler als 99% unserer besucher (die heißen alle Kevin)',
    'hey alter!!! willkommen in der höhle. schnapp dir nen cheat, guck nen clip, bleib a bisschen. füße abtreten',
  ),
  newsHeading: 'NEUESTE NEWS',
  sinceLine: 'du bist besucher nr.',
  sinceLineEnd: 'seit 2004!!',
  linkUsHeading: 'VERLINKT UNS!!',
  linkUs:
    'pack unseren button auf deine seite und CaveKing grüßt dich. (er beantwortet jede mail. irgendwann)',
  buttons: ['CheatCave', 'cheats drin', 'KEINE n00bs'],
  cheatsHeading: 'CHEATS + CODES',
  cheatsIntro:
    'such dir ein spiel aus!!! jeder cheat is von CaveKing persönlich GETESTET. (die witz-cheats auch. deshalb wissen wirs)',
  jokeLabel: 'WITZ-CHEAT (nich nachmachen):',
  noGame:
    'das spiel is (noch) nich in der höhle. such dir eins aus der liste aus!!',
  allGames: '« alle spiele',
  clipsHeading: 'TOP 10 LUSTIGE CLIPS',
  clipsIntro:
    'die lustigsten clips im ganzen internet, sortiert nach aufrufen. neue charts TÄGLICH (wenn CaveKing dran denkt)',
  clipsPlayer:
    'der clip-player braucht das neueste plugin. wir arbeiten dran. bis dahin: stells dir vor. is LUSTIG',
  forumHeading: 'CHEATCAVE-FORUM',
  forumIntro:
    'stell ne frage, krieg ne antwort. oder „n00b“. is halt das internet',
  forumClosed:
    'neue anmeldungen sind wegen spam-bots zu (danke auch, billig_klingeltoene_4u). lesen könnt ihr trotzdem alles!!',
  noThread: 'den thread gibts (noch??) nich. zurück ins forum!!',
  backToForum: '« zurück ins forum',
  bestViewed: 'am besten bei 800x600 und mit licht AUS',
  footer:
    '(c) 2004-2007 CheatCave. wir gehören zu keiner spielefirma. wir mögen nur spiele. SEHR',
};

/** Flash-Spiele-News, ein oder zwei am Tag. */
export const CHEATCAVE_NEWS: readonly NewsPost[] = [
  {
    day: 1,
    title: 'WILLKOMMEN IN DER NEUEN CHEATCAVE!!!',
    author: 'CaveKing',
    body: 'neues layout!!! neue farben!!! ein FORUM!!! hat 3 wochenenden gedauert und meine mutter denkt, ich mach hausaufgaben. guckt euch die cheats an und sagt hallo im forum. kein spam bitte',
  },
  {
    day: 1,
    title: 'FLASH-SPIEL DER WOCHE: Zombie-Mensa',
    author: 'CaveKing',
    body: 'bewerft zombies mit undefinierbarem fleisch, bis es klingelt. lädt mit modem ca. 2 minuten und es LOHNT sich. auf der cheats-seite steht der trick mit den milchtüten',
  },
  {
    day: 2,
    title: 'Thunder Kart: geheime strecke entdeckt?!',
    author: 'CaveKing',
    body: 'ein leser sagt: wer auf schwer jeden cup gewinnt, kriegt ne 13. strecke aus reinem regenbogen. noch keine fotos. fotos oder es is nie passiert!!! schickt sie uns',
  },
  {
    day: 3,
    title: 'CHEATCAVE WEEKLY #12 is raus!!',
    author: 'CaveKing',
    body: 'guckt in euer postfach!!! 99 leben in Galaxy Raiders 3, der turbostart und das goldene huhn. außerdem: 13.370 besucher. das is quasi ein stadion',
  },
  {
    day: 3,
    title: 'Tiny Tank Takedown 2 is DA',
    author: 'CaveKing',
    body: 'mehr panzer. kleinere panzer. jetzt gibts ein level mit kühen. die kühe sind auf niemandes seite. spielts in der mittagspause, bevor der computerraum abgeschlossen wird',
  },
  {
    day: 4,
    title: 'GERÜCHT: Galaxy Raiders 4?!',
    author: 'CaveKing',
    body: 'ein spielemagazin sagt: vielleicht nächstes jahr. der kumpel von meinem cousin sagt: vielleicht NIE. ich glaubs, wenn die packung im laden steht. bis dahin: 99 leben',
  },
  {
    day: 5,
    title: 'DER CHEAT, NACH DEM IHR ALLE GEFRAGT HABT: Oma Ninja',
    author: 'CaveKing',
    body: 'spielt in Ninja Turbo Kombat den arcade-modus durch, ohne EIN MAL zu blocken, und Oma Ninja gehört euch. sie wirft stricknadeln. sie is der beste charakter im ganzen spiel. kein witz',
  },
  {
    day: 5,
    title: 'neuer platz 1: typ will über ne pfütze springen',
    author: 'CaveKing',
    body: 'die ära „katze gegen deckenventilator“ is VORBEI. die pfütze gewinnt. guckt euch die neuen top 10 an!!',
  },
];

/** `/cheats?game=<id>`: sechs erfundene Spiele, dann die drei auf diesem Computer. */
export const CHEATCAVE_GAMES: readonly CheatGame[] = [
  {
    id: 'galaxy-raiders-3',
    name: 'Galaxy Raiders 3',
    genre: 'weltraum-shooter',
    blurb:
      'aliens abschießen. asteroiden ausweichen. in level 7 alle leben verlieren. ein klassiker',
    cheats: [
      {
        code: 'titelbildschirm: SPRUNG halten, LINKS LINKS RECHTS drücken',
        effect:
          'ihr startet mit 99 leben. (wenn ihr mit 0 startet, habt ihrs falsch gemacht)',
      },
      {
        code: 'welle 3: nur die blauen asteroiden abschießen',
        effect: 'gratis-schutzschild. hält 10 sekunden. gut einteilen',
      },
      {
        code: 'endgegner level 7: HINTER ihn fliegen',
        effect:
          'er kann sich nich umdrehen. sehr großes schiff, sehr kleines hirn',
      },
    ],
    joke: {
      code: 'im pausebildschirm GALAXY eintippen',
      effect: 'das spiel sagt „netter versuch“. haben wir ausprobiert',
    },
  },
  {
    id: 'thunder-kart',
    name: 'Thunder Kart',
    genre: 'kart-rennen',
    blurb: '8 karts, 12 strecken, 1 kaputte freundschaft pro rennen',
    cheats: [
      {
        code: 'GAS geben, genau wenn die ampel grün wird',
        effect: 'TURBOSTART. klappt immer. (klappt meistens)',
      },
      {
        code: 'auf Lava Loop um den vulkan durchdriften',
        effect: 'blaue funken = mini-boost. orange funken = GROSSER boost',
      },
      {
        code: 'Opa Blitz nehmen',
        effect:
          'schwerster fahrer im spiel. schubst alle von der strecke. auch dich',
      },
    ],
    joke: {
      code: 'auf der Regenbogenbrücke die augen zumachen',
      effect: 'ihr fallt runter. haben wir getestet. 6 mal',
    },
  },
  {
    id: 'ninja-turbo-kombat',
    name: 'Ninja Turbo Kombat',
    genre: 'prügelspiel',
    blurb: 'ninjas. turbo. kombat mit K, weil das cooler is',
    cheats: [
      {
        code: 'den arcade-modus durchspielen, ohne EIN MAL zu blocken',
        effect: 'schaltet Oma Ninja frei. bester charakter im spiel. kein witz',
      },
      {
        code: 'level 4: ÜBER den schirm-typen springen, in den rücken treten',
        effect:
          'von hinten kann er nich blocken. (danke an PizzaRolls4Life aus dem forum)',
      },
      {
        code: 'SCHLAG + BLOCK 3 sekunden halten',
        effect:
          'TURBO-schlag. der is laut. euer kleiner bruder will dann auch mal',
      },
    ],
    joke: {
      code: 'im titelbildschirm 100 mal START drücken',
      effect: 'passiert nix. aber euer daumen wird STARK',
    },
  },
  {
    id: 'rail-grind-pro-2',
    name: 'Rail Grind Pro 2',
    genre: 'skateboarden',
    blurb:
      'geländer grinden, bretter schrotten, nie knochen brechen. der traum',
    cheats: [
      {
        code: 'in der luft zweimal GRAB drücken',
        effect: 'doppel-grab, +500 punkte. landen oder verlieren',
      },
      {
        code: 'den zaun hinter der schule 10 mal grinden',
        effect: 'schaltet das geheime dach-level frei',
      },
      {
        code: 'im menü: hoch, hoch, runter, runter, GRAB',
        effect: 'mond-schwerkraft. jeder ollie is ein 900er. so ungefähr',
      },
    ],
    joke: {
      code: 'mitten im sprung den controller ausstecken',
      effect: 'euer skater hängt für immer in der luft. sehr entspannend',
    },
  },
  {
    id: 'zombie-lunchroom',
    name: 'Zombie-Mensa',
    genre: 'flash-spiel',
    blurb: 'undefinierbares fleisch gegen zombies. das fleisch is gruseliger',
    cheats: [
      {
        code: 'das fleisch in die ecken werfen',
        effect: 'prallt von den wänden ab und trifft so 3 zombies',
      },
      {
        code: 'die milchtüten aufheben',
        effect: 'zombies HASSEN milch. die werden 5 sekunden langsamer',
      },
      {
        code: 'in level 3 auf die küchenfrau warten',
        effect: 'die is auf eurer seite. sie hat ne kelle',
      },
    ],
    joke: {
      code: 'im informatikunterricht spielen',
      effect:
        'die lehrerin wird zum zombie. (nee, wird sie nich. sie wird SAUER)',
    },
  },
  {
    id: 'tiny-tank-takedown-2',
    name: 'Tiny Tank Takedown 2',
    genre: 'flash-spiel',
    blurb: 'winzige panzer. riesige explosionen. mittelgroße kühe',
    cheats: [
      {
        code: 'maustaste gedrückt halten',
        effect: 'lädt nen superschuss. loslassen, wenn das rohr glüht',
      },
      {
        code: 'hinter den kühen verstecken',
        effect: 'die halten kugeln ab. den kühen is das egal',
      },
      {
        code: 'zuerst die fässer abschießen',
        effect: 'kettenexplosion. 3 panzer zum preis von 1',
      },
    ],
    joke: {
      code: 'den panzer MAMA nennen',
      effect:
        'alle gegner bleiben stehen und rufen „KOMME GLEICH“. (gibts nich. wär aber cool)',
    },
  },
  {
    id: 'mines',
    name: 'Minen',
    genre: 'denkspiel (auf deinem computer!!)',
    blurb: 'zahlen, fähnchen und purer STRESS. steht im startmenü unter Spiele',
    cheats: [
      {
        code: 'erster klick: egal wohin',
        effect: 'der erste klick is IMMER sicher. immer. klickt in die mitte',
      },
      {
        code: 'auf ne zahl klicken, wenn alle ihre fähnchen stehen',
        effect: 'deckt alle anderen felder drumrum auf einmal auf. profi-move',
      },
      {
        code: 'zweimal rechtsklick',
        effect:
          'ein fragezeichen. für wenn ihr euch nich sicher seid. (ihr seid euch nie sicher)',
      },
    ],
    joke: {
      code: 'augen zu und klicken',
      effect: 'ihr verliert. aber ihr verliert ENTSPANNT',
    },
  },
  {
    id: 'henhunt',
    name: 'Hühnerjagd',
    genre: 'shooter (auf deinem computer!!)',
    blurb:
      'hühner. ein bauernhof. eine windmühle. die hühner finden das alles nich gut',
    cheats: [
      {
        code: 'VOR das goldene huhn zielen, nich drauf',
        effect: '100 punkte. das ding is SCHNELL',
      },
      {
        code: 'das fenster der windmühle beobachten',
        effect: 'da guckt manchmal ein huhn raus. bonuspunkte',
      },
      {
        code: 'nich auf die vogelscheuche schießen',
        effect: 'ihr hut kostet punkte. die STEHT da einfach nur',
      },
    ],
    joke: {
      code: 'bei jedem schuss PENG schreien',
      effect: '+0 punkte. +100 spaß',
    },
  },
  {
    id: 'pinball',
    name: 'Sternen-Flipper',
    genre: 'flipper (auf deinem computer!!)',
    blurb: 'planeten, flipper und ne rampe in den HYPERRAUM',
    cheats: [
      {
        code: 'alle 4 S-T-A-R-ziele aufleuchten lassen',
        effect: 'fetter bonus. die zuerst holen',
      },
      {
        code: 'die rampe treffen',
        effect: 'HYPERRAUM. klingt so cool, wie es aussieht',
      },
      {
        code: 'den ball auf dem hochgehaltenen flipper fangen',
        effect: 'anhalten, atmen, zielen. nich einfach rumflattern',
      },
    ],
    joke: {
      code: '2 millionen punkte holen',
      effect: 'fotos oder es is nie passiert',
    },
  },
];

/** Die Charts: die 10 meistgesehenen Clips bis heute (die Pfütze holt an Tag 5 Platz 1). */
export const CHEATCAVE_CLIPS: readonly FunnyClip[] = [
  {
    id: 'cat-vs-fan',
    day: 1,
    title: 'katze gegen deckenventilator (der katze gehts gut)',
    length: '0:34',
    views: 98_765,
    uploader: 'miezi_mike',
    photo: { scene: 'pet', seed: 7301, caption: 'die katze. vorher' },
  },
  {
    id: 'pool-dad',
    day: 1,
    title: 'mein vater gegen das planschbecken',
    length: '1:12',
    views: 87_210,
    uploader: 'grill_kid',
    photo: { scene: 'beach', seed: 7302, caption: 'das becken hat gewonnen' },
  },
  {
    id: 'snowman',
    day: 1,
    title: 'schneemann fällt auf meinen bruder (dem gehts gut)',
    length: '0:21',
    views: 76_543,
    uploader: 'frosty_fan99',
    photo: { scene: 'snow', seed: 7303, caption: 'RIP schneemann' },
  },
  {
    id: 'spoon-drummer',
    day: 1,
    title: 'drummer lässt die sticks fallen, spielt mit LÖFFELN weiter',
    length: '2:03',
    views: 65_002,
    uploader: 'rock_on_ryan',
    photo: { scene: 'concert', seed: 7304, caption: 'löffel-solo' },
  },
  {
    id: 'cake-candles',
    day: 1,
    title: 'onkel pustet die kerzen aus. und die torte',
    length: '0:15',
    views: 54_321,
    uploader: 'partyanimal_07',
    photo: {
      scene: 'party',
      seed: 7305,
      caption: 'alles gute (an die wand)',
    },
  },
  {
    id: 'goat-sandwich',
    day: 1,
    title: 'ziege klaut im streichelzoo ein sandwich',
    length: '0:48',
    views: 43_210,
    uploader: 'zoo_crew',
    photo: { scene: 'trip', seed: 7306, caption: 'täterin flüchtig' },
  },
  {
    id: 'campfire-song',
    day: 1,
    title: 'das SCHLIMMSTE lagerfeuerlied aller zeiten (6 minuten)',
    length: '6:00',
    views: 32_100,
    uploader: 'betreuer_dave',
    photo: { scene: 'camp', seed: 7307, caption: 'strophe 41' },
  },
  {
    id: 'dog-ice-cream',
    day: 1,
    title: 'hund heult mit dem eiswagen mit',
    length: '0:39',
    views: 28_888,
    uploader: 'bello_und_ich',
    photo: { scene: 'pet', seed: 7308, caption: 'er kann den text' },
  },
  {
    id: 'grandpa-webcam',
    day: 1,
    title: 'opa entdeckt die webcam',
    length: '3:15',
    views: 21_007,
    uploader: 'enkel_vom_support',
    photo: { scene: 'party', seed: 7309, caption: 'IS DAS AN' },
  },
  {
    id: 'beach-frisbee',
    day: 1,
    title: 'frisbee gegen möwe: das rückspiel',
    length: '0:52',
    views: 17_345,
    uploader: 'sandy_steve',
    photo: { scene: 'beach', seed: 7310, caption: 'die möwe hats behalten' },
  },
  {
    id: 'puddle-ollie',
    day: 5,
    title: 'typ will über ne pfütze springen',
    length: '0:09',
    views: 123_456,
    uploader: 'sk8_or_die_88',
    photo: { scene: 'trip', seed: 7311, caption: 'die pfütze gewinnt' },
  },
];

/** Drei Threads. Theo fragt schüchtern, Dex schreibt einmal (spät), Marco is trocken. */
export const CHEATCAVE_THREADS: readonly ForumThread[] = [
  {
    id: 'ntk-level-4',
    title: 'wie schafft man level 4?? (der typ mit dem schirm)',
    board: 'Ninja Turbo Kombat',
    posts: [
      {
        day: 1,
        user: 'theo_k',
        text: 'hallo. sorry, falls das ne dumme frage ist. wie schafft man level 4? der typ mit dem schirm blockt alles. hab es 23 mal probiert. sorry für den langen beitrag',
      },
      { day: 1, user: 'xXSniperWolfXx', text: 'n00b' },
      { day: 1, user: 'l33t_m4st3r_99', text: 'n00b' },
      { day: 2, user: 'DarkFlame2007', text: 'n00b lol' },
      {
        day: 2,
        user: 'PizzaRolls4Life',
        text: 'ok jetzt mal ernst: ÜBER ihn springen und ihm in den rücken treten, wenn er den schirm aufmacht. von hinten kann er nich blocken. das wars',
      },
      {
        day: 2,
        user: 'theo_k',
        text: 'es hat GEKLAPPT. danke PizzaRolls4Life. sorry für den doppelpost. und danke auch an alle, die n00b gesagt haben, glaub ich',
      },
      {
        day: 3,
        user: 'CaveKing',
        text: 'MOD-HINWEIS: hab noch 22 antworten gelöscht, in denen nur n00b stand. seid nett zu neuen leuten oder ich mach den thread zu. (die hilfreiche bleibt)',
      },
      {
        day: 3,
        user: 'theo_k',
        text: 'sorry, nicht ganz zum thema, aber ich kann diese woche nicht spielen. bio-projekt. wir haben ne zelle aus wackelpudding gebaut. sie ist… wackelig',
      },
      {
        day: 5,
        user: 'theo_k',
        text: 'update: hab das ganze spiel durch. UND ne 2+ für die wackelpudding-zelle. sorry fürs angeben',
      },
    ],
  },
  {
    id: 'pc-vs-console',
    title: 'PC gegen KONSOLE. klärt das. LOS',
    board: 'Spiele allgemein',
    posts: [
      {
        day: 2,
        user: 'DarkFlame2007',
        text: 'pc gegen konsole. wer verliert, muss es zugeben. LOS',
      },
      {
        day: 2,
        user: 'l33t_m4st3r_99',
        text: 'KONSOLE. da kann man auf der couch zocken. thema erledigt',
      },
      {
        day: 3,
        user: 'marco.bassline',
        text: `ich hab nen pc, auf dem galaxy raiders 3 auf maximum läuft. ich schreib damit mails an meinen vermieter. also. konsole. ${g('meine kleine cousine', 'mein kleiner cousin')} schlägt mich in thunder kart sowieso. ohne auf den bildschirm zu gucken`,
      },
      { day: 3, user: 'DarkFlame2007', text: 'wer bist du überhaupt' },
      {
        day: 4,
        user: 'marco.bassline',
        text: 'einer, der beides hat und keins spielt. ich spiel bass',
      },
      {
        day: 4,
        user: 'l33t_m4st3r_99',
        text: 'is velvet lantern ein spiel?? nie gehört',
      },
      {
        day: 5,
        user: 'marco.bassline',
        text: 'ne band. wir haben gestern im bean cellar gespielt. ausverkauft. passen 11 leute rein',
      },
    ],
  },
  {
    id: 'best-trick-irl',
    title: 'bester trick, den ihr je IN ECHT gestanden habt?',
    board: 'Off Topic',
    posts: [
      {
        day: 1,
        user: 'Kickflip_Kev',
        text: 'ok zocker, geht mal kurz raus. bester trick, den ihr je IM ECHTEN LEBEN gestanden habt? meiner: ein 50-50 auf dem bordstein an der tanke',
      },
      {
        day: 2,
        user: 'PizzaRolls4Life',
        text: 'ich bin auf dem rücken gelandet. zählt das',
      },
      {
        day: 2,
        user: 'xXSniperWolfXx',
        text: 'ich hab in Rail Grind Pro 2 nen 900er gestanden. is quasi in echt',
      },
      {
        day: 3,
        user: 'Kickflip_Kev',
        text: 'ein videospiel is NICH in echt. noch wer?? hallo??',
      },
      {
        day: 5,
        user: 'dex.kickflip',
        text: 'kickflip. gestern. nach so 400 versuchen. keiner hats gefilmt. kamera war in meiner tasche. müsst ihr mir halt glauben',
      },
    ],
  },
];
