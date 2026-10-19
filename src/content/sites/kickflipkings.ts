// kickflipkings.example: "Kickflip Kings", the skate crew from the park by the school. Kev runs the
// site; the crew is Kev, Sam, Rico and Dex. News and shouts are day-gated (days 1–5) and follow
// Dex's story: filming (day 2), the eaten tape (3), the kickflip nobody filmed (4), the 30-second
// blur premiering on `/video` (5). `/gigs` lists Velvet Lantern's bean cellar show (Marco's band).
import { g } from '../gender';
import type {
  CrewMember,
  DayLine,
  Gig,
  NewsPost,
  Shout,
  SiteMeta,
  Trick,
} from './types';

export const KICKFLIP_HOST = 'kickflipkings.example';

export const SITE_META: SiteMeta = {
  title: 'KICKFLIP KINGS - skate crew',
  description:
    'Kickflip Kings: the skate crew from the park by the school. Trick tips from ollie to kickflip, the crew, a shoutbox, local shows and the Dex skate video.',
  keywords: [
    'skate',
    'skating',
    'skateboard',
    'skateboarding',
    'skater',
    'kickflip',
    'ollie',
    'tricks',
    'crew',
    'skatepark',
  ],
  pages: {
    '/': {
      title: 'KICKFLIP KINGS - skate crew',
      keywords: ['news', 'shoutbox', 'home'],
    },
    '/crew': {
      title: 'KICKFLIP KINGS - the crew',
      keywords: ['members', 'kev', 'sam', 'rico', 'dex'],
    },
    '/tricks': {
      title: 'KICKFLIP KINGS - trick tips',
      keywords: ['trick tips', 'how to', 'guide', 'shove-it', 'learn'],
    },
    '/video': {
      title: 'KICKFLIP KINGS - skate video',
      keywords: ['video', 'skate video', 'premiere', 'dex'],
    },
    '/gigs': {
      title: 'KICKFLIP KINGS - gigs',
      keywords: [
        'gigs',
        'shows',
        'concerts',
        'velvet lantern',
        'bean cellar',
        'band',
      ],
    },
  },
};

export const KICKFLIP_TEXT = {
  title: 'KICKFLIP KINGS',
  tagline: 'skate. fall. get up. repeat.',
  welcomeHeading: 'YO!!',
  welcome: g(
    'yo skater girl!! welcome 2 the kings. sam says girls who skate r the real kings. she is right. dont tell rico',
    'yo dude!! welcome 2 the kings. grab ur board, read the trick tips, try not 2 eat concrete',
  ),
  newsHeading: 'NEWS FROM THE PARK',
  shoutboxHeading: 'SHOUTBOX',
  shoutboxClosed:
    'only the crew can shout rn. the spam bots found us (thx a lot, cheap_ringtones_4u). kev is "fixing it"',
  stickers: ['SKATE OR DIE', 'NO SKATING (lol)', 'KINGS', 'grip tape 4 life'],
  crewHeading: 'THE CREW',
  crewIntro:
    'four ppl, five boards (one is broken but we keep it for luck). we skate the park by the school every day it doesnt rain. and some days it does',
  tricksHeading: 'TRICK TIPS',
  tricksIntro:
    'from ollie 2 kickflip in 3 steps. wear a helmet. sam made us write that. sam is right',
  dexStoryHeading: 'DEX: HOW I LANDED IT',
  dexStoryLater:
    'dex is "still working on it". his story goes here when he lands it. dont hold ur breath. (jk dex. hold it a little)',
  videoHeading: 'THE DEX VIDEO',
  videoSoon: 'COMING SOON!!',
  gigsHeading: 'LOCAL SHOWS',
  gigsIntro:
    'bands that let skaters in. bring ur board, leave it at the door. most of these places r tiny',
  noVelvetLantern:
    'velvet lantern: no shows booked rn. marco (bass) says "soon". he says it very seriously',
  bestViewed: 'best viewed at 800x600 after a long sesh',
  footer:
    '(c) 2007 Kickflip Kings. site by kev. hosted on my dads web space. dont break it',
};

/** Kev's news posts: one a day, two on day 2 (Marco's flyer). */
export const KICKFLIP_NEWS: readonly NewsPost[] = [
  {
    day: 1,
    title: 'KICKFLIP KINGS IS ONLINE!!!',
    author: 'Kickflip_Kev',
    body: 'my dad let me use his web space. 5 pages!!! one is the video page and it is EMPTY 4 now. dex says the video is coming. dex says a lot of things (jk dex)',
  },
  {
    day: 2,
    title: 'dex is FILMING',
    author: 'Kickflip_Kev',
    body: 'he found a camcorder from 1998. it has a handle on top. he filmed at the park all day, like 2 hours of tape. most of it is him falling. thats skating',
  },
  {
    day: 2,
    title: 'show alert: velvet lantern @ the bean cellar',
    author: 'Kickflip_Kev',
    body: 'marco from velvet lantern put a flyer up at the park. one night only, 11 ppl max. its in a basement so NO boards inside. check the gigs page',
  },
  {
    day: 3,
    title: 'R.I.P. tape #1',
    author: 'Kickflip_Kev',
    body: 'the camcorder ATE dexs tape. 40 falls, gone 4ever. moment of silence. ... ok thats enough silence. his bro has 1 more tape',
  },
  {
    day: 4,
    title: 'DEX LANDED THE KICKFLIP!!!',
    author: 'Kickflip_Kev',
    body: 'clean. rolled away and everything. witness: 1 kid, age 7. the camera? in his bag. lens cap on. read the whole story on the tricks page',
  },
  {
    day: 5,
    title: 'WORLD PREMIERE: the dex video',
    author: 'Kickflip_Kev',
    body: 'its HERE. 30 seconds of pure skateboarding (and sky). my dad has a capture card so i put it on the video page. it might buffer a little. a lot. go watch it!!',
  },
];

/** The shoutbox, read-only for visitors: crew, regulars and one lost CheatCave gamer. */
export const KICKFLIP_SHOUTS: readonly Shout[] = [
  { day: 1, user: 'Kickflip_Kev', text: 'first!!! (its my site so i win)' },
  { day: 1, user: 'rico.manual', text: 'manuals 4 life. ollies r overrated' },
  {
    day: 1,
    user: 'sam_grabs',
    text: 'kev the banner said KINGZ with a z for like an hour',
  },
  { day: 1, user: 'Kickflip_Kev', text: 'that was a STYLE sam' },
  {
    day: 2,
    user: 'skaterboi_14',
    text: 'is this the crew from the park by the school?? u guys r sick',
  },
  {
    day: 2,
    user: 'dex.kickflip',
    text: 'filming today. if u see a guy with a huge camcorder thats me',
  },
  { day: 2, user: 'sam_grabs', text: 'dex filmed me 2. i look like a blur' },
  { day: 3, user: 'grindrail_gary', text: 'rip tape :(' },
  { day: 3, user: 'rico.manual', text: 'pour some soda out for the tape' },
  {
    day: 3,
    user: 'PizzaRolls4Life',
    text: 'i came from cheatcave. what is a kickflip. is it a cheat',
  },
  {
    day: 4,
    user: 'Kickflip_Kev',
    text: 'HE LANDED IT. the shoutbox is officially shouting',
  },
  { day: 4, user: 'sam_grabs', text: 'pics or it didnt happen' },
  {
    day: 4,
    user: 'dex.kickflip',
    text: 'there was a witness. he gave me a high five',
  },
  { day: 4, user: 'skaterboi_14', text: 'a high five is legally binding' },
  { day: 5, user: 'dex.kickflip', text: 'its up. 30 sec. no refunds' },
  {
    day: 5,
    user: 'Kickflip_Kev',
    text: 'second 22. turn ur speakers up. thats history',
  },
  { day: 5, user: 'grindrail_gary', text: 'stuck at 99% buffering lol' },
  {
    day: 5,
    user: 'sam_grabs',
    text: 'watched it at dexs house on the tv. bring snacks if u go',
  },
];

export const KICKFLIP_CREW: readonly CrewMember[] = [
  {
    handle: 'Kickflip_Kev',
    name: 'Kev',
    role: 'founder + webmaster',
    bestTrick: '50-50 on the curb at the gas station',
    bio: 'started the crew, made the site. owns the only board with 4 working wheels. says "sick" about everything',
  },
  {
    handle: 'sam_grabs',
    name: 'Sam',
    role: 'best ollie in the crew',
    bestTrick: 'ollie over 3 boards in a row',
    bio: 'skating since 4th grade. fixes everyones bearings with a butter knife. rico is scared of her. rightly',
  },
  {
    handle: 'rico.manual',
    name: 'Rico',
    role: 'manual guy',
    bestTrick: 'manual across the whole parking lot',
    bio: 'refuses to learn kickflips "on principle". eats sunflower seeds all sesh. leaves the shells everywhere',
  },
  {
    handle: 'dex.kickflip',
    name: 'Dex',
    role: 'filmer + kickflip guy',
    bestTrick: 'kickflip (almost) (the board lands it)',
    bio: 'always away, always at the park. has a camcorder from 1998 and a big bro with a garage full of "organized" stuff',
    after: {
      day: 4,
      bestTrick: 'kickflip. LANDED. ask the kid',
    },
  },
];

/** Ollie → kickflip, in order. */
export const KICKFLIP_TRICKS: readonly Trick[] = [
  {
    id: 'ollie',
    name: 'Ollie',
    level: 'step 1 (learn this first. seriously)',
    steps: [
      'back foot on the tail, front foot in the middle of the board',
      'bend ur knees. lower. LOWER',
      'snap the tail down hard',
      'slide ur front foot up 2 the nose. the board follows',
      'land with both feet over the bolts. knees bent',
    ],
    tip: 'practice on grass first so the board cant roll away. ur mom will ask why there is a board on the lawn',
  },
  {
    id: 'shove-it',
    name: 'Pop Shove-It',
    level: 'step 2',
    steps: [
      'same feet as the ollie, back foot a bit more on the toe side',
      'pop and SCOOP the tail backwards',
      'jump straight up. the board spins under u',
      'catch it with ur feet when it comes back around',
    ],
    tip: 'dont jump forward or u will land in front of ur board. ask rico how we know',
  },
  {
    id: 'kickflip',
    name: 'Kickflip',
    level: 'step 3 (the big one)',
    steps: [
      'ollie stance, front foot angled a bit, toes near the edge',
      'pop the tail like an ollie',
      'flick ur front foot off the corner of the nose',
      'let it spin. ONE flip. not two',
      'catch it with ur back foot, then the front. ride away',
    ],
    tip: 'it takes like 400 tries. dex counted. keep a camera in ur hand, not in ur bag',
  },
];

/** Dex's story on the kickflip, from day 4 (in his own words; lowercase, few words). */
export const DEX_STORY: { day: number; lines: readonly string[] } = {
  day: 4,
  lines: [
    'ok so. like 400 tries',
    'back foot on the tail. front foot kinda angled. flick off the corner',
    'the board spun once. i landed on it. it rolled away. with me on it',
    'a kid said "whoa". then his mom made him leave',
    'camera was in my bag. lens cap on. so u have to trust me',
    '- dex',
  ],
};

/** The `/video` page: teasers until the premiere on day 5, then the video. */
export const KICKFLIP_VIDEO: {
  premiereDay: number;
  teasers: readonly DayLine[];
  title: string;
  length: string;
  timeline: readonly { at: string; text: string }[];
  playLabel: string;
  buffering: string;
  stuck: string;
  credits: string;
} = {
  premiereDay: 5,
  teasers: [
    {
      day: 1,
      text: 'dex is making a skate video. when? "soon". how long? "short". ok then',
    },
    {
      day: 2,
      text: 'filming has STARTED. 2 hours of tape. mostly falls. very authentic',
    },
    {
      day: 3,
      text: 'update: the camera ate the tape. the video is delayed. by the camera',
    },
    {
      day: 4,
      text: 'he landed the kickflip but didnt film it. the premiere is still on. tomorrow!!',
    },
  ],
  title: 'dex productions presents: a blur',
  length: '0:30',
  timeline: [
    { at: '0:00-0:10', text: 'sky (very blue)' },
    { at: '0:10-0:20', text: 'ground (also important)' },
    { at: '0:20-0:22', text: 'orange. thats dexs shirt' },
    { at: '0:22', text: 'THE SOUND. that is the kickflip' },
    { at: '0:23-0:27', text: 'his bro yelling "is it recording"' },
    { at: '0:27-0:30', text: 'credits (written on paper)' },
  ],
  playLabel: 'PLAY',
  buffering: 'buffering…',
  stuck:
    'stuck at 99%. like every video in 2007. watch it at dexs house instead, its on the tv there',
  credits:
    'filmed on a 1998 camcorder + the last of a 1999 tape. put online by kevs dads capture card. no refunds',
};

export const KICKFLIP_GIGS: readonly Gig[] = [
  {
    id: 'grip-tapes',
    day: 1,
    band: 'The Grip Tapes',
    venue: 'the half-pipe at the skatepark',
    when: 'whenever it doesnt rain',
    note: 'skate punk. 3 songs, all about skating. one is about rain. bring earplugs or dont',
  },
  {
    id: 'velvet-lantern-bean-cellar',
    day: 2,
    band: 'Velvet Lantern',
    venue: 'the bean cellar (the basement under the coffee place)',
    when: 'one night only (date is on the flyer. marco drew it)',
    note: '11 ppl max. no boards inside, its a basement. marco (bass) said "no moshing". we asked what moshing is. he didnt answer',
    updates: [
      {
        day: 3,
        text: 'update: the drummer quit?? the bean cellar only fits one snare. marco says the show is still on',
      },
      {
        day: 4,
        text: 'update: the drummer is back. he is bringing a paint bucket. dont ask',
      },
    ],
    after: {
      day: 5,
      when: 'played last night',
      note: 'SOLD OUT (all 11). kev and sam were 2 of them. the drummer kicked the bucket over in the last song. everyone thought it was on purpose. its in the act now',
    },
  },
  {
    id: 'velvet-lantern-next',
    day: 5,
    band: 'Velvet Lantern',
    venue: 'TBA',
    when: 'soon',
    note: 'marco says the next show is "bigger". we asked how big. he said "12"',
  },
];
