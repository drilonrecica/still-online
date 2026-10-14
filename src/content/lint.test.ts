import { describe, expect, it } from 'vitest';
import { lintContentStrings, lintText } from './lint';

describe('lintText', () => {
  it('passes plain text and .example links and emails', () => {
    expect(lintText('hey :) see spaceport.example/kayla', 'p')).toEqual([]);
    expect(lintText('http://www.kayla.example/blog', 'p')).toEqual([]);
    expect(lintText('mail me: kim@livemail.example.', 'p')).toEqual([]);
  });

  it('flags real TLDs, schemes and www hosts', () => {
    expect(lintText('go to example.com', 'p')).toEqual([
      'p: real-looking URL in "go to example.com"',
    ]);
    expect(lintText('https://news.org/x', 'p')).toHaveLength(1);
    expect(lintText('www.foo.example.com', 'p')).toHaveLength(1);
    expect(lintText('http://real.net and a.example', 'p')).toHaveLength(1);
  });

  it('flags real emails but not .example ones', () => {
    expect(lintText('a@hotmail.com', 'p')).toEqual([
      'p: real-looking email "a@hotmail.com"',
    ]);
  });

  it('flags forbidden names and post-2007 terms', () => {
    for (const bad of [
      'Windows',
      'the app store',
      '#hashtag',
      'a tweet',
      'streaming',
    ])
      expect(lintText(bad, 'p'), bad).toHaveLength(1);
  });

  it('checks placeholders only when a list is given', () => {
    expect(lintText('hi {name} {x}', 'p')).toEqual([]);
    expect(
      lintText('hi {name} {x}', 'p', { placeholders: ['{name}'] }),
    ).toEqual(['p: unknown placeholder {x}']);
  });
});

describe('lintContentStrings', () => {
  it('walks nested objects and arrays with paths', () => {
    expect(
      lintContentStrings({ a: ['ok', { b: 'visit foo.com' }] }, 'root'),
    ).toEqual(['root.a[1].b: real-looking URL in "visit foo.com"']);
  });
});
