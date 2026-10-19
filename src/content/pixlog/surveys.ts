// Pixlog surveys (P2-03): friends answer one each; the player can fill any of them in.
// Jess answers "this or that", Kayla "about me", Pia "last time"; P3-03 reuses them.
import type { Survey } from './types';

export const SURVEYS: readonly Survey[] = [
  {
    id: 'this-or-that',
    title: 'this or that?!',
    questions: [
      'pizza or burgers?',
      'call or IM?',
      'summer or winter?',
      'mp3 player or CDs?',
      'cats or dogs?',
      'early bird or night owl?',
      'scary movie or funny movie?',
      'pool or beach?',
      'sneakers or flip flops?',
      'text in caps or text in lowercase?',
    ],
  },
  {
    id: 'about-me',
    title: '~*the ULTIMATE about me survey*~',
    questions: [
      'name:',
      'nicknames:',
      'birthday:',
      'fave color:',
      'fave song right now:',
      'fave food:',
      'what r u wearing right now?',
      'whats ur away message?',
      'who was the last person u IMed?',
      'biggest fear:',
      'what do u want to be when u grow up?',
      'describe urself in 3 words:',
    ],
  },
  {
    id: 'last-time',
    title: 'when was the last time u...',
    questions: [
      'laughed so hard u cried?',
      'got in trouble?',
      'said sorry?',
      'stayed up way too late?',
      'ate something weird?',
      'lost something important?',
      'got a present?',
      'sang out loud?',
      'had a sleepover?',
      'told a secret?',
    ],
  },
];
