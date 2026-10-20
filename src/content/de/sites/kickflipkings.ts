// German kickflipkings.example, same exports as `src/content/sites/kickflipkings`. Kev schreibt klein
// und locker („is“, „nich“, „sesh“), wie eine Skater-Crew 2007 eben. Dex bleibt wortkarg, Marco
// trocken. Tricks behalten ihre englischen Namen (Ollie, Kickflip), so wie auf jedem Skatepark.
import { g } from '../../gender';
import type {
  CrewMember,
  Gig,
  NewsPost,
  Shout,
  SiteMeta,
  SkateVideo,
  Trick,
} from '../../sites/types';
import {
  KICKFLIP_NEWS_WEEK2,
  KICKFLIP_SHOUTS_WEEK2,
  KICKFLIP_VIDEO_WEEK2,
} from './kickflipkings-week2';

export const KICKFLIP_HOST = 'kickflipkings.example';

export const SITE_META: SiteMeta = {
  title: 'KICKFLIP KINGS - Skate-Crew',
  description:
    'Kickflip Kings: die Skate-Crew vom Skatepark bei der Schule. Trick-Tipps vom Ollie bis zum Kickflip, die Crew, eine Shoutbox, Konzerte in der Gegend und das Skatevideo von Dex.',
  keywords: [
    'skaten',
    'skateboard',
    'skateboarden',
    'skater',
    'kickflip',
    'ollie',
    'tricks',
    'crew',
    'skatepark',
    'rollbrett',
  ],
  pages: {
    '/': {
      title: 'KICKFLIP KINGS - Skate-Crew',
      keywords: [
        'news',
        'neuigkeiten',
        'shoutbox',
        'startseite',
        'westfield jam',
        'ergebnisse',
      ],
    },
    '/crew': {
      title: 'KICKFLIP KINGS - die Crew',
      keywords: ['mitglieder', 'kev', 'sam', 'rico', 'dex'],
    },
    '/tricks': {
      title: 'KICKFLIP KINGS - Trick-Tipps',
      keywords: ['trick-tipps', 'anleitung', 'lernen', 'shove-it'],
    },
    '/video': {
      title: 'KICKFLIP KINGS - Skatevideo',
      keywords: ['video', 'skatevideo', 'premiere', 'dex', 'aufrufe', 'clip'],
    },
    '/gigs': {
      title: 'KICKFLIP KINGS - Konzerte',
      keywords: [
        'konzerte',
        'gigs',
        'auftritte',
        'velvet lantern',
        'bean cellar',
        'band',
      ],
    },
  },
};

export const KICKFLIP_TEXT = {
  title: 'KICKFLIP KINGS',
  tagline: 'skaten. hinfallen. aufstehen. nochmal.',
  welcomeHeading: 'JO!!',
  welcome: g(
    'jo skatergirl!! willkommen bei den kings. sam sagt, mädels die skaten sind die wahren kings. sie hat recht. nich rico verraten',
    'jo alter!! willkommen bei den kings. schnapp dir dein board, lies die trick-tipps und versuch, keinen beton zu fressen',
  ),
  newsHeading: 'NEUES VOM SKATEPARK',
  shoutboxHeading: 'SHOUTBOX',
  shoutboxClosed:
    'grad darf nur die crew shouten. die spam-bots haben uns gefunden (danke auch, cheap_ringtones_4u). kev „repariert das“',
  stickers: [
    'SKATE ALL DAY',
    'SKATEN VERBOTEN (lol)',
    'KINGS',
    'griptape 4 life',
  ],
  crewHeading: 'DIE CREW',
  crewIntro:
    'vier leute, fünf boards (eins is kaputt, aber das behalten wir als glücksbringer). wir skaten jeden tag am park bei der schule, wenns nich regnet. und manchmal auch wenns regnet',
  tricksHeading: 'TRICK-TIPPS',
  tricksIntro:
    'vom ollie zum kickflip in 3 schritten. tragt nen helm. das sollten wir von sam aus hinschreiben. sam hat recht',
  dexStoryHeading: 'DEX: WIE ICH IHN GESTANDEN HAB',
  dexStoryLater:
    'dex „arbeitet noch dran“. seine story kommt hierhin, wenn er ihn steht. nich die luft anhalten. (spaß dex. bisschen anhalten)',
  videoHeading: 'DAS DEX-VIDEO',
  videoSoon: 'BALD HIER!!',
  gigsHeading: 'KONZERTE IN DER GEGEND',
  gigsIntro:
    'bands, bei denen skater reindürfen. board mitbringen, an der tür lassen. die meisten läden sind winzig',
  noVelvetLantern:
    'velvet lantern: grad keine konzerte. marco (bass) sagt „bald“. er sagt das sehr ernst',
  bestViewed: 'am besten in 800x600 nach ner langen sesh',
  footer:
    '(c) 2007 Kickflip Kings. seite von kev. läuft auf dem webspace von meinem vater. nich kaputtmachen',
};

/** Kevs News: eine am Tag, zwei an Tag 2 (Marcos Flyer). */
export const KICKFLIP_NEWS: readonly NewsPost[] = [
  {
    day: 1,
    title: 'KICKFLIP KINGS IS ONLINE!!!',
    author: 'Kickflip_Kev',
    body: 'mein vater hat mir seinen webspace geliehen. 5 seiten!!! eine is die videoseite und die is noch LEER. dex sagt, das video kommt. dex sagt viel (spaß dex)',
  },
  {
    day: 2,
    title: 'dex FILMT',
    author: 'Kickflip_Kev',
    body: 'er hat nen camcorder von 1998 gefunden. mit griff obendrauf. er hat den ganzen tag im park gefilmt, so 2 stunden kassette. meistens fällt er hin. so is skaten halt',
  },
  {
    day: 2,
    title: 'konzert-alarm: velvet lantern im bean cellar',
    author: 'Kickflip_Kev',
    body: 'marco von velvet lantern hat nen flyer im park aufgehängt. nur eine nacht, max. 11 leute. is ein keller, also KEINE boards drin. alles auf der konzertseite',
  },
  {
    day: 3,
    title: 'R.I.P. kassette #1',
    author: 'Kickflip_Kev',
    body: 'der camcorder hat dex seine kassette GEFRESSEN. 40 stürze, für immer weg. schweigeminute. ... ok reicht. sein bruder hat noch 1 kassette',
  },
  {
    day: 4,
    title: 'DEX HAT DEN KICKFLIP GESTANDEN!!!',
    author: 'Kickflip_Kev',
    body: 'sauber. weggerollt und alles. zeuge: 1 kind, 7 jahre alt. die kamera? in der tasche. mit deckel drauf. die ganze story steht auf der trickseite',
  },
  {
    day: 5,
    title: 'WELTPREMIERE: das dex-video',
    author: 'Kickflip_Kev',
    body: 'es is DA. 30 sekunden pures skateboarden (und himmel). mein vater hat ne capture-karte, also is es jetzt auf der videoseite. kann sein, dass es bisschen lädt. sehr. guckts euch an!!',
  },
  ...KICKFLIP_NEWS_WEEK2,
];

export const KICKFLIP_SHOUTS: readonly Shout[] = [
  {
    day: 1,
    user: 'Kickflip_Kev',
    text: 'erster!!! (is meine seite, ich gewinn)',
  },
  {
    day: 1,
    user: 'rico.manual',
    text: 'manuals 4 life. ollies werden überschätzt',
  },
  {
    day: 1,
    user: 'sam_grabs',
    text: 'kev, im banner stand ne stunde lang KINGZ mit z',
  },
  { day: 1, user: 'Kickflip_Kev', text: 'das war STYLE, sam' },
  {
    day: 2,
    user: 'skaterboi_14',
    text: 'seid ihr die crew vom park bei der schule?? ihr seid krass',
  },
  {
    day: 2,
    user: 'dex.kickflip',
    text: 'filme heute. wer nen typen mit riesen-camcorder sieht: das bin ich',
  },
  {
    day: 2,
    user: 'sam_grabs',
    text: 'dex hat mich auch gefilmt. ich seh aus wie ein fleck',
  },
  { day: 3, user: 'grindrail_gary', text: 'rip kassette :(' },
  {
    day: 3,
    user: 'rico.manual',
    text: 'kippt nen schluck cola für die kassette aus',
  },
  {
    day: 3,
    user: 'PizzaRolls4Life',
    text: 'komm von cheatcave. was is ein kickflip. is das ein cheat',
  },
  {
    day: 4,
    user: 'Kickflip_Kev',
    text: 'ER HAT IHN GESTANDEN. die shoutbox shoutet jetzt offiziell',
  },
  { day: 4, user: 'sam_grabs', text: 'fotos oder es is nie passiert' },
  {
    day: 4,
    user: 'dex.kickflip',
    text: 'es gab nen zeugen. er hat mir high five gegeben',
  },
  { day: 4, user: 'skaterboi_14', text: 'high five is rechtlich bindend' },
  { day: 5, user: 'dex.kickflip', text: 'is online. 30 sek. kein geld zurück' },
  {
    day: 5,
    user: 'Kickflip_Kev',
    text: 'sekunde 22. boxen aufdrehen. das is geschichte',
  },
  { day: 5, user: 'grindrail_gary', text: 'hängt bei 99% lol' },
  {
    day: 5,
    user: 'sam_grabs',
    text: 'habs bei dex am fernseher geguckt. wer hingeht: chips mitbringen',
  },
  ...KICKFLIP_SHOUTS_WEEK2,
];

export const KICKFLIP_CREW: readonly CrewMember[] = [
  {
    handle: 'Kickflip_Kev',
    name: 'Kev',
    role: 'gründer + webmaster',
    bestTrick: '50-50 auf dem bordstein an der tanke',
    bio: 'hat die crew gegründet und die seite gebaut. hat das einzige board mit 4 rollen, die gehen. sagt zu allem „krass“',
  },
  {
    handle: 'sam_grabs',
    name: 'Sam',
    role: 'bester ollie der crew',
    bestTrick: 'ollie über 3 boards hintereinander',
    bio: 'skatet seit der 4. klasse. repariert allen die kugellager mit nem buttermesser. rico hat angst vor ihr. zu recht',
  },
  {
    handle: 'rico.manual',
    name: 'Rico',
    role: 'der manual-typ',
    bestTrick: 'manual über den ganzen parkplatz',
    bio: 'weigert sich „aus prinzip“, kickflips zu lernen. isst die ganze sesh sonnenblumenkerne. die schalen liegen überall',
  },
  {
    handle: 'dex.kickflip',
    name: 'Dex',
    role: 'filmer + kickflip-typ',
    bestTrick: 'kickflip (fast) (das board steht ihn)',
    bio: 'immer abwesend, immer im park. hat nen camcorder von 1998 und nen großen bruder mit ner garage voller „ordentlichem“ zeug',
    after: {
      day: 4,
      bestTrick: 'kickflip. GESTANDEN. frag das kind',
    },
    // W3 replaces this with German
    later: {
      day: 9,
      bestTrick: 'kickflip. LANDED. on tape. 3rd at the jam',
    },
  },
];

export const KICKFLIP_TRICKS: readonly Trick[] = [
  {
    id: 'ollie',
    name: 'Ollie',
    level: 'schritt 1 (lern den zuerst. echt jetzt)',
    steps: [
      'hinterer fuß aufs tail, vorderer fuß in die mitte vom board',
      'knie beugen. tiefer. TIEFER',
      'tail hart runterschnappen lassen',
      'vorderen fuß zur nose hochziehen. das board kommt mit',
      'mit beiden füßen über den schrauben landen. knie gebeugt',
    ],
    tip: 'erst auf rasen üben, da rollt das board nich weg. deine mutter fragt dann, warum ein board auf dem rasen liegt',
  },
  {
    id: 'shove-it',
    name: 'Pop Shove-It',
    level: 'schritt 2',
    steps: [
      'füße wie beim ollie, hinterer fuß bisschen mehr auf der zehenseite',
      'tail poppen und nach hinten SCHAUFELN',
      'gerade hochspringen. das board dreht sich unter dir',
      'mit den füßen fangen, wenns wieder rumkommt',
    ],
    tip: 'nich nach vorne springen, sonst landest du vor deinem board. frag rico, woher wir das wissen',
  },
  {
    id: 'kickflip',
    name: 'Kickflip',
    level: 'schritt 3 (der große)',
    steps: [
      'ollie-stellung, vorderer fuß bisschen schräg, zehen an der kante',
      'tail poppen wie beim ollie',
      'vorderen fuß über die ecke von der nose rausflicken',
      'drehen lassen. EIN flip. nich zwei',
      'mit dem hinteren fuß fangen, dann mit dem vorderen. wegrollen',
    ],
    tip: 'dauert so 400 versuche. dex hat gezählt. die kamera in der hand halten, nich in der tasche',
  },
];

export const DEX_STORY: { day: number; lines: readonly string[] } = {
  day: 4,
  lines: [
    'ok also. so 400 versuche',
    'hinterer fuß aufs tail. vorderer bisschen schräg. über die ecke flicken',
    'das board hat sich einmal gedreht. ich bin drauf gelandet. es is weggerollt. mit mir drauf',
    'ein kind hat „wow“ gesagt. dann hat seine mutter ihn mitgenommen',
    'kamera war in der tasche. deckel drauf. musst mir also glauben',
    '- dex',
  ],
};

export const KICKFLIP_VIDEO: SkateVideo = {
  premiereDay: 5,
  teasers: [
    {
      day: 1,
      text: 'dex macht ein skatevideo. wann? „bald“. wie lang? „kurz“. na dann',
    },
    {
      day: 2,
      text: 'die dreharbeiten haben ANGEFANGEN. 2 stunden kassette. meistens stürze. sehr echt',
    },
    {
      day: 3,
      text: 'update: die kamera hat die kassette gefressen. das video verspätet sich. wegen der kamera',
    },
    {
      day: 4,
      text: 'er hat den kickflip gestanden, aber nich gefilmt. die premiere steht trotzdem. morgen!!',
    },
  ],
  title: 'dex productions präsentiert: ein fleck',
  length: '0:30',
  timeline: [
    { at: '0:00-0:10', text: 'himmel (sehr blau)' },
    { at: '0:10-0:20', text: 'boden (auch wichtig)' },
    { at: '0:20-0:22', text: 'orange. das is dex sein shirt' },
    { at: '0:22', text: 'DAS GERÄUSCH. das is der kickflip' },
    { at: '0:23-0:27', text: 'sein bruder brüllt „nimmt das auf?“' },
    { at: '0:27-0:30', text: 'abspann (auf papier geschrieben)' },
  ],
  playLabel: 'PLAY',
  buffering: 'wird geladen…',
  stuck:
    'hängt bei 99%. wie jedes video 2007. guck es lieber bei dex, da läuft es am fernseher',
  credits:
    'gefilmt mit nem camcorder von 1998 + dem rest von ner 1999er kassette. online dank der capture-karte von kevs vater. kein geld zurück',
  ...KICKFLIP_VIDEO_WEEK2,
};

export const KICKFLIP_GIGS: readonly Gig[] = [
  {
    id: 'grip-tapes',
    day: 1,
    band: 'The Grip Tapes',
    venue: 'die halfpipe im skatepark',
    when: 'immer wenns nich regnet',
    note: 'skate-punk. 3 songs, alle übers skaten. einer übern regen. ohrstöpsel mitbringen oder halt nich',
  },
  {
    id: 'velvet-lantern-bean-cellar',
    day: 2,
    band: 'Velvet Lantern',
    venue: 'der bean cellar (der keller unterm café)',
    when: 'nur eine nacht (datum steht auf dem flyer. marco hat ihn gemalt)',
    note: 'max. 11 leute. keine boards drin, is ein keller. marco (bass) hat gesagt „kein pogo“. wir haben gefragt, was pogo is. er hat nich geantwortet',
    updates: [
      {
        day: 3,
        text: 'update: der schlagzeuger is ausgestiegen?? in den bean cellar passt nur eine snare. marco sagt, das konzert findet trotzdem statt',
      },
      {
        day: 4,
        text: 'update: der schlagzeuger is wieder da. er bringt nen farbeimer mit. nich fragen',
      },
    ],
    after: {
      day: 5,
      when: 'war gestern abend',
      note: 'AUSVERKAUFT (alle 11). kev und sam waren 2 davon. der schlagzeuger hat im letzten song den eimer umgetreten. alle dachten, das war absicht. jetzt gehört es zur show',
    },
  },
  {
    id: 'velvet-lantern-next',
    day: 5,
    band: 'Velvet Lantern',
    venue: 'kommt noch',
    when: 'bald',
    note: 'marco sagt, das nächste konzert wird „größer“. wir haben gefragt, wie groß. er hat „12“ gesagt',
    // W3 replaces this with German (moved, updates, after)
    moved: {
      day: 6,
      venue: 'the westfield rec hall',
      when: 'saturday. doors at 6. all ages',
    },
    updates: [
      {
        day: 6,
        text: 'update: its the REC HALL. for real this time. the first date went to bingo. marco says bingo always wins',
      },
      {
        day: 8,
        text: 'update: The Grip Tapes open!!! dex is filming. boards stay outside',
      },
    ],
    after: {
      day: 10,
      when: 'played saturday',
      note: 'played. 83 ppl. kev filmed nothing, dex filmed everything',
    },
  },
];
