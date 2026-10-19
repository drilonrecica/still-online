// Dex's boy-only threads (G2-03, `forGender: 'boy'`): a skate session at the gas station curb
// (day 2), backyard wrestling (3) and the video night after the premiere (5); in week two (W1-03)
// the Jam course at night (8). Each follows his day script, so it never crowds it. One side only:
// no `g()`. Slow, lowercase, always Away.
import type { Script } from '../types';

export const dexBoyThreads: readonly Script[] = [
  {
    id: 'skateSession',
    forGender: 'boy',
    trigger: { type: 'afterScript', scriptId: 'day2', minutes: 6 },
    start: 'curb',
    nodes: {
      curb: {
        lines: [
          { text: '{name}', delayMs: 15_000 },
          { text: 'u wanna come skate tmrw after school', delayMs: 3000 },
          {
            text: 'the curb at the gas station. kev says its the best curb in town',
            delayMs: 2200,
          },
          {
            text: 'bring the helmet ur mom bought. or dont tell her',
            delayMs: 2000,
          },
        ],
        choices: [
          { text: 'sweet. im there', label: 'Sweet', next: 'there' },
          {
            text: 'dude the helmet has a dragon on it',
            label: 'The dragon helmet',
            next: 'dragon',
          },
        ],
      },
      there: {
        lines: [
          { text: 'cool', delayMs: 3000 },
          {
            text: 'kev will try to teach u the 50-50. dont let him. ollie first',
            delayMs: 2000,
          },
          {
            delayMs: 1000,
            personalMessageChange: 'gas station curb. after school. helmet',
          },
        ],
        end: true,
      },
      dragon: {
        lines: [
          { text: 'lol', delayMs: 3500 },
          { text: 'dragons r tough. nobody laughs at a dragon', delayMs: 2000 },
          { text: 'ok kev laughs. kev laughs at everything', delayMs: 2000 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'wrestling',
    forGender: 'boy',
    trigger: { type: 'afterScript', scriptId: 'day3', minutes: 6 },
    start: 'show',
    nodes: {
      show: {
        lines: [
          { text: '{name}', delayMs: 15_000 },
          {
            text: 'backyard wrestling at my house. my bro put his old mattress on the grass',
            delayMs: 3000,
          },
          { text: 'u need a wrestling name', delayMs: 2000 },
        ],
        choices: [
          {
            text: 'THE MODEM MAULER',
            label: 'The Modem Mauler',
            next: 'mauler',
          },
          {
            text: 'i already wrote my entrance speech',
            label: 'I have a speech',
            next: 'speech',
          },
        ],
      },
      mauler: {
        lines: [
          { text: 'THE MODEM MAULER? lol. ok ur in', delayMs: 3500 },
          {
            text: 'im "the kickflip kid". kev said its lame. kev is just "kev"',
            delayMs: 2200,
          },
          {
            text: 'rules: mattress only. no chairs. my mom said no chairs twice',
            delayMs: 2000,
          },
          {
            delayMs: 1000,
            personalMessageChange:
              'backyard wrestling. mattress only. no chairs',
          },
        ],
        end: true,
      },
      speech: {
        lines: [
          { text: 'u WROTE one', delayMs: 3500 },
          { text: 'whats ur finisher', delayMs: 2000 },
        ],
        choices: [
          {
            text: 'the DIAL-UP DROP. u hear beep krrrsh and ur DISCONNECTED',
            label: 'The Dial-Up Drop',
            next: 'drop',
          },
          {
            text: 'its secret. u find out in the ring',
            label: 'Its secret',
            next: 'secret',
          },
        ],
      },
      drop: {
        lines: [
          { text: '...', delayMs: 3500 },
          { text: 'thats the best thing ive ever heard', delayMs: 2000 },
          {
            text: 'ok ur in. mattress only. no chairs. my mom said no chairs twice',
            delayMs: 2000,
          },
        ],
        end: true,
      },
      secret: {
        lines: [
          { text: 'respect', delayMs: 3500 },
          {
            text: 'ok ur in. mattress only. no chairs. my mom said no chairs twice',
            delayMs: 2000,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'videoNight',
    forGender: 'boy',
    trigger: { type: 'afterScript', scriptId: 'day5', minutes: 6 },
    start: 'night',
    nodes: {
      night: {
        lines: [
          { text: '{name}', delayMs: 15_000 },
          {
            text: 'video night at my house. my mom ordered pizza',
            delayMs: 3000,
          },
          {
            text: 'we watch the 30 sec on the tv. on repeat. sam and kev r coming',
            delayMs: 2200,
          },
          {
            text: 'the internet one is on kickflipkings.example/video but it buffers forever. tv is better',
            delayMs: 2400,
          },
        ],
        choices: [
          {
            text: 'pizza and the blur. dude im there',
            label: 'Im there',
            next: 'there',
          },
          {
            text: 'how many times r we watching it',
            label: 'How many times?',
            next: 'times',
          },
        ],
      },
      there: {
        lines: [
          {
            text: 'cool. second 22 is the best part. u will hear it',
            delayMs: 3000,
          },
          {
            text: 'my bro does the remote. he pauses on the orange',
            delayMs: 2000,
          },
          {
            delayMs: 1000,
            personalMessageChange: 'video night. pizza. 30 sec on repeat',
          },
        ],
        end: true,
      },
      times: {
        lines: [
          { text: 'kev says 50', delayMs: 3000 },
          {
            text: 'i say until the tape gives up. it gave up before. it can do it again',
            delayMs: 2200,
          },
          { text: 'ok see u. its a big pizza', delayMs: 2000 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'jamCourse',
    forGender: 'boy',
    trigger: { type: 'afterScript', scriptId: 'day8', minutes: 6 },
    start: 'course',
    nodes: {
      course: {
        lines: [
          { text: '{name}', delayMs: 15_000 },
          { text: 'come skate the jam course 2nite', delayMs: 3000 },
          { text: 'park closes at 8', delayMs: 2000 },
          { text: 'bring the dragon helmet', delayMs: 2000 },
        ],
        choices: [
          { text: 'im there', label: 'Im there', next: 'there' },
          { text: 'ill time ur run', label: 'Ill time ur run', next: 'time' },
        ],
      },
      there: {
        lines: [
          { text: 'cool', delayMs: 3000 },
          { text: 'kev says ur the official hype guy now', delayMs: 2200 },
          { text: 'u yell when i land it. thats the job', delayMs: 2000 },
          {
            delayMs: 1000,
            personalMessageChange: 'jam course. 2 of us. 1 dragon',
          },
        ],
        end: true,
      },
      time: {
        lines: [
          { text: 'ok. kev has a watch with a stopwatch', delayMs: 3000 },
          {
            text: 'he says ur the official hype guy tho. so time it and yell',
            delayMs: 2200,
          },
          {
            delayMs: 1000,
            personalMessageChange: 'jam course. 2 of us. 1 dragon',
          },
        ],
        end: true,
      },
    },
  },
];
