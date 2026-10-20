// German kickflipkings.example, days 6–10 (`src/content/sites/kickflipkings-week2`): a placeholder
// until W3, the English news, shouts and Jam clip (same days, authors and view counts).
// W3 replaces this with German
import {
  KICKFLIP_NEWS_WEEK2 as EN_NEWS,
  KICKFLIP_SHOUTS_WEEK2 as EN_SHOUTS,
  KICKFLIP_VIDEO_WEEK2 as EN_VIDEO,
} from '../../sites/kickflipkings-week2';
import type { NewsPost, Shout, SkateVideo } from '../../sites/types';

export const KICKFLIP_NEWS_WEEK2: readonly NewsPost[] = EN_NEWS;
export const KICKFLIP_SHOUTS_WEEK2: readonly Shout[] = EN_SHOUTS;
export const KICKFLIP_VIDEO_WEEK2: Pick<SkateVideo, 'views' | 'clip'> =
  EN_VIDEO;
