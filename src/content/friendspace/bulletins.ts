// Friendspace bulletins (`/bulletins`, P1-01): two to four a day from friends and Top 8 extras.
// Sample data for now: P3-01 writes the ~15 real ones (days 1–5).
import { g } from '../gender';
import type { Bulletin } from './types';

export const BULLETINS: readonly Bulletin[] = [
  {
    id: 'd1-jess-comets-countdown',
    day: 1,
    from: { contactId: 'jess' },
    subject: 'TINFOIL COMETS COUNTDOWN!!!',
    body: 'only a few days left!!! who is coming?? repost if ur going 2 b there ~*~',
    link: 'http://tinfoilcomets.example/',
  },
  {
    id: 'd2-lexi-luck-chain',
    day: 2,
    from: { extra: 'lipgloss_lexi', seed: 'lipglosslexi' },
    subject: 'fw: fw: fw: GOOD LUCK',
    body: `repost this in 5 min and ${g('ur crush will IM u 2nite', 'u will land ur first kickflip 2morrow')}. i did and it WORKED`,
  },
];
