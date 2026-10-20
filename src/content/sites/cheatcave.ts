// cheatcave.example: "CheatCave", a 2007 games portal run by CaveKing (webmaster, moderator and
// only employee). Every game except Mines, Hen Hunt and Star Pinball is invented, and so is every
// clip and forum handle. News and forum replies are day-gated (days 1–5); the forum has Theo's shy
// level-4 question (the one CheatCave Weekly #12 brags about), Dex's one late post and Marco, dry.
// Days 6–10 (news, two clips, forum replies) live in `cheatcave-week2.ts`.
import { g } from '../gender';
import {
  CHEATCAVE_CLIPS_WEEK2,
  CHEATCAVE_FORUM_WEEK2,
  CHEATCAVE_NEWS_WEEK2,
  withForumPosts,
} from './cheatcave-week2';
import type {
  CheatGame,
  ForumThread,
  FunnyClip,
  NewsPost,
  SiteMeta,
} from './types';

export const CHEATCAVE_HOST = 'cheatcave.example';

export const SITE_META: SiteMeta = {
  title: 'CheatCave - cheats. clips. games.',
  description:
    'CHEATS and codes for Galaxy Raiders 3, Thunder Kart, Ninja Turbo Kombat, Mines, Hen Hunt, Star Pinball and MORE. Flash game news, top 10 funny clips and a forum. UPDATED DAILY!!',
  keywords: [
    'cheats',
    'codes',
    'cheat codes',
    'games',
    'gaming',
    'flash games',
    'tips',
    'clips',
    'forum',
    'galaxy raiders',
  ],
  pages: {
    '/': {
      title: 'CheatCave - cheats. clips. games.',
      keywords: ['news', 'flash', 'home'],
    },
    '/cheats': {
      title: 'CheatCave - Cheats + Codes',
      keywords: ['walkthrough', 'secret', 'unlock', 'mines', 'hen hunt'],
    },
    '/clips': {
      title: 'CheatCave - Top 10 Funny Clips',
      keywords: ['videos', 'funny', 'lol', 'top 10', 'bingo', 'mic'],
    },
    '/forum': {
      title: 'CheatCave - Forum',
      keywords: ['forum', 'board', 'threads', 'help'],
    },
  },
};

export const CHEATCAVE_TEXT = {
  title: 'CheatCave',
  tagline: 'cheats. clips. games.',
  updated: 'UPDATED DAILY!!',
  owner: 'CaveKing',
  welcomeHeading: 'WELCOME 2 THE CAVE',
  welcome: g(
    'hey gamer girl!!! welcome 2 the cave. ur officially cooler than 99% of our visitors (they r all named Kyle)',
    'hey dude!!! welcome 2 the cave. grab a cheat, watch a clip, stay a while. wipe ur feet',
  ),
  newsHeading: 'LATEST NEWS',
  sinceLine: 'u r visitor #',
  sinceLineEnd: 'since 2004!!',
  linkUsHeading: 'LINK 2 US!!',
  linkUs:
    'put our button on ur page and CaveKing gives u a shoutout. (he answers every email. eventually)',
  buttons: ['CheatCave', 'cheats inside', 'NO n00bs'],
  cheatsHeading: 'CHEATS + CODES',
  cheatsIntro:
    'pick a game!!! every cheat is TESTED by CaveKing personally. (the joke ones too. thats how we know)',
  jokeLabel: 'JOKE CHEAT (dont try this):',
  noGame: 'that game isnt in the cave (yet). pick one from the list!!',
  allGames: '« all games',
  clipsHeading: 'TOP 10 FUNNY CLIPS',
  clipsIntro:
    'the funniest clips on the whole internet, ranked by views. new chart DAILY (when CaveKing remembers)',
  clipsPlayer:
    'clip player needs the newest plugin. we r working on it. for now: imagine it. its FUNNY',
  forumHeading: 'CHEATCAVE FORUM',
  forumIntro: 'ask a question, get an answer. or get "n00b". its the internet',
  forumClosed:
    'new sign-ups r closed bc of spam bots (thx a lot, cheap_ringtones_4u). u can still read everything!!',
  noThread: 'that thread doesnt exist (yet??). back 2 the forum!!',
  backToForum: '« back 2 the forum',
  bestViewed: 'best viewed at 800x600 with the lights OFF',
  footer:
    '(c) 2004-2007 CheatCave. not affiliated with any game company. we just like games. a LOT',
};

/** Flash-game news, one or two posts a day. */
export const CHEATCAVE_NEWS: readonly NewsPost[] = [
  {
    day: 1,
    title: 'WELCOME 2 THE NEW CHEATCAVE!!!',
    author: 'CaveKing',
    body: 'new layout!!! new colors!!! a FORUM!!! it took me 3 weekends and my mom thinks i have been doing homework. go check out the cheats and say hi in the forum. no spam pls',
  },
  {
    day: 1,
    title: 'FLASH GAME OF THE WEEK: Zombie Lunchroom',
    author: 'CaveKing',
    body: 'throw mystery meat at zombies until the bell rings. it loads in like 2 minutes on dial-up and it is WORTH IT. our cheats page has the milk carton trick',
  },
  {
    day: 2,
    title: 'Thunder Kart: secret track found?!',
    author: 'CaveKing',
    body: 'a reader says if u win every cup on hard there is a 13th track made of pure rainbow. no pics yet. pics or it didnt happen!!! send them in',
  },
  {
    day: 3,
    title: 'CHEATCAVE WEEKLY #12 is out!!',
    author: 'CaveKing',
    body: 'check ur inbox!!! 99 lives in Galaxy Raiders 3, the turbo start and the golden hen. also: 13,370 visitors. thats basically a stadium',
  },
  {
    day: 3,
    title: 'Tiny Tank Takedown 2 is OUT',
    author: 'CaveKing',
    body: 'more tanks. tinier tanks. there is a level with cows now. the cows are on nobodys side. play it at lunch before the computer room gets locked',
  },
  {
    day: 4,
    title: 'RUMOR: Galaxy Raiders 4?!',
    author: 'CaveKing',
    body: 'a game magazine says maybe next year. my cousins friend says maybe NEVER. i will believe it when i see the box in the store. until then: 99 lives',
  },
  {
    day: 5,
    title: 'THE CHEAT U ALL ASKED FOR: Grandma Ninja',
    author: 'CaveKing',
    body: 'beat arcade mode in Ninja Turbo Kombat without blocking ONCE and Grandma Ninja is yours. she throws knitting needles. she is the best character in the game. this is not a joke',
  },
  {
    day: 5,
    title: 'new #1 clip: guy tries to ollie a puddle',
    author: 'CaveKing',
    body: 'the cat vs ceiling fan era is OVER. the puddle wins. go see the new top 10!!',
  },
  ...CHEATCAVE_NEWS_WEEK2,
];

/** `/cheats?game=<id>`: six invented games, then the three that ship on this computer. */
export const CHEATCAVE_GAMES: readonly CheatGame[] = [
  {
    id: 'galaxy-raiders-3',
    name: 'Galaxy Raiders 3',
    genre: 'space shooter',
    blurb:
      'shoot aliens. dodge asteroids. lose all ur lives on level 7. a classic',
    cheats: [
      {
        code: 'title screen: hold JUMP, press LEFT LEFT RIGHT',
        effect: 'u start with 99 lives. (if u start with 0 u did it wrong)',
      },
      {
        code: 'wave 3: shoot only the blue asteroids',
        effect: 'free shield. it lasts 10 seconds. use them wisely',
      },
      {
        code: 'level 7 boss: fly BEHIND him',
        effect:
          'he cant turn around. he is a very big ship with a very small brain',
      },
    ],
    joke: {
      code: 'type GALAXY on the pause screen',
      effect: 'the game says "nice try". we checked',
    },
  },
  {
    id: 'thunder-kart',
    name: 'Thunder Kart',
    genre: 'kart racing',
    blurb: '8 karts, 12 tracks, 1 friendship ruined per race',
    cheats: [
      {
        code: 'tap GAS right when the light turns green',
        effect: 'TURBO START. works every time. (works most times)',
      },
      {
        code: 'hold the drift around the volcano on Lava Loop',
        effect: 'blue sparks = mini boost. orange sparks = BIG boost',
      },
      {
        code: 'pick Grandpa Bolt',
        effect:
          'heaviest driver in the game. he bumps everyone off the road. even u',
      },
    ],
    joke: {
      code: 'close ur eyes on Rainbow Bridge',
      effect: 'u will fall off. we tested it. 6 times',
    },
  },
  {
    id: 'ninja-turbo-kombat',
    name: 'Ninja Turbo Kombat',
    genre: 'fighting',
    blurb: 'ninjas. turbo. kombat with a K bc its cooler',
    cheats: [
      {
        code: 'beat arcade mode without blocking ONCE',
        effect: 'unlocks Grandma Ninja. best character in the game. not a joke',
      },
      {
        code: 'level 4: jump OVER the umbrella guy, kick his back',
        effect:
          'he cant block from behind. (thx PizzaRolls4Life from the forum)',
      },
      {
        code: 'hold PUNCH + BLOCK for 3 seconds',
        effect: 'TURBO punch. it is loud. ur little brother will want a turn',
      },
    ],
    joke: {
      code: 'press START 100 times on the title screen',
      effect: 'nothing happens. but ur thumb gets STRONG',
    },
  },
  {
    id: 'rail-grind-pro-2',
    name: 'Rail Grind Pro 2',
    genre: 'skateboarding',
    blurb: 'grind rails, break boards, never break bones. the dream',
    cheats: [
      {
        code: 'press GRAB twice in the air',
        effect: 'double grab, +500 points. land it or lose it',
      },
      {
        code: 'grind the fence behind the school 10 times',
        effect: 'unlocks the secret rooftop level',
      },
      {
        code: 'at the menu: up, up, down, down, GRAB',
        effect: 'moon gravity. every ollie is a 900. sort of',
      },
    ],
    joke: {
      code: 'unplug the controller in the middle of a jump',
      effect: 'ur skater just hangs in the air forever. very relaxing',
    },
  },
  {
    id: 'zombie-lunchroom',
    name: 'Zombie Lunchroom',
    genre: 'flash game',
    blurb: 'mystery meat vs zombies. the meat is the scarier one',
    cheats: [
      {
        code: 'throw the mystery meat at the corners',
        effect: 'it bounces off the walls and hits like 3 zombies',
      },
      {
        code: 'save the milk cartons',
        effect: 'zombies HATE milk. they slow down for 5 seconds',
      },
      {
        code: 'wait for the lunch lady on level 3',
        effect: 'she is on ur side. she has a ladle',
      },
    ],
    joke: {
      code: 'play it in computer class',
      effect: 'the teacher turns into a zombie. (no she doesnt. she turns MAD)',
    },
  },
  {
    id: 'tiny-tank-takedown-2',
    name: 'Tiny Tank Takedown 2',
    genre: 'flash game',
    blurb: 'tiny tanks. big explosions. medium cows',
    cheats: [
      {
        code: 'hold the mouse button down',
        effect: 'charges a super shot. let go when the barrel glows',
      },
      {
        code: 'hide behind the cows',
        effect: 'they block bullets. the cows do not care',
      },
      {
        code: 'shoot the barrels first',
        effect: 'chain explosion. 3 tanks for the price of 1',
      },
    ],
    joke: {
      code: 'name ur tank MOM',
      effect:
        'every enemy stops to yell "COMING". (not real. would be cool tho)',
    },
  },
  {
    id: 'mines',
    name: 'Mines',
    genre: 'puzzle (on ur computer!!)',
    blurb:
      'numbers, flags and pure STRESS. its in the Games folder of ur start menu',
    cheats: [
      {
        code: 'first click: anywhere',
        effect: 'the first click is ALWAYS safe. always. click the middle',
      },
      {
        code: 'click a number when all its flags are set',
        effect: 'opens every other square around it at once. pro move',
      },
      {
        code: 'right-click twice',
        effect: 'a ? mark. for when ur not sure. (ur never sure)',
      },
    ],
    joke: {
      code: 'close ur eyes and click',
      effect: 'u will lose. but u will lose RELAXED',
    },
  },
  {
    id: 'henhunt',
    name: 'Hen Hunt',
    genre: 'shooter (on ur computer!!)',
    blurb: 'hens. a farm. a windmill. the hens r not happy about any of this',
    cheats: [
      {
        code: 'aim IN FRONT of the golden hen, not at it',
        effect: '100 points. it is FAST',
      },
      {
        code: 'watch the windmill window',
        effect: 'a hen peeks out sometimes. bonus points',
      },
      {
        code: 'dont shoot the scarecrow',
        effect: 'his hat costs u points. he is just STANDING there',
      },
    ],
    joke: {
      code: 'yell BLAM every time u shoot',
      effect: '+0 points. +100 fun',
    },
  },
  {
    id: 'pinball',
    name: 'Star Pinball',
    genre: 'pinball (on ur computer!!)',
    blurb: 'planets, flippers and a ramp to HYPERSPACE',
    cheats: [
      {
        code: 'light up all 4 S-T-A-R targets',
        effect: 'big bonus. go for them first',
      },
      {
        code: 'shoot the ramp',
        effect: 'HYPERSPACE. it sounds as cool as it looks',
      },
      {
        code: 'catch the ball on a raised flipper',
        effect: 'stop, breathe, aim. dont just flap',
      },
    ],
    joke: {
      code: 'get 2 million points',
      effect: 'pics or it didnt happen',
    },
  },
];

/** The chart: the 10 most-viewed clips out by today (the puddle takes #1 on day 5). */
export const CHEATCAVE_CLIPS: readonly FunnyClip[] = [
  {
    id: 'cat-vs-fan',
    day: 1,
    title: 'cat vs ceiling fan (the cat is fine)',
    length: '0:34',
    views: 98_765,
    uploader: 'meowmix_mike',
    photo: { scene: 'pet', seed: 7301, caption: 'the cat. before' },
  },
  {
    id: 'pool-dad',
    day: 1,
    title: 'my dad vs the inflatable pool',
    length: '1:12',
    views: 87_210,
    uploader: 'BBQ_Kid',
    photo: { scene: 'beach', seed: 7302, caption: 'the pool won' },
  },
  {
    id: 'snowman',
    day: 1,
    title: 'snowman falls on my brother (he is fine)',
    length: '0:21',
    views: 76_543,
    uploader: 'frosty_fan99',
    photo: { scene: 'snow', seed: 7303, caption: 'RIP snowman' },
  },
  {
    id: 'spoon-drummer',
    day: 1,
    title: 'drummer drops his sticks, keeps going with SPOONS',
    length: '2:03',
    views: 65_002,
    uploader: 'rock_on_ryan',
    photo: { scene: 'concert', seed: 7304, caption: 'spoon solo' },
  },
  {
    id: 'cake-candles',
    day: 1,
    title: 'uncle blows out the candles. and the cake',
    length: '0:15',
    views: 54_321,
    uploader: 'partyanimal_07',
    photo: { scene: 'party', seed: 7305, caption: 'happy bday (to the wall)' },
  },
  {
    id: 'goat-sandwich',
    day: 1,
    title: 'goat steals a sandwich at the petting zoo',
    length: '0:48',
    views: 43_210,
    uploader: 'zoo_crew',
    photo: { scene: 'trip', seed: 7306, caption: 'suspect fled the scene' },
  },
  {
    id: 'campfire-song',
    day: 1,
    title: 'worst campfire song EVER (6 minutes)',
    length: '6:00',
    views: 32_100,
    uploader: 'camp_counselor_dave',
    photo: { scene: 'camp', seed: 7307, caption: 'verse 41' },
  },
  {
    id: 'dog-ice-cream',
    day: 1,
    title: 'dog howls along with the ice cream truck',
    length: '0:39',
    views: 28_888,
    uploader: 'barkley_and_me',
    photo: { scene: 'pet', seed: 7308, caption: 'he knows the words' },
  },
  {
    id: 'grandpa-webcam',
    day: 1,
    title: 'grandpa discovers the webcam',
    length: '3:15',
    views: 21_007,
    uploader: 'techsupport_grandson',
    photo: { scene: 'party', seed: 7309, caption: 'IS IT ON' },
  },
  {
    id: 'beach-frisbee',
    day: 1,
    title: 'frisbee vs seagull: the rematch',
    length: '0:52',
    views: 17_345,
    uploader: 'sandy_steve',
    photo: { scene: 'beach', seed: 7310, caption: 'the seagull kept it' },
  },
  {
    id: 'puddle-ollie',
    day: 5,
    title: 'guy tries to ollie a puddle',
    length: '0:09',
    views: 123_456,
    uploader: 'sk8_or_die_88',
    photo: { scene: 'trip', seed: 7311, caption: 'the puddle wins' },
  },
  ...CHEATCAVE_CLIPS_WEEK2,
];

/**
 * Three threads. Theo asks shyly, Dex posts late (day 5, then from the Jam), Marco is dry; everyone
 * else is a stranger. Week two's replies are appended from `CHEATCAVE_FORUM_WEEK2`.
 */
export const CHEATCAVE_THREADS: readonly ForumThread[] = withForumPosts(
  [
    {
      id: 'ntk-level-4',
      title: 'how do u beat level 4?? (the umbrella guy)',
      board: 'Ninja Turbo Kombat',
      posts: [
        {
          day: 1,
          user: 'theo_k',
          text: 'hi. sorry if this is a dumb question. how do u beat level 4? the guy with the umbrella blocks everything. i tried 23 times. sorry for the long post',
        },
        { day: 1, user: 'xXSniperHawkXx', text: 'n00b' },
        { day: 1, user: 'l33t_m4st3r_99', text: 'n00b' },
        { day: 2, user: 'DarkFlame2007', text: 'n00b lol' },
        {
          day: 2,
          user: 'PizzaRolls4Life',
          text: 'ok for real: jump OVER him and kick his back when he opens the umbrella. he cant block from behind. thats it',
        },
        {
          day: 2,
          user: 'theo_k',
          text: 'it WORKED. thank u PizzaRolls4Life. sorry for the double post. and thanks to everyone who said n00b too i guess',
        },
        {
          day: 3,
          user: 'CaveKing',
          text: 'MOD NOTE: i deleted 22 more replies that just said n00b. be nice to new ppl or i lock this thread. (the helpful one stays)',
        },
        {
          day: 3,
          user: 'theo_k',
          text: 'sorry, off topic, but i cant play this week. bio project. we made a cell out of jello. its... wobbly',
        },
        {
          day: 5,
          user: 'theo_k',
          text: 'update: beat the whole game. AND got a B+ on the jello cell. sorry for bragging',
        },
      ],
    },
    {
      id: 'pc-vs-console',
      title: 'PC vs CONSOLE. settle it. GO',
      board: 'General Gaming',
      posts: [
        {
          day: 2,
          user: 'DarkFlame2007',
          text: 'pc vs console. whoever loses has to admit it. GO',
        },
        {
          day: 2,
          user: 'l33t_m4st3r_99',
          text: 'CONSOLE. u can play on the couch. case closed',
        },
        {
          day: 3,
          user: 'marco.bassline',
          text: `i have a pc that runs galaxy raiders 3 on max. i use it to email my landlord. so. console. my little cousin beats me at thunder kart anyway. ${g('she', 'he')} doesnt even look at the screen`,
        },
        { day: 3, user: 'DarkFlame2007', text: 'who even r u' },
        {
          day: 4,
          user: 'marco.bassline',
          text: 'someone who owns both and plays neither. i play bass',
        },
        {
          day: 4,
          user: 'l33t_m4st3r_99',
          text: 'is velvet lantern a game?? never heard of it',
        },
        {
          day: 5,
          user: 'marco.bassline',
          text: 'its a band. we played the bean cellar last night. sold out. capacity is 11',
        },
      ],
    },
    {
      id: 'best-trick-irl',
      title: 'best trick u ever landed IRL?',
      board: 'Off Topic',
      posts: [
        {
          day: 1,
          user: 'Kickflip_Kev',
          text: 'ok gamers go outside for 1 sec. best trick u ever landed in REAL LIFE? mine: a 50-50 on the curb at the gas station',
        },
        {
          day: 2,
          user: 'PizzaRolls4Life',
          text: 'i landed on my back. does that count',
        },
        {
          day: 2,
          user: 'xXSniperHawkXx',
          text: 'i landed a 900 in Rail Grind Pro 2. thats basically irl',
        },
        {
          day: 3,
          user: 'Kickflip_Kev',
          text: 'a video game is NOT irl. anyone?? hello??',
        },
        {
          day: 5,
          user: 'dex.kickflip',
          text: 'kickflip. yesterday. after like 400 tries. nobody filmed it. camera was in my bag. so u have to trust me',
        },
      ],
    },
  ],
  CHEATCAVE_FORUM_WEEK2,
);
