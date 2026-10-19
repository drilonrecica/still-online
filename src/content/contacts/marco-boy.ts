// Marco's boy-only threads (G2-03, `forGender: 'boy'`): the LAN party (day 1), the cheat-code
// trade (2) and roadie at the bean cellar load-in (4). Each follows one of his day scripts, so it
// never crowds them. One side only: no `g()`. Lowercase, dry, never "!".
import type { Script } from '../types';

export const marcoBoyThreads: readonly Script[] = [
  {
    id: 'lanParty',
    forGender: 'boy',
    trigger: { type: 'afterScript', scriptId: 'followup2', minutes: 3 },
    start: 'lan',
    nodes: {
      lan: {
        lines: [
          { text: 'kid. question', delayMs: 6000 },
          {
            text: 'lan party at my place friday night. galaxy raiders 3. my roommate has a router and 4 pcs',
            delayMs: 1600,
          },
          {
            text: 'bring ur own cable. and chips. mostly chips',
            delayMs: 1400,
          },
          {
            text: 'i asked ur mom. she said ok if i drive u home by 10',
            delayMs: 1500,
          },
        ],
        choices: [
          { text: 'dude yes. im in', label: 'Im in', next: 'in' },
          { text: 'can i be on ur team?', label: 'Ur team?', next: 'team' },
        ],
      },
      in: {
        lines: [
          { text: 'good. ur on chips and cables', delayMs: 1300 },
          {
            text: 'the blue cable. not the phone cable. someone brought a phone cable last time',
            delayMs: 1500,
          },
          {
            delayMs: 1200,
            personalMessageChange: 'lan fri. bring chips. mostly chips',
          },
        ],
        end: true,
      },
      team: {
        lines: [
          {
            text: 'no. i play with my roommate. we have a system',
            delayMs: 1400,
          },
          {
            text: 'u play with derek. he yells but hes good at level 7',
            delayMs: 1500,
          },
          { text: 'dont tell him i said hes good', delayMs: 1200 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'cheatTrade',
    forGender: 'boy',
    trigger: { type: 'afterScript', scriptId: 'day2', minutes: 5 },
    start: 'trade',
    nodes: {
      trade: {
        lines: [
          { text: 'kid. trade', delayMs: 7000 },
          {
            text: 'i got a thunder kart one. hold the drift around the volcano on lava loop. orange sparks = big boost',
            delayMs: 1700,
          },
          {
            text: 'it works. i tested it on my roommate. he took it personally',
            delayMs: 1400,
          },
          { text: 'ur turn. what do u have', delayMs: 1200 },
        ],
        choices: [
          {
            text: 'big head mode in galaxy raiders 3. type BIGBRAIN',
            label: 'Big head mode',
            next: 'bigbrain',
          },
          {
            text: 'rainbow kart. hold select on the loading screen',
            label: 'Rainbow kart',
            next: 'rainbow',
          },
        ],
      },
      bigbrain: {
        lines: [
          { text: 'kid', delayMs: 1300 },
          {
            text: 'i gave u that one. its in ur cheat file. i got it from a forum',
            delayMs: 1500,
          },
          { text: 'still the best one tho. deal', delayMs: 1200 },
          {
            text: 'more on cheatcave.example. ignore the guy who says galaxy raiders 4 is coming',
            delayMs: 1500,
          },
        ],
        end: true,
      },
      rainbow: {
        lines: [
          {
            text: 'tried it. got a normal kart and a long loading screen',
            delayMs: 1500,
          },
          { text: 'maybe ur select button is better than mine', delayMs: 1300 },
          {
            text: 'the real ones are on cheatcave.example. the forum. half of them work',
            delayMs: 1500,
          },
          {
            delayMs: 1200,
            personalMessageChange: 'thunder kart. orange sparks. trust me',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'roadie',
    forGender: 'boy',
    trigger: { type: 'afterScript', scriptId: 'day4', minutes: 5 },
    start: 'ask',
    nodes: {
      ask: {
        lines: [
          { text: 'kid. job offer', delayMs: 7000 },
          {
            text: 'velvet lantern needs a roadie. load-in before the show',
            delayMs: 1400,
          },
          {
            text: 'u carry the amp down the stairs to the bean cellar. derek carries the bucket. thats his whole job',
            delayMs: 1700,
          },
          { text: 'pay: a crew shirt. and a soda', delayMs: 1300 },
        ],
        choices: [
          {
            text: 'a CREW shirt? dude im in',
            label: 'Im in',
            next: 'crew',
          },
          { text: 'how heavy is this amp', label: 'How heavy?', next: 'amp' },
        ],
      },
      amp: {
        lines: [
          {
            text: 'heavy. its from the 80s. they built things heavy',
            delayMs: 1500,
          },
          {
            text: 'my roommate takes the other end. u carry the cable and look strong',
            delayMs: 1500,
          },
          {
            text: 'ur mom says load-in yes, show no. next time. sorry kid',
            delayMs: 1500,
          },
        ],
        end: true,
      },
      crew: {
        lines: [
          { text: 'derek made the shirts with a marker', delayMs: 1400 },
          {
            text: 'CREW on the front. VELVET LANTRN on the back. he ran out of shirt',
            delayMs: 1600,
          },
          {
            text: 'ur mom says load-in yes, show no. next time. sorry kid',
            delayMs: 1500,
          },
          {
            delayMs: 1200,
            personalMessageChange: 'now hiring: roadies. pay: 1 shirt',
          },
        ],
        end: true,
      },
    },
  },
];
