// Pia: the little sibling on dad's laptop downstairs. Bossy, pony-obsessed, tells mom everything.
import type { ContactContent } from '../types';

export const pia: ContactContent = {
  contact: {
    id: 'pia',
    displayName: 'pia (L) ponies (L)',
    handle: 'pia.ponyfan@livemail.example',
    avatar: { kind: 'pattern', seed: 'pia', colors: ['#B47EDB', '#FFE0F4'] },
    group: 'Family',
    initialStatus: 'online',
    personalMessage: 'DO NOT GO IN MY ROOM',
    signInAfterMs: 35_000,
  },
  scripts: [
    {
      id: 'opening',
      trigger: { type: 'onSignIn' },
      start: 'hi',
      nodes: {
        hi: {
          lines: [
            { text: '{name} its pia', delayMs: 3000 },
            { text: 'im on dads laptop!! he said i get 20 min', delayMs: 1200 },
          ],
          choices: [
            {
              text: 'cool. why are u messaging me',
              label: 'Why?',
              next: 'why',
            },
            {
              text: 'dad lets u use his laptop??',
              label: 'Dads laptop??',
              next: 'laptop',
            },
          ],
        },
        laptop: {
          lines: [
            { text: 'yes bc im RESPONSIBLE', delayMs: 1000 },
            { text: 'unlike SOME people', delayMs: 800 },
          ],
          choices: [
            {
              text: 'what is that supposed to mean',
              label: 'Excuse me?',
              next: 'remote',
            },
            { text: 'ok fine', next: 'why' },
          ],
        },
        remote: {
          lines: [
            { text: 'u broke the remote', delayMs: 900 },
            { text: 'everyone knows', delayMs: 700 },
          ],
          choices: [
            {
              text: 'that was the dog!!',
              label: 'It was the dog',
              next: 'dog',
            },
            { text: '...ok fair', next: 'why' },
          ],
        },
        dog: {
          lines: [
            { text: 'biscuit cant even reach the table', delayMs: 1000 },
            { text: 'i told mom already :P', delayMs: 800 },
          ],
          choices: [
            { text: 'PIA', next: 'why' },
            { text: 'whatever', next: 'why' },
          ],
        },
        why: {
          lines: [
            { text: 'ANYWAY mom says dinner is in 10 min', delayMs: 1200 },
            { text: 'also can u help me with my horse quiz', delayMs: 1000 },
          ],
          choices: [
            { text: 'sure whats the question', label: 'Sure', next: 'quiz' },
            { text: 'no', next: 'no' },
          ],
        },
        quiz: {
          lines: [{ text: 'what is a baby horse called', delayMs: 1500 }],
          choices: [
            { text: 'a foal', next: 'right' },
            { text: 'a pony', next: 'wrong' },
            { text: 'a horselet', next: 'wrong' },
          ],
        },
        right: {
          lines: [
            { text: 'CORRECT!!! :D', delayMs: 800 },
            { text: 'ur not that dumb after all', delayMs: 900 },
            { delayMs: 1500, personalMessageChange: '{name} knows horses (Y)' },
          ],
          end: true,
        },
        wrong: {
          lines: [
            { text: 'WRONG lol', delayMs: 700 },
            {
              text: 'its a FOAL. a pony is a whole different thing',
              delayMs: 1300,
            },
            { text: 'im telling dad', delayMs: 800 },
          ],
          end: true,
        },
        no: {
          lines: [
            { text: 'FINE. im telling mom u said no', delayMs: 1000 },
            { delayMs: 600, statusChange: 'busy' },
          ],
          end: true,
        },
      },
    },
    {
      id: 'dinner',
      trigger: { type: 'afterMinutes', minutes: 5 },
      start: 'dinner',
      nodes: {
        dinner: {
          lines: [
            { text: 'DINNER', delayMs: 0, nudge: true },
            { text: 'mom says come down NOW', delayMs: 700 },
          ],
          choices: [
            { text: 'coming!!', next: 'coming' },
            { text: '5 more minutes', next: 'five' },
          ],
        },
        coming: {
          lines: [{ text: 'and bring ur plate from yesterday', delayMs: 900 }],
          end: true,
        },
        five: {
          lines: [
            { text: 'MOM {name} SAID 5 MORE MINUTES', delayMs: 800 },
            { text: 'oops did i type that out loud', delayMs: 1200 },
          ],
          end: true,
        },
      },
    },
    {
      id: 'timeUp',
      trigger: { type: 'afterMinutes', minutes: 8 },
      start: 'bye',
      nodes: {
        bye: {
          lines: [
            { text: 'dad says my 20 min are up :(', delayMs: 0 },
            { text: 'byeeee', delayMs: 800 },
            { delayMs: 1000, statusChange: 'offline' },
          ],
          end: true,
        },
      },
    },
  ],
};
