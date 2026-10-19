// Marco, days 2–5: Velvet Lantern plays the bean cellar. The flyer goes up, Derek quits over a
// one-snare rule, un-quits with a paint bucket, and 11 people come. Lowercase, dry, never "!".
// Days 6–10 are in `marco-week2.ts`; both are exported from here.
import type { Contact, Script } from '../types';
import { marcoWeek2Days, marcoWeek2Scripts } from './marco-week2';

export const marcoDays: Contact['days'] = {
  2: {
    status: 'busy',
    personalMessage: 'velvet lantern @ the bean cellar. flyers up',
  },
  3: {
    status: 'away',
    personalMessage: 'drummer wanted. must fit in a backpack',
  },
  4: { status: 'busy', personalMessage: 'derek is back. so is the bucket' },
  5: { status: 'online', personalMessage: 'sold out show. venue capacity: 11' },
  ...marcoWeek2Days,
};

export const marcoDayScripts: readonly Script[] = [
  {
    id: 'day2',
    trigger: { type: 'onDay', day: 2 },
    start: 'flyer',
    nodes: {
      flyer: {
        lines: [
          { text: 'hey kid', delayMs: 15_000 },
          {
            text: 'the flyer is up. coffee place, laundromat, bus stop',
            delayMs: 1500,
          },
          {
            text: 'velvet lantern. live at the bean cellar. one night only',
            delayMs: 1400,
          },
          {
            text: 'the bean cellar is the basement under the coffee place. very intimate',
            delayMs: 1600,
          },
        ],
        choices: [
          {
            text: 'how many people fit in there?',
            label: 'How many fit?',
            next: 'capacity',
          },
          {
            text: 'did u use my flyer??',
            label: 'My flyer??',
            next: 'myflyer',
          },
        ],
      },
      myflyer: {
        lines: [
          { text: 'parts of it', delayMs: 1500 },
          {
            text: 'derek "improved" it with a marker. dont ask',
            delayMs: 1300,
          },
          { text: 'people can still read the name. mostly', delayMs: 1200 },
        ],
        choices: [
          {
            text: 'what did he draw??',
            label: 'What did he draw?',
            next: 'marker',
          },
          {
            text: 'ugh. so how many people fit?',
            label: 'How many fit?',
            next: 'capacity',
          },
        ],
      },
      marker: {
        lines: [
          { text: 'a lantern. its supposed to be a lantern', delayMs: 1400 },
          { text: 'it looks like a jar of soup', delayMs: 1100 },
          { text: 'three people asked if were selling soup', delayMs: 1300 },
          {
            delayMs: 1200,
            personalMessageChange: 'velvet lantern @ the bean cellar. not soup',
          },
        ],
        end: true,
      },
      capacity: {
        lines: [
          {
            text: 'the guy said 11. maybe 12 if theyre friends',
            delayMs: 1500,
          },
          {
            text: 'fire code is a suggestion. his words not mine',
            delayMs: 1300,
          },
        ],
        choices: [
          { text: 'thats tiny lol', label: 'Tiny lol', next: 'tiny' },
          { text: 'cozy. very indie', label: 'Very indie', next: 'indie' },
        ],
      },
      tiny: {
        lines: [
          { text: 'its called exclusive', delayMs: 1200 },
          { text: 'ur still on the list. if ur mom says ok', delayMs: 1300 },
          {
            delayMs: 1200,
            personalMessageChange: 'velvet lantern. exclusive. (tiny)',
          },
        ],
        end: true,
      },
      indie: {
        lines: [
          { text: 'see. u get it', delayMs: 1200 },
          { text: 'derek says its "too small for his sound"', delayMs: 1300 },
          {
            text: 'derek always says that. ok practice. later kid',
            delayMs: 1400,
          },
          { delayMs: 1200, statusChange: 'away' },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day3',
    trigger: { type: 'onDay', day: 3 },
    start: 'quit',
    nodes: {
      quit: {
        lines: [
          { text: 'so', delayMs: 18_000 },
          { text: 'derek quit', delayMs: 1200 },
          { text: 'again. thats 4 this year', delayMs: 1100 },
          {
            text: 'the bean cellar has no room for a drum kit. the guy said he can bring one snare',
            delayMs: 1800,
          },
        ],
        choices: [
          { text: 'one snare??', label: 'One snare??', next: 'snare' },
          {
            text: 'can u find a new drummer?',
            label: 'New drummer?',
            next: 'replace',
          },
          {
            text: 'tell him i said dont quit',
            label: 'Tell him dont quit',
            next: 'plea',
          },
        ],
      },
      snare: {
        lines: [
          {
            text: 'one snare. and "whatever fits in a backpack"',
            delayMs: 1500,
          },
          {
            text: 'derek took it personally. he says his art needs cymbals',
            delayMs: 1500,
          },
        ],
        choices: [
          { text: 'his ART lol', label: 'His art lol', next: 'art' },
          {
            text: 'hell come back. he always does',
            label: 'Hell come back',
            next: 'always',
          },
        ],
      },
      art: {
        lines: [
          { text: 'i know', delayMs: 1100 },
          {
            text: 'i said that to him. thats partly why he quit',
            delayMs: 1400,
          },
          {
            delayMs: 1200,
            personalMessageChange: 'drummer wanted. no art please',
          },
        ],
        end: true,
      },
      always: {
        lines: [
          { text: 'probably', delayMs: 1300 },
          {
            text: 'he left his sticks here. thats usually a good sign',
            delayMs: 1400,
          },
          { text: 'or he just forgot them. later kid', delayMs: 1200 },
        ],
        end: true,
      },
      replace: {
        lines: [
          { text: 'two days before the show. sure', delayMs: 1400 },
          {
            text: 'my roommate offered. he brought a pan and a fork to audition',
            delayMs: 1600,
          },
        ],
        choices: [
          { text: 'hire him', label: 'Hire him', next: 'fork' },
          {
            text: 'ok maybe call derek back',
            label: 'Call derek',
            next: 'plea',
          },
        ],
      },
      fork: {
        lines: [
          { text: 'he kept time better than derek', delayMs: 1500 },
          { text: 'thats not a compliment to anyone', delayMs: 1200 },
          {
            delayMs: 1200,
            personalMessageChange: 'new drummer: a pan. its going ok',
          },
        ],
        end: true,
      },
      plea: {
        lines: [
          { text: 'ill tell him', delayMs: 1300 },
          {
            text: 'he doesnt listen to me. he might listen to a kid',
            delayMs: 1400,
          },
          { text: 'ok. calling him. wish me luck', delayMs: 1200 },
          { delayMs: 1000, statusChange: 'busy' },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day4',
    trigger: { type: 'onDay', day: 4 },
    start: 'back',
    nodes: {
      back: {
        lines: [
          { text: 'update', delayMs: 16_000 },
          { text: 'derek un-quit', delayMs: 1200 },
          {
            text: 'showed up to practice with a snare and a bucket',
            delayMs: 1400,
          },
          {
            text: 'he says the bucket is "a second drum". its a paint bucket',
            delayMs: 1500,
          },
        ],
        choices: [
          {
            text: 'lol does it sound good?',
            label: 'Does it sound good?',
            next: 'sound',
          },
          {
            text: 'told u hed come back',
            label: 'Told u so',
            next: 'toldu',
          },
        ],
      },
      sound: {
        lines: [
          { text: 'honestly. yes', delayMs: 1500 },
          { text: 'dont tell him i said that', delayMs: 1000 },
          {
            text: 'he also brought a tambourine. nobody asked about the tambourine',
            delayMs: 1500,
          },
        ],
        choices: [
          {
            text: 'the tambourine stays',
            label: 'Keep the tambourine',
            next: 'tambourine',
          },
          {
            text: 'are u nervous for tmrw?',
            label: 'Nervous?',
            next: 'nerves',
          },
        ],
      },
      toldu: {
        lines: [
          { text: 'ya ya', delayMs: 1200 },
          {
            text: 'he was gone 26 hours. a new record. last time was 3',
            delayMs: 1500,
          },
        ],
        choices: [
          {
            text: 'are u nervous for tmrw?',
            label: 'Nervous?',
            next: 'nerves',
          },
          { text: 'whats the setlist?', label: 'Setlist?', next: 'setlist' },
        ],
      },
      tambourine: {
        lines: [
          { text: 'the band has voted', delayMs: 1300 },
          {
            text: 'the tambourine stays. derek is unbearable about it',
            delayMs: 1400,
          },
          {
            delayMs: 1200,
            personalMessageChange: 'now featuring: a tambourine',
          },
        ],
        end: true,
      },
      setlist: {
        lines: [
          {
            text: 'six songs. five originals and a cover nobody knows',
            delayMs: 1500,
          },
          { text: 'so basically six originals', delayMs: 1100 },
          { text: 'ok. last practice. later kid', delayMs: 1200 },
        ],
        end: true,
      },
      nerves: {
        lines: [
          { text: 'no', delayMs: 1500 },
          { text: '...', delayMs: 1800 },
          {
            text: 'a little. dont tell anyone. especially aunt rita',
            delayMs: 1500,
          },
          { delayMs: 1200, personalMessageChange: 'not nervous. go away' },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day5',
    trigger: { type: 'onDay', day: 5 },
    start: 'gig',
    nodes: {
      gig: {
        lines: [
          { text: 'kid', delayMs: 14_000 },
          { text: 'the show happened', delayMs: 1200 },
          { text: '11 people came', delayMs: 1300 },
          { text: 'a sold-out show if the venue held 11', delayMs: 1400 },
          { text: 'which it did', delayMs: 1100 },
        ],
        choices: [
          { text: '11 is great!!', label: '11 is great!!', next: 'great' },
          { text: 'who were the 11?', label: 'Who came?', next: 'who' },
        ],
      },
      great: {
        lines: [
          { text: 'its fine. its a number', delayMs: 1300 },
          { text: '...', delayMs: 1500 },
          { text: 'ok it was good. it was really good', delayMs: 1300 },
        ],
        choices: [
          { text: 'proud of u :)', label: 'Proud of u', next: 'proud' },
          {
            text: 'did derek play the bucket?',
            label: 'The bucket?',
            next: 'bucket',
          },
        ],
      },
      who: {
        lines: [
          {
            text: 'my roommate. dereks mom. two girls from my lit class',
            delayMs: 1500,
          },
          { text: 'the guy from the coffee place upstairs', delayMs: 1200 },
          { text: 'and five strangers. kid. we have fans now', delayMs: 1400 },
        ],
        choices: [
          { text: 'ur famous', label: 'Ur famous', next: 'famous' },
          {
            text: 'did derek play the bucket?',
            label: 'The bucket?',
            next: 'bucket',
          },
        ],
      },
      bucket: {
        lines: [
          { text: 'the bucket was the best part', delayMs: 1400 },
          {
            text: 'he kicked it over in the last song. everyone thought it was on purpose',
            delayMs: 1600,
          },
          { text: 'its in the act now', delayMs: 1100 },
          {
            delayMs: 1200,
            personalMessageChange: 'velvet lantern ft. the bucket. sold out',
          },
        ],
        end: true,
      },
      proud: {
        lines: [
          { text: 'thanks kid', delayMs: 1400 },
          { text: 'next time ur on the list. front row', delayMs: 1300 },
          { text: 'its also the back row. its one row', delayMs: 1200 },
          {
            delayMs: 1200,
            personalMessageChange: '11 people. 1 row. no regrets',
          },
        ],
        end: true,
      },
      famous: {
        lines: [
          { text: 'eleven people famous', delayMs: 1300 },
          {
            text: 'i signed a napkin. my roommate asked as a joke',
            delayMs: 1400,
          },
          {
            text: 'i signed it anyway. its about the principle',
            delayMs: 1300,
          },
        ],
        end: true,
      },
    },
  },
  ...marcoWeek2Scripts,
];
