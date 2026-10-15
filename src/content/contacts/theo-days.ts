// Theo, days 2–5: the jello cell. It sets (or doesn't), presentation nerves, a B+ and a shy thanks.
// Day 3's outcome depends on that day's choices: scripts can't see earlier days' branches.
import type { Contact, Script } from '../types';

export const theoDays: Contact['days'] = {
  2: { status: 'online', personalMessage: '2 boxes of lime jello. sorry mom' },
  3: { status: 'online', personalMessage: 'the jello is... wobbly' },
  4: { status: 'busy', personalMessage: 'presenting tmrw. 14 index cards' },
  5: { status: 'online', personalMessage: 'B+ :) (sorry for bragging)' },
};

export const theoDayScripts: readonly Script[] = [
  {
    id: 'day2',
    trigger: { type: 'onDay', day: 2 },
    start: 'jello',
    nodes: {
      jello: {
        lines: [
          { text: 'um hi {name}', delayMs: 5000 },
          { text: 'sorry. is now ok?', delayMs: 2000 },
          { text: 'we made the jello. me and my mom', delayMs: 2200 },
          { text: 'it has to set overnight', delayMs: 1800 },
          {
            text: 'i put the grapes in too early. they all sank',
            delayMs: 2500,
          },
        ],
        choices: [
          {
            text: 'lol sinking mitochondria',
            label: 'Sinking mitochondria',
            next: 'sank',
          },
          { text: 'is the nucleus ok?', label: 'The nucleus?', next: 'plum' },
        ],
      },
      sank: {
        lines: [
          { text: 'yeah. theyre all at the bottom', delayMs: 2500 },
          { text: 'maybe theyre tired mitochondria', delayMs: 2000 },
          { text: 'sorry. bad joke', delayMs: 1800 },
        ],
        choices: [
          { text: 'no that was funny lol', label: 'Funny lol', next: 'joke' },
          {
            text: 'we can fix it tmrw',
            label: 'Fix it tmrw',
            next: 'fix',
          },
        ],
      },
      plum: {
        lines: [
          { text: 'the plum is ok', delayMs: 2500 },
          { text: 'well. my little sister ate half of it', delayMs: 2000 },
          { text: 'so its half a nucleus now. sorry', delayMs: 2000 },
        ],
        choices: [
          {
            text: 'half a nucleus. very scientific',
            label: 'Very scientific',
            next: 'joke',
          },
          { text: 'we can use a peach!', label: 'Use a peach', next: 'fix' },
        ],
      },
      joke: {
        lines: [
          { text: ':)', delayMs: 2500 },
          { text: 'ok. ill draw the labels tonight', delayMs: 1800 },
          {
            delayMs: 1500,
            personalMessageChange: 'drawing labels for jello. normal stuff',
          },
        ],
        end: true,
      },
      fix: {
        lines: [
          { text: 'ok. good', delayMs: 2500 },
          { text: 'u always know what to do', delayMs: 2000 },
          { text: 'sorry. that sounded weird. bye', delayMs: 2200 },
          { delayMs: 1500, personalMessageChange: 'plan B for the jello' },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day3',
    trigger: { type: 'onDay', day: 3 },
    start: 'fridge',
    nodes: {
      fridge: {
        lines: [
          { text: '{name}? sorry. kind of an emergency', delayMs: 5000 },
          { text: 'i just checked the jello', delayMs: 2000 },
          { text: 'it didnt set all the way', delayMs: 2000 },
          { text: 'its wobbly. like VERY wobbly', delayMs: 1800 },
        ],
        choices: [
          {
            text: 'put it in the freezer!',
            label: 'Freezer!',
            next: 'freezer',
          },
          {
            text: 'add more gelatin and wait',
            label: 'More gelatin',
            next: 'wait',
          },
          {
            text: 'wobbly is fine. cells r wobbly',
            label: 'Wobbly is fine',
            next: 'wobbly',
          },
        ],
      },
      wobbly: {
        lines: [
          { text: 'oh. thats true actually', delayMs: 2500 },
          {
            text: 'cytoplasm is kind of like jello. i read that',
            delayMs: 2200,
          },
          {
            text: 'but mr dalton will poke it. he pokes everything',
            delayMs: 2200,
          },
        ],
        choices: [
          { text: 'ok more gelatin then', next: 'wait' },
          { text: 'quick. freezer', next: 'freezer' },
        ],
      },
      freezer: {
        lines: [
          { text: 'ok. doing it', delayMs: 2000 },
          { text: 'um', delayMs: 4000 },
          {
            text: 'it cracked. down the middle. and the grapes r frozen',
            delayMs: 2500,
          },
          { text: 'sorry. this is my fault', delayMs: 2000 },
        ],
        choices: [
          {
            text: 'call it a cell after an earthquake',
            label: 'Earthquake cell',
            next: 'quake',
          },
          {
            text: 'its not ur fault. bring the poster too',
            label: 'Not ur fault',
            next: 'backup',
          },
        ],
      },
      quake: {
        lines: [
          { text: 'oh', delayMs: 2500 },
          { text: 'actually mr dalton might like that', delayMs: 2000 },
          { text: 'i can make a sign. "a cell under stress"', delayMs: 2200 },
          {
            delayMs: 1500,
            personalMessageChange: 'our cell has been through a lot',
          },
        ],
        end: true,
      },
      backup: {
        lines: [
          { text: 'ok. the poster as backup', delayMs: 2500 },
          { text: 'and the jello. for... texture', delayMs: 2000 },
          { text: 'thanks {name}. sorry. bye', delayMs: 2000 },
          {
            delayMs: 1500,
            personalMessageChange: 'jello: cracked. poster: ready',
          },
        ],
        end: true,
      },
      wait: {
        lines: [
          { text: 'ok. my mom had another box', delayMs: 2500 },
          { text: 'sorry. ill tell u in an hour', delayMs: 2000 },
          { text: '...', delayMs: 5000 },
          { text: 'it worked', delayMs: 2000 },
          {
            text: 'its perfect. the grapes r even in the right place',
            delayMs: 2500,
          },
        ],
        choices: [
          { text: 'YES theo!!', label: 'YES!!', next: 'yay' },
          { text: 'see? good team (Y)', label: 'Good team', next: 'team' },
        ],
      },
      yay: {
        lines: [
          { text: ':D', delayMs: 2000 },
          { text: 'sorry. i never use that one', delayMs: 2000 },
          { delayMs: 1500, personalMessageChange: 'the jello has SET :D' },
        ],
        end: true,
      },
      team: {
        lines: [
          { text: 'yeah', delayMs: 2500 },
          { text: 'um. yeah we are', delayMs: 2000 },
          { delayMs: 1500, personalMessageChange: 'the jello has SET :D' },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day4',
    trigger: { type: 'onDay', day: 4 },
    start: 'cards',
    nodes: {
      cards: {
        lines: [
          { text: 'um {name}', delayMs: 5000 },
          { text: 'we present tmrw. first period', delayMs: 2000 },
          { text: 'i wrote my part on 14 index cards', delayMs: 2000 },
          {
            text: 'i practiced in the mirror. i said sorry 6 times',
            delayMs: 2500,
          },
          { text: 'to the mirror', delayMs: 1500 },
        ],
        choices: [
          {
            text: 'ull be great theo',
            label: 'Ull be great',
            next: 'great',
          },
          {
            text: 'practice on me!',
            label: 'Practice on me',
            next: 'practice',
          },
        ],
      },
      practice: {
        lines: [
          { text: 'ok. um', delayMs: 2500 },
          {
            text: '"this is a plant cell. sorry. this is a plant cell"',
            delayMs: 3000,
          },
          { text: '...was that ok', delayMs: 2000 },
        ],
        choices: [
          {
            text: 'drop the sorry and its perfect',
            label: 'Drop the sorry',
            next: 'nosorry',
          },
          { text: 'very clear. 10/10', label: '10/10', next: 'great' },
        ],
      },
      nosorry: {
        lines: [
          { text: 'i didnt even notice i said it', delayMs: 2500 },
          { text: 'ok. ill write NO SORRY on my hand', delayMs: 2000 },
          {
            delayMs: 1500,
            personalMessageChange: 'NO SORRY (written on my hand)',
          },
        ],
        end: true,
      },
      great: {
        lines: [
          { text: 'ok', delayMs: 2500 },
          { text: 'u do the intro and i do the organelles?', delayMs: 2200 },
        ],
        choices: [
          { text: 'deal (Y)', next: 'deal' },
          {
            text: 'u do the intro. ur better at it than u think',
            label: 'U do the intro',
            next: 'intro',
          },
        ],
      },
      deal: {
        lines: [
          { text: 'ok. thanks', delayMs: 2500 },
          { text: 'ill bring the jello in our camping cooler', delayMs: 2000 },
          {
            text: 'it smells a bit like fish. sorry in advance',
            delayMs: 2000,
          },
        ],
        end: true,
      },
      intro: {
        lines: [
          { text: 'oh', delayMs: 3000 },
          { text: 'ok. ill try', delayMs: 2000 },
          { text: 'ill need 3 more index cards', delayMs: 2000 },
          {
            delayMs: 1500,
            personalMessageChange: 'presenting tmrw. 17 index cards',
          },
        ],
        end: true,
      },
    },
  },
  {
    id: 'day5',
    trigger: { type: 'onDay', day: 5 },
    start: 'grade',
    nodes: {
      grade: {
        lines: [
          { text: 'um hi', delayMs: 5000 },
          { text: 'mr dalton put the grades up', delayMs: 2000 },
          { text: 'we got a B+', delayMs: 2500 },
        ],
        choices: [
          { text: 'B+!! WE DID IT', label: 'We did it!!', next: 'did' },
          { text: 'only a B+? lol', label: 'Only a B+?', next: 'only' },
        ],
      },
      only: {
        lines: [
          { text: 'oh. um. sorry', delayMs: 2500 },
          {
            text: 'the jello lost points for "structural issues"',
            delayMs: 2200,
          },
          {
            text: 'but he said the drawings were the best in the class',
            delayMs: 2200,
          },
        ],
        choices: [
          {
            text: 'ok thats actually awesome',
            label: 'Thats awesome',
            next: 'thanks',
          },
          {
            text: 'ur drawings carried us',
            label: 'Ur drawings carried us',
            next: 'drawings',
          },
        ],
      },
      did: {
        lines: [
          { text: ':)', delayMs: 2500 },
          { text: 'he said the jello was "memorable"', delayMs: 2000 },
          { text: 'i think that was a compliment', delayMs: 1800 },
        ],
        choices: [
          {
            text: 'definitely a compliment',
            label: 'A compliment',
            next: 'thanks',
          },
          { text: 'and ur drawings?', next: 'drawings' },
        ],
      },
      drawings: {
        lines: [
          { text: 'he said they were the best in the class', delayMs: 2500 },
          { text: 'i didnt know what to do so i said sorry', delayMs: 2200 },
          { text: 'he said "dont be sorry, be proud"', delayMs: 2000 },
        ],
        choices: [
          { text: 'listen to mr dalton', next: 'thanks' },
          { text: 'im proud of u theo', next: 'thanks' },
        ],
      },
      thanks: {
        lines: [
          { text: 'um', delayMs: 3000 },
          { text: 'thanks for being my partner {name}', delayMs: 2500 },
          { text: 'sorry. i mean. thanks. not sorry', delayMs: 2500 },
          {
            delayMs: 1500,
            personalMessageChange: 'B+ and a good partner :)',
          },
        ],
        end: true,
      },
    },
  },
];
