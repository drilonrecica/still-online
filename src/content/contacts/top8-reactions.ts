// Top 8 drama (P0-03): each friend's reaction pair to being dropped from the player's Friendspace
// Top 8 (the day after) and put back. Kayla is dramatic, Jess hurt in CAPS and then over it, Dex
// didn't know he was in it, Theo thinks it's his fault, Marco is dry, Pia tells mom. The matching
// wall lines live in `src/content/friendspace/top8Reactions.ts`.
import { g } from '../gender';
import type { Script } from '../types';

export const jessTop8Dropped: Script = {
  id: 'top8-dropped',
  trigger: { type: 'onTop8Dropped' },
  start: 'noticed',
  nodes: {
    noticed: {
      lines: [
        { text: '{name}!!!!', delayMs: 2000, nudge: true },
        { text: 'WHY AM I NOT IN UR TOP 8???', delayMs: 600 },
        { text: 'i refreshed like 10 times. STILL NOT THERE', delayMs: 900 },
        { text: 'ok im over it', delayMs: 1500 },
        { text: '(im not over it) :(', delayMs: 900 },
        { delayMs: 600, personalMessageChange: 'not in a CERTAIN top 8 :(' },
      ],
      end: true,
    },
  },
};

export const jessTop8Readded: Script = {
  id: 'top8-readded',
  trigger: { type: 'onTop8Readded' },
  start: 'back',
  nodes: {
    back: {
      lines: [
        { text: 'IM BACK IN UR TOP 8!!!!!', delayMs: 2000, nudge: true },
        {
          text: 'i forgive u. i forgave u like 2 min ago honestly',
          delayMs: 900,
        },
        {
          text: g('BFFS AGAIN (L) (L)', 'BEST BUDS AGAIN (Y) (Y)'),
          delayMs: 700,
        },
        { delayMs: 600, personalMessageChange: 'BACK IN THE TOP 8!!! :D' },
      ],
      end: true,
    },
  },
};

export const piaTop8Dropped: Script = {
  id: 'top8-dropped',
  trigger: { type: 'onTop8Dropped' },
  start: 'noticed',
  nodes: {
    noticed: {
      lines: [
        { text: '{name}', delayMs: 3000 },
        { text: 'I AM NOT IN UR TOP 8', delayMs: 800 },
        { text: 'i checked on dads laptop. TWICE', delayMs: 1000 },
        { text: 'im telling mom', delayMs: 900 },
      ],
      choices: [
        {
          text: 'pia its just a website',
          label: 'Its just a website',
          next: 'website',
        },
        {
          text: 'ok ok ill put u back',
          label: 'Ill put you back',
          next: 'back',
        },
      ],
    },
    website: {
      lines: [
        { text: 'MOOOOOOOM', delayMs: 800 },
        {
          text: `mom says be nice to ur ${g('sister', 'brother')}. HA`,
          delayMs: 1200,
        },
        { delayMs: 600, personalMessageChange: 'NOT in a top 8. mom knows' },
      ],
      end: true,
    },
    back: {
      lines: [
        { text: 'u have 5 min', delayMs: 900 },
        { text: 'i am counting. 1. 2. 3', delayMs: 1200 },
        {
          delayMs: 600,
          personalMessageChange: 'waiting 4 my top 8 spot. 4. 5',
        },
      ],
      end: true,
    },
  },
};

export const piaTop8Readded: Script = {
  id: 'top8-readded',
  trigger: { type: 'onTop8Readded' },
  start: 'back',
  nodes: {
    back: {
      lines: [
        { text: 'ok i saw. im back in ur top 8', delayMs: 3000 },
        { text: 'i told mom u fixed it', delayMs: 900 },
        {
          text: g(
            'ur not the WORST sister. ur like the 3rd worst',
            'ur not the WORST brother. ur like the 3rd worst',
          ),
          delayMs: 1100,
        },
        {
          delayMs: 600,
          personalMessageChange: 'back in the top 8. as i SHOULD be',
        },
      ],
      end: true,
    },
  },
};

export const kaylaTop8Dropped: Script = {
  id: 'top8-dropped',
  trigger: { type: 'onTop8Dropped' },
  start: 'noticed',
  nodes: {
    noticed: {
      lines: [
        { text: 'so.', delayMs: 3000 },
        { text: 'i checked ur friendspace last nite', delayMs: 1200 },
        { text: 'and im not in ur top 8 anymore??', delayMs: 1000 },
        { text: 'like. wow. ok {name}', delayMs: 1200 },
      ],
      choices: [
        {
          text: 'it was an accident i swear',
          label: 'It was an accident',
          next: 'accident',
        },
        {
          text: 'i was just changing stuff around',
          label: 'Just changing stuff',
          next: 'changing',
        },
      ],
    },
    accident: {
      lines: [
        { text: 'an ACCIDENT', delayMs: 900 },
        { text: 'ur mouse just slipped and deleted me. sure.', delayMs: 1300 },
        { delayMs: 600, personalMessageChange: '~*replaceable apparently*~' },
      ],
      end: true,
    },
    changing: {
      lines: [
        { text: 'changing stuff around = taking ME out', delayMs: 1100 },
        { text: 'noted.', delayMs: 900 },
        { delayMs: 600, personalMessageChange: '~*replaceable apparently*~' },
      ],
      end: true,
    },
  },
};

export const kaylaTop8Readded: Script = {
  id: 'top8-readded',
  trigger: { type: 'onTop8Readded' },
  start: 'back',
  nodes: {
    back: {
      lines: [
        { text: 'omg im back in ur top 8!!!', delayMs: 2500 },
        { text: 'ok ur forgiven. this time', delayMs: 1000 },
        { text: '<3', delayMs: 700 },
        { delayMs: 600, personalMessageChange: '~*back where i belong*~ <3' },
      ],
      end: true,
    },
  },
};

export const marcoTop8Dropped: Script = {
  id: 'top8-dropped',
  trigger: { type: 'onTop8Dropped' },
  start: 'noticed',
  nodes: {
    noticed: {
      lines: [
        { text: 'kid', delayMs: 8000 },
        {
          text: 'aunt rita called. apparently im not in ur top 8 anymore',
          delayMs: 1500,
        },
        { text: 'she is more upset than me', delayMs: 1200 },
        { text: 'i am not upset. for the record', delayMs: 1400 },
        { delayMs: 600, personalMessageChange: 'removed from a top 8. coping' },
      ],
      end: true,
    },
  },
};

export const marcoTop8Readded: Script = {
  id: 'top8-readded',
  trigger: { type: 'onTop8Readded' },
  start: 'back',
  nodes: {
    back: {
      lines: [
        { text: 'kid', delayMs: 8000 },
        {
          text: 'back in the top 8. aunt rita told me before i saw it',
          delayMs: 1500,
        },
        { text: 'ill try to stay humble', delayMs: 1300 },
        { delayMs: 600, personalMessageChange: 'top 8 again. humbled' },
      ],
      end: true,
    },
  },
};

export const theoTop8Dropped: Script = {
  id: 'top8-dropped',
  trigger: { type: 'onTop8Dropped' },
  start: 'noticed',
  nodes: {
    noticed: {
      lines: [
        { text: 'um hi {name}', delayMs: 5000 },
        { text: 'i saw im not in ur top 8 anymore', delayMs: 2000 },
        { text: 'sorry. i probably did something', delayMs: 1800 },
        { text: 'was it the bio poster. i can redo the poster', delayMs: 2000 },
      ],
      choices: [
        {
          text: g(
            'its not ur fault theo!! u didnt do anything',
            'its not ur fault man. u didnt do anything',
          ),
          label: 'Its not your fault',
          next: 'notFault',
        },
        {
          text: 'i just needed the space',
          label: 'Needed the space',
          next: 'space',
        },
      ],
    },
    notFault: {
      lines: [
        { text: 'oh. ok', delayMs: 1800 },
        { text: 'sorry for asking. i mean. thanks', delayMs: 1600 },
        {
          delayMs: 600,
          personalMessageChange: 'not in a top 8. its ok. sorry',
        },
      ],
      end: true,
    },
    space: {
      lines: [
        { text: 'thats ok. 8 is not a lot of spaces', delayMs: 2000 },
        { text: 'sorry for taking one', delayMs: 1600 },
        {
          delayMs: 600,
          personalMessageChange: 'not in a top 8. its ok. sorry',
        },
      ],
      end: true,
    },
  },
};

export const theoTop8Readded: Script = {
  id: 'top8-readded',
  trigger: { type: 'onTop8Readded' },
  start: 'back',
  nodes: {
    back: {
      lines: [
        { text: 'um. im back in ur top 8', delayMs: 5000 },
        { text: 'thanks. sorry. i mean thanks', delayMs: 1800 },
        { text: 'i drew a frog to celebrate. its a small frog', delayMs: 2000 },
        { delayMs: 600, personalMessageChange: 'back in a top 8 :) sorry' },
      ],
      end: true,
    },
  },
};

export const dexTop8Dropped: Script = {
  id: 'top8-dropped',
  trigger: { type: 'onTop8Dropped' },
  start: 'noticed',
  nodes: {
    noticed: {
      lines: [
        { text: '{name}', delayMs: 20_000 },
        { text: 'ry says im not in ur top 8 anymore', delayMs: 4000 },
        { text: 'wait was i in it', delayMs: 5000 },
        { text: 'huh. cool. didnt know', delayMs: 4000 },
      ],
      end: true,
    },
  },
};

export const dexTop8Readded: Script = {
  id: 'top8-readded',
  trigger: { type: 'onTop8Readded' },
  start: 'back',
  nodes: {
    back: {
      lines: [
        { text: 'ry says im back in ur top 8', delayMs: 20_000 },
        { text: 'nice. didnt know i left', delayMs: 5000 },
        { delayMs: 600, personalMessageChange: 'away. but in a top 8' },
      ],
      end: true,
    },
  },
};
