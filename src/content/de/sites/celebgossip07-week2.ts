// German celebgossip07.example, days 6–10 (`src/content/sites/celebgossip07-week2`): a placeholder
// until W3, the English posts and polls (same ids, days, tags, photos and comment counts).
// W3 replaces this with German
import {
  GOSSIP_POLLS_WEEK2 as EN_POLLS,
  GOSSIP_POSTS_WEEK2 as EN_POSTS,
} from '../../sites/celebgossip07-week2';
import type { BlogPost, Poll } from '../../sites/types';

export const GOSSIP_POSTS_WEEK2: readonly BlogPost[] = EN_POSTS;
export const GOSSIP_POLLS_WEEK2: readonly Poll[] = EN_POLLS;
