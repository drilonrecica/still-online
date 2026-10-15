// Kayla: the ~*drama*~ friend. Everything is a crisis and the personal message changes constantly.
import type { ContactContent } from '../types';
import { kaylaDayScripts, kaylaDays } from './kayla-days';
import { kaylaGameScore } from './game-reactions';
import { kaylaNowPlaying2 } from './now-playing';

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
    days: kaylaDays,
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
    {
      id: 'followup1',
      trigger: { type: 'afterScript', scriptId: 'opening', minutes: 2 },
      start: 'poll',
      nodes: {
        poll: {
          lines: [
            { text: '{name}', delayMs: 3000 },
            { text: 'i need ur opinion. its urgent', delayMs: 1200 },
            {
              text: 'brianna checks my pm like every 5 min so it has to be PERFECT',
              delayMs: 1300,
            },
            { text: 'option 1: "some ppl r just jealous"', delayMs: 1100 },
            { text: 'option 2: "~*happy and thriving*~ :)"', delayMs: 1000 },
            {
              text: 'option 3: something sad so everyone asks whats wrong',
              delayMs: 1300,
            },
          ],
          choices: [
            { text: '1 obviously', next: 'jealous' },
            {
              text: '2. be the bigger person',
              label: '2, bigger person',
              next: 'thriving',
            },
            {
              text: '3 lol ur such a drama queen',
              label: '3, drama queen',
              next: 'sad',
            },
          ],
        },
        jealous: {
          lines: [
            { text: 'YES. subtle but deadly', delayMs: 1000 },
            {
              delayMs: 600,
              personalMessageChange: 'some ppl r just jealous ;)',
            },
            { text: 'and now im going busy', delayMs: 1200 },
            { delayMs: 500, statusChange: 'busy' },
            {
              text: 'im not actually busy. its a strategy',
              delayMs: 1100,
            },
          ],
          end: true,
        },
        thriving: {
          lines: [
            { text: 'ugh ur right. mature kayla. new kayla', delayMs: 1300 },
            {
              delayMs: 600,
              personalMessageChange: '~*happy and thriving*~ :)',
            },
            { text: '...', delayMs: 2500 },
            { text: 'this feels so fake', delayMs: 1000 },
            { text: 'ok i lasted 30 seconds', delayMs: 1100 },
            {
              delayMs: 600,
              personalMessageChange: '~*happy and thriving (kind of)*~',
            },
          ],
          end: true,
        },
        sad: {
          lines: [
            { text: 'EXCUSE ME', delayMs: 900 },
            { text: 'i am not a drama queen', delayMs: 1000 },
            {
              text: 'i am a drama PRINCESS. theres a difference',
              delayMs: 1300,
            },
            { text: 'ok but what do i put', delayMs: 1100 },
          ],
          choices: [
            {
              text: 'something about rain. sad stuff is always about rain',
              label: 'Something w rain',
              next: 'rain',
            },
            {
              text: 'make up ur own. ur deep',
              label: 'Write ur own',
              next: 'poet',
            },
          ],
        },
        rain: {
          lines: [
            { text: 'omg ur so right', delayMs: 1000 },
            {
              delayMs: 800,
              personalMessageChange: '~*the rain knows my secrets*~ :(',
            },
            { text: 'perfect. so tragic. 10/10', delayMs: 1300 },
          ],
          end: true,
        },
        poet: {
          lines: [
            { text: 'ok hold on. its coming to me', delayMs: 2000 },
            {
              delayMs: 800,
              personalMessageChange: 'u cant break what was never whole...',
            },
            { text: 'wait thats actually deep', delayMs: 1500 },
            { text: 'im kind of crying', delayMs: 1000 },
          ],
          end: true,
        },
      },
    },
    {
      id: 'followup2',
      trigger: { type: 'afterScript', scriptId: 'followup1', minutes: 4 },
      start: 'omg',
      nodes: {
        omg: {
          lines: [
            { text: 'omg. omg. {name}', delayMs: 2000 },
            { text: 'brianna just IMed me', delayMs: 1200 },
            { text: 'she said "cute pm"', delayMs: 1300 },
            { text: 'WHAT DOES THAT MEAN', delayMs: 900 },
            { delayMs: 500, personalMessageChange: '???????' },
          ],
          choices: [
            {
              text: 'maybe she just thinks its cute?',
              label: 'Maybe its nice?',
              next: 'literal',
            },
            {
              text: 'thats DEFINITELY sarcastic',
              label: 'Sarcastic',
              next: 'sarcastic',
            },
            {
              text: 'just say thanks lol',
              label: 'Say thanks',
              next: 'thanks',
            },
          ],
        },
        literal: {
          lines: [
            {
              text: 'cute like CUTE or cute like "aww how sad"',
              delayMs: 1300,
            },
            { text: 'there is a HUGE difference {name}', delayMs: 1000 },
          ],
          choices: [
            { text: 'cute like cute. relax', label: 'Relax', next: 'thanks' },
            {
              text: 'ok yeah thats the sad kind',
              label: 'The sad kind',
              next: 'sarcastic',
            },
          ],
        },
        sarcastic: {
          lines: [
            { text: 'I KNEW IT', delayMs: 800, nudge: true },
            {
              text: 'ok im writing back "thx, cute away message"',
              delayMs: 1400,
            },
            { text: 'wait is that too much', delayMs: 1100 },
          ],
          choices: [
            { text: 'its perfect. send it', label: 'Send it', next: 'sent' },
            {
              text: 'too much. abort abort',
              label: 'Abort!',
              next: 'thanks',
            },
          ],
        },
        sent: {
          lines: [
            { text: 'SENT', delayMs: 1000 },
            { text: '...', delayMs: 2500 },
            { text: 'she sent back :P', delayMs: 1200 },
            { text: 'is that war or is that peace', delayMs: 1100 },
            { text: 'i need to lie down', delayMs: 1300 },
            {
              delayMs: 600,
              statusChange: 'away',
              personalMessageChange: '~*lying down. do not disturb*~',
            },
          ],
          end: true,
        },
        thanks: {
          lines: [
            { text: 'fine. i said "thx :)"', delayMs: 1500 },
            { text: '...', delayMs: 2500 },
            { text: 'she said "np :)"', delayMs: 1200 },
            { text: 'omg r we friends now??', delayMs: 1000 },
            { text: 'i dont know how to feel about this', delayMs: 1200 },
            { delayMs: 600, personalMessageChange: '~*confused*~ :O' },
          ],
          end: true,
        },
      },
    },
    ...kaylaDayScripts,
    kaylaNowPlaying2,
    kaylaGameScore,
  ],
};
