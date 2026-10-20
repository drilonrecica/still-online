// Pia, days 6–10: Operation Hamster. The essay, the Paint presentation, "we'll see", a goldfish
// called Sir Stardust the Second, and no show for her (docs/story-week2.md → Pia).
import { g } from '../gender';
import type { Contact, Script } from '../types';

export const piaWeek2Days: Contact['days'] = {
  6: { status: 'online', personalMessage: 'I NEED A HAMSTER (not a joke)' },
  7: { status: 'online', personalMessage: 'presenting to mom TONIGHT' },
  8: { status: 'busy', personalMessage: "mom said WE'LL SEE :(" },
  9: {
    status: 'online',
    personalMessage: 'FISH. (not a hamster) (still a pet)',
  },
  10: { status: 'busy', personalMessage: 'NOT ALLOWED AT THE SHOW. UNFAIR' },
};

export const piaWeek2Scripts: readonly Script[] = [
  {
    id: 'day6',
    trigger: { type: 'onDay', day: 6 },
    start: 'hamster',
    nodes: {
      hamster: {
        lines: [
          { text: '{name}', delayMs: 4000, nudge: true },
          { text: 'i need a HAMSTER', delayMs: 900 },
          { text: 'NOT a joke', delayMs: 800 },
          {
            text: 'his name is professor nibbles. he doesnt exist yet but thats his name',
            delayMs: 1300,
          },
        ],
        choices: [
          {
            text: g('omg a hamster!!', 'its a mouse with a plan'),
            label: g('A hamster!!', 'Mouse with a plan'),
            next: 'yay',
          },
          {
            text: 'what about biscuit?',
            label: 'What about biscuit?',
            next: 'biscuit',
          },
          { text: 'hamsters bite tho', label: 'They bite', next: 'bite' },
        ],
      },
      yay: {
        lines: [
          {
            text: g('I KNOW', 'a mouse with a PLAN is the BEST kind'),
            delayMs: 1000,
          },
          {
            text: 'he gets a wheel AND a castle. the castle is for thinking',
            delayMs: 1200,
          },
        ],
        choices: [
          { text: 'does mom know?', label: 'Does mom know?', next: 'essay' },
          { text: 'a thinking castle??', next: 'essay' },
        ],
      },
      biscuit: {
        lines: [
          { text: 'biscuit is a DOG', delayMs: 900 },
          { text: 'dogs and hamsters r different departments', delayMs: 1200 },
          {
            text: 'also biscuit is still on probation from the stardust case',
            delayMs: 1300,
          },
        ],
        choices: [
          { text: 'fair', next: 'essay' },
          { text: 'poor biscuit', next: 'essay' },
        ],
      },
      bite: {
        lines: [
          { text: 'only if u r MEAN to them', delayMs: 1000 },
          {
            text: 'professor nibbles will not bite. hes a PROFESSOR',
            delayMs: 1200,
          },
        ],
        choices: [
          { text: 'professors bite sometimes', next: 'essay' },
          { text: 'ok fair', next: 'essay' },
        ],
      },
      essay: {
        lines: [
          { text: 'anyway i wrote it down', delayMs: 1000 },
          { text: 'WHY I NEED A HAMSTER. on dads laptop', delayMs: 1100 },
          {
            text: 'it has 10 reasons. number 10 is "i am almost 10"',
            delayMs: 1300,
          },
          { text: 'i mailed it to u. READ IT. ur my witness', delayMs: 1200 },
          {
            delayMs: 1500,
            personalMessageChange: 'WHY I NEED A HAMSTER: 10 reasons',
          },
          {
            text: 'dont tell mom yet. telling mom is MY job',
            delayMs: 1000,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day7',
    trigger: { type: 'onDay', day: 7 },
    start: 'show',
    nodes: {
      show: {
        lines: [
          { text: '{name}', delayMs: 4000 },
          { text: 'TONIGHT is the presentation', delayMs: 900 },
          {
            text: 'i made a drawing in paint. professor nibbles in his castle',
            delayMs: 1300,
          },
          {
            text: 'after dinner. living room. mom on the couch',
            delayMs: 1100,
          },
          { text: 'ur the audience', delayMs: 800 },
          { text: 'the audience that CLAPS', delayMs: 900, nudge: true },
        ],
        choices: [
          {
            text: g('ill clap!', 'fine. one clap'),
            label: g('Ill clap', 'One clap'),
            next: 'clap',
          },
          { text: 'add a graph', label: 'Add a graph', next: 'graph' },
          { text: 'mom will say no', label: 'Mom will say no', next: 'no' },
        ],
      },
      clap: {
        lines: [
          {
            text: g('GOOD. clap LOUD', 'ONE?? ok. one LOUD one'),
            delayMs: 900,
          },
          { text: 'and say WOW at the castle part', delayMs: 1100 },
        ],
        choices: [
          { text: 'wow', next: 'done' },
          { text: 'what if i laugh', next: 'done' },
        ],
      },
      graph: {
        lines: [
          { text: 'a GRAPH', delayMs: 900 },
          { text: 'yes. a graph of how happy i will be', delayMs: 1100 },
          { text: 'it only goes UP', delayMs: 900 },
        ],
        choices: [
          { text: 'mom loves graphs', next: 'done' },
          { text: 'genius', next: 'done' },
        ],
      },
      no: {
        lines: [
          { text: 'she WONT', delayMs: 900 },
          { text: 'not after the castle part', delayMs: 1000 },
          {
            text: 'and if she does im telling... ok i cant tell mom on mom',
            delayMs: 1300,
          },
        ],
        choices: [
          { text: 'tell dad', next: 'done' },
          { text: 'good luck', next: 'done' },
        ],
      },
      done: {
        lines: [
          { text: 'ok its OVER', delayMs: 2000, nudge: true },
          { text: 'thank u for the clapping', delayMs: 900 },
          { text: 'biscuit clapped too. he barked. same thing', delayMs: 1200 },
          { text: 'mom said "ill think about it"', delayMs: 1100 },
          {
            delayMs: 1500,
            personalMessageChange: 'presentation: DONE. mom: thinking',
          },
          { text: 'thinking is GOOD. thinking is almost yes', delayMs: 1100 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day8',
    trigger: { type: 'onDay', day: 8 },
    start: 'weSee',
    nodes: {
      weSee: {
        lines: [
          { text: '{name}', delayMs: 4000, nudge: true },
          { text: 'mom said "well see"', delayMs: 900 },
          { text: 'everyone knows well see means NO', delayMs: 1100 },
          { text: 'its the rule of moms', delayMs: 900 },
        ],
        choices: [
          {
            text: 'ill talk to her',
            label: 'Ill talk to her',
            next: 'talk',
          },
          {
            text: 'maybe start smaller?',
            label: 'Start smaller?',
            next: 'smaller',
          },
          {
            text: 'tell her biscuit wants a friend',
            label: 'Biscuit wants a friend',
            next: 'friend',
          },
        ],
      },
      talk: {
        lines: [
          { text: 'YES', delayMs: 800, nudge: true },
          { text: 'ur older. moms listen to older people', delayMs: 1100 },
          { text: 'say the 10 reasons. ur the WITNESS', delayMs: 1100 },
        ],
        choices: [
          { text: 'all 10?', next: 'phase' },
          { text: 'ok ok', next: 'phase' },
        ],
      },
      smaller: {
        lines: [
          { text: 'SMALLER??', delayMs: 800 },
          { text: 'a hamster IS small', delayMs: 900 },
          {
            text: 'what is smaller than a hamster. a BUG?? i dont want a bug',
            delayMs: 1300,
          },
        ],
        choices: [
          { text: 'like a fish maybe', next: 'phase' },
          { text: 'ok ill just talk to her', next: 'phase' },
        ],
      },
      friend: {
        lines: [
          { text: 'biscuit DOES want a friend', delayMs: 900 },
          { text: 'he told me. with his eyes', delayMs: 1000 },
        ],
        choices: [
          { text: 'his eyes say a lot', next: 'phase' },
          { text: 'ill tell her', next: 'phase' },
        ],
      },
      phase: {
        lines: [
          { text: 'ok. operation hamster. phase 2', delayMs: 1000 },
          { text: 'phase 2 is U', delayMs: 900 },
          {
            delayMs: 1500,
            personalMessageChange: 'operation hamster: phase 2 (u)',
          },
          { text: 'dont tell mom i sent u', delayMs: 1000 },
          { text: 'telling mom is MY job', delayMs: 900 },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day9',
    trigger: { type: 'onDay', day: 9 },
    start: 'fish',
    nodes: {
      fish: {
        lines: [
          { text: '{name}!!!', delayMs: 4000, nudge: true },
          { text: 'i got a PET', delayMs: 900 },
          { text: 'its not a hamster', delayMs: 900 },
          {
            text: 'its a FISH. a goldfish. from the pet store at the mall',
            delayMs: 1300,
          },
          {
            text: 'mom says a fish is a "starter pet". i am STARTING',
            delayMs: 1200,
          },
        ],
        choices: [
          {
            text: g('a fish!! so cool', 'dude a fish is just a wet hamster'),
            label: g('A fish!!', 'A wet hamster'),
            next: 'react',
          },
          {
            text: 'what about professor nibbles?',
            label: 'Professor nibbles?',
            next: 'nibbles',
          },
        ],
      },
      react: {
        lines: [
          {
            text: g(
              'I KNOW. hes orange and he does laps',
              'a WET HAMSTER. lol. ok thats funny',
            ),
            delayMs: 1000,
          },
          {
            text: g('like 100 laps. i counted', 'dont tell him i laughed'),
            delayMs: 1000,
          },
        ],
        choices: [
          { text: 'whats his name?', next: 'names' },
          { text: 'does he have a name?', next: 'names' },
        ],
      },
      nibbles: {
        lines: [
          { text: 'professor nibbles is on HOLD', delayMs: 1000 },
          { text: 'like a show that comes back next year', delayMs: 1100 },
        ],
        choices: [
          { text: 'ok. so whats the fish called?', next: 'names' },
          { text: 'rip professor nibbles', next: 'names' },
        ],
      },
      names: {
        lines: [
          { text: 'he needs a NAME', delayMs: 900 },
          { text: 'u can suggest. i will decide', delayMs: 1000 },
        ],
        choices: [
          { text: 'nibbles junior', label: 'Nibbles junior', next: 'sir' },
          { text: 'goldie', label: 'Goldie', next: 'sir' },
        ],
      },
      sir: {
        lines: [
          { text: 'no', delayMs: 900 },
          {
            text: 'his name is SIR STARDUST THE SECOND',
            delayMs: 1000,
            nudge: true,
          },
          { text: 'bc stardust is the FIRST', delayMs: 900 },
          {
            delayMs: 1500,
            personalMessageChange: 'his name is SIR STARDUST THE SECOND',
          },
          {
            text: 'he lives on my desk. u can visit. knock first',
            delayMs: 1100,
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day10',
    trigger: { type: 'onDay', day: 10 },
    start: 'unfair',
    nodes: {
      unfair: {
        lines: [
          { text: '{name}', delayMs: 4000, nudge: true },
          { text: 'how WAS it', delayMs: 900 },
          { text: 'dont tell me', delayMs: 800 },
          { text: 'ok tell me', delayMs: 1000 },
          { text: 'NO dont. its UNFAIR', delayMs: 900 },
          { text: 'mom said im too young. she said NEXT YEAR', delayMs: 1200 },
        ],
        choices: [
          {
            text: g('next year for sure', 'u didnt miss much'),
            label: g('Next year for sure', 'U didnt miss much'),
            next: 'next',
          },
          {
            text: 'ill tell u everything',
            label: 'Ill tell u everything',
            next: 'tell',
          },
        ],
      },
      next: {
        lines: [
          {
            text: g('next year. u PROMISE', 'LIAR. i saw the PICS'),
            delayMs: 1000,
            nudge: true,
          },
          {
            text: g(
              'i wrote it on the calendar. in PEN',
              'marco put up a WHOLE album',
            ),
            delayMs: 1100,
          },
        ],
        choices: [
          { text: 'deal', next: 'fish' },
          { text: 'ill tell u everything tmrw', next: 'fish' },
        ],
      },
      tell: {
        lines: [
          { text: 'EVERYTHING', delayMs: 900 },
          { text: 'start with the bucket. did derek kick it', delayMs: 1100 },
          { text: 'no wait. tell me tmrw. im still mad', delayMs: 1100 },
        ],
        choices: [
          { text: 'he kicked it', next: 'fish' },
          { text: 'tmrw. promise', next: 'fish' },
        ],
      },
      fish: {
        lines: [
          { text: 'anyway i did my OWN show', delayMs: 1100 },
          {
            text: 'for sir stardust the second. on my desk. next to the ponies',
            delayMs: 1300,
          },
          { text: 'stardust is still in the middle. obviously', delayMs: 1100 },
          {
            delayMs: 1500,
            personalMessageChange: 'sir stardust the 2nd is my show now',
          },
          {
            text: 'he swam the whole time. that means he liked it',
            delayMs: 1200,
          },
        ],
        end: true,
      },
    },
  },
];
