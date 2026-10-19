// Pixlog surveys (P2-03): friends answer one each; the player can fill any of them in.
// Sample data for now: P3-02 writes the real ~3 surveys.
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
    ],
  },
];
