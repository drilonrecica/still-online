// Jess: the hyperactive best friend. ALL CAPS, many exclamation marks, nudges constantly.
import type { ContactContent } from '../types';
import { jessDayScripts, jessDays } from './jess-days';
import { jessNowPlaying2 } from './now-playing';

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
    days: jessDays,
    awayReply: 'UR AWAY?? ugh fine. BRB 2',
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
            {
              text: 'here have a hamster anyway',
              delayMs: 600,
              wink: 'hamster',
            },
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
            {
              text: 'WHO??? the tinfoil comets they r the best band EVER',
              delayMs: 700,
            },
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
    {
      id: 'followup1',
      trigger: { type: 'afterScript', scriptId: 'opening', minutes: 2 },
      start: 'back',
      nodes: {
        back: {
          lines: [
            { text: 'IM BACK', delayMs: 1500, nudge: true },
            { text: 'ok VERY important question', delayMs: 600 },
            {
              text: 'is ur mom ok w friday?? like OFFICIALLY officially??',
              delayMs: 800,
            },
          ],
          choices: [
            {
              text: 'yep shes totally cool w it!!',
              label: 'Yep, all good!',
              next: 'official',
            },
            {
              text: 'shes still "thinking about it"',
              label: 'Still thinking...',
              next: 'bribe',
            },
            {
              text: 'umm i kinda havent asked yet',
              label: 'Havent asked yet',
              next: 'notyet',
            },
          ],
        },
        official: {
          lines: [
            { text: 'YESSSSSSSS', delayMs: 500, nudge: true },
            { text: 'ok my mom is driving us there', delayMs: 800 },
            { text: 'she PROMISED not to sing in the car', delayMs: 700 },
            { text: '(she will sing in the car)', delayMs: 1000 },
          ],
          choices: [
            { text: 'lol poor us', next: 'sign' },
            {
              text: 'ill bring earplugs for the ride :P',
              label: 'Earplugs',
              next: 'sign',
            },
          ],
        },
        bribe: {
          lines: [
            { text: 'ugh moms LOVE to think about it', delayMs: 800 },
            { text: 'ok plan B. we bribe her', delayMs: 700 },
            {
              text: 'i can make my famous brownies. famous to my dog but still',
              delayMs: 1000,
            },
          ],
          choices: [
            {
              text: 'lol ok brownies it is',
              label: 'Brownies it is',
              next: 'sign',
            },
            {
              text: 'ill tell her its a once in a lifetime thing',
              label: 'Once in a lifetime',
              next: 'sign',
            },
          ],
        },
        notyet: {
          lines: [
            { text: 'WHAT', delayMs: 600, nudge: true },
            { text: '{name} its in like a WEEK', delayMs: 700 },
            { text: 'go ask her right after this. promise me', delayMs: 800 },
          ],
          choices: [
            { text: 'ok ok i promise!!', label: 'I promise', next: 'sign' },
            { text: 'pinky promise (Y)', label: 'Pinky promise', next: 'sign' },
          ],
        },
        sign: {
          lines: [
            { text: 'ok ANYWAY', delayMs: 900 },
            { text: 'im making us a SIGN for the concert!!', delayMs: 700 },
            {
              text: 'theres glitter EVERYWHERE. my cat is sparkly now',
              delayMs: 900,
            },
            { text: 'what should it say?? :D', delayMs: 700 },
          ],
          choices: [
            { text: 'ZIGGY MARRY ME', label: 'Ziggy marry me', next: 'marry' },
            {
              text: 'WE DROVE 3 HRS FOR THIS (we didnt)',
              label: 'We drove 3 hrs',
              next: 'drove',
            },
            {
              text: 'just draw a giant robot on it',
              label: 'Giant robot',
              next: 'robot',
            },
          ],
        },
        marry: {
          lines: [
            { text: 'LOL ziggy is like 28 thats OLD', delayMs: 900 },
            {
              text: 'but he does the drumstick spin thing so... worth it',
              delayMs: 1000,
            },
            { text: 'writing it in pink. BIG pink', delayMs: 700 },
            {
              delayMs: 1500,
              personalMessageChange: 'ZIGGY MARRY ME (L) (L) (L)',
            },
          ],
          end: true,
        },
        drove: {
          lines: [
            { text: 'HAHAHAHA', delayMs: 600, nudge: true },
            { text: 'nobody will ever know', delayMs: 700 },
            { text: 'ur a GENIUS {name}', delayMs: 600 },
            {
              delayMs: 1500,
              personalMessageChange: 'we drove 3 hrs 4 this (we didnt) :P',
            },
          ],
          end: true,
        },
        robot: {
          lines: [
            { text: 'OMG YES like on their cd cover!!', delayMs: 800 },
            { text: 'ok i cant draw robots tho', delayMs: 700 },
            {
              text: 'its gonna look like a toaster. a toaster w feelings',
              delayMs: 1000,
            },
            {
              delayMs: 1500,
              personalMessageChange: 'making a sign!!! it might be a toaster',
            },
          ],
          end: true,
        },
      },
    },
    {
      id: 'followup2',
      trigger: { type: 'afterScript', scriptId: 'followup1', minutes: 4 },
      start: 'panic',
      nodes: {
        panic: {
          lines: [
            { text: '{name}', delayMs: 0, nudge: true },
            { text: '{name} {name} {name}', delayMs: 400, nudge: true },
            { text: 'i cant find the tickets', delayMs: 700 },
            { text: 'I CANT FIND THE TICKETS', delayMs: 500 },
          ],
          choices: [
            {
              text: 'WHAT. where did u have them last??',
              label: 'Where were they?',
              next: 'desk',
            },
            {
              text: 'did u check ur pockets',
              label: 'Check ur pockets',
              next: 'pocket',
            },
            {
              text: 'lol ur joking right',
              label: 'Ur joking right?',
              next: 'notjoke',
            },
          ],
        },
        notjoke: {
          lines: [
            { text: 'IM NOT JOKING', delayMs: 600, nudge: true },
            { text: 'this is a CODE RED', delayMs: 600 },
            { text: 'help me think!!!', delayMs: 500 },
          ],
          choices: [
            { text: 'ok where were they last', next: 'desk' },
            { text: 'check ur pockets', next: 'pocket' },
          ],
        },
        desk: {
          lines: [
            { text: 'ON MY DESK. next to my lip gloss', delayMs: 800 },
            { text: 'and now theyre GONE', delayMs: 600 },
            {
              text: 'my little brother was in my room earlier. SUSPICIOUS',
              delayMs: 900,
            },
          ],
          choices: [
            {
              text: 'go interrogate him!!',
              label: 'Interrogate him',
              next: 'brother',
            },
            {
              text: 'jess. check. ur. pockets.',
              label: 'Check ur pockets',
              next: 'pocket',
            },
          ],
        },
        brother: {
          lines: [
            { text: 'oh im GOING. brb', delayMs: 600, statusChange: 'away' },
            { delayMs: 12_000, statusChange: 'online' },
            { text: 'FOUND THEM', delayMs: 500, nudge: true },
            {
              text: 'he was using them as a BOOKMARK. in his dinosaur book',
              delayMs: 900,
            },
            {
              text: 'i said if he touches them again i tell everyone about his nightlight',
              delayMs: 1000,
            },
          ],
          choices: [
            { text: 'LOL savage', next: 'found' },
            { text: 'poor kid lol', next: 'found' },
          ],
        },
        pocket: {
          lines: [
            { text: '...', delayMs: 1200 },
            { text: 'hold on', delayMs: 600 },
            { text: 'OMG', delayMs: 1500, nudge: true },
            {
              text: 'they were in my jeans. IN THE WASHING MACHINE',
              delayMs: 700,
            },
            {
              text: 'theyre kinda crunchy now but u can still read them!!!',
              delayMs: 900,
            },
          ],
          choices: [
            {
              text: 'crunchy tickets lol',
              label: 'Crunchy tickets',
              next: 'found',
            },
            {
              text: 'jess how r u even alive',
              label: 'How r u alive',
              next: 'found',
            },
          ],
        },
        found: {
          lines: [
            { text: 'ok new rule', delayMs: 900 },
            { text: 'my mom holds the tickets until friday', delayMs: 700 },
            { text: 'i cant be trusted w nice things :P', delayMs: 800 },
            { text: 'luv u bye!!! (L)', delayMs: 700 },
            {
              delayMs: 1500,
              personalMessageChange: 'tickets: SAFE. me: a mess :P',
            },
          ],
          end: true,
        },
      },
    },
    ...jessDayScripts,
    jessNowPlaying2,
  ],
};
