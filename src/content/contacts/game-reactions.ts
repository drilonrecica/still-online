// Game reactions (P6-07), one per friend: `onGameScore` scripts that fire when the player finishes
// a game while signed in. `{score}` is the raw score (Mines: seconds), `{game}` the game's name.
// Hen Hunt and Star Pinball need at least 1 point, so a scoreless round doesn't get an "OMG 0??".
import { g } from '../gender';
import type { Script } from '../types';

export const jessGameScore: Script = {
  id: 'gameScore',
  trigger: { type: 'onGameScore', game: 'henhunt', minScore: 1 },
  start: 'omg',
  nodes: {
    omg: {
      lines: [
        { text: 'WAIT', delayMs: 2000, nudge: true },
        { text: 'OMG {score}?? my record is like 400 lol', delayMs: 600 },
        {
          text: 'i always shoot the scarecrow by accident. hes just STANDING there',
          delayMs: 900,
        },
        { text: 'did u get the golden hen?!?!', delayMs: 700 },
      ],
      choices: [
        { text: 'YES it was so fast', label: 'Yes!', next: 'golden' },
        { text: 'whats a golden hen', label: 'Golden hen?', next: 'what' },
      ],
    },
    golden: {
      lines: [
        { text: 'NO WAY!!! ive NEVER got it', delayMs: 600 },
        { text: 'ur like a hen ninja', delayMs: 800 },
        {
          delayMs: 600,
          personalMessageChange: '{name} is a HEN NINJA!!! >:D',
        },
      ],
      end: true,
    },
    what: {
      lines: [
        { text: 'its GOLD. and it goes ZOOM', delayMs: 600 },
        { text: '100 points!!! keep ur eyes open next time', delayMs: 900 },
        { text: 'BLAM BLAM BLAM', delayMs: 500 },
      ],
      end: true,
    },
  },
};

export const kaylaGameScore: Script = {
  id: 'gameScore',
  trigger: { type: 'onGameScore', game: 'mines' },
  start: 'stress',
  nodes: {
    stress: {
      lines: [
        { text: 'u were playing mines??', delayMs: 3000 },
        { text: 'mines is SO stressful i cant even', delayMs: 800 },
        { text: '{score} seconds of pure STRESS', delayMs: 900 },
        {
          text: 'every time i click i feel like the whole computer is judging me',
          delayMs: 1100,
        },
      ],
      choices: [
        {
          text: 'its just numbers. its relaxing',
          label: 'Its relaxing',
          next: 'relax',
        },
        {
          text: 'i almost had a heart attack tbh',
          label: 'Same',
          next: 'same',
        },
      ],
    },
    relax: {
      lines: [
        { text: 'RELAXING???', delayMs: 700 },
        { text: 'who ARE u', delayMs: 800 },
        {
          delayMs: 700,
          personalMessageChange: 'some ppl find mines RELAXING. scary.',
        },
      ],
      end: true,
    },
    same: {
      lines: [
        { text: 'THANK u', delayMs: 600 },
        { text: 'its like a tiny bomb drama in a box', delayMs: 900 },
        { text: 'i only play it when im already sad', delayMs: 900 },
      ],
      end: true,
    },
  },
};

export const dexGameScore: Script = {
  id: 'gameScore',
  trigger: { type: 'onGameScore', game: 'pinball', minScore: 1 },
  start: 'nice',
  nodes: {
    nice: {
      lines: [
        { text: 'saw ur {game} score', delayMs: 9000 },
        { text: '{score}', delayMs: 4000 },
        { text: 'nice. i got 2 million once. maybe', delayMs: 5000 },
        { text: 'might have been a dream', delayMs: 4000 },
      ],
      choices: [
        { text: 'pics or it didnt happen', label: 'Proof?', next: 'proof' },
        { text: '2 million is a lot dex', label: 'Thats a lot', next: 'lot' },
      ],
    },
    proof: {
      lines: [
        { text: 'i filmed it', delayMs: 5000 },
        { text: 'lens cap was on', delayMs: 4000 },
      ],
      end: true,
    },
    lot: {
      lines: [
        { text: 'yeah', delayMs: 6000 },
        { text: 'i was very good at pinball for one night', delayMs: 4000 },
      ],
      end: true,
    },
  },
};

export const theoGameScore: Script = {
  id: 'gameScore',
  trigger: { type: 'onGameScore', game: 'mines' },
  start: 'wow',
  nodes: {
    wow: {
      lines: [
        { text: 'hi. sorry', delayMs: 4000 },
        { text: 'did u just beat mines in {score} seconds?', delayMs: 1200 },
        { text: 'thats really good', delayMs: 1000 },
        {
          text: 'i always click a mine first. sorry, thats not ur problem',
          delayMs: 1400,
        },
      ],
      choices: [
        {
          text: 'the first click is always safe!',
          label: 'First click is safe',
          next: 'safe',
        },
        { text: 'want me to show u?', label: 'Ill show u', next: 'show' },
      ],
    },
    safe: {
      lines: [
        { text: 'oh', delayMs: 900 },
        { text: 'then i think i click a mine second', delayMs: 1200 },
        { text: 'sorry. thats worse', delayMs: 900 },
      ],
      end: true,
    },
    show: {
      lines: [
        { text: 'really?', delayMs: 1000 },
        {
          text: g(
            'maybe in the computer lab. if thats ok',
            'maybe in the computer lab. i can show u the galaxy raiders 3 cheat after. if thats ok',
          ),
          delayMs: 1300,
        },
        { text: 'thanks {name}', delayMs: 900 },
      ],
      end: true,
    },
  },
};

export const marcoGameScore: Script = {
  id: 'gameScore',
  trigger: { type: 'onGameScore', game: 'henhunt', minScore: 1 },
  start: 'hens',
  nodes: {
    hens: {
      lines: [
        { text: 'heard u shot {score} points of hen today', delayMs: 4000 },
        { text: 'pia told me. she tells me everything', delayMs: 1200 },
        {
          text: 'our drummer plays that between sets. hes worse at it than at drums',
          delayMs: 1500,
        },
      ],
      choices: [
        { text: 'is that bad?', label: 'Is that bad?', next: 'bad' },
        { text: 'i could beat him', label: 'I could beat him', next: 'beat' },
      ],
    },
    bad: {
      lines: [
        { text: 'he once shot the scarecrow nine times', delayMs: 1200 },
        { text: 'on purpose. he said it was personal', delayMs: 1200 },
      ],
      end: true,
    },
    beat: {
      lines: [
        { text: 'everyone could beat him', delayMs: 1000 },
        { text: 'ill tell him. he needs this', delayMs: 1200 },
      ],
      end: true,
    },
  },
};

export const piaGameScore: Script = {
  id: 'gameScore',
  trigger: { type: 'onGameScore', game: 'pinball', minScore: 1 },
  start: 'better',
  nodes: {
    better: {
      lines: [
        { text: '{name} i saw u playing {game}', delayMs: 3000 },
        { text: 'u got {score}??', delayMs: 900 },
        { text: 'i am better', delayMs: 800 },
        {
          text: 'its my turn on the computer now. that is the RULE',
          delayMs: 1000,
        },
      ],
      choices: [
        {
          text: 'u cant even reach the keys',
          label: 'U cant reach',
          next: 'reach',
        },
        { text: 'ok fine. 10 minutes', label: 'Ok, 10 minutes', next: 'turn' },
      ],
    },
    reach: {
      lines: [
        { text: 'I CAN REACH', delayMs: 700 },
        { text: 'im telling mom', delayMs: 900 },
        {
          delayMs: 600,
          personalMessageChange: 'BETTER AT PINBALL THAN SOME PPL',
        },
      ],
      end: true,
    },
    turn: {
      lines: [
        { text: '10 minutes is not a turn', delayMs: 800 },
        { text: 'a turn is until i win', delayMs: 900 },
      ],
      end: true,
    },
  },
};
