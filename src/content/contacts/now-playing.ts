// Second now-playing reactions (P5-06), one per friend. Track-specific where the joke needs it;
// friends who already react to any track (jess, kayla, marco) only get track-specific ones here,
// so the first track the player plays never triggers two reactions from the same friend.
import type { Script } from '../types';

export const jessNowPlaying2: Script = {
  id: 'nowPlaying2',
  trigger: { type: 'onNowPlaying', trackId: 'surf-shimmy' },
  repeat: false,
  start: 'surf',
  nodes: {
    surf: {
      lines: [
        { text: 'WAIT', delayMs: 2500, nudge: true },
        { text: 'IS THIS SURF SHIMMY?!?!', delayMs: 500 },
        {
          text: 'im DANCING. in my ROOM. my mom is just staring at me',
          delayMs: 800,
        },
        { text: 'u have 2 dance too its the LAW', delayMs: 600 },
      ],
      choices: [
        {
          text: 'im dancing!! (im not dancing)',
          label: 'Im dancing!',
          next: 'dance',
        },
        { text: 'i do NOT dance', label: 'I dont dance', next: 'nodance' },
      ],
    },
    dance: {
      lines: [
        { text: 'DANCE PARTY!!!!', delayMs: 500, wink: 'fireworks' },
        { text: 'ok i knocked over my lamp. WORTH IT', delayMs: 900 },
        {
          delayMs: 700,
          personalMessageChange: 'SURF SHIMMY 4EVER!!! ~~~ :D',
        },
      ],
      end: true,
    },
    nodance: {
      lines: [
        { text: 'u DO at sleepovers', delayMs: 600 },
        {
          text: 'the hairbrush microphone thing. i have WITNESSES',
          delayMs: 800,
        },
        { text: 'DANCE!!!', delayMs: 500, nudge: true },
      ],
      end: true,
    },
  },
};

export const piaNowPlaying2: Script = {
  id: 'nowPlaying2',
  trigger: { type: 'onNowPlaying' },
  repeat: false,
  start: 'floor',
  nodes: {
    floor: {
      lines: [
        { text: '{name} i can hear ur music', delayMs: 3500 },
        { text: 'thru the CEILING', delayMs: 900 },
        {
          text: 'is that {title}?? im trying to do my pony puzzle',
          delayMs: 1200,
        },
      ],
      choices: [
        { text: 'sorry ill turn it down', label: 'Sorry', next: 'down' },
        { text: 'its not even loud', label: 'Its not loud', next: 'loud' },
      ],
    },
    down: {
      lines: [
        { text: 'thank u', delayMs: 900 },
        { text: 'u can turn it back up when im done', delayMs: 1000 },
        { text: 'in 2 hours', delayMs: 800 },
      ],
      end: true,
    },
    loud: {
      lines: [
        { text: 'the lamp is SHAKING', delayMs: 1000 },
        { text: 'im telling mom', delayMs: 900 },
        { text: '...after this song. its kind of good', delayMs: 1600 },
      ],
      end: true,
    },
  },
};

export const kaylaNowPlaying2: Script = {
  id: 'nowPlaying2',
  trigger: { type: 'onNowPlaying', trackId: 'pleasant-porridge' },
  repeat: false,
  start: 'porridge',
  nodes: {
    porridge: {
      lines: [
        { text: '{name}', delayMs: 3000 },
        { text: 'PLEASANT porridge??', delayMs: 900 },
        {
          text: 'nothing in my life is pleasant rn and ur playing a song about BREAKFAST',
          delayMs: 1400,
        },
      ],
      choices: [
        { text: 'want me to change it?', label: 'Change it?', next: 'keep' },
        {
          text: 'maybe u just need some porridge',
          label: 'Eat some porridge',
          next: 'eat',
        },
      ],
    },
    keep: {
      lines: [
        { text: 'no. leave it', delayMs: 1000 },
        { text: 'its actually kind of soothing', delayMs: 1100 },
        {
          delayMs: 600,
          personalMessageChange: '~*finding my inner porridge*~',
        },
      ],
      end: true,
    },
    eat: {
      lines: [
        {
          text: 'omg ur right. i havent eaten since brianna said that thing',
          delayMs: 1300,
        },
        { text: 'brb making oatmeal', delayMs: 900 },
        {
          delayMs: 600,
          statusChange: 'away',
          personalMessageChange: 'brb. emotional oatmeal',
        },
      ],
      end: true,
    },
  },
};

export const marcoNowPlaying2: Script = {
  id: 'nowPlaying2',
  trigger: { type: 'onNowPlaying', trackId: 'voxel-revolution' },
  repeat: false,
  start: 'judge',
  nodes: {
    judge: {
      lines: [
        { text: 'hold on', delayMs: 4000 },
        { text: 'voxel revolution. really', delayMs: 1200 },
        {
          text: 'this is music for a video game loading screen',
          delayMs: 1300,
        },
      ],
      choices: [
        {
          text: 'its a banger and u know it',
          label: 'Its a banger',
          next: 'banger',
        },
        {
          text: 'ok then what should i listen to',
          label: 'What then?',
          next: 'mix',
        },
      ],
    },
    banger: {
      lines: [
        { text: 'its fine. its fine', delayMs: 1300 },
        { text: 'i nodded once. tell no one', delayMs: 1100 },
      ],
      end: true,
    },
    mix: {
      lines: [
        { text: 'velvet lantern demo. obviously', delayMs: 1200 },
        { text: 'ill burn u a mix cd next time im home', delayMs: 1100 },
        {
          text: 'handwritten tracklist. like a professional',
          delayMs: 1000,
        },
      ],
      end: true,
    },
  },
};

export const theoNowPlaying2: Script = {
  id: 'nowPlaying2',
  trigger: { type: 'onNowPlaying', trackId: 'newer-wave' },
  repeat: false,
  start: 'wave',
  nodes: {
    wave: {
      lines: [
        { text: 'um', delayMs: 9000 },
        { text: 'is that newer wave? ur listening to', delayMs: 2200 },
        { text: 'sorry. its in ur name thing. i wasnt spying', delayMs: 1800 },
        { text: 'i listen to that one when i draw', delayMs: 1500 },
      ],
      choices: [
        {
          text: 'what are u drawing rn?',
          label: 'What r u drawing?',
          next: 'frog',
        },
        {
          text: 'we have the same taste then',
          label: 'Same taste',
          next: 'taste',
        },
      ],
    },
    frog: {
      lines: [
        { text: 'a frog. in a spacesuit', delayMs: 2000 },
        { text: 'dont laugh', delayMs: 1400 },
        { text: 'ok u can laugh a little', delayMs: 1600 },
      ],
      end: true,
    },
    taste: {
      lines: [
        { text: 'oh. cool', delayMs: 2000 },
        { text: 'thats really cool actually', delayMs: 1500 },
        { text: 'sorry. ok. bye', delayMs: 1300 },
      ],
      end: true,
    },
  },
};

export const dexNowPlaying2: Script = {
  id: 'nowPlaying2',
  trigger: { type: 'onNowPlaying', trackId: 'cool-rock' },
  repeat: false,
  start: 'rock',
  nodes: {
    rock: {
      lines: [
        { text: 'yo', delayMs: 15_000 },
        { text: 'cool rock', delayMs: 2000 },
        {
          text: 'who named that. like they looked at a rock and went yep. cool',
          delayMs: 1800,
        },
      ],
      choices: [
        {
          text: 'its a skate song tho right',
          label: 'Skate song?',
          next: 'skate',
        },
        { text: 'lol dex what', next: 'what' },
      ],
    },
    skate: {
      lines: [
        { text: '100%', delayMs: 1800 },
        {
          text: 'if i ever make a skate video this is the song',
          delayMs: 1500,
        },
        { text: 'need someone w a camcorder tho. hint hint', delayMs: 1400 },
      ],
      end: true,
    },
    what: {
      lines: [
        { text: 'im just saying', delayMs: 2000 },
        { text: 'its a good rock', delayMs: 1300 },
        { text: 'ok back to the park', delayMs: 1500 },
      ],
      end: true,
    },
  },
};
