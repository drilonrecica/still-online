// Dex, days 2–5: the skate video. Filming, the camcorder eats the tape, the kickflip nobody filmed,
// and a 30-second blur (which Kev also puts on kickflipkings.example/video). He stays Away the
// whole time and still answers slowly.
// Days 6–10 are in `dex-week2.ts`; both are exported from here.
import type { Contact, Script } from '../types';
import { dexWeek2Days, dexWeek2Scripts } from './dex-week2';

export const dexDays: Contact['days'] = {
  2: { status: 'away', personalMessage: 'found the charger. ACTION' },
  3: { status: 'away', personalMessage: 'rip tape #1 (1998-2007)' },
  4: { status: 'away', personalMessage: 'landed it. camera: in my bag' },
  5: {
    status: 'away',
    personalMessage: 'world premiere. 30 sec. no refunds',
  },
  ...dexWeek2Days,
};

export const dexDayScripts: readonly Script[] = [
  {
    id: 'day2',
    trigger: { type: 'onDay', day: 2 },
    start: 'action',
    nodes: {
      action: {
        lines: [
          { text: '{name}', delayMs: 20_000 },
          {
            text: 'found the camcorder charger. it was in the microwave box',
            delayMs: 2500,
          },
          { text: 'filmed at the park all day', delayMs: 1800 },
          { text: 'got like 2 hours of tape', delayMs: 1500 },
        ],
        choices: [
          { text: 'how did it go??', label: 'How did it go?', next: 'went' },
          {
            text: 'why was it in the MICROWAVE box',
            label: 'Microwave box??',
            next: 'microwave',
          },
        ],
      },
      microwave: {
        lines: [
          { text: 'my bro says its "organized"', delayMs: 3000 },
          { text: 'i dont ask questions in that garage', delayMs: 1800 },
        ],
        choices: [
          { text: 'lol fair. so how was filming?', next: 'went' },
          { text: 'ur family is weird dex', next: 'went' },
        ],
      },
      went: {
        lines: [
          { text: 'mostly me falling', delayMs: 3000 },
          { text: '40 falls. i counted on the tape', delayMs: 1800 },
          {
            text: 'some guy skated thru the shot and fell too. so hes in it now',
            delayMs: 2200,
          },
        ],
        choices: [
          {
            text: 'but did u land the kickflip?',
            label: 'The kickflip?',
            next: 'kickflip',
          },
          {
            text: 'make it a blooper reel lol',
            label: 'Blooper reel',
            next: 'blooper',
          },
        ],
      },
      kickflip: {
        lines: [
          { text: 'almost. like 3 times', delayMs: 3000 },
          { text: 'the board landed it. i didnt', delayMs: 1800 },
          { text: 'tmrw for sure', delayMs: 1500 },
          { delayMs: 1000, personalMessageChange: 'take 41. still going' },
        ],
        end: true,
      },
      blooper: {
        lines: [
          { text: 'huh', delayMs: 3500 },
          { text: 'thats not bad actually', delayMs: 1500 },
          {
            text: 'part 1: falls. part 2: the kickflip. if part 2 happens',
            delayMs: 2200,
          },
          {
            delayMs: 1000,
            personalMessageChange: 'skate vid part 1: falls (done)',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day3',
    trigger: { type: 'onDay', day: 3 },
    start: 'tape',
    nodes: {
      tape: {
        lines: [
          { text: '{name}', delayMs: 25_000 },
          { text: 'bad news', delayMs: 2000 },
          { text: 'the camcorder ate the tape', delayMs: 1800 },
          {
            text: 'like ATE it. tape coming out like spaghetti',
            delayMs: 2000,
          },
        ],
        choices: [
          { text: 'NOOO. all of it??', label: 'All of it??', next: 'all' },
          {
            text: 'can u wind it back in?',
            label: 'Wind it back?',
            next: 'pencil',
          },
          { text: 'rip', next: 'rip' },
        ],
      },
      pencil: {
        lines: [
          {
            text: 'my bro said use a pencil. like for cassettes',
            delayMs: 3500,
          },
          { text: 'so i used a pencil', delayMs: 1500 },
          { text: 'now the pencil is also in the camcorder', delayMs: 2000 },
        ],
        choices: [
          { text: 'oh no dex', next: 'all' },
          { text: 'lol of course it is', next: 'all' },
        ],
      },
      rip: {
        lines: [
          { text: 'ya. rip', delayMs: 3500 },
          { text: 'it was a 1998 tape. it lived a long life', delayMs: 1800 },
        ],
        choices: [
          { text: 'u can film again!', label: 'Film again!', next: 'again' },
          { text: 'pour one out for the tape', next: 'all' },
        ],
      },
      all: {
        lines: [
          { text: 'all 40 falls. gone', delayMs: 3000 },
          {
            text: 'maybe the world wasnt ready for those anyway',
            delayMs: 2000,
          },
        ],
        choices: [
          {
            text: 'film it again tmrw?',
            label: 'Again tmrw?',
            next: 'again',
          },
          {
            text: 'at least u still have the memories',
            label: 'The memories',
            next: 'memories',
          },
        ],
      },
      again: {
        lines: [
          { text: 'ya. bro has 1 more tape. says 1999 on it', delayMs: 3000 },
          { text: 'newer. so better', delayMs: 1500 },
          { text: 'ok going back out. later', delayMs: 1500 },
          { delayMs: 1000, personalMessageChange: 'camcorder: 1. me: 0' },
        ],
        end: true,
      },
      memories: {
        lines: [
          { text: 'deep', delayMs: 3500 },
          { text: 'my elbow remembers too', delayMs: 1500 },
          { text: 'ok gtg get the pencil out. later', delayMs: 1800 },
          {
            delayMs: 1000,
            personalMessageChange: 'missing: 1 pencil. last seen: camcorder',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day4',
    trigger: { type: 'onDay', day: 4 },
    start: 'landed',
    nodes: {
      landed: {
        lines: [
          { text: '{name}', delayMs: 30_000 },
          { text: 'ok so', delayMs: 2000 },
          { text: 'i landed it', delayMs: 1500 },
          {
            text: 'the kickflip. clean. rolled away and everything',
            delayMs: 2000,
          },
          { text: 'camera was in my bag. lens cap on', delayMs: 2500 },
        ],
        choices: [
          {
            text: 'NO WAY!! congrats!!',
            label: 'Congrats!!',
            next: 'congrats',
          },
          {
            text: 'pics or it didnt happen :P',
            label: 'Pics or it didnt happen',
            next: 'pics',
          },
        ],
      },
      congrats: {
        lines: [
          { text: 'thx :D', delayMs: 3000 },
          { text: 'i just stood there for like a minute', delayMs: 1800 },
          { text: 'then i fell over. but AFTER. so it counts', delayMs: 2000 },
        ],
        choices: [
          { text: 'it totally counts', next: 'counts' },
          { text: 'did anyone see??', label: 'Anyone see?', next: 'witness' },
        ],
      },
      pics: {
        lines: [
          { text: 'i KNEW u would say that', delayMs: 3500 },
          { text: 'there was a witness tho', delayMs: 1800 },
        ],
        choices: [
          { text: 'who??', next: 'witness' },
          { text: 'ok fine i believe u', next: 'counts' },
        ],
      },
      witness: {
        lines: [
          { text: 'a little kid. like 7', delayMs: 3000 },
          {
            text: 'he said "whoa". then his mom made him leave',
            delayMs: 2000,
          },
        ],
        choices: [
          { text: 'the kid counts (Y)', label: 'Kid counts', next: 'counts' },
          {
            text: 'one kid is not proof dex',
            label: 'Not proof',
            next: 'proof',
          },
        ],
      },
      proof: {
        lines: [
          { text: 'he was VERY sure', delayMs: 3500 },
          {
            text: 'he gave me a high five. thats basically a signature',
            delayMs: 2000,
          },
          { text: 'anyway. tmrw i make the video. somehow', delayMs: 2000 },
          {
            delayMs: 1000,
            personalMessageChange: 'landed it. witness: 1 kid. signed: high 5',
          },
        ],
        end: true,
      },
      counts: {
        lines: [
          { text: 'right', delayMs: 3000 },
          {
            text: 'tmrw i make the video with whatever tape is left',
            delayMs: 2000,
          },
          { text: 'which is not much. ok later', delayMs: 1800 },
          {
            delayMs: 1000,
            personalMessageChange: 'kickflip: landed. camera: napping',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day5',
    trigger: { type: 'onDay', day: 5 },
    start: 'premiere',
    nodes: {
      premiere: {
        lines: [
          { text: '{name}', delayMs: 25_000 },
          { text: 'its done. the video', delayMs: 2000 },
          {
            text: 'filmed the last of the 1999 tape this morning',
            delayMs: 2000,
          },
          { text: 'its 30 seconds. its kind of a blur', delayMs: 1800 },
          {
            text: 'like a real blur. u can see orange. thats my shirt',
            delayMs: 2200,
          },
          {
            text: 'kev put it on the crew site: kickflipkings.example/video. it buffers forever tho',
            delayMs: 2400,
          },
        ],
        choices: [
          {
            text: 'send me the real one!!',
            label: 'Send it!!',
            next: 'send',
          },
          { text: 'a blur?? lol', label: 'A blur??', next: 'blur' },
        ],
      },
      send: {
        lines: [
          { text: 'its on a tape. i cant send a tape', delayMs: 3500 },
          {
            text: 'u have to come over and watch it on the tv',
            delayMs: 1800,
          },
          { text: 'my bro hooked it up. took him an hour', delayMs: 1800 },
        ],
        choices: [
          { text: 'ill be there (Y)', label: 'Ill be there', next: 'there' },
          {
            text: 'just describe it to me',
            label: 'Describe it',
            next: 'describe',
          },
        ],
      },
      blur: {
        lines: [
          { text: 'an ARTISTIC blur', delayMs: 3500 },
          {
            text: 'theres a sound at second 22. thats the kickflip',
            delayMs: 2000,
          },
          { text: 'u cant see it. but u can hear it', delayMs: 1800 },
        ],
        choices: [
          { text: 'thats so dex', next: 'proud' },
          {
            text: 'describe the whole thing',
            label: 'Describe it',
            next: 'describe',
          },
        ],
      },
      describe: {
        lines: [
          { text: 'ok', delayMs: 3000 },
          { text: '0-10: sky. 10-20: ground. 20-22: orange', delayMs: 2000 },
          { text: '22: the sound', delayMs: 1500 },
          {
            text: '23-27: my bro yelling "is it recording"',
            delayMs: 1800,
          },
        ],
        choices: [
          { text: 'its a masterpiece', next: 'proud' },
          { text: 'and the last 3 seconds?', label: '27-30?', next: 'credits' },
        ],
      },
      credits: {
        lines: [
          { text: 'the credits', delayMs: 3000 },
          {
            text: 'i wrote "special thanks: {name}" on paper and filmed it',
            delayMs: 2200,
          },
          { text: 'clearest shot in the whole video', delayMs: 1800 },
          {
            delayMs: 1000,
            personalMessageChange: 'special thanks: {name}. u know why',
          },
        ],
        end: true,
      },
      there: {
        lines: [
          { text: 'cool. bring snacks', delayMs: 3000 },
          {
            text: 'its 30 sec so we can watch it like 50 times',
            delayMs: 1800,
          },
          {
            delayMs: 1000,
            personalMessageChange: 'premiere at my house. bring snacks',
          },
        ],
        end: true,
      },
      proud: {
        lines: [
          { text: 'thx', delayMs: 3000 },
          { text: 'honestly best thing ive ever made', delayMs: 1800 },
          {
            text: 'my mom watched it twice. she said "very nice dex" both times',
            delayMs: 2200,
          },
          {
            delayMs: 1000,
            personalMessageChange: 'dex productions presents: a blur (30 sec)',
          },
        ],
        end: true,
      },
    },
  },
  ...dexWeek2Scripts,
];
