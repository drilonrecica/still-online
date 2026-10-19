// Wall lines a friend leaves on the player's `/me` after a Top 8 drop and a re-add (P0-03, P1-05).
// Sample data for now: P3-01 writes all six friends.
import type { Top8Reaction } from './types';

export const TOP8_REACTIONS: readonly Top8Reaction[] = [
  {
    contactId: 'kayla',
    dropped: 'wow. WOW. i see how it is {name}. real friends stay true',
    readded: 'ok fine ur forgiven. ONLY bc u put me back <3',
  },
];
