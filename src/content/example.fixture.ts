// The example from docs/content-format.md. Not shipped content; engine tests may reuse it.
import type { ContactContent } from './types';

export const exampleContact: ContactContent = {
  contact: {
    id: 'mika',
    displayName: '~*mika*~ (L)',
    handle: 'mika.sunshine@livemail.example',
    avatar: { kind: 'pattern', seed: 'mika', colors: ['#FF9ACB', '#FFE36E'] },
    group: 'friends',
    initialStatus: 'online',
    personalMessage: 'summer cant come soon enough!!',
    signInAfterMs: 20_000,
  },
  scripts: [
    {
      id: 'opening',
      trigger: { type: 'onSignIn' },
      start: 'hi',
      nodes: {
        hi: {
          lines: [
            { text: 'heyyy {name}!!', delayMs: 1500, nudge: true },
            { text: 'r u coming 2 the lake on saturday? :D', delayMs: 800 },
          ],
          choices: [
            { text: 'yeah totally!! what time?', label: 'Yes!', next: 'yes' },
            { text: 'cant, grounded :(', label: 'Grounded', next: 'no' },
          ],
        },
        yes: {
          lines: [
            { text: 'like 2ish, bring ur cd player', delayMs: 1200 },
            {
              text: 'brb mom needs the phone',
              delayMs: 600,
              statusChange: 'away',
            },
          ],
          end: true,
        },
        no: {
          lines: [
            { text: 'nooo :( thats so unfair', delayMs: 1000 },
            {
              delayMs: 400,
              personalMessageChange: 'lake trip minus {name} :(',
            },
          ],
          end: true,
        },
      },
    },
    {
      id: 'nudged',
      trigger: { type: 'onPlayerNudge' },
      start: 'ow',
      repeat: true,
      nodes: {
        ow: { lines: [{ text: 'OW lol stop :P', delayMs: 500 }], end: true },
      },
    },
  ],
};
