// Shape checks for the gossip blog, school site and VirusGuard content (the text lint runs separately).
import { describe, expect, it } from 'vitest';
import { contentDays } from '../storyDays';
import { CELEBS, GOSSIP_POLLS, GOSSIP_POSTS } from './celebgossip07';
import { VIRUSGUARD_TEXT } from './virusguard';
import { WESTFIELD_NEWS, WESTFIELD_STAFF } from './westfieldhigh';

const days = contentDays();

describe('celebgossip07 content', () => {
  it('has two posts on each written day with unique ids', () => {
    for (const day of days)
      expect(GOSSIP_POSTS.filter((p) => p.day === day)).toHaveLength(2);
    const ids = GOSSIP_POSTS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers at least five invented celebs, each with posts under their tag', () => {
    expect(CELEBS.length).toBeGreaterThanOrEqual(5);
    for (const celeb of CELEBS)
      expect(
        GOSSIP_POSTS.some((p) => p.tags.includes(celeb.tag)),
        celeb.name,
      ).toBe(true);
    expect(CELEBS.map((c) => c.tag)).toContain('tinfoil comets');
  });

  it('uses lowercase tags and gives every post comments', () => {
    for (const post of GOSSIP_POSTS) {
      for (const tag of post.tags) expect(tag).toBe(tag.toLowerCase());
      expect(post.comments.length).toBeGreaterThan(0);
    }
  });

  it('runs one poll a day with unique ids', () => {
    expect(GOSSIP_POLLS.map((p) => p.day)).toEqual(days);
    expect(new Set(GOSSIP_POLLS.map((p) => p.id)).size).toBe(days.length);
    for (const poll of GOSSIP_POLLS)
      expect(poll.options.length).toBeGreaterThanOrEqual(2);
  });
});

describe('westfield-high content', () => {
  it('posts news every story day', () => {
    for (const day of days)
      expect(
        WESTFIELD_NEWS.some((n) => n.day === day),
        `day ${day}`,
      ).toBe(true);
  });

  it('lists Mr Dalton: Biology, Room 12', () => {
    expect(WESTFIELD_STAFF).toContainEqual(
      expect.objectContaining({
        name: 'Mr Dalton',
        role: 'Biology',
        room: 'Room 12',
        email: 'mr.dalton@westfield-high.example',
      }),
    );
  });
});

describe('virusguard content', () => {
  it('is obviously a parody', () => {
    expect(VIRUSGUARD_TEXT.alert).toContain('87% INFECTED');
    expect(VIRUSGUARD_TEXT.offer).toContain('$49.95');
    expect(VIRUSGUARD_TEXT.bought).toContain(
      'Payment system under construction',
    );
    expect(VIRUSGUARD_TEXT.fineprint).toMatch(/joke website/i);
  });
});
