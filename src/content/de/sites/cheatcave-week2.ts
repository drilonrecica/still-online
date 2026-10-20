// German cheatcave.example, days 6–10 (`src/content/sites/cheatcave-week2`): a placeholder until
// W3, the English news, clips and forum replies (same days, ids, views, scenes and users).
// W3 replaces this with German
import {
  CHEATCAVE_CLIPS_WEEK2 as EN_CLIPS,
  CHEATCAVE_FORUM_WEEK2 as EN_FORUM,
  CHEATCAVE_NEWS_WEEK2 as EN_NEWS,
} from '../../sites/cheatcave-week2';
import type { ForumPost, FunnyClip, NewsPost } from '../../sites/types';

export const CHEATCAVE_NEWS_WEEK2: readonly NewsPost[] = EN_NEWS;
export const CHEATCAVE_CLIPS_WEEK2: readonly FunnyClip[] = EN_CLIPS;
export const CHEATCAVE_FORUM_WEEK2: Readonly<
  Record<string, readonly ForumPost[]>
> = EN_FORUM;
