import { describe, expect, it } from 'vitest';
import { splitLinks } from './linkify';

describe('splitLinks', () => {
  it('returns plain text as one segment', () => {
    expect(splitLinks('hello :)')).toEqual([
      { kind: 'text', text: 'hello :)' },
    ]);
    expect(splitLinks('')).toEqual([]);
  });

  it('links bare, www and scheme hosts and normalises the url', () => {
    expect(splitLinks('see friendspace.example now')).toEqual([
      { kind: 'text', text: 'see ' },
      {
        kind: 'link',
        text: 'friendspace.example',
        url: 'http://friendspace.example',
      },
      { kind: 'text', text: ' now' },
    ]);
    expect(splitLinks('www.kayla.example/blog')).toEqual([
      {
        kind: 'link',
        text: 'www.kayla.example/blog',
        url: 'http://www.kayla.example/blog',
      },
    ]);
    expect(splitLinks('http://a.example/x?y=1')).toEqual([
      {
        kind: 'link',
        text: 'http://a.example/x?y=1',
        url: 'http://a.example/x?y=1',
      },
    ]);
  });

  it('keeps trailing punctuation out of the link', () => {
    expect(splitLinks('go to fun.example!')).toEqual([
      { kind: 'text', text: 'go to ' },
      { kind: 'link', text: 'fun.example', url: 'http://fun.example' },
      { kind: 'text', text: '!' },
    ]);
  });

  it('finds several links and ignores real TLDs and emails', () => {
    const links = splitLinks('a.example and b.example/p').filter(
      (s) => s.kind === 'link',
    );
    expect(links).toHaveLength(2);
    expect(splitLinks('visit example.com')).toEqual([
      { kind: 'text', text: 'visit example.com' },
    ]);
    expect(splitLinks('mail kim@livemail.example')).toEqual([
      { kind: 'text', text: 'mail kim@livemail.example' },
    ]);
  });
});
