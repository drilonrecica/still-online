// Pia: the little sibling on dad's laptop downstairs. Bossy, pony-obsessed, tells mom everything.
import type { ContactContent } from '../types';
import { piaDayScripts, piaDays } from './pia-days';
import { piaGameScore } from './game-reactions';
import { piaNowPlaying2 } from './now-playing';

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
    days: piaDays,
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
    {
      id: 'followup1',
      trigger: { type: 'afterScript', scriptId: 'opening', minutes: 2 },
      start: 'how',
      nodes: {
        how: {
          lines: [
            { text: '{name}', delayMs: 3000 },
            { text: '{name} {name} {name}', delayMs: 700, nudge: true },
            {
              text: 'how do u change the grey writing under ur name',
              delayMs: 1200,
            },
          ],
          choices: [
            {
              text: 'click on it and type something',
              label: 'Click on it',
              next: 'helped',
            },
            {
              text: 'why should i help u',
              label: 'Why should i?',
              next: 'bribe',
            },
          ],
        },
        bribe: {
          lines: [
            { text: 'bc i know who ate the last pudding cup', delayMs: 1100 },
            { text: 'and its not biscuit', delayMs: 800 },
          ],
          choices: [
            {
              text: 'ok ok just click on it and type',
              label: 'Ok ok',
              next: 'helped',
            },
            { text: 'u wouldnt', next: 'mom' },
          ],
        },
        mom: {
          lines: [
            { text: 'MOOOOOOOM', delayMs: 800, nudge: true },
            { text: 'jk she is in the garden', delayMs: 1300 },
            { text: 'i figured it out myself anyway. HA', delayMs: 1000 },
            {
              delayMs: 800,
              personalMessageChange:
                '{name} ate the pudding. ask me how i know',
            },
          ],
          end: true,
        },
        helped: {
          lines: [
            { text: 'OMG it worked', delayMs: 1500 },
            {
              delayMs: 400,
              personalMessageChange: 'pia is the BOSS of this house (L)',
            },
            { text: 'look look look', delayMs: 700 },
          ],
          choices: [
            {
              text: 'mom is the boss of the house',
              label: 'Mom is',
              next: 'boss',
            },
            { text: 'cute :)', next: 'cute' },
          ],
        },
        boss: {
          lines: [
            { text: 'mom is the boss of MOM', delayMs: 1000 },
            { text: 'i am the boss of the HOUSE', delayMs: 900 },
            { text: 'its different. u wouldnt understand', delayMs: 1100 },
          ],
          end: true,
        },
        cute: {
          lines: [
            { text: 'its not CUTE its TRUE', delayMs: 900 },
            { text: 'but thank u', delayMs: 1000 },
          ],
          end: true,
        },
      },
    },
    {
      id: 'followup2',
      trigger: { type: 'afterScript', scriptId: 'followup1', minutes: 4 },
      start: 'sneak',
      nodes: {
        sneak: {
          lines: [
            { text: 'psst', delayMs: 3000 },
            {
              text: 'dad is on the phone with grandma so he forgot about the laptop :D',
              delayMs: 1300,
            },
            { text: 'ok SERIOUS question', delayMs: 900 },
            { text: 'did u go in my room', delayMs: 1000, nudge: true },
          ],
          choices: [
            { text: 'no?? why would i', label: 'No??', next: 'denied' },
            {
              text: 'ok i moved ONE pony',
              label: 'I moved one pony',
              next: 'confess',
            },
            {
              text: 'i sorted ur ponies by color. ur welcome',
              label: 'Sorted them by color',
              next: 'sorted',
            },
          ],
        },
        denied: {
          lines: [
            { text: 'bc my ponies are in a DIFFERENT ORDER', delayMs: 1000 },
            { text: 'someone was in there', delayMs: 800 },
          ],
          choices: [
            {
              text: 'maybe it was biscuit',
              label: 'Biscuit?',
              next: 'biscuit',
            },
            {
              text: 'maybe u did it urself',
              label: 'U did it',
              next: 'herself',
            },
          ],
        },
        biscuit: {
          lines: [
            { text: 'biscuit cant reach my shelf', delayMs: 1100 },
            { text: '...', delayMs: 1200 },
            {
              text: 'unless he stands on the bean bag. he HAS been acting weird',
              delayMs: 1300,
            },
            { text: 'ok ur off the hook. for now', delayMs: 900 },
          ],
          end: true,
        },
        herself: {
          lines: [
            { text: 'oh', delayMs: 1300 },
            { text: 'i did do a pony wedding this morning', delayMs: 1100 },
            { text: 'NOBODY IS ALLOWED TO KNOW THAT', delayMs: 800 },
          ],
          end: true,
        },
        confess: {
          lines: [
            { text: 'WHICH ONE', delayMs: 700, nudge: true },
            { text: 'if its stardust i will SCREAM', delayMs: 900 },
            { text: 'she is the queen she goes in the MIDDLE', delayMs: 1000 },
            {
              text: 'im telling mom. after dad gets off the phone',
              delayMs: 1100,
            },
            { delayMs: 600, statusChange: 'busy' },
          ],
          end: true,
        },
        sorted: {
          lines: [
            { text: '...', delayMs: 1500 },
            { text: 'ok actually thats kind of pretty', delayMs: 1100 },
            { text: 'but DONT do it again', delayMs: 800 },
            { text: 'and dont tell mom i said pretty', delayMs: 900 },
            {
              delayMs: 800,
              personalMessageChange: 'ponies sorted by color :) DO NOT TOUCH',
            },
          ],
          end: true,
        },
      },
    },
    ...piaDayScripts,
    piaNowPlaying2,
    piaGameScore,
  ],
};
