// Pure helpers for celebgossip07.example: the tag cloud, tag/post lookups and the poll tally.
import type { BlogPost, Poll } from '@/content/sites/types';
import { mulberry32, seedFrom } from '@/os/random';

/** How a tag id reads: the language's label, or the id itself. */
export const tagLabel = (
  tag: string,
  labels: Readonly<Record<string, string>>,
): string => labels[tag] ?? tag;

/**
 * v0.3 German posts used their labels as tags, so saved `/tag?t=mode` URLs still name a label.
 * Maps those back to the id; anything else is already an id.
 */
const V03_GERMAN_TAGS: Readonly<Record<string, string>> = {
  mode: 'fashion',
  gesichtet: 'spotted',
  konzerte: 'concerts',
  haare: 'hair',
  'reality-tv': 'reality tv',
  tiere: 'animals',
  filme: 'movies',
  autsch: 'ouch',
  zoff: 'feud',
  gerüchte: 'rumors',
};

/** The tag id a `?t=` value names: trimmed, lowercased, old German labels mapped to ids. */
export function tagFromQuery(value: string): string {
  const tag = value.trim().toLowerCase();
  return V03_GERMAN_TAGS[tag] ?? tag;
}

export interface CloudTag {
  /** The tag id (for the URL). */
  tag: string;
  /** How it reads in the current language. */
  label: string;
  count: number;
  /** 1 (smallest) … 5 (biggest) font step. */
  size: number;
}

/** Every tag on `posts` with its count, alphabetical by label; the most-used tag gets size 5. */
export function tagCloud(
  posts: readonly BlogPost[],
  labels: Readonly<Record<string, string>> = {},
): CloudTag[] {
  const counts = new Map<string, number>();
  for (const post of posts)
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  const max = Math.max(1, ...counts.values());
  return [...counts]
    .map(([tag, count]) => ({ tag, count, label: tagLabel(tag, labels) }))
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(({ tag, label, count }) => ({
      tag,
      label,
      count,
      size: 1 + Math.round(((count - 1) / Math.max(1, max - 1)) * 4),
    }));
}

export const tagHref = (tag: string) => `/tag?t=${encodeURIComponent(tag)}`;
export const postHref = (id: string) => `/post?id=${encodeURIComponent(id)}`;

export function postsWithTag(
  posts: readonly BlogPost[],
  tag: string,
): BlogPost[] {
  const want = tagFromQuery(tag);
  return posts.filter((p) => p.tags.includes(want));
}

/** The newest poll that has started by `day`, or null before day 1. */
export function currentPoll(polls: readonly Poll[], day: number): Poll | null {
  let best: Poll | null = null;
  for (const poll of polls)
    if (poll.day <= day && (!best || poll.day >= best.day)) best = poll;
  return best;
}

export interface PollResult {
  option: string;
  votes: number;
  percent: number;
}

/**
 * The poll's results: seeded "other readers" (deterministic per poll id) plus the player's vote.
 * Percentages are rounded and may not add up to exactly 100, just like a real 2007 poll.
 */
export function pollTally(poll: Poll, vote: number | undefined): PollResult[] {
  const rand = mulberry32(seedFrom(poll.id));
  const votes = poll.options.map(
    (_, i) => 40 + Math.floor(rand() * 400) + (vote === i ? 1 : 0),
  );
  const total = votes.reduce((a, b) => a + b, 0);
  return poll.options.map((option, i) => {
    const n = votes[i] ?? 0;
    return { option, votes: n, percent: Math.round((n / total) * 100) };
  });
}
