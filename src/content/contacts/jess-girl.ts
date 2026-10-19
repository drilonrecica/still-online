// Jess's girl-only threads (W1-01, `forGender: 'girl'`): the late-night call after Lakeview sold
// out (day 8) and the glitter-sign workshop (day 9). Each follows her day script, so it never
// crowds it. One side only: no `g()`. ALL CAPS, nudges, PG.
import type { Script } from '../types';

export const jessGirlThreads: readonly Script[] = [
  {
    id: 'lateNight',
    forGender: 'girl',
    trigger: { type: 'afterScript', scriptId: 'day8', minutes: 8 },
    start: 'awake',
    nodes: {
      awake: {
        lines: [
          { text: '{name}', delayMs: 15_000 },
          { text: 'r u awake', delayMs: 1500 },
          { text: 'my mom thinks im asleep', delayMs: 900 },
          { text: 'im typing QUIETLY', delayMs: 800 },
        ],
        choices: [
          { text: 'im awake. whats up', label: 'Im awake', next: 'talk' },
          {
            text: 'jess ur caps lock is NOT quiet',
            label: 'Caps lock is loud',
            next: 'quiet',
          },
        ],
      },
      quiet: {
        lines: [
          { text: 'shhhhh', delayMs: 900 },
          { text: 'see. lowercase. like a NINJA', delayMs: 900 },
          { text: 'ok that one was loud', delayMs: 800 },
        ],
        choices: [
          { text: 'lol ok whats up', next: 'talk' },
          { text: 'whisper it', next: 'talk' },
        ],
      },
      talk: {
        lines: [
          { text: 'ok so. lakeview is gone. its FINE', delayMs: 1000 },
          {
            text: 'the rec hall is small. u can actually SEE the band',
            delayMs: 1000,
          },
          {
            text: 'and my new sign will be the best sign in HISTORY',
            delayMs: 900,
          },
          { text: 'also', delayMs: 1500 },
          {
            text: 'theo says sorry to u in a CUTE way. just saying',
            delayMs: 1200,
          },
        ],
        choices: [
          { text: '...maybe', label: '...maybe', next: 'maybe' },
          { text: 'JESS', label: 'JESS', next: 'jess' },
          { text: 'go 2 sleep lol', label: 'Go 2 sleep', next: 'sleep' },
        ],
      },
      maybe: {
        lines: [
          { text: 'MAYBE', delayMs: 800 },
          { text: 'ok im not saying anything. im just SMILING', delayMs: 1000 },
          { text: 'ok ok. nite (L)', delayMs: 900 },
        ],
        end: true,
      },
      jess: {
        lines: [
          { text: 'WHAT. im just an observer', delayMs: 900 },
          { text: 'a very good observer', delayMs: 800 },
          { text: 'ok ok. nite (L)', delayMs: 900 },
        ],
        end: true,
      },
      sleep: {
        lines: [
          { text: 'u always change the subject lol', delayMs: 900 },
          { text: 'i heard my mom on the stairs', delayMs: 800 },
          { text: 'ok ok. nite (L)', delayMs: 700 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'signWorkshop',
    forGender: 'girl',
    trigger: { type: 'afterScript', scriptId: 'day9', minutes: 6 },
    start: 'workshop',
    nodes: {
      workshop: {
        lines: [
          { text: '{name}!!!', delayMs: 15_000, nudge: true },
          { text: 'SIGN WORKSHOP. NOW', delayMs: 600 },
          { text: 'poster board: CHECK. glitter glue: 4 colors', delayMs: 900 },
          { text: 'MARCO THROW A: done', delayMs: 700 },
          { text: 'what color is PICK??', delayMs: 700 },
        ],
        choices: [
          { text: 'silver. like a real pick', label: 'Silver', next: 'silver' },
          { text: 'pink!!', label: 'Pink', next: 'pink' },
        ],
      },
      silver: {
        lines: [
          { text: 'SILVER. classy. he will respect it', delayMs: 800 },
          { text: 'next question', delayMs: 600 },
          { text: 'do i add a lantern?? its the BAND NAME', delayMs: 900 },
        ],
        choices: [
          {
            text: 'yes!! a little lantern',
            label: 'Add a lantern',
            next: 'lantern',
          },
          { text: 'no, just glitter', label: 'Just glitter', next: 'plain' },
        ],
      },
      pink: {
        lines: [
          { text: 'PINK. he will HATE it. perfect', delayMs: 800 },
          { text: 'next question', delayMs: 600 },
          { text: 'do i add a lantern?? its the BAND NAME', delayMs: 900 },
        ],
        choices: [
          {
            text: 'yes!! a little lantern',
            label: 'Add a lantern',
            next: 'lantern',
          },
          { text: 'no, just glitter', label: 'Just glitter', next: 'plain' },
        ],
      },
      lantern: {
        lines: [
          { text: 'a lantern in the corner. like theos poster', delayMs: 900 },
          { text: 'its glowing. with GLITTER', delayMs: 700 },
        ],
        choices: [
          { text: 'its perfect', next: 'cat' },
          { text: 'marco has to throw it now', next: 'cat' },
        ],
      },
      plain: {
        lines: [
          { text: 'just glitter. the CLASSIC', delayMs: 800 },
          {
            text: 'less is more. except glitter. glitter is more',
            delayMs: 900,
          },
        ],
        choices: [
          { text: 'its perfect', next: 'cat' },
          { text: 'marco has to throw it now', next: 'cat' },
        ],
      },
      cat: {
        lines: [
          { text: 'WAIT', delayMs: 1200, nudge: true },
          { text: 'the cat just walked across it. AGAIN', delayMs: 800 },
          { text: 'a 2nd PAW PRINT', delayMs: 700 },
          { text: 'its a SERIES now', delayMs: 700 },
          {
            delayMs: 1500,
            personalMessageChange: 'sign: DONE. cat: also done',
          },
        ],
        end: true,
      },
    },
  },
];
