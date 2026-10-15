// celebgossip07.example: "Celeb Gossip 07 ★ OMG!!" by Roxi. Every celebrity, band, show, movie and
// commenter here is invented. Two posts a day for days 1–5 (day-gated); the Tinfoil Comets show
// (between days 4 and 5) and Kayla's twin-hoodie feud echo the friends' storylines.
import type { BlogPost, Poll } from './types';

export const GOSSIP_HOST = 'celebgossip07.example';

export const GOSSIP_TEXT = {
  title: 'Celeb Gossip 07',
  star: '★',
  omg: 'OMG!!',
  tagline: 'all the goss. none of the facts. updated like 2x a day!!!',
  owner: 'Roxi',
  about:
    'hi im Roxi!!! i write about celebs bc my life is boring and theirs is NOT. everything here is 100% true* (*probably)',
  disclaimer:
    'Celeb Gossip 07 is a fan blog. all rumors r rumors. if u r a celeb and u r mad pls leave a comment',
  footer: '(c) 2007 Celeb Gossip 07. do not copy my posts, copy my STYLE',
  tagsHeading: 'TAGZ',
  pollHeading: 'HOT or NOT?!',
  noPostYet: 'that post doesnt exist (yet??). Roxi is on it!!!',
  noTagPosts: 'no posts with that tag yet. check back 2morrow!!!',
};

export interface Celeb {
  /** The tag used on posts about them. */
  tag: string;
  name: string;
  famousFor: string;
  status: string;
  /** Roxi's hotness meter, 1–5 stars. */
  stars: number;
  facts: readonly string[];
}

export const CELEBS: readonly Celeb[] = [
  {
    tag: 'starla vance',
    name: 'Starla Vance',
    famousFor: 'pop princess. "Sparkle Alarm" was #1 for 9 weeks',
    status: 'on tour + buying scrunchies',
    stars: 5,
    facts: [
      'her album Bubblegum Galaxy went triple platinum',
      'has a pet bunny named Mr Fluffington',
      'says she writes all her songs in the bath',
    ],
  },
  {
    tag: '4ever boulevard',
    name: '4Ever Boulevard',
    famousFor: 'boy band. 5 guys, 1 dance move, matching vests',
    status: 'in the studio (allegedly)',
    stars: 4,
    facts: [
      'members: Jayden, Tyler, Marcus, Brett and Kyle (the quiet one)',
      'their hit "Girl, U R My Homework" is about homework. probably',
      'they have the frostiest tips in the business',
    ],
  },
  {
    tag: 'bianca goldcrest',
    name: 'Bianca Goldcrest',
    famousFor: 'reality TV heiress on "Silver Spoon Ranch"',
    status: 'learning what a barn is',
    stars: 3,
    facts: [
      'her hotel family owns 40 hotels and 1 (one) farm now',
      'her chihuahua Duchess has her own bodyguard',
      'catchphrase: "thats SO not ranch"',
    ],
  },
  {
    tag: 'rex hammerton',
    name: 'Rex Hammerton',
    famousFor: 'action star. Exploding Point 1, 2 and 3',
    status: 'filming Exploding Point 3: Detonation Day',
    stars: 4,
    facts: [
      'catchphrase: "thats gonna leave a crater"',
      'claims to do all his own stunts',
      'his biceps have their own fan club',
    ],
  },
  {
    tag: 'dakota sky',
    name: 'Dakota Sky',
    famousFor: 'star of the teen drama "Maple Bay"',
    status: 'feuding (or IS she)',
    stars: 4,
    facts: [
      'cried real tears in the Maple Bay season finale',
      'owns 200 pairs of flip flops',
      'once played a mermaid in a cereal ad',
    ],
  },
  {
    tag: 'tinfoil comets',
    name: 'Tinfoil Comets',
    famousFor: 'space-pop band. Nova, Buzz, Mo and Ziggy',
    status: 'live at Riverside Arena!!!',
    stars: 5,
    facts: [
      'Buzz wears a real tinfoil hat on stage',
      'Ziggy throws a drumstick into the crowd every show',
      'their album Hello, Robot has a robot named Kevin on the cover',
    ],
  },
];

/** Two posts a day, oldest first; the site shows `day <= currentDay`, newest first. */
export const GOSSIP_POSTS: readonly BlogPost[] = [
  {
    id: 'starla-scrunchies',
    day: 1,
    title: 'SPOTTED: Starla Vance buys FORTY scrunchies?!',
    body: 'OMG!!! a source (my cousin who works at the mall) says Starla Vance walked into Hair Heaven yesterday and bought 40 scrunchies. FORTY!!!\n\nis this a comeback??? are scrunchies back??? do i have to dig mine out of the bathroom drawer??? Starlas people say she "just likes them". sure Starla. SURE.',
    tags: ['starla vance', 'fashion', 'spotted'],
    photo: {
      scene: 'party',
      seed: 9101,
      caption: 'blurry but thats DEFINITELY her',
    },
    comments: [
      {
        user: 'popfan4life',
        text: 'starla can wear whatever she wants shes a QUEEN',
      },
      { user: 'hater_patrol', text: '40 is too many for 1 head' },
      {
        user: '~*starla_stan*~',
        text: 'i have 41. so who is the trendsetter now',
      },
    ],
  },
  {
    id: 'tinfoil-sold-out',
    day: 1,
    title: 'Tinfoil Comets SELL OUT Riverside Arena in 11 minutes!!!',
    body: 'the Tinfoil Comets show at Riverside Arena is SOLD OUT. tickets lasted 11 minutes. a local radio station gave the last 2 away and the winner apparently screamed so loud the DJ dropped his headphones.\n\ndrummer Ziggy Voltz promises "the biggest drumstick spin of my career". Buzz says he is making a new tinfoil hat for the occasion. "a shinier one". we will be watching!!!',
    tags: ['tinfoil comets', 'concerts', 'ziggy'],
    comments: [
      {
        user: 'comet_fan_4ever',
        text: 'didnt get tickets. i am FINE. (i am not fine)',
      },
      {
        user: 'xX~JeSs~Xx :D',
        text: 'THAT WAS ME ON THE RADIO!!!!! I WON!!! FRONT ROW HERE I COME (L)',
      },
      { user: 'bored_in_class', text: 'whats a tinfoil comet' },
      { user: 'comet_fan_4ever', text: '@bored_in_class get out' },
    ],
  },
  {
    id: 'kyle-tips',
    day: 2,
    title:
      '4Ever Boulevard\'s Kyle CUTS OFF his frosted tips. fans: "we are not ok"',
    body: 'it is a sad day 4 frosted tip lovers everywhere. Kyle from 4Ever Boulevard (the quiet one) showed up to a signing with plain brown hair. JUST BROWN.\n\nfans were seen crying into their matching vests. Kyle said "it was time". time for WHAT Kyle. the band says the new single is still coming out but honestly how can we think about music at a time like this',
    tags: ['4ever boulevard', 'hair', 'omg'],
    photo: {
      scene: 'party',
      seed: 9102,
      caption: 'the last known photo of the tips (RIP)',
    },
    comments: [
      {
        user: 'boulevard_girl_99',
        text: 'i have a poster of the tips. what do i do with it now',
      },
      { user: 'popfan4life', text: 'brown is a valid hair color guys' },
      { user: 'boulevard_girl_99', text: '@popfan4life not for KYLE' },
    ],
  },
  {
    id: 'bianca-cow',
    day: 2,
    title:
      'Bianca Goldcrest milks a cow on Silver Spoon Ranch. the cow is "unimpressed"',
    body: 'on this weeks Silver Spoon Ranch, hotel heiress Bianca Goldcrest had to milk a cow named Brenda. she wore white boots. you can guess how that went.\n\nBianca: "thats SO not ranch". Brenda: did not comment. Duchess the chihuahua watched from a tiny hay bale wearing a tiny cowboy hat. honestly Duchess is the real star of this show',
    tags: ['bianca goldcrest', 'reality tv', 'animals'],
    comments: [
      {
        user: 'pia (L) ponies (L)',
        text: 'cows r just big ponies with spots. be NICE to brenda',
      },
      {
        user: 'ranch_hand_rick',
        text: 'u pull DOWN not sideways. come on bianca',
      },
      { user: 'duchess_fanclub', text: 'DUCHESS 4 PRESIDENT' },
    ],
  },
  {
    id: 'rex-stunts',
    day: 3,
    title: 'Rex Hammerton "does his own stunts" (he fell off a curb)',
    body: 'action hero Rex Hammerton was on set for Exploding Point 3: Detonation Day when he tripped over a curb walking to his trailer. a CURB!!! the man jumps off helicopters for a living (in movies).\n\nhis rep says it was "a planned stunt rehearsal". Rex was seen limping to the snack table and then he said "thats gonna leave a crater". it did not leave a crater. it left a small scrape',
    tags: ['rex hammerton', 'movies', 'ouch'],
    photo: { scene: 'trip', seed: 9103, caption: 'the curb in question' },
    comments: [
      { user: 'dex', text: 'curbs r no joke. respect' },
      {
        user: 'action_jackson',
        text: 'EP3 is gonna be the best one. scrape or no scrape',
      },
      {
        user: 'hater_patrol',
        text: 'i could fall off a curb too. where is my movie',
      },
    ],
  },
  {
    id: 'starla-dakota-dress',
    day: 3,
    title: 'FEUD ALERT: Starla Vance + Dakota Sky wear THE SAME DRESS',
    body: 'it finally happened. at the Teen Wave Awards, pop princess Starla Vance and Maple Bay star Dakota Sky showed up in the EXACT same sparkly purple dress. same dress. same shoes. same face of horror.\n\nthey stood on opposite ends of the red carpet and did not look at each other once. a source says Dakota "knew" and wore it "on purpose". Starlas people say "no comment" which means YES COMMENT. this is the feud of the year people',
    tags: ['starla vance', 'dakota sky', 'feud', 'fashion'],
    photo: {
      scene: 'party',
      seed: 9104,
      caption: 'spot the difference (u cant)',
    },
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'this is literally my life rn. EXACT same thing happened 2 me w a hoodie. stay strong starla',
      },
      { user: '~*starla_stan*~', text: 'starla wore it first. DAKOTA COPIED' },
      { user: 'maplebay_mel', text: 'dakota wore it BETTER tho' },
      { user: '~*Kayla*~ <3', text: 'maplebay_mel ur not helping' },
    ],
  },
  {
    id: 'buzz-hat',
    day: 4,
    title:
      "Tinfoil Comets TONIGHT: is Buzz's hat insured for a MILLION dollars?",
    body: 'tonight is the night!!! Tinfoil Comets play the sold out Riverside Arena and the rumor mill is going CRAZY. sources say guitarist Buzz Kowalczyk insured his new tinfoil hat for one million dollars. the hat is made of tinfoil. it cost like $2.\n\nalso Ziggy has been "practicing his throw" all week, and fans in the front row are making signs. if u r going: bring earplugs. and a helmet maybe',
    tags: ['tinfoil comets', 'concerts', 'rumors'],
    comments: [
      {
        user: 'comet_fan_4ever',
        text: 'the hat is worth more than a million to ME',
      },
      {
        user: 'marco | velvet lantern',
        text: 'arena shows are fine. the real music is in tiny rooms. velvet lantern. the bean cellar. go',
      },
      {
        user: 'xX~JeSs~Xx :D',
        text: 'I HAVE A SIGN AND TINFOIL ARMBANDS. I AM READY. ZIGGY I AM READY',
      },
    ],
  },
  {
    id: 'starla-dakota-bffs',
    day: 4,
    title: 'PLOT TWIST: Starla + Dakota are... BFFs???',
    body: 'stop everything. remember the dress feud??? Starla Vance and Dakota Sky were spotted getting frozen yogurt TOGETHER. laughing. sharing toppings. wearing MATCHING charm bracelets.\n\nturns out they have been friends since a cereal ad they did when they were 9 (Dakota was the mermaid, Starla was the singing spoon). the dress thing was "a total accident" and they think its "hilarious now". i dont know what to believe anymore. i had a whole post ready',
    tags: ['starla vance', 'dakota sky', 'feud', 'spotted'],
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'ok this is ALSO my life. i am so confused. is everyone secretly nice??',
      },
      { user: 'hater_patrol', text: 'fake. this is for the magazines' },
      {
        user: 'maplebay_mel',
        text: 'the singing spoon!!! i remember that ad!!!',
      },
    ],
  },
  {
    id: 'tinfoil-recap',
    day: 5,
    title:
      'CONCERT RECAP: Ziggy\'s drumstick hits a front row fan IN THE FACE. fan "has never been happier"',
    body: 'the Tinfoil Comets show at Riverside Arena was EPIC by all accounts. Nova held the last note of Space Girl for 24 seconds (a new record). Buzz kept the hat on the whole time. Mo turned around ONCE.\n\nbut the moment everyone is talking about: Ziggy did the biggest drumstick spin ever, then threw the stick into the front row where it bonked a fan right on the forehead. witnesses say she caught it on the rebound, held it up and screamed for 2 full minutes. legend. ziggy if u read this: aim lower next time',
    tags: ['tinfoil comets', 'concerts', 'ziggy', 'omg'],
    photo: {
      scene: 'concert',
      seed: 9105,
      caption: 'the spin of the century (sent in by a reader)',
    },
    comments: [
      {
        user: 'xX~JeSs~Xx :D',
        text: 'THAT WAS ME!!!!!!! IT WAS MY FACE!!!!! I HAVE THE DRUMSTICK AND A BUMP AND I REGRET NOTHING (L)(L)(L)',
      },
      { user: 'comet_fan_4ever', text: 'jealous of ur face tbh' },
      {
        user: 'spacegirl4eva',
        text: '24 seconds. i will be thinking about this forever',
      },
      { user: 'bored_in_class', text: 'ok i get the tinfoil comets thing now' },
    ],
  },
  {
    id: 'eau-de-duchess',
    day: 5,
    title: "Bianca Goldcrest's chihuahua Duchess launches a PERFUME",
    body: 'in news nobody asked for: Duchess, the chihuahua from Silver Spoon Ranch, now has her own perfume. it is called Eau de Duchess and it comes in a bottle shaped like a tiny dog bone.\n\nBianca says it smells "like a spa day". people who smelled it say it smells "like a dog that had a spa day". it costs $80. Duchess was not available for comment (she was asleep in a handbag)',
    tags: ['bianca goldcrest', 'animals', 'omg'],
    photo: {
      scene: 'pet',
      seed: 9106,
      caption: 'Duchess at the launch party (exhausted)',
    },
    comments: [
      { user: 'duchess_fanclub', text: 'BUYING 3' },
      {
        user: 'pia (L) ponies (L)',
        text: 'i want a pony perfume. it would smell like hay and LOVE',
      },
      {
        user: 'ranch_hand_rick',
        text: 'brenda the cow deserves a perfume more',
      },
    ],
  },
];

/** One "hot or not" poll a day; the sidebar shows the newest with `day <= currentDay`. */
export const GOSSIP_POLLS: readonly Poll[] = [
  {
    id: 'scrunchies',
    day: 1,
    question: "Starla's 40 scrunchies:",
    options: ['HOT', 'NOT'],
  },
  {
    id: 'kyle-hair',
    day: 2,
    question: 'Kyle without the frosted tips:',
    options: ['HOT', 'NOT', 'who is kyle'],
  },
  {
    id: 'rex-limp',
    day: 3,
    question: 'Rex Hammerton\'s "stunt" limp:',
    options: ['HOT', 'NOT'],
  },
  {
    id: 'buzz-hat',
    day: 4,
    question: "Buzz's million dollar tinfoil hat:",
    options: ['HOT', 'NOT', 'i want one'],
  },
  {
    id: 'eau-de-duchess',
    day: 5,
    question: 'Eau de Duchess (dog perfume):',
    options: ['HOT', 'NOT', 'ew'],
  },
];
