// Jess, days 2–5: concert week. Sign panic, outfit crisis, the night before, the front-row recap.
import { g } from '../gender';
import type { Contact, Script } from '../types';

export const jessDays: Contact['days'] = {
  2: {
    status: 'online',
    personalMessage: 'SIGN EMERGENCY!!! glitter EVERYWHERE',
  },
  3: { status: 'busy', personalMessage: 'NOTHING 2 WEAR. NOTHING!!!! :(' },
  4: { status: 'online', personalMessage: '1 MORE SLEEP!!!!! (L) (L)' },
  5: {
    status: 'online',
    personalMessage: 'FRONT ROW!!!!! u had to be there (L)',
  },
};

export const jessDayScripts: readonly Script[] = [
  {
    id: 'day2',
    trigger: { type: 'onDay', day: 2 },
    start: 'sign',
    nodes: {
      sign: {
        lines: [
          { text: '{name}!!!!', delayMs: 2000, nudge: true },
          { text: 'SIGN EMERGENCY', delayMs: 500 },
          { text: 'i spelled it wrong. IN GLITTER GLUE', delayMs: 800 },
          { text: 'it says TINFOIL COMTES', delayMs: 700 },
        ],
        choices: [
          {
            text: 'just add a tiny E on top',
            label: 'Add a tiny E',
            next: 'fix',
          },
          {
            text: 'comtes is kind of a cool word tho',
            label: 'Keep it',
            next: 'keep',
          },
          {
            text: 'start over?? theres still time',
            label: 'Start over',
            next: 'over',
          },
        ],
      },
      fix: {
        lines: [
          { text: 'a TINY E. ur a genius', delayMs: 900 },
          {
            text: 'ok its kinda floating above like a little hat',
            delayMs: 1000,
          },
          { text: 'its fine. its CUTE', delayMs: 600 },
        ],
        choices: [
          { text: 'it gives it character', next: 'cat' },
          { text: 'nobody will even notice', next: 'cat' },
        ],
      },
      keep: {
        lines: [
          { text: 'LOL comtes', delayMs: 800 },
          { text: 'it can be our secret word', delayMs: 700 },
          { text: 'COMTES 4 LIFE', delayMs: 600, nudge: true },
        ],
        choices: [
          { text: 'COMTES 4 LIFE', next: 'cat' },
          {
            text: 'what does it even mean',
            label: 'What does it mean?',
            next: 'cat',
          },
        ],
      },
      over: {
        lines: [
          { text: 'START OVER??? the glitter is GONE {name}', delayMs: 900 },
          { text: 'i used ALL of it. my cat has the rest', delayMs: 800 },
        ],
        choices: [
          { text: 'ok ok keep it lol', next: 'cat' },
          {
            text: 'borrow glitter from the cat',
            label: 'Borrow from the cat',
            next: 'cat',
          },
        ],
      },
      cat: {
        lines: [
          { text: 'ok WAIT update', delayMs: 1200 },
          { text: 'my cat just walked across it', delayMs: 700 },
          { text: 'theres a PAW PRINT in the middle now', delayMs: 800 },
          { text: 'honestly it looks better', delayMs: 900 },
          {
            delayMs: 1500,
            personalMessageChange: 'SIGN STATUS: has a paw print (L)',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day3',
    trigger: { type: 'onDay', day: 3 },
    start: 'help',
    nodes: {
      help: {
        lines: [
          { text: '{name} {name}', delayMs: 2000, nudge: true },
          { text: 'CODE PINK', delayMs: 500 },
          { text: 'i have NOTHING to wear to the concert', delayMs: 800 },
          { text: 'my whole closet is a LIE', delayMs: 700 },
        ],
        choices: [
          {
            text: 'ur tinfoil comets shirt!!',
            label: 'Band shirt',
            next: 'shirt',
          },
          {
            text: g(
              'the sparkly purple top!!',
              'the shiny purple thing?? idk what its called',
            ),
            label: g('Sparkly top', 'The purple thing'),
            next: 'sparkly',
          },
          {
            text: 'wear actual tinfoil lol',
            label: 'Actual tinfoil',
            next: 'tinfoil',
          },
        ],
      },
      shirt: {
        lines: [
          { text: 'the robot one??', delayMs: 800 },
          { text: 'omg wait its too small now', delayMs: 900 },
          { text: 'i wore it 2 much. it shrank from LOVE', delayMs: 900 },
        ],
        choices: [
          { text: 'wear it anyway', next: 'mirror' },
          {
            text: 'put it over a long sleeve',
            label: 'Layer it',
            next: 'mirror',
          },
        ],
      },
      sparkly: {
        lines: [
          { text: 'OMG YES', delayMs: 600, nudge: true },
          { text: 'with the jeans w the stars on the pocket??', delayMs: 900 },
        ],
        choices: [
          { text: 'YES the star jeans', label: 'Star jeans', next: 'mirror' },
          {
            text: g(
              'and glitter. obviously',
              'and glitter i guess?? u love glitter',
            ),
            label: g('And glitter', 'Glitter i guess'),
            next: 'mirror',
          },
        ],
      },
      tinfoil: {
        lines: [
          { text: 'LOL', delayMs: 700 },
          { text: '...', delayMs: 1200 },
          { text: 'wait', delayMs: 600 },
          { text: 'WAIT. tinfoil ARMBANDS', delayMs: 700, nudge: true },
          { text: 'UR A GENIUS', delayMs: 500 },
        ],
        choices: [
          { text: 'i know :P', next: 'mirror' },
          {
            text: 'i was joking but ok',
            label: 'I was joking...',
            next: 'mirror',
          },
        ],
      },
      mirror: {
        lines: [
          { text: 'ok trying it on. brb', delayMs: 900, statusChange: 'away' },
          { delayMs: 10_000, statusChange: 'online' },
          { text: 'ok i look AMAZING', delayMs: 500, nudge: true },
          { text: 'my brother said i look like a disco ball', delayMs: 800 },
          { text: 'thats a COMPLIMENT', delayMs: 700 },
          {
            delayMs: 1500,
            personalMessageChange: 'outfit: SOLVED. disco ball mode (L)',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day4',
    trigger: { type: 'onDay', day: 4 },
    start: 'cant',
    nodes: {
      cant: {
        lines: [
          { text: '{name}', delayMs: 2000, nudge: true },
          { text: 'i cant sleep', delayMs: 600 },
          {
            text: 'i KNOW its not even late. i ALREADY cant sleep',
            delayMs: 900,
          },
          { text: 'checklist time. ready??', delayMs: 700 },
        ],
        choices: [
          { text: 'ready!!', next: 'list' },
          {
            text: 'jess its gonna be fine. breathe',
            label: 'Breathe',
            next: 'breathe',
          },
        ],
      },
      breathe: {
        lines: [
          { text: 'BREATHING IS FOR THE WEAK', delayMs: 700 },
          { text: 'ok fine. in. out. in. out', delayMs: 1200 },
          { text: 'ok THAT helped. checklist', delayMs: 800 },
        ],
        choices: [
          { text: 'go', next: 'list' },
          { text: 'checklist!!', next: 'list' },
        ],
      },
      list: {
        lines: [
          { text: 'tickets: my mom has them. SAFE (Y)', delayMs: 800 },
          { text: 'sign: paw print and all. PERFECT', delayMs: 800 },
          { text: 'outfit: on my chair. staring at me', delayMs: 800 },
          { text: 'disposable camera: CHECK', delayMs: 700 },
          { text: 'what am i forgetting??', delayMs: 700 },
        ],
        choices: [
          { text: 'earplugs!!', next: 'earplugs' },
          {
            text: 'ur voice. save it for screaming',
            label: 'Save ur voice',
            next: 'voice',
          },
        ],
      },
      earplugs: {
        lines: [
          { text: 'EARPLUGS?? who needs ears', delayMs: 800 },
          { text: 'ok fine my mom already packed them', delayMs: 900 },
          {
            text: 'she also packed a sweater. its a CONCERT mom',
            delayMs: 900,
          },
        ],
        choices: [
          { text: 'lol moms', next: 'night' },
          { text: 'the sweater stays', label: 'Sweater stays', next: 'night' },
        ],
      },
      voice: {
        lines: [
          { text: 'omg ur right', delayMs: 700 },
          { text: 'ok im not talking anymore', delayMs: 700 },
          { text: 'typing doesnt count', delayMs: 800 },
        ],
        choices: [
          { text: 'it totally counts', next: 'night' },
          { text: 'lol loophole', next: 'night' },
        ],
      },
      night: {
        lines: [
          { text: 'ok im gonna TRY to sleep', delayMs: 900 },
          { text: 'nite {name}!!!! (L)', delayMs: 600, nudge: true },
          {
            delayMs: 1500,
            personalMessageChange: 'sleeping (NOT) 1 MORE SLEEP!!!',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day5',
    trigger: { type: 'onDay', day: 5 },
    start: 'recap',
    nodes: {
      recap: {
        lines: [
          { text: '{name}!!!!!', delayMs: 2000, nudge: true },
          { text: 'FRONT ROW', delayMs: 500 },
          { text: 'I WAS IN THE FRONT ROW', delayMs: 500, nudge: true },
          {
            text: 'after we lost each other the crowd just PUSHED me. all the way up',
            delayMs: 1000,
          },
        ],
        choices: [
          {
            text: 'i saw u!! u screamed the whole time',
            label: 'I saw u!!',
            next: 'saw',
          },
          {
            text: 'i was stuck by the t-shirt table lol',
            label: 'I was stuck in the back',
            next: 'back',
          },
        ],
      },
      saw: {
        lines: [
          { text: 'I DID. i have no voice left', delayMs: 800 },
          { text: 'my mom says its a blessing', delayMs: 700 },
          { text: 'but u missed the END. u were getting nachos', delayMs: 900 },
        ],
        choices: [
          {
            text: 'what happened at the end??',
            label: 'What happened?',
            next: 'best',
          },
          {
            text: 'the nachos were worth it',
            label: 'Nachos tho',
            next: 'best',
          },
        ],
      },
      back: {
        lines: [
          { text: 'NOOOO', delayMs: 600 },
          { text: 'so u missed the best part', delayMs: 700 },
        ],
        choices: [
          { text: 'what best part??', label: 'What best part?', next: 'best' },
          {
            text: 'i could see ur sign tho!!',
            label: 'I saw the sign!',
            next: 'best',
          },
        ],
      },
      best: {
        lines: [
          { text: 'ziggy did the drumstick spin', delayMs: 900 },
          { text: 'AND THEN HE THREW IT', delayMs: 600 },
          { text: 'AND I CAUGHT IT', delayMs: 600, nudge: true },
          {
            text: 'ok it hit me in the forehead first. but THEN i caught it',
            delayMs: 1100,
          },
          { text: 'u had to be there. like THERE there', delayMs: 900 },
        ],
        choices: [
          { text: 'NO WAY!!!', next: 'keep' },
          {
            text: 'is ur forehead ok??',
            label: 'Ur forehead ok?',
            next: 'bump',
          },
        ],
      },
      keep: {
        lines: [
          { text: 'WAY. its under my pillow', delayMs: 800 },
          { text: 'best. night. EVER. (L)', delayMs: 700 },
          { text: 'thx for coming w me {name}. ur the best', delayMs: 900 },
          {
            delayMs: 1500,
            personalMessageChange: 'i caught ZIGGYS DRUMSTICK!!!!! (w my face)',
          },
        ],
        end: true,
      },
      bump: {
        lines: [
          { text: 'it has a little bump', delayMs: 800 },
          { text: 'i call it my souvenir', delayMs: 700 },
          {
            text: `thx for coming w me {name}. ur the best ${g('(L)', '(Y)')}`,
            delayMs: 900,
          },
          {
            delayMs: 1500,
            personalMessageChange: 'i caught ZIGGYS DRUMSTICK!!!!! (w my face)',
          },
        ],
        end: true,
      },
    },
  },
];
