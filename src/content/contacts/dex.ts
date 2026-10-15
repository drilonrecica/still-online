// Dex: the skater who is always "Away". Answers late, never changes his status back.
import type { ContactContent } from '../types';
import { dexDayScripts, dexDays } from './dex-days';
import { dexNowPlaying2 } from './now-playing';

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
    days: dexDays,
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
    {
      id: 'followup1',
      trigger: { type: 'afterScript', scriptId: 'opening', minutes: 2 },
      start: 'back',
      nodes: {
        back: {
          lines: [
            { text: 'ok so', delayMs: 25_000 },
            { text: 'tried the kickflip again. like an hour', delayMs: 2000 },
            { text: 'landed it 0 times', delayMs: 1500 },
          ],
          choices: [
            {
              text: 'lol so it WAS a fluke',
              label: 'Fluke?',
              next: 'fluke',
            },
            { text: 'aw dude :( r u ok', label: 'U ok?', next: 'hurt' },
          ],
        },
        fluke: {
          lines: [
            { text: 'it was NOT a fluke', delayMs: 3000 },
            { text: 'my board is just mad at me', delayMs: 1500 },
            { text: 'i left it in the rain once. it remembers', delayMs: 1800 },
          ],
          choices: [
            { text: 'say sorry to ur board', next: 'sorry' },
            {
              text: 'boards dont have feelings dex',
              label: 'No feelings',
              next: 'feelings',
            },
          ],
        },
        sorry: {
          lines: [
            { text: 'already did. it said no', delayMs: 2500 },
            { text: 'gonna give it a new grip tape. as a gift', delayMs: 1500 },
            {
              delayMs: 1000,
              personalMessageChange: 'me and my board r in couples therapy',
            },
          ],
          end: true,
        },
        feelings: {
          lines: [
            { text: 'thats what u think', delayMs: 2500 },
            { text: 'ok gtg ice my elbow. long story', delayMs: 1500 },
          ],
          end: true,
        },
        hurt: {
          lines: [
            { text: 'ya mostly', delayMs: 3000 },
            { text: 'my elbow is purple now. kinda cool tho', delayMs: 1500 },
            { text: 'looks like a map of australia', delayMs: 1800 },
          ],
          choices: [
            { text: 'put ice on it!!', next: 'ice' },
            {
              text: 'lol show me tmrw',
              label: 'Show me tmrw',
              next: 'show',
            },
          ],
        },
        ice: {
          lines: [
            { text: 'only ice we have is a bag of peas', delayMs: 2500 },
            { text: 'ok. peas it is', delayMs: 1200 },
            {
              delayMs: 1000,
              personalMessageChange: 'elbow: purple. peas: frozen.',
            },
          ],
          end: true,
        },
        show: {
          lines: [
            { text: 'deal. itll be green by then probably', delayMs: 2500 },
            { text: 'even cooler', delayMs: 1200 },
          ],
          end: true,
        },
      },
    },
    {
      id: 'followup2',
      trigger: { type: 'afterScript', scriptId: 'followup1', minutes: 4 },
      start: 'cam',
      nodes: {
        cam: {
          lines: [
            { text: '{name}', delayMs: 30_000 },
            { text: 'big news', delayMs: 2000 },
            {
              text: 'found my bros OLD camcorder in the garage. it works',
              delayMs: 2200,
            },
            { text: 'tapes say 1998 on them lol', delayMs: 1500 },
          ],
          choices: [
            {
              text: 'so now theres proof of the kickflip?',
              label: 'Proof!',
              next: 'proof',
            },
            {
              text: 'omg make a skate video!!',
              label: 'Skate video!!',
              next: 'video',
            },
            { text: 'r u gonna change ur status now', next: 'status' },
          ],
        },
        status: {
          lines: [
            { text: 'what status', delayMs: 4000 },
            { text: 'oh. away. ya no thats permanent', delayMs: 2000 },
            { text: 'anyway. the camcorder', delayMs: 1500 },
          ],
          choices: [
            { text: 'lol ok. skate video?', next: 'video' },
            { text: 'film the kickflip!', next: 'proof' },
          ],
        },
        proof: {
          lines: [
            {
              text: 'exactly. no more "pics or it didnt happen"',
              delayMs: 2500,
            },
            { text: 'but i need someone to hold it', delayMs: 1500 },
            { text: 'my bro said hes "too old for this"', delayMs: 1800 },
          ],
          choices: [
            { text: 'ill film it! (Y)', label: 'Ill film', next: 'film' },
            {
              text: 'only if i get credit',
              label: 'Credit pls',
              next: 'credit',
            },
          ],
        },
        video: {
          lines: [
            { text: 'ya thats the plan', delayMs: 2500 },
            {
              text: 'slow mo parts. sick music. the whole thing',
              delayMs: 1800,
            },
            { text: 'u in?', delayMs: 1200 },
          ],
          choices: [
            { text: 'im so in', next: 'film' },
            {
              text: 'only if i get credit',
              label: 'Credit pls',
              next: 'credit',
            },
          ],
        },
        credit: {
          lines: [
            { text: 'ok. "camera by {name}"', delayMs: 2500 },
            { text: 'in big letters. after my name', delayMs: 1500 },
            { text: 'but big', delayMs: 1200 },
          ],
          choices: [
            { text: 'deal lol', next: 'film' },
            { text: 'BEFORE ur name', next: 'before' },
          ],
        },
        before: {
          lines: [
            { text: 'ur ruthless', delayMs: 3000 },
            { text: 'fine. same size. final offer', delayMs: 1500 },
            {
              delayMs: 1000,
              personalMessageChange: 'dex + {name} productions. coming soon',
            },
          ],
          end: true,
        },
        film: {
          lines: [
            { text: 'sick', delayMs: 2500 },
            {
              text: 'gotta find the charger first. could take days',
              delayMs: 1800,
            },
            { text: 'ok going back out. later', delayMs: 1500 },
            {
              delayMs: 1000,
              personalMessageChange: 'filming a skate vid. camera: {name}',
            },
          ],
          end: true,
        },
      },
    },
    ...dexDayScripts,
    dexNowPlaying2,
  ],
};
