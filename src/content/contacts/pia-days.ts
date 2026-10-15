// Pia, days 2–5: the Stardust crisis. The queen pony goes missing, Biscuit is the prime suspect,
// she turns up in the laundry, and Pia says thank you with a present: the Pony Paradise wallpaper.
import type { Contact, Script } from '../types';

export const piaDays: Contact['days'] = {
  2: {
    status: 'online',
    personalMessage: 'MISSING: STARDUST. if u see her TELL ME',
  },
  3: { status: 'busy', personalMessage: 'detective pia is ON THE CASE' },
  4: { status: 'online', personalMessage: 'case CLOSED (dont ask)' },
  5: {
    status: 'online',
    personalMessage: 'i gave someone a PRESENT (L) guess who',
  },
};

export const piaDayScripts: readonly Script[] = [
  {
    id: 'day2',
    trigger: { type: 'onDay', day: 2 },
    start: 'missing',
    nodes: {
      missing: {
        lines: [
          { text: '{name}!!!', delayMs: 4000, nudge: true },
          { text: 'STARDUST IS GONE', delayMs: 900 },
          {
            text: 'she was in the middle of the shelf this morning and now SHE ISNT',
            delayMs: 1300,
          },
          { text: 'did u take her', delayMs: 1000 },
        ],
        choices: [
          { text: 'no!! i swear', label: 'No!! I swear', next: 'swear' },
          { text: 'who is stardust?', label: 'Who is stardust?', next: 'who' },
          {
            text: 'maybe she ran away',
            label: 'She ran away',
            next: 'ranaway',
          },
        ],
      },
      who: {
        lines: [
          { text: 'WHO IS STARDUST', delayMs: 800 },
          {
            text: 'she is the QUEEN. purple with silver hair and a star',
            delayMs: 1300,
          },
          { text: 'everyone knows that', delayMs: 900 },
        ],
        choices: [
          {
            text: 'oh that one. no i didnt take her',
            label: 'Didnt take her',
            next: 'swear',
          },
          {
            text: 'sorry ur majesty',
            label: 'Sorry ur majesty',
            next: 'swear',
          },
        ],
      },
      ranaway: {
        lines: [
          { text: 'ponies DONT RUN AWAY {name}', delayMs: 1000 },
          { text: 'they are plastic', delayMs: 900 },
          {
            text: 'ok they run away in STORIES but not in REAL LIFE',
            delayMs: 1300,
          },
        ],
        choices: [
          {
            text: 'ok ok i didnt take her',
            label: 'I didnt take her',
            next: 'swear',
          },
          {
            text: 'maybe she has a boyfriend',
            label: 'A boyfriend?',
            next: 'boyfriend',
          },
        ],
      },
      boyfriend: {
        lines: [
          { text: 'EW', delayMs: 700 },
          { text: 'she is a QUEEN she doesnt need a boyfriend', delayMs: 1100 },
          { text: 'im telling mom u said that', delayMs: 900 },
          { delayMs: 800, statusChange: 'busy' },
        ],
        end: true,
      },
      swear: {
        lines: [{ text: 'pinky swear?', delayMs: 1200 }],
        choices: [
          { text: 'pinky swear', label: 'Pinky swear', next: 'pinky' },
          {
            text: 'i dont do pinky swears',
            label: 'No pinky swears',
            next: 'mom',
          },
        ],
      },
      pinky: {
        lines: [
          { text: 'ok. i believe u. for now', delayMs: 1100 },
          { text: 'im making a MISSING poster', delayMs: 1000 },
          {
            delayMs: 800,
            personalMessageChange:
              'REWARD for stardust: 1 sticker (the good kind)',
          },
        ],
        end: true,
      },
      mom: {
        lines: [
          { text: 'im telling mom u wont pinky swear', delayMs: 1000 },
          { text: 'thats basically a CONFESSION', delayMs: 900 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day3',
    trigger: { type: 'onDay', day: 3 },
    start: 'solved',
    nodes: {
      solved: {
        lines: [
          { text: '{name} i solved it', delayMs: 4000 },
          { text: 'it was BISCUIT', delayMs: 900 },
          {
            text: 'evidence: 1. he is acting weird. 2. he has a sparkle on his nose. 3. he looked at me',
            delayMs: 1600,
          },
        ],
        choices: [
          {
            text: 'thats not evidence pia',
            label: 'Not evidence',
            next: 'notevidence',
          },
          { text: 'a sparkle?', label: 'A sparkle?', next: 'sparkle' },
          {
            text: 'case closed. arrest him',
            label: 'Arrest him',
            next: 'arrest',
          },
        ],
      },
      sparkle: {
        lines: [
          { text: 'a SILVER sparkle. like stardusts HAIR', delayMs: 1100 },
          {
            text: 'ok it might be from my glitter pen. but MIGHT NOT',
            delayMs: 1300,
          },
        ],
        choices: [
          {
            text: 'ur glitter pen is everywhere tho',
            label: 'Glitter is everywhere',
            next: 'glitter',
          },
          {
            text: 'ok biscuit did it',
            label: 'Biscuit did it',
            next: 'arrest',
          },
        ],
      },
      notevidence: {
        lines: [
          { text: 'it is TOO evidence', delayMs: 900 },
          { text: 'mom said "pia please" which means im right', delayMs: 1200 },
        ],
        choices: [
          {
            text: 'thats not what that means',
            label: 'Thats not what it means',
            next: 'interrogate',
          },
          { text: 'fine. what now?', label: 'What now?', next: 'interrogate' },
        ],
      },
      interrogate: {
        lines: [
          { text: 'now i interrogate him', delayMs: 1100 },
          { text: 'he is not saying anything. VERY suspicious', delayMs: 1200 },
          { text: 'no treats until stardust comes home', delayMs: 1000 },
          {
            delayMs: 800,
            personalMessageChange: 'biscuit is a SUSPECT. no treats',
          },
        ],
        end: true,
      },
      arrest: {
        lines: [
          { text: 'i put him in pony jail', delayMs: 1000 },
          { text: 'pony jail is the laundry basket', delayMs: 1000 },
          {
            text: 'he fell asleep in it. criminals have NO SHAME',
            delayMs: 1200,
          },
          { delayMs: 800, statusChange: 'busy' },
        ],
        end: true,
      },
      glitter: {
        lines: [
          { text: 'its NOT everywhere', delayMs: 900 },
          { text: '...its a little bit everywhere', delayMs: 1300 },
          { text: 'dont tell mom about the couch', delayMs: 1000 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day4',
    trigger: { type: 'onDay', day: 4 },
    start: 'found',
    nodes: {
      found: {
        lines: [
          { text: '{name} {name}', delayMs: 4000, nudge: true },
          { text: 'I FOUND HER!!!!', delayMs: 800 },
          { text: 'stardust was in the LAUNDRY', delayMs: 900 },
          {
            text: 'inside one of dads socks. IN THE WASHING MACHINE',
            delayMs: 1200,
          },
        ],
        choices: [
          { text: 'is she ok??', label: 'Is she ok??', next: 'ok' },
          {
            text: 'so it wasnt biscuit',
            label: 'Not biscuit then',
            next: 'biscuit',
          },
        ],
      },
      ok: {
        lines: [
          { text: 'she went thru a WHOLE WASH', delayMs: 1000 },
          {
            text: 'her hair is extra fluffy now. she looks AMAZING actually',
            delayMs: 1300,
          },
        ],
        choices: [
          { text: 'how did she get in a sock?', label: 'How?', next: 'sock' },
          { text: 'yay stardust!!', label: 'Yay stardust!!', next: 'yay' },
        ],
      },
      biscuit: {
        lines: [
          { text: '...', delayMs: 1300 },
          { text: 'ok it wasnt biscuit', delayMs: 900 },
          {
            text: 'i gave him a SORRY treat. dont make it a big deal',
            delayMs: 1200,
          },
        ],
        choices: [
          {
            text: 'u owe him an apology',
            label: 'Apologise to him',
            next: 'apology',
          },
          {
            text: 'so how did she get in a sock?',
            label: 'How?',
            next: 'sock',
          },
        ],
      },
      sock: {
        lines: [
          { text: 'ok so', delayMs: 1100 },
          {
            text: 'MAYBE i did a pony sleepover in the laundry basket',
            delayMs: 1300,
          },
          { text: 'MAYBE i forgot', delayMs: 900 },
          {
            text: 'and u CANT tell mom. i tell mom things. mom doesnt get told things',
            delayMs: 1500,
          },
        ],
        end: true,
      },
      yay: {
        lines: [
          { text: 'YAY STARDUST (L)(L)(L)', delayMs: 800 },
          {
            text: 'she is back in the MIDDLE where she belongs',
            delayMs: 1100,
          },
          {
            delayMs: 800,
            personalMessageChange: 'STARDUST IS HOME (L) extra fluffy',
          },
        ],
        end: true,
      },
      apology: {
        lines: [
          { text: 'i DID apologise', delayMs: 1000 },
          {
            text: 'he licked my face. that means sorry accepted',
            delayMs: 1200,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day5',
    trigger: { type: 'onDay', day: 5 },
    start: 'present',
    nodes: {
      present: {
        lines: [
          { text: '{name}', delayMs: 4000 },
          { text: 'i have a PRESENT for u', delayMs: 900 },
          {
            text: 'bc u helped with stardust. kind of. a little',
            delayMs: 1200,
          },
          {
            text: 'i put a PRESENT in ur computer!!! look at the backrounds',
            delayMs: 1300,
            unlock: 'ponies',
          },
        ],
        choices: [
          { text: 'aww thanks pia :)', label: 'Thanks pia :)', next: 'thanks' },
          { text: 'what is it?', label: 'What is it?', next: 'what' },
          {
            text: 'how did u get in my computer??',
            label: 'How??',
            next: 'how',
          },
        ],
      },
      thanks: {
        lines: [
          { text: 'ur welcome', delayMs: 900 },
          { text: 'u have to use it FOREVER', delayMs: 900 },
          { text: 'or at least for a week', delayMs: 1000 },
        ],
        choices: [
          { text: 'forever. promise', label: 'Promise', next: 'look' },
          {
            text: 'what if i dont like it',
            label: 'What if i dont like it?',
            next: 'dislike',
          },
        ],
      },
      what: {
        lines: [
          { text: 'its a SURPRISE', delayMs: 900 },
          { text: 'ok its ponies', delayMs: 1000 },
          { text: 'stardust is in it. in the MIDDLE obviously', delayMs: 1100 },
        ],
        choices: [
          { text: 'ill go look now', label: 'Ill go look', next: 'look' },
          {
            text: 'but how did u get in my computer',
            label: 'How??',
            next: 'how',
          },
        ],
      },
      how: {
        lines: [
          { text: 'i have my WAYS', delayMs: 1000 },
          { text: '...dad helped', delayMs: 1300 },
          {
            text: 'he said "dont tell {name}" so dont tell u i told u',
            delayMs: 1300,
          },
        ],
        choices: [
          { text: 'ur secret is safe', label: 'Secret is safe', next: 'safe' },
          { text: 'im telling mom', label: 'Im telling mom', next: 'telling' },
        ],
      },
      look: {
        lines: [
          { text: 'GOOD', delayMs: 800 },
          {
            text: 'right click the desktop. then properties. then LOOK',
            delayMs: 1300,
          },
          {
            delayMs: 800,
            personalMessageChange: 'gave {name} a PRESENT (L) ur welcome',
          },
        ],
        end: true,
      },
      dislike: {
        lines: [
          { text: 'u WILL like it', delayMs: 900 },
          { text: 'it has sparkles. everyone likes sparkles', delayMs: 1100 },
          { text: 'if u change it im telling mom', delayMs: 1000 },
        ],
        end: true,
      },
      safe: {
        lines: [
          { text: 'good', delayMs: 800 },
          {
            text: 'now dad owes me a pudding cup for keeping HIS secret',
            delayMs: 1300,
          },
        ],
        end: true,
      },
      telling: {
        lines: [
          { text: 'U CANT TELL MOM', delayMs: 700, nudge: true },
          { text: 'telling mom is MY job', delayMs: 1000 },
          {
            text: 'and presents cant get people in trouble. its a RULE',
            delayMs: 1200,
          },
        ],
        end: true,
      },
    },
  },
];
