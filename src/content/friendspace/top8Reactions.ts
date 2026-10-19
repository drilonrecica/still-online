// Wall lines a friend leaves on the player's `/me` after a Top 8 drop and a re-add (P0-03, P1-05),
// in sign-in order. The Messenger conversations live in `src/content/contacts/top8-reactions.ts`.
import { g } from '../gender';
import type { Top8Reaction } from './types';

export const TOP8_REACTIONS: readonly Top8Reaction[] = [
  {
    contactId: 'jess',
    dropped:
      'I AM NOT IN UR TOP 8 ANYMORE??? {name} HOW COULD U :( :( :( (ok im fine) (im not fine)',
    readded: `IM BACK IN THE TOP 8!!! where i BELONG!!! ur the best {name} ${g('(L)', '(Y)')}`,
  },
  {
    contactId: 'pia',
    dropped:
      'I AM NOT IN UR TOP 8. i told mom. she said "oh dear". that means UR IN TROUBLE',
    readded: g(
      'ok im back in ur top 8. mom says ur a good sister. i said "sometimes"',
      'ok im back in ur top 8. mom says ur a good brother. i said "sometimes"',
    ),
  },
  {
    contactId: 'kayla',
    dropped: 'wow. WOW. i see how it is {name}. real friends stay true',
    readded: `ok fine ur forgiven. ONLY bc u put me back ${g('<3', ';)')}`,
  },
  {
    contactId: 'marco',
    dropped: 'saw the top 8. its fine. aunt rita is not fine. call her',
    readded: 'back in the top 8. dont make it weird, kid',
  },
  {
    contactId: 'theo',
    dropped:
      'um. sorry if i did something. u can take more ppl out if u need the space. sorry',
    readded: 'thanks for putting me back in ur top 8. sorry. i mean. thanks :)',
  },
  {
    contactId: 'dex',
    dropped: 'wait was i in ur top 8. huh',
    readded: 'back in the top 8 i guess. nice',
  },
];
