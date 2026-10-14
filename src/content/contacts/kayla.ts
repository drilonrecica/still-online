// Kayla: the ~*drama*~ friend. Everything is a crisis and the personal message changes constantly.
import type { ContactContent } from '../types';

export const kayla: ContactContent = {
  contact: {
    id: 'kayla',
    displayName: '~*Kayla*~ <3',
    handle: 'kayla.xoxo@livemail.example',
    avatar: { kind: 'pattern', seed: 'kayla', colors: ['#D63A6E', '#FFD1DC'] },
    group: 'Friends',
    initialStatus: 'online',
    personalMessage: 'some ppl need to learn what loyalty means...',
    signInAfterMs: 75_000,
  },
  scripts: [
    {
      id: 'opening',
      trigger: { type: 'onSignIn' },
      start: 'hi',
      nodes: {
        hi: {
          lines: [
            { text: '{name}', delayMs: 4000 },
            {
              text: 'did u see what brianna put as her away message',
              delayMs: 1200,
            },
          ],
          choices: [
            { text: 'no what??', next: 'what' },
            {
              text: 'kayla not this again',
              label: 'Not again...',
              next: 'again',
            },
          ],
        },
        again: {
          lines: [
            { text: 'excuse me?? this is IMPORTANT', delayMs: 900 },
            { delayMs: 500, personalMessageChange: 'nobody understands me' },
          ],
          choices: [
            { text: 'ok ok what happened', next: 'what' },
            { text: 'fine. tell me', next: 'what' },
          ],
        },
        what: {
          lines: [
            {
              text: 'she wrote "some ppl copy EVERYTHING i do"',
              delayMs: 1500,
            },
            { text: 'EVERYONE knows thats about me', delayMs: 900 },
            { text: 'i had the striped hoodie FIRST', delayMs: 1100 },
          ],
          choices: [
            { text: 'omg thats so rude', label: 'So rude', next: 'side' },
            {
              text: 'maybe its not about u?',
              label: 'Maybe not about u?',
              next: 'doubt',
            },
          ],
        },
        doubt: {
          lines: [
            { text: '{name}. it is ALWAYS about me', delayMs: 1300 },
            { text: 'whose side r u on', delayMs: 900 },
          ],
          choices: [
            { text: 'urs obviously', next: 'side' },
            {
              text: 'nobodys. im switzerland',
              label: 'Switzerland',
              next: 'swiss',
            },
          ],
        },
        swiss: {
          lines: [
            { text: 'ugh ur so diplomatic its annoying', delayMs: 1200 },
            {
              delayMs: 600,
              personalMessageChange: 'trust no1. not even switzerland',
            },
          ],
          choices: [
            {
              text: 'lol ok im on ur side',
              label: 'Ok, ur side',
              next: 'side',
            },
            {
              text: 'can we talk about something else',
              label: 'Change topic',
              next: 'else',
            },
          ],
        },
        side: {
          lines: [
            { text: 'THANK YOU', delayMs: 800 },
            { text: 'ok im changing my pm. watch', delayMs: 1000 },
            {
              delayMs: 1500,
              personalMessageChange: '~*real friends stay true*~ (L)',
            },
          ],
          choices: [
            { text: 'ooh dramatic', next: 'plan' },
            {
              text: 'is that about brianna?',
              label: 'About brianna?',
              next: 'plan',
            },
          ],
        },
        plan: {
          lines: [
            { text: 'maybe. maybe not ;)', delayMs: 1000 },
            {
              text: 'should i say something to her at lunch tmrw?',
              delayMs: 1300,
            },
          ],
          choices: [
            { text: 'just ignore it', label: 'Ignore it', next: 'ignore' },
            { text: 'talk to her. nicely', label: 'Talk nicely', next: 'talk' },
          ],
        },
        ignore: {
          lines: [
            { text: 'yes. ignoring is the ultimate revenge', delayMs: 1200 },
            {
              delayMs: 800,
              personalMessageChange: 'ignoring ppl who dont matter :)',
            },
          ],
          end: true,
        },
        talk: {
          lines: [
            { text: 'ugh FINE ur probably right', delayMs: 1300 },
            { text: 'but if she rolls her eyes im leaving', delayMs: 1000 },
            { delayMs: 800, personalMessageChange: 'taking the high road (Y)' },
          ],
          end: true,
        },
        else: {
          lines: [
            { text: 'fine. did u finish the english essay', delayMs: 1500 },
            { text: 'jk i dont care lol', delayMs: 900 },
            { delayMs: 600, personalMessageChange: '~*whatever*~' },
          ],
          end: true,
        },
      },
    },
    {
      id: 'update',
      trigger: { type: 'afterMinutes', minutes: 7 },
      start: 'update',
      nodes: {
        update: {
          lines: [
            { text: 'UPDATE', delayMs: 0, nudge: true },
            { text: 'brianna just changed HER pm too', delayMs: 900 },
            { text: 'this means war', delayMs: 800 },
            { delayMs: 400, personalMessageChange: '~*its ON*~' },
          ],
          choices: [
            { text: 'kayla. breathe.', label: 'Breathe', next: 'calm' },
            { text: 'lol go get her', label: 'Go get her', next: 'war' },
          ],
        },
        calm: {
          lines: [
            { text: '...ok. breathing', delayMs: 1500 },
            { delayMs: 600, personalMessageChange: '~*zen mode*~' },
          ],
          end: true,
        },
        war: {
          lines: [
            { text: 'lol jk im not THAT dramatic', delayMs: 1200 },
            { text: '...yes i am', delayMs: 1500 },
          ],
          end: true,
        },
      },
    },
    {
      id: 'nowPlaying',
      trigger: { type: 'onNowPlaying' },
      start: 'life',
      nodes: {
        life: {
          lines: [
            {
              text: 'omg {title} is literally my life right now',
              delayMs: 2500,
            },
            { delayMs: 800, personalMessageChange: '{title} = my life <3' },
          ],
          end: true,
        },
      },
    },
  ],
};
