import { describe, expect, it } from 'vitest';
import { GOSSIP_POLLS } from '@/content/sites/celebgossip07';
import { STORY_DAYS } from '@/content/storyDays';
import type { BlogPost, Poll } from '@/content/sites/types';
import {
  currentPoll,
  pollTally,
  postHref,
  postsWithTag,
  tagCloud,
  tagFromQuery,
  tagHref,
} from './logic';

const post = (id: string, tags: string[]): BlogPost => ({
  id,
  day: 1,
  title: id,
  body: '',
  tags,
  comments: [],
});

describe('tagCloud', () => {
  it('counts tags alphabetically and scales the most used to size 5', () => {
    const posts = [
      post('a', ['omg', 'starla']),
      post('b', ['starla']),
      post('c', ['starla', 'feud']),
    ];
    expect(tagCloud(posts)).toEqual([
      { tag: 'feud', label: 'feud', count: 1, size: 1 },
      { tag: 'omg', label: 'omg', count: 1, size: 1 },
      { tag: 'starla', label: 'starla', count: 3, size: 5 },
    ]);
  });

  it('shows labels, sorted by label, and keeps ids for the links', () => {
    const posts = [post('a', ['feud', 'omg'])];
    expect(tagCloud(posts, { feud: 'zoff' })).toEqual([
      { tag: 'omg', label: 'omg', count: 1, size: 1 },
      { tag: 'feud', label: 'zoff', count: 1, size: 1 },
    ]);
  });

  it('handles no posts and all-equal counts', () => {
    expect(tagCloud([])).toEqual([]);
    expect(tagCloud([post('a', ['x'])])).toEqual([
      { tag: 'x', label: 'x', count: 1, size: 1 },
    ]);
  });
});

describe('links and lookups', () => {
  it('builds encoded tag and post links', () => {
    expect(tagHref('tinfoil comets')).toBe('/tag?t=tinfoil%20comets');
    expect(postHref('kyle-tips')).toBe('/post?id=kyle-tips');
  });

  it('finds posts by tag, ignoring case and spaces around it', () => {
    const posts = [post('a', ['omg']), post('b', ['feud'])];
    expect(postsWithTag(posts, ' OMG ').map((p) => p.id)).toEqual(['a']);
    expect(postsWithTag(posts, 'nope')).toEqual([]);
  });

  it('maps v0.3 German tag URLs to ids', () => {
    const posts = [post('a', ['feud']), post('b', ['reality tv'])];
    expect(postsWithTag(posts, 'Zoff').map((p) => p.id)).toEqual(['a']);
    expect(postsWithTag(posts, 'reality-tv').map((p) => p.id)).toEqual(['b']);
    expect(tagFromQuery(' Gerüchte ')).toBe('rumors');
  });
});

describe('polls', () => {
  it('picks the newest poll that has started', () => {
    expect(currentPoll(GOSSIP_POLLS, 0)).toBeNull();
    expect(currentPoll(GOSSIP_POLLS, 1)?.day).toBe(1);
    expect(currentPoll(GOSSIP_POLLS, 3)?.day).toBe(3);
    // After the story, the last story day's poll keeps running.
    expect(currentPoll(GOSSIP_POLLS, STORY_DAYS.last + 2)?.day).toBe(
      STORY_DAYS.last,
    );
  });

  it('tallies deterministic reader votes plus the player vote', () => {
    const poll: Poll = {
      id: 'p',
      day: 1,
      question: 'q',
      options: ['HOT', 'NOT'],
    };
    const before = pollTally(poll, undefined);
    expect(pollTally(poll, undefined)).toEqual(before);
    const after = pollTally(poll, 1);
    expect(after[0]?.votes).toBe(before[0]?.votes);
    expect(after[1]?.votes).toBe((before[1]?.votes ?? 0) + 1);
    for (const r of after) {
      expect(r.votes).toBeGreaterThanOrEqual(40);
      expect(r.percent).toBeGreaterThanOrEqual(0);
      expect(r.percent).toBeLessThanOrEqual(100);
    }
  });
});
