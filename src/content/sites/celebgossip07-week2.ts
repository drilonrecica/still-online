// celebgossip07.example, days 6–10 (bible §5): two posts and one poll a day, as in week one.
// Bangs season echoes Kayla and Brianna (day 7), Lakeview sells out in 9 minutes (day 8, Jess's
// grief) and blows Buzz's hat away on show night (day 10, the same night as the rec hall).
import type { BlogPost, Poll } from './types';

export const GOSSIP_POSTS_WEEK2: readonly BlogPost[] = [
  {
    id: 'bff-bracelets',
    day: 6,
    title: 'Starla + Dakota trade BFF BRACELETS. on the red carpet',
    body: 'remember when they wore the same dress and we all thought it was WAR??? well now Starla Vance and Dakota Sky have matching BFF bracelets. half a heart each. Starla has "BE FRI" and Dakota has "ST ENDS".\n\nthey showed them off at the Maple Bay premiere party and held them together for the cameras for like 5 minutes. a photographer says his arm got tired. i have never been so confused and so happy at the same time',
    tags: ['starla vance', 'dakota sky', 'fashion', 'spotted'],
    photo: {
      scene: 'party',
      seed: 9107,
      caption: 'BE FRI + ST ENDS (they had to stand very close)',
    },
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'ok so u CAN go from feud to bff. noted. not saying who im thinking of',
      },
      { user: 'maplebay_mel', text: 'i want the dakota half' },
      { user: 'hater_patrol', text: 'ST ENDS sounds like a disease' },
    ],
  },
  {
    id: 'rex-trailer-trip',
    day: 6,
    title: 'Exploding Point 3 trailer: Rex Hammerton TRIPS. they kept it in',
    body: 'the first trailer for Exploding Point 3: Detonation Day is out and fans with sharp eyes spotted something at 1:12. Rex walks away from an explosion (cool) and trips over a hose (not cool). he does not fall. he does a little hop.\n\nthe studio says the hop is "part of the character". Rex says "thats gonna leave a crater". again. there is no crater. i have watched it 40 times on dial-up. it took all night',
    tags: ['rex hammerton', 'movies', 'ouch'],
    comments: [
      {
        user: 'dex',
        text: 'the hop is a good save. respect again',
      },
      {
        user: 'action_jackson',
        text: 'the hop is the best part. EP3 4 oscar',
      },
      {
        user: 'bored_in_class',
        text: 'what is it with this man and the ground',
      },
    ],
  },
  {
    id: 'bangs-season',
    day: 7,
    title: 'BANGS SEASON: Starla AND Dakota get bangs. on the SAME DAY',
    body: 'it is official. it is bangs season. Starla Vance walked out of Hair Heaven with brand new bangs in the morning. by the afternoon Dakota Sky had bangs TOO. same length. same side swoop.\n\nnobody knows who copied who. Starla says "great minds". Dakota says "it was booked for weeks". a source (my cousin, still at the mall) says the stylist "just wants to go home". if ur best friend gets bangs tomorrow, now u know why',
    tags: ['starla vance', 'dakota sky', 'hair', 'feud'],
    photo: {
      scene: 'party',
      seed: 9108,
      caption: 'bangs on the left. bangs on the right. bangs EVERYWHERE',
    },
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'I HAD THEM FIRST. not starla. not dakota. ME. and now SOMEONE at my school has them too and is running against me. this is my life',
      },
      { user: '~*starla_stan*~', text: 'starla had them first. it was 9am' },
      { user: 'maplebay_mel', text: 'dakota booked it LAST WEEK. i saw it' },
      { user: '~*Kayla*~ <3', text: 'maplebay_mel ur STILL not helping' },
    ],
  },
  {
    id: 'bianca-buys-brenda',
    day: 7,
    title: 'Bianca Goldcrest BUYS Brenda the cow. Brenda moves into the hotel',
    body: 'Silver Spoon Ranch is over for the season and Bianca Goldcrest could not say goodbye. so she BOUGHT Brenda the cow. Brenda now lives in the garden of the Goldcrest Grand Hotel, next to the fountain.\n\nthe hotel says Brenda is "a guest like any other". she has a room key on her collar. she does not use it. Duchess the chihuahua has not spoken to Bianca since',
    tags: ['bianca goldcrest', 'reality tv', 'animals'],
    comments: [
      {
        user: 'pia (L) ponies (L)',
        text: 'GOOD. brenda deserves a hotel. i am asking my mom 4 a hamster TONIGHT and bianca got a WHOLE COW',
      },
      { user: 'ranch_hand_rick', text: 'finally someone treats brenda right' },
      {
        user: 'duchess_fanclub',
        text: 'duchess was there first. JUSTICE 4 DUCHESS',
      },
    ],
  },
  {
    id: 'lakeview-sold-out',
    day: 8,
    title: 'Tinfoil Comets SELL OUT Lakeview Fairgrounds in 9 MINUTES',
    body: 'they did it again. tickets for the Tinfoil Comets at Lakeview Fairgrounds went on sale this morning and were GONE in 9 minutes. that is 2 minutes faster than Riverside Arena.\n\nthe phone line at TicketTown was busy for an hour after it sold out. people were still calling to ask if it was really sold out. it was really sold out. Buzz says he is making an outdoor hat. "for the wind"',
    tags: ['tinfoil comets', 'concerts', 'omg'],
    comments: [
      {
        user: 'xX~JeSs~Xx :D',
        text: 'NINE MINUTES. I WAS ON HOLD FOR ALL NINE. THE HOLD MUSIC WAS NOT EVEN THEM',
      },
      {
        user: 'comet_fan_4ever',
        text: 'didnt get tickets AGAIN. i am a ghost now',
      },
      {
        user: 'marco | velvet lantern',
        text: 'same night: velvet lantern at the westfield rec hall. no tickets needed. no wind either',
      },
      {
        user: 'xX~JeSs~Xx :D',
        text: '@marco I KNOW. I AM COMING. I AM MAKING A SIGN',
      },
    ],
  },
  {
    id: 'duchess-recall',
    day: 8,
    title: 'Eau de Duchess RECALLED. it "smells like dog"',
    body: 'it lasted 3 days. Eau de Duchess, the $80 perfume named after Bianca Goldcrests chihuahua, has been pulled from every store. the official reason: "customer feedback". the real reason: it smells like dog.\n\nnot a dog after a spa day. just dog. a store lady told my cousin it made the whole perfume counter smell like a pet shop. Duchess is said to be "fine with it". she was asleep in a handbag again',
    tags: ['bianca goldcrest', 'animals', 'rumors'],
    comments: [
      { user: 'duchess_fanclub', text: 'i bought 3. i am keeping all 3' },
      {
        user: 'pia (L) ponies (L)',
        text: 'smelling like dog is GOOD. biscuit smells like dog and he is the best',
      },
      { user: 'hater_patrol', text: 'called it. day 5. look it up' },
    ],
  },
  {
    id: 'kyle-hair-back',
    day: 9,
    title:
      "4Ever Boulevard drop a COMEBACK single and Kyle's hair is... growing back???",
    body: 'two big news in one post bc i cannot handle two posts about this. 4Ever Boulevard have a new single called "Grow Back To Me" and in the video Kyle (the quiet one) has TIPS AGAIN. little ones. baby tips.\n\nis the song about hair??? the band says no. the chorus says "it was time / now its time again". KYLE. fans are crying into their vests again, but happy this time',
    tags: ['4ever boulevard', 'hair', 'omg'],
    photo: {
      scene: 'concert',
      seed: 9109,
      caption: 'the baby tips (zoom in. ZOOM IN)',
    },
    comments: [
      {
        user: 'boulevard_girl_99',
        text: 'i KNEW keeping the poster was right',
      },
      {
        user: 'popfan4life',
        text: 'brown was fine. tips are also fine. i love everyone',
      },
      { user: 'boulevard_girl_99', text: '@popfan4life we are so back' },
    ],
  },
  {
    id: 'best-bangs-tie',
    day: 9,
    title: 'Teen Wave poll: "best bangs" is a TIE. Starla and Dakota SHARE it',
    body: 'the Teen Wave magazine poll for "best bangs of the year" closed today and the result is a TIE. Starla Vance and Dakota Sky got the exact same number of votes. the magazine says it counted twice.\n\nthey will share the trophy. it is a gold pair of scissors. they say they will keep it "one week each". i give that a month',
    tags: ['starla vance', 'dakota sky', 'hair', 'feud'],
    comments: [
      {
        user: '~*Kayla*~ <3',
        text: 'a TIE?? that is so random. that would NEVER happen in real life. (it happened today. at my school. i cant talk about it)',
      },
      {
        user: 'maplebay_mel',
        text: 'dakota should have it 2 weeks. she had more swoop',
      },
      { user: '~*starla_stan*~', text: 'recount' },
    ],
  },
  {
    id: 'lakeview-hat',
    day: 10,
    title: "LAKEVIEW: Buzz's tinfoil hat BLOWS AWAY. live on the radio",
    body: 'the Tinfoil Comets played Lakeview Fairgrounds tonight and it was WINDY. three songs in, a big gust took Buzz Kowalczyks tinfoil hat clean off his head and over the crowd. the radio guy said "and there goes the hat". the crowd screamed louder than for any song.\n\nBuzz played the rest of the show with NO HAT for the first time ever. Ziggy did the spin anyway. if u found a shiny hat in a field near Lakeview: it is worth a million dollars. allegedly',
    tags: ['tinfoil comets', 'concerts', 'ziggy', 'omg'],
    photo: {
      scene: 'concert',
      seed: 9110,
      caption: 'the hat, seconds before it left us',
    },
    comments: [
      {
        user: 'comet_fan_4ever',
        text: 'listened on the radio. heard the hat leave',
      },
      {
        user: 'xX~JeSs~Xx :D',
        text: 'I WAS AT A DIFFERENT SHOW TONIGHT AND IT WAS ALSO AMAZING. A BASS PLAYER THREW ME A PICK. I CAUGHT IT WITH MY HAND THIS TIME',
      },
      {
        user: 'marco | velvet lantern',
        text: 'it was a pick. i said no first. it does not count as throwing if u say no first',
      },
      { user: 'spacegirl4eva', text: 'hat or no hat. buzz is buzz' },
    ],
  },
  {
    id: 'rex-stunt-nap',
    day: 10,
    title: 'Rex Hammerton\'s "big stunt" on the EP3 set was... a NAP',
    body: 'the Exploding Point 3 team promised fans "the biggest stunt Rex has ever done" today. fans waited outside the set all afternoon. the stunt: Rex lies down on a car roof. the car does not move. Rex falls asleep.\n\nhis rep says it was "a stunt of endurance". the director says they "got the shot". the car is fine. Rex woke up and said "thats gonna leave a crater". it left a small dent',
    tags: ['rex hammerton', 'movies', 'rumors'],
    comments: [
      {
        user: 'action_jackson',
        text: 'sleeping on a car is HARDER than it looks',
      },
      { user: 'dex', text: 'did that once. on a ramp. respect' },
      { user: 'hater_patrol', text: 'i also nap. where is my movie (again)' },
    ],
  },
];

export const GOSSIP_POLLS_WEEK2: readonly Poll[] = [
  {
    id: 'bff-bracelets',
    day: 6,
    question: 'BFF bracelets:',
    options: ['HOT', 'NOT'],
  },
  {
    id: 'bangs',
    day: 7,
    question: 'Bangs:',
    options: ['HOT', 'NOT', 'i have them'],
  },
  {
    id: 'lakeview',
    day: 8,
    question: 'Lakeview selling out in 9 minutes:',
    options: ['HOT', 'NOT', 'i didnt get tix'],
  },
  {
    id: 'kyle-hair-back',
    day: 9,
    question: "Kyle's hair growing back:",
    options: ['HOT', 'NOT'],
  },
  {
    id: 'buzz-hat-wind',
    day: 10,
    question: "Buzz's hat in the wind:",
    options: ['HOT', 'NOT'],
  },
];
