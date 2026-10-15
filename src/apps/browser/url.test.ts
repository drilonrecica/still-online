import { describe, expect, it } from 'vitest';
import { HOMEPAGE, normalizeUrl, parseUrl, resolveHref } from './url';

describe('normalizeUrl', () => {
  it.each([
    ['friendspace.example', 'http://friendspace.example/'],
    ['  FriendSpace.EXAMPLE/Kayla ', 'http://friendspace.example/Kayla'],
    [
      'https://searchly.example/search?q=hi',
      'http://searchly.example/search?q=hi',
    ],
    ['www.tinfoilcomets.example/band', 'http://www.tinfoilcomets.example/band'],
    ['', HOMEPAGE],
  ])('%s → %s', (input, out) => {
    expect(normalizeUrl(input)).toBe(out);
  });

  it('sends plain words to Searchly', () => {
    expect(normalizeUrl('pony games')).toBe(
      'http://searchly.example/search?q=pony%20games',
    );
  });
});

describe('resolveHref', () => {
  const base = 'http://tinfoilcomets.example/band';
  it.each([
    ['/guestbook', 'http://tinfoilcomets.example/guestbook'],
    ['pics', 'http://tinfoilcomets.example/pics'],
    ['?page=2', 'http://tinfoilcomets.example/band?page=2'],
    ['friendspace.example/jess', 'http://friendspace.example/jess'],
    ['http://Searchly.example/', 'http://searchly.example/'],
  ])('%s → %s', (href, out) => {
    expect(resolveHref(base, href)).toBe(out);
  });
});

describe('parseUrl', () => {
  it('strips www and trailing slashes and keeps the query', () => {
    const p = parseUrl('www.Friendspace.example/kayla/?tab=comments');
    expect(p).toMatchObject({
      host: 'friendspace.example',
      path: '/kayla',
      url: 'http://friendspace.example/kayla?tab=comments',
    });
    expect(p?.query.get('tab')).toBe('comments');
  });

  it('defaults the path to /', () => {
    expect(parseUrl('about.example')?.path).toBe('/');
  });
});
