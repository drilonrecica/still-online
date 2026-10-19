// Top 8 drama (P0-03): a friend's reaction pair to being dropped from the player's Friendspace
// Top 8 (the day after) and put back. Kayla is the sample; P3-01 writes all six. The matching
// wall lines live in `src/content/friendspace/top8Reactions.ts`.
import type { Script } from '../types';

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
