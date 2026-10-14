// Dex: the skater who is always "Away". Answers late, never changes his status back.
import type { ContactContent } from '../types';

export const dex: ContactContent = {
  contact: {
    id: 'dex',
    displayName: 'dex',
    handle: 'dex.kickflip@livemail.example',
    avatar: { kind: 'pattern', seed: 'dex', colors: ['#E07B22', '#FFF4E0'] },
    group: 'School',
    initialStatus: 'away',
    personalMessage: 'skating. leave a msg',
    signInAfterMs: 270_000,
  },
  scripts: [
    {
      id: 'opening',
      trigger: { type: 'onSignIn' },
      start: 'hi',
      nodes: {
        hi: {
          lines: [
            { text: 'oh hey {name}', delayMs: 20_000 },
            {
              text: 'i always look away i know. i forget to change it',
              delayMs: 1500,
            },
          ],
          choices: [
            {
              text: 'lol ur ALWAYS away',
              label: 'Always away',
              next: 'always',
            },
            { text: 'hey dex whats up', label: 'Whats up?', next: 'up' },
          ],
        },
        always: {
          lines: [
            { text: 'its a lifestyle', delayMs: 2500 },
            { text: 'me and the keyboard r on a break', delayMs: 1200 },
          ],
          choices: [
            { text: 'thats deep', next: 'up' },
            { text: 'so where r u now', next: 'up' },
          ],
        },
        up: {
          lines: [
            { text: 'just got back from the skatepark', delayMs: 2000 },
            { text: 'landed a kickflip. finally', delayMs: 1200 },
          ],
          choices: [
            { text: 'NO WAY nice!!', label: 'Nice!!', next: 'nice' },
            { text: 'pics or it didnt happen', label: 'Pics?', next: 'pics' },
          ],
        },
        pics: {
          lines: [
            { text: 'my bros digital camera died lol', delayMs: 2200 },
            { text: 'u gotta believe me', delayMs: 1000 },
          ],
          choices: [
            { text: 'ok i believe u', next: 'nice' },
            { text: 'nope :P', next: 'nope' },
          ],
        },
        nope: {
          lines: [
            { text: 'wow. tragic', delayMs: 1800 },
            {
              text: 'ill do it in front of school tmrw. u will see',
              delayMs: 1500,
            },
          ],
          end: true,
        },
        nice: {
          lines: [
            { text: 'thx :D', delayMs: 1500 },
            { text: 'took like 300 tries', delayMs: 1000 },
          ],
          choices: [
            { text: 'wanna teach me?', label: 'Teach me?', next: 'teach' },
            {
              text: 'my wrists hurt just thinking about it',
              label: 'Ouch',
              next: 'wrists',
            },
          ],
        },
        teach: {
          lines: [
            { text: 'sure. saturday at the park', delayMs: 2000 },
            { text: 'bring a helmet. seriously', delayMs: 1200 },
          ],
          choices: [
            { text: 'deal (Y)', next: 'deal' },
            {
              text: 'do i HAVE to wear the helmet',
              label: 'Helmet??',
              next: 'helmet',
            },
          ],
        },
        helmet: {
          lines: [
            {
              text: 'yes. my mom would find out somehow. she always does',
              delayMs: 2000,
            },
            { text: 'ok going back outside. later', delayMs: 1500 },
          ],
          end: true,
        },
        deal: {
          lines: [
            { text: 'cool. ok going back outside', delayMs: 1500 },
            {
              delayMs: 1000,
              personalMessageChange: 'teaching {name} 2 skate sat.',
            },
          ],
          end: true,
        },
        wrists: {
          lines: [
            { text: 'lol fair', delayMs: 1500 },
            { text: 'ok going back out. later', delayMs: 1200 },
          ],
          end: true,
        },
      },
    },
    {
      id: 'dinner',
      trigger: { type: 'afterMinutes', minutes: 10 },
      start: 'gone',
      nodes: {
        gone: {
          lines: [
            { text: '{name} u still there?', delayMs: 0 },
            { text: 'nvm. dinner. brb (prob not)', delayMs: 2000 },
            {
              delayMs: 800,
              personalMessageChange: 'dinner. then skating. then sleep.',
            },
          ],
          end: true,
        },
      },
    },
    {
      id: 'nudged',
      trigger: { type: 'onPlayerNudge' },
      start: 'huh',
      repeat: true,
      nodes: {
        huh: {
          lines: [{ text: 'huh? oh. sry. was away. as usual', delayMs: 4000 }],
          end: true,
        },
      },
    },
  ],
};
