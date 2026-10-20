// German tinfoilcomets.example, days 6–10 (`src/content/sites/tinfoilcomets-week2`): a placeholder
// until W3, the English marquee, winners pics and guestbook (same days, seeds, scenes and names).
// W3 replaces this with German
import {
  TINFOIL_GUESTBOOK_WEEK2 as EN_GUESTBOOK,
  TINFOIL_NEWS_WEEK2 as EN_NEWS,
  TINFOIL_PICS_WEEK2 as EN_PICS,
} from '../../sites/tinfoilcomets-week2';
import type { ConcertPic, DayText } from '../../sites/tinfoilcomets';
import type { GuestbookEntry } from '../../sites/types';

export const TINFOIL_NEWS_WEEK2: readonly DayText[] = EN_NEWS;
export const TINFOIL_PICS_WEEK2: readonly ConcertPic[] = EN_PICS;
export const TINFOIL_GUESTBOOK_WEEK2: readonly GuestbookEntry[] = EN_GUESTBOOK;
