// Dex, days 6–10: the Westfield Jam. 41 views, an invite, 30 practice runs, 3rd place and a tape
// from 2007, then filming the show (docs/story-week2.md → Dex). Slow, few words, always Away: his
// scripts never change his status.
import { g } from '../gender';
import type { Contact, Script } from '../types';

export const dexWeek2Days: Contact['days'] = {
  6: { status: 'away', personalMessage: '41 views. like 30 r me' },
  7: { status: 'away', personalMessage: 'the westfield jam. me. in it??' },
  8: {
    status: 'away',
    personalMessage: 'practicing. away (for real this time)',
  },
  9: { status: 'away', personalMessage: '3rd place. camera: ON' },
  10: { status: 'away', personalMessage: 'filming velvet lantern. new tape' },
};

export const dexWeek2Scripts: readonly Script[] = [
  {
    id: 'day6',
    trigger: { type: 'onDay', day: 6 },
    start: 'views',
    nodes: {
      views: {
        lines: [
          { text: '{name}', delayMs: 22_000 },
          { text: 'the video has 41 views', delayMs: 2500 },
          { text: 'on kickflipkings.example/video', delayMs: 1800 },
          { text: 'like 30 r me', delayMs: 2000 },
          {
            text: 'my mom watched it 4 times. online. she has the tape',
            delayMs: 2400,
          },
        ],
        choices: [
          {
            text: 'thats 11 real fans!',
            label: '11 real fans!',
            next: 'fans',
          },
          {
            text: 'i watched it like 5 times',
            label: 'I watched it 5 times',
            next: 'five',
          },
          { text: 'make a part 2', label: 'Part 2', next: 'part2' },
        ],
      },
      fans: {
        lines: [
          { text: 'huh', delayMs: 3500 },
          { text: '11 real fans', delayMs: 1800 },
          { text: 'same as marcos first show', delayMs: 2000 },
          { delayMs: 1000, personalMessageChange: '11 real fans. probably' },
        ],
        choices: [
          { text: 'ur basically famous', next: 'tell' },
          { text: 'minus ur mom tho', next: 'tell' },
        ],
      },
      five: {
        lines: [
          { text: 'ok so', delayMs: 3500 },
          { text: '30 me. 4 my mom. 5 u. 2 strangers', delayMs: 2200 },
          { text: 'two strangers. thats a fanbase', delayMs: 2000 },
          { delayMs: 1000, personalMessageChange: '11 real fans. probably' },
        ],
        choices: [
          { text: 'who r the strangers', next: 'tell' },
          { text: 'ill watch it again', next: 'tell' },
        ],
      },
      part2: {
        lines: [
          { text: 'part 2', delayMs: 3500 },
          { text: 'i have one tape left. it says 1999 too', delayMs: 2000 },
          {
            text: 'ry says part 2s r never as good. ry never made a part 1',
            delayMs: 2400,
          },
          { delayMs: 1000, personalMessageChange: '11 real fans. probably' },
        ],
        choices: [
          { text: 'ignore ry', next: 'tell' },
          { text: 'part 2: more blur', next: 'tell' },
        ],
      },
      tell: {
        lines: [
          { text: 'kev says views go up if u tell people', delayMs: 3000 },
          { text: 'so', delayMs: 2000 },
          { text: 'telling people', delayMs: 1800 },
          { text: 'u r people', delayMs: 2000 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day7',
    trigger: { type: 'onDay', day: 7 },
    start: 'invite',
    nodes: {
      invite: {
        lines: [
          { text: '{name}', delayMs: 25_000 },
          { text: 'kev signed me up for something', delayMs: 2500 },
          {
            text: 'the westfield jam. a skate contest. at the park',
            delayMs: 2200,
          },
          { text: 'in 2 days', delayMs: 1800 },
          { text: 'he wrote my name already. in pen', delayMs: 2000 },
        ],
        choices: [
          {
            text: 'do the kickflip!',
            label: 'Do the kickflip!',
            next: 'kickflip',
          },
          { text: 'will kev film it?', label: 'Kev films?', next: 'film' },
        ],
      },
      kickflip: {
        lines: [
          { text: 'thats the plan', delayMs: 3500 },
          { text: 'u get 1 min on the course', delayMs: 2000 },
          { text: '1 kickflip. maybe', delayMs: 1800 },
          {
            delayMs: 1000,
            personalMessageChange: 'jam run: 1 min. 1 kickflip. maybe',
          },
        ],
        choices: [
          {
            text: 'u landed it before',
            label: 'U landed it before',
            next: 'landed',
          },
          { text: 'what if u fall', label: 'What if u fall?', next: 'fall' },
        ],
      },
      film: {
        lines: [
          { text: 'ya. kev has a camera now', delayMs: 3500 },
          { text: 'ok its his moms', delayMs: 1800 },
          { text: 'so if i land it. someone sees. finally', delayMs: 2200 },
          {
            delayMs: 1000,
            personalMessageChange: 'jam run: 1 min. 1 kickflip. maybe',
          },
        ],
        choices: [
          {
            text: 'u landed it before',
            label: 'U landed it before',
            next: 'landed',
          },
          { text: 'what if u fall', label: 'What if u fall?', next: 'fall' },
        ],
      },
      landed: {
        lines: [
          { text: 'ya. with nobody filming', delayMs: 3000 },
          { text: 'this time theres people. like a lot', delayMs: 2000 },
          { text: 'ok. practicing tmrw', delayMs: 1800 },
        ],
        end: true,
      },
      fall: {
        lines: [
          { text: 'then i fall', delayMs: 3500 },
          { text: 'i know how. 40 times on tape', delayMs: 2000 },
          { text: 'ok. practicing tmrw', delayMs: 1800 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day8',
    trigger: { type: 'onDay', day: 8 },
    start: 'practice',
    nodes: {
      practice: {
        lines: [
          { text: '{name}', delayMs: 30_000 },
          { text: 'sorry. practicing', delayMs: 4000 },
          { text: 'away for real this time', delayMs: 3500 },
          { text: 'ran the course like 30 times', delayMs: 3500 },
        ],
        choices: [
          { text: 'u got this', label: 'U got this', next: 'got' },
          {
            text: 'eat something dex',
            label: 'Eat something',
            next: 'eat',
          },
        ],
      },
      got: {
        lines: [
          { text: 'ya', delayMs: 5000 },
          { text: 'maybe', delayMs: 3500 },
          { text: 'i fell once', delayMs: 3500 },
        ],
        choices: [
          { text: 'oh no. r u ok?', next: 'once' },
          { text: 'only once??', next: 'once' },
        ],
      },
      eat: {
        lines: [
          { text: 'my mom said that', delayMs: 5000 },
          {
            text: 'she brought a sandwich to the park. in front of kev',
            delayMs: 3500,
          },
          { text: 'kev ate half', delayMs: 3000 },
        ],
        choices: [
          { text: 'kev is a menace', next: 'once' },
          { text: 'any falls?', next: 'once' },
        ],
      },
      once: {
        lines: [
          { text: 'fell once. on purpose', delayMs: 5000 },
          { text: 'to get it over with', delayMs: 3500 },
          {
            text: 'now i cant fall the first time tmrw. its done',
            delayMs: 3500,
          },
          {
            delayMs: 1000,
            personalMessageChange:
              'ran the course 30 times. fell once. on purpose',
          },
        ],
        choices: [
          { text: 'thats genius', next: 'more' },
          { text: 'thats not how it works', next: 'more' },
        ],
      },
      more: {
        lines: [
          { text: 'it works for me', delayMs: 5000 },
          { text: 'ok. 1 more run. then sleep', delayMs: 3500 },
          { text: 'maybe 2', delayMs: 3000 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day9',
    trigger: { type: 'onDay', day: 9 },
    start: 'jam',
    nodes: {
      jam: {
        lines: [
          { text: '{name}', delayMs: 25_000 },
          { text: 'the jam', delayMs: 2500 },
          { text: 'i landed it', delayMs: 2000 },
          { text: 'in front of everyone. like 40 people', delayMs: 2200 },
          { text: '3rd place', delayMs: 2000 },
        ],
        choices: [
          { text: '3RD!!!', label: '3RD!!!', next: 'third' },
          { text: 'did kev get it??', label: 'Kev got it?', next: 'kev' },
          { text: 'who won?', label: 'Who won?', next: 'won' },
        ],
      },
      third: {
        lines: [
          { text: 'ya', delayMs: 3500 },
          { text: 'i got a prize', delayMs: 2000 },
          { text: 'a sticker pack and a blank tape', delayMs: 2000 },
        ],
        choices: [
          { text: 'a TAPE', next: 'tape' },
          { text: 'who won?', label: 'Who won?', next: 'won' },
        ],
      },
      kev: {
        lines: [
          { text: 'he got it. 6 seconds', delayMs: 3500 },
          { text: 'u can see the board. and me', delayMs: 2000 },
          { text: 'first time im not a blur', delayMs: 2200 },
        ],
        choices: [
          { text: 'not a blur!!', next: 'tape' },
          { text: 'who won?', label: 'Who won?', next: 'won' },
        ],
      },
      won: {
        lines: [
          { text: 'sam. obviously', delayMs: 3500 },
          { text: 'big mike from riverside 2nd. hes huge', delayMs: 2200 },
          { text: 'me 3rd. prize is stickers and a tape', delayMs: 2200 },
        ],
        choices: [
          { text: 'beating big mike next year', next: 'tape' },
          { text: 'whats on the tape?', next: 'tape' },
        ],
      },
      tape: {
        lines: [
          { text: 'the tape says 2007 on it', delayMs: 3500 },
          { text: 'the future', delayMs: 2000 },
          { text: 'its blank. saving it for something', delayMs: 2200 },
          {
            delayMs: 1000,
            personalMessageChange: '3rd. stickers. a tape from 2007',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day10',
    trigger: { type: 'onDay', day: 10 },
    start: 'filmed',
    nodes: {
      filmed: {
        lines: [
          { text: '{name}', delayMs: 25_000 },
          { text: 'filmed the whole show', delayMs: 2500 },
          { text: 'on the 2007 tape', delayMs: 2000 },
          { text: 'first thing on it. velvet lantern', delayMs: 2200 },
        ],
        choices: [
          {
            text: 'how much did u film?',
            label: 'How much?',
            next: 'much',
          },
          { text: 'did u get the pick?', label: 'The pick?', next: 'pick' },
        ],
      },
      much: {
        lines: [
          { text: 'all of it. 8 songs', delayMs: 3500 },
          { text: 'and like 10 min of derek tuning', delayMs: 2200 },
          { text: 'the bucket is in 4 songs. derek counts 3', delayMs: 2200 },
        ],
        choices: [
          { text: 'director dex', next: 'mom' },
          { text: 'cut the tuning', next: 'mom' },
        ],
      },
      pick: {
        lines: [
          { text: 'ya. its kind of a blur', delayMs: 3500 },
          { text: 'jess caught it. u can hear her', delayMs: 2200 },
          { text: 'u cant see it. but u can hear it', delayMs: 2000 },
        ],
        choices: [
          { text: 'classic dex', next: 'mom' },
          { text: 'what did she yell', next: 'mom' },
        ],
      },
      mom: {
        lines: [
          { text: 'also. i met ur mom', delayMs: 3500 },
          { text: 'at drop-off', delayMs: 2000 },
          { text: 'said maam. twice. she wrote something down', delayMs: 2200 },
          {
            text: g(
              'she asked if im the one with the video',
              'she asked about helmets. for filming',
            ),
            delayMs: 2200,
          },
          {
            delayMs: 1000,
            personalMessageChange: 'camera: dex. special thanks: {name}',
          },
        ],
        choices: [
          {
            text: 'what did she write??',
            label: 'What did she write?',
            next: 'list',
          },
          { text: 'she likes u', label: 'She likes u', next: 'list' },
        ],
      },
      list: {
        lines: [
          { text: 'idk', delayMs: 3500 },
          { text: 'ry says its a list', delayMs: 2000 },
          { text: 'i want to be on the good list', delayMs: 2200 },
        ],
        end: true,
      },
    },
  },
];
