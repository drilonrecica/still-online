// Kayla's girl-only thread (W1-01, `forGender: 'girl'`): picking her outfit for the show after the
// 61–61 tie (day 9). It follows her day script, so it never crowds it. One side only: no `g()`.
import type { Script } from '../types';

export const kaylaGirlThreads: readonly Script[] = [
  {
    id: 'outfitPick',
    forGender: 'girl',
    trigger: { type: 'afterScript', scriptId: 'day9', minutes: 6 },
    start: 'ask',
    nodes: {
      ask: {
        lines: [
          { text: '{name}', delayMs: 15_000 },
          { text: 'ok forget the election for 5 min', delayMs: 1300 },
          { text: 'help me pick an outfit for the show', delayMs: 1300 },
          { text: 'A: black top + the star jeans', delayMs: 1300 },
          {
            text: 'B: the purple skirt + leg warmers. the ones from my album',
            delayMs: 1500,
          },
        ],
        choices: [
          { text: 'A!! black is so rock', label: 'A: black top', next: 'a' },
          { text: 'B!! the leg warmers', label: 'B: purple skirt', next: 'b' },
        ],
      },
      a: {
        lines: [
          { text: 'A. black. mysterious', delayMs: 1200 },
          { text: 'like a co-rep of the NIGHT', delayMs: 1300 },
        ],
        choices: [
          { text: 'very mysterious', next: 'sealed' },
          {
            text: 'add the silver hoops',
            label: 'Silver hoops',
            next: 'sealed',
          },
        ],
      },
      b: {
        lines: [
          { text: 'B. purple. a STATEMENT', delayMs: 1200 },
          { text: 'leg warmers at a rock show. iconic', delayMs: 1300 },
        ],
        choices: [
          { text: 'so iconic', next: 'sealed' },
          { text: 'and a scrunchie', label: 'And a scrunchie', next: 'sealed' },
        ],
      },
      sealed: {
        lines: [
          { text: 'and the best part', delayMs: 1300 },
          {
            text: 'brianna will NEVER wear the same thing twice in a row',
            delayMs: 1400,
          },
          { text: 'statistically', delayMs: 1200 },
          {
            delayMs: 800,
            personalMessageChange: '~*outfit: chosen. destiny: sealed*~',
          },
        ],
        end: true,
      },
    },
  },
];
