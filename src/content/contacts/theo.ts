// Theo: the shy classmate from bio. Short, hesitant lines, apologises a lot.
import type { ContactContent } from '../types';

export const theo: ContactContent = {
  contact: {
    id: 'theo',
    displayName: 'theo',
    handle: 'theo.k@livemail.example',
    avatar: { kind: 'pattern', seed: 'theo', colors: ['#5B8C5A', '#E8F1D4'] },
    group: 'School',
    initialStatus: 'online',
    personalMessage: 'bio project due fri...',
    signInAfterMs: 210_000,
  },
  scripts: [
    {
      id: 'opening',
      trigger: { type: 'onSignIn' },
      start: 'hi',
      nodes: {
        hi: {
          lines: [
            { text: 'um hi', delayMs: 15_000 },
            { text: 'is this {name}? from bio?', delayMs: 2500 },
          ],
          choices: [
            { text: 'yeah! hi theo', label: 'Yeah, hi!', next: 'yes' },
            { text: 'who is this?', next: 'who' },
          ],
        },
        who: {
          lines: [
            { text: 'oh. sorry. its theo', delayMs: 2000 },
            { text: 'i sit behind u in bio', delayMs: 1500 },
          ],
          choices: [
            { text: 'oh hey theo!', next: 'yes' },
            {
              text: 'the one with the cool drawings?',
              label: 'The drawings guy?',
              next: 'drawings',
            },
          ],
        },
        drawings: {
          lines: [
            { text: 'oh. u saw those?', delayMs: 2200 },
            { text: 'theyre not that good', delayMs: 1400 },
          ],
          choices: [
            { text: 'theyre really good tho', next: 'project' },
            { text: 'lol the frog one was awesome', next: 'project' },
          ],
        },
        yes: {
          lines: [
            {
              text: 'ok good. i wasnt sure i had the right address',
              delayMs: 2000,
            },
          ],
          choices: [
            { text: 'whats up?', next: 'project' },
            { text: 'lol of course u did', next: 'project' },
          ],
        },
        project: {
          lines: [
            {
              text: 'so um. we r partners for the cell project',
              delayMs: 2500,
            },
            { text: 'mr dalton paired us', delayMs: 1500 },
            { text: 'sorry', delayMs: 1200 },
          ],
          choices: [
            {
              text: 'cool! wanna meet at the library?',
              label: 'Library?',
              next: 'library',
            },
            {
              text: 'can u just do it lol',
              label: 'U do it lol',
              next: 'doall',
            },
          ],
        },
        doall: {
          lines: [
            { text: 'oh. um. ok i guess', delayMs: 3000 },
            { text: '...', delayMs: 2000 },
          ],
          choices: [
            {
              text: 'jk jk!! we do it together',
              label: 'jk!!',
              next: 'library',
            },
            { text: 'no seriously', next: 'solo' },
          ],
        },
        library: {
          lines: [{ text: 'ok yeah. thursday after school?', delayMs: 2200 }],
          choices: [
            { text: 'thursday works (Y)', next: 'thursday' },
            { text: 'can we do wednesday?', next: 'wednesday' },
          ],
        },
        thursday: {
          lines: [
            { text: 'cool. ill bring markers :)', delayMs: 1800 },
            { delayMs: 2000, personalMessageChange: 'thursday: library :)' },
          ],
          end: true,
        },
        wednesday: {
          lines: [
            { text: 'wednesday i have piano', delayMs: 2000 },
            { text: 'but ok. i can skip it. dont tell my mom', delayMs: 2500 },
          ],
          end: true,
        },
        solo: {
          lines: [
            { text: 'ok', delayMs: 4000 },
            { delayMs: 1000, statusChange: 'away' },
          ],
          end: true,
        },
      },
    },
    {
      id: 'poster',
      trigger: { type: 'afterMinutes', minutes: 12 },
      start: 'poster',
      nodes: {
        poster: {
          lines: [
            { text: 'um {name}?', delayMs: 0 },
            {
              text: 'i made a draft of the poster. its kind of bad',
              delayMs: 2500,
            },
          ],
          choices: [
            { text: 'send it!', next: 'send' },
            { text: 'im sure its great', next: 'great' },
          ],
        },
        send: {
          lines: [
            {
              text: 'its on my brothers computer. ill bring it tmrw',
              delayMs: 2200,
            },
          ],
          end: true,
        },
        great: {
          lines: [{ text: 'thanks :)', delayMs: 2500 }],
          end: true,
        },
      },
    },
    {
      id: 'nudged',
      trigger: { type: 'onPlayerNudge' },
      start: 'oh',
      repeat: true,
      nodes: {
        oh: {
          lines: [
            {
              text: 'oh! hi. sorry, was i supposed to say something?',
              delayMs: 1500,
            },
          ],
          end: true,
        },
      },
    },
  ],
};
