import { describe, expect, it } from 'vitest';
import { g, gendered } from './gender';
import { lintContentStrings, lintText } from './lint';

describe('gender variants', () => {
  it('passes well-formed variants and lints both sides', () => {
    expect(lintText(`ur my fave ${g('cousine', 'cousin')}`, 'p')).toEqual([]);
    expect(lintText(g('hi', 'see example.com'), 'p')).toHaveLength(1);
  });

  it.each([
    ['unbalanced', '\uE000girl\uE001boy'],
    ['nested', `\uE000${g('a', 'b')}\uE001c\uE002`],
    ['empty side', g('girl', '')],
  ])('fails a malformed variant (%s)', (_, text) => {
    expect(lintText(text, 'p').length).toBeGreaterThan(0);
    expect(lintContentStrings({ x: [text] }, 'm').length).toBeGreaterThan(0);
  });

  it('checks gendered() values', () => {
    const ok = gendered({ girl: { scene: 'a' }, boy: { scene: 'b' } });
    expect(lintContentStrings({ ok }, 'm')).toEqual([]);
    const half = { __gendered: true, girl: 'x' };
    expect(lintContentStrings({ half }, 'm')).toEqual([
      'm.half: gendered value needs a girl and a boy side',
    ]);
    const mixed = gendered<unknown>({ girl: 'x', boy: 1 });
    expect(lintContentStrings({ mixed }, 'm')).toEqual([
      'm.mixed: gendered sides differ in type',
    ]);
    const nested = gendered({
      girl: gendered({ girl: 'a', boy: 'b' }),
      boy: 'c',
    });
    expect(lintContentStrings({ nested }, 'm')).toContain(
      'm.nested.girl: nested gendered value',
    );
  });
});

describe('lintText', () => {
  it('passes plain text and .example links and emails', () => {
    expect(lintText('hey :) see friendspace.example/kayla', 'p')).toEqual([]);
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

describe('lint per locale', () => {
  const de = { locale: 'de' } as const;

  it('flags German anachronisms only in German text', () => {
    for (const bad of [
      'schreib mir auf WhatsApp',
      'hast du Instagram?',
      'neues Smartphone',
      'die App ist cool',
      'lad dir Apps runter',
      'im App-Store',
      'ich muss das posten',
      'hab ich gepostet',
      'meine Story',
      'Stories gucken',
      'streamen wir das',
      'schick mir ne DM',
    ])
      // Some (Smartphone, DM, streamen…) are already caught by the shared list.
      expect(lintText(bad, 'p', de), bad).toHaveLength(1);
    expect(lintText('ich muss das posten', 'p', de)).toEqual([
      'p: German anachronism in "ich muss das posten"',
    ]);
    expect(lintText('ich muss das posten', 'p')).toEqual([]);
  });

  it('keeps ordinary German words that contain or resemble them', () => {
    for (const ok of [
      'der Posten als Klassensprecher',
      'stell das Tablett ab',
      'Appetit auf Pizza',
      'die Größe passt',
      'bring den Müll raus',
    ])
      expect(lintText(ok, 'p', de), ok).toEqual([]);
  });

  it('forbids real TLDs in every locale, including .de/.at/.ch', () => {
    for (const bad of ['schau auf foo.de', 'foo.at', 'www.foo.ch'])
      expect(lintText(bad, 'p', de), bad).toHaveLength(1);
    expect(lintText('kayla.example/blog', 'p', de)).toEqual([]);
    expect(lintContentStrings({ a: 'meine Story' }, 'r', 'de')).toHaveLength(1);
  });
});
