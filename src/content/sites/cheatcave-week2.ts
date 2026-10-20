// cheatcave.example, days 6–10 (bible §5): CaveKing's news (1–2 a day), two new clips (Marco's
// bingo rival on day 7, Derek's upside-down mic from the rec hall on day 10, the new #1) and forum
// replies: Marco's LAN rematch (7), Theo's poster (8), Dex on tape at the Jam (9), Kev was there (10).
import type { ForumPost, ForumThread, FunnyClip, NewsPost } from './types';

export const CHEATCAVE_NEWS_WEEK2: readonly NewsPost[] = [
  {
    day: 6,
    title: 'Galaxy Raiders 3: the BIGBRAIN code still works',
    author: 'CaveKing',
    body: 'a reader asked if BIGBRAIN still works after the patch. we checked. TWICE. title screen, type it, everyone gets a giant head. if it doesnt work for u, u typed BIGBRIAN. everyone types BIGBRIAN',
  },
  {
    day: 7,
    title: 'Zombie Lunchroom 2?!',
    author: 'CaveKing',
    body: 'the guy who made Zombie Lunchroom put a picture on his site. it is a lunch tray. there is a 2 on it. that is all we know. that is ENOUGH. this is the biggest news since the cows in Tiny Tank Takedown 2',
  },
  {
    day: 7,
    title: 'new clip: grandma wins bingo FOUR times in a row',
    author: 'CaveKing',
    body: 'the hall goes quiet. she says bingo. again. a man in the back throws his pen. watch it on the clips page. bingo always wins. we dont make the rules',
  },
  {
    day: 8,
    title: 'Thunder Kart: the rainbow track is FAKE',
    author: 'CaveKing',
    body: 'remember the reader who said there is a 13th track made of rainbow? he sent the pics. it was his little brother holding a flashlight over the tv. nice try. still 12 tracks. the palm tree shortcut is real tho',
  },
  {
    day: 9,
    title: 'FLASH GAME OF THE WEEK: Goldfish Escape',
    author: 'CaveKing',
    body: 'u are a goldfish. u escape. the bowl is very small. it is harder than it sounds and it loads in under a minute on dial-up. tip: jump when the cat blinks',
  },
  {
    day: 9,
    title: 'OFFICIAL: Galaxy Raiders 4 is NOT coming',
    author: 'CaveKing',
    body: 'my cousin knows a guy who works at a store that sells games. the guy says no. so stop asking. we locked all 40 threads called "GR4??" except the funny one',
  },
  {
    day: 10,
    title: "new #1 clip: band's mic only works upside down",
    author: 'CaveKing',
    body: 'a band played the westfield rec hall tonight and the singer sang a whole song into the mic UPSIDE DOWN. like a bat. the crowd sang back. the puddle era is OVER. go see the new top 10',
  },
  {
    day: 10,
    title: 'Grandma Ninja has a secret TAUNT',
    author: 'CaveKing',
    body: 'Ninja Turbo Kombat: hold down + kick during a fight and Grandma Ninja sits down and knits. it does 0 damage. it is the best move in the game',
  },
];

export const CHEATCAVE_CLIPS_WEEK2: readonly FunnyClip[] = [
  {
    id: 'bingo-grandma',
    day: 7,
    title: 'grandma wins bingo 4 times in a row',
    length: '1:12',
    views: 31_337,
    uploader: 'b1ngo_barbara',
    photo: { scene: 'party', seed: 7312, caption: 'BINGO (again)' },
  },
  {
    id: 'upside-down-mic',
    day: 10,
    title: "band's mic only works upside down",
    length: '3:41',
    views: 131_072,
    uploader: 'derek_drums',
    photo: {
      scene: 'stage',
      seed: 7313,
      day: 10,
      caption: 'like a bat. a very loud bat',
    },
  },
];

/** Replies added to week one's threads, by thread id, oldest first. */
export const CHEATCAVE_FORUM_WEEK2: Readonly<
  Record<string, readonly ForumPost[]>
> = {
  'pc-vs-console': [
    {
      day: 6,
      user: 'DarkFlame2007',
      text: 'nobody posted in 2 days so CONSOLE WINS. thats the rule. i made it',
    },
    {
      day: 7,
      user: 'marco.bassline',
      text: 'lan rematch tonight. pc. so pc wins this week',
    },
    { day: 7, user: 'DarkFlame2007', text: 'who even r u (again)' },
  ],
  'ntk-level-4': [
    {
      day: 8,
      user: 'theo_k',
      text: 'sorry. cant play this week. drawing a poster for a band. sorry',
    },
    {
      day: 8,
      user: 'PizzaRolls4Life',
      text: 'a BAND?? theo is famous now. dont forget us little ppl',
    },
  ],
  'best-trick-irl': [
    {
      day: 9,
      user: 'dex.kickflip',
      text: 'kickflip. at the jam. on tape this time. kev has it',
    },
    {
      day: 9,
      user: 'Kickflip_Kev',
      text: 'I HAVE IT. 6 seconds. lens cap OFF. kickflipkings.example/video',
    },
    {
      day: 10,
      user: 'Kickflip_Kev',
      text: 'the #1 clip with the upside down mic? i was there. dex filmed it from the front. derek filmed it from behind the bucket',
    },
  ],
};

/** `threads` with `posts` appended to each (the threads' days stay in order). */
export function withForumPosts(
  threads: readonly ForumThread[],
  posts: Readonly<Record<string, readonly ForumPost[]>>,
): readonly ForumThread[] {
  return threads.map((t) => ({
    ...t,
    posts: [...t.posts, ...(posts[t.id] ?? [])],
  }));
}
