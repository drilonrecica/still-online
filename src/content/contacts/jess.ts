// Jess: the hyperactive best friend. ALL CAPS, many exclamation marks, nudges constantly.
import type { ContactContent } from '../types';

export const jess: ContactContent = {
  contact: {
    id: 'jess',
    displayName: 'xX~JeSs~Xx :D',
    handle: 'jessiebee@livemail.example',
    avatar: { kind: 'pattern', seed: 'jess', colors: ['#FF6FB5', '#FFF27A'] },
    group: 'Friends',
    initialStatus: 'online',
    personalMessage: 'OMG 3 more days!!!1 (L)',
    signInAfterMs: 8_000,
  },
  scripts: [
    {
      id: 'opening',
      trigger: { type: 'onSignIn' },
      start: 'hi',
      nodes: {
        hi: {
          lines: [
            { text: '{name}!!!!!', delayMs: 2000, nudge: true },
            { text: 'omg omg omg', delayMs: 500 },
            { text: 'guess what', delayMs: 400 },
          ],
          choices: [
            { text: 'what?? tell me!!', label: 'What??', next: 'guess' },
            {
              text: 'lemme guess... u got a hamster',
              label: 'A hamster?',
              next: 'hamster',
            },
          ],
        },
        hamster: {
          lines: [
            { text: 'NO lol thats so random :P', delayMs: 900 },
            { text: 'ok its WAY better than a hamster', delayMs: 600 },
          ],
          choices: [
            { text: 'ok just tell me!!', label: 'Just tell me', next: 'guess' },
            {
              text: 'u won the radio contest??',
              label: 'Radio contest?',
              next: 'contest',
            },
          ],
        },
        contest: {
          lines: [
            { text: 'HOW DID U KNOW', delayMs: 700, nudge: true },
            { text: 'ur psychic. thats creepy. i love it', delayMs: 800 },
            { text: '2 TICKETS to the Tinfoil Comets!!!', delayMs: 700 },
          ],
          choices: [
            { text: 'OMG!!!', next: 'invite' },
            { text: 'im so jealous rn', label: 'Jealous', next: 'invite' },
          ],
        },
        guess: {
          lines: [
            { text: 'i WON the radio contest!!!', delayMs: 800, nudge: true },
            { text: '2 TICKETS to the Tinfoil Comets!!! :D', delayMs: 600 },
          ],
          choices: [
            { text: 'NO WAY', next: 'invite' },
            { text: 'who?', next: 'who' },
          ],
        },
        who: {
          lines: [
            { text: 'WHO??? {name} they r the best band EVER', delayMs: 700 },
            {
              text: 'we played their cd at my bday like 40 times',
              delayMs: 900,
            },
          ],
          choices: [
            {
              text: 'oh right, the cd w the robot on it',
              label: 'Oh right!',
              next: 'invite',
            },
            {
              text: 'lol jk i know who they are',
              label: 'jk lol',
              next: 'invite',
            },
          ],
        },
        invite: {
          lines: [
            { text: 'sooooo...', delayMs: 800 },
            { text: 'wanna come with me?? :D its next friday', delayMs: 900 },
          ],
          choices: [
            { text: 'YES obviously', label: 'YES', next: 'yes' },
            {
              text: 'i have to ask my mom first',
              label: 'Ask mom first',
              next: 'mom',
            },
          ],
        },
        yes: {
          lines: [
            { text: 'AAAAAHHHHH', delayMs: 500, nudge: true },
            { text: 'best night of our lives (L)', delayMs: 700 },
            {
              delayMs: 1500,
              personalMessageChange: 'TINFOIL COMETS W/ {name}!!!!',
            },
          ],
          end: true,
        },
        mom: {
          lines: [
            { text: 'ugh ok but tell her its educational lol', delayMs: 900 },
            { text: 'go ask NOW. ill wait. brb', delayMs: 700 },
            { delayMs: 500, statusChange: 'away' },
            { delayMs: 45_000, statusChange: 'online' },
          ],
          end: true,
        },
      },
    },
    {
      id: 'bored',
      trigger: { type: 'afterMinutes', minutes: 6 },
      start: 'bored',
      nodes: {
        bored: {
          lines: [
            { text: '{name} im sooooo bored', delayMs: 0, nudge: true },
            { text: 'entertain me!!!', delayMs: 600 },
          ],
          choices: [
            {
              text: 'why did the cd player cry? it had too many skips',
              label: 'Tell a joke',
              next: 'joke',
            },
            { text: 'go do ur homework lol', label: 'Homework', next: 'hw' },
          ],
        },
        joke: {
          lines: [
            { text: 'LOL that is the WORST joke ever', delayMs: 1200 },
            { text: 'im telling it to everyone tmrw', delayMs: 700 },
          ],
          end: true,
        },
        hw: {
          lines: [{ text: 'homework is for the WEAK :P', delayMs: 900 }],
          end: true,
        },
      },
    },
    {
      id: 'nowPlaying',
      trigger: { type: 'onNowPlaying' },
      start: 'loud',
      nodes: {
        loud: {
          lines: [
            { text: 'omg ur listening to {artist}??', delayMs: 3000 },
            { text: 'TURN IT UP!!! :D', delayMs: 500, nudge: true },
          ],
          end: true,
        },
      },
    },
    {
      id: 'nudged',
      trigger: { type: 'onPlayerNudge' },
      start: 'war',
      repeat: true,
      nodes: {
        war: {
          lines: [{ text: 'NUDGE WAR!!!', delayMs: 600, nudge: true }],
          end: true,
        },
      },
    },
  ],
};
