import { lazy } from 'react';
import { describe, expect, it } from 'vitest';
import type { SiteDefinition, SiteMeta } from '@/content/sites/types';
import { LOCALES } from '@/i18n/types';
import { SITES } from '..';
import {
  PAGE_SIZE,
  buildIndex,
  didYouMean,
  luckyUrl,
  search,
  tokenize,
} from './search';

const component = lazy(() => Promise.resolve({ default: () => null }));

/** A site with the same meta in every language. */
function fake(host: string, meta: SiteMeta): SiteDefinition {
  return {
    host,
    meta: () => meta,
    pages: Object.fromEntries(
      Object.keys(meta.pages).map((path) => [path, { component }]),
    ),
  };
}

const FAKES: SiteDefinition[] = [
  fake('comets.example', {
    title: 'Comets Fan Page',
    description: 'hamsters dance for the band',
    keywords: ['band', 'hamster'],
    pages: {
      '/': { title: 'Comets Home' },
      '/songs': { title: 'Songs', keywords: ['music'] },
      '/*': { title: 'Wildcard' },
    },
  }),
  fake('school.example', {
    title: 'Westfield High',
    description: 'the band plays Friday',
    keywords: ['school'],
    pages: { '/': { title: 'Westfield High Band' } },
  }),
];

describe('searchly: Unicode and German', () => {
  const GERMAN: SiteDefinition[] = [
    fake('stadt.example', {
      title: 'Stadtwerke',
      description: 'Abfuhrtermine für Müll und Papier',
      keywords: ['müll', 'abfall'],
      pages: { '/': { title: 'Größe der Tonnen' } },
    }),
  ];

  it('keeps letters outside a–z as part of a word', () => {
    expect(tokenize('Müll, Größe & Café!')).toEqual(['müll', 'größe', 'café']);
  });

  it('folds umlauts and ß in German, on both index and query', () => {
    expect(tokenize('Müll Größe GRÖSSE', 'de')).toEqual([
      'mull',
      'grosse',
      'grosse',
    ]);
    const index = buildIndex(GERMAN, 'de');
    for (const q of ['Müll', 'müll', 'Mull', 'Größe', 'Grösse', 'grosse'])
      expect(
        search(q, index).map((r) => r.url),
        q,
      ).toEqual(['http://stadt.example/']);
  });

  it('finds Müll and Größe in English too, without folding', () => {
    const index = buildIndex(GERMAN);
    expect(search('Müll', index)).toHaveLength(1);
    expect(search('Größe', index)).toHaveLength(1);
    expect(search('Grösse', index)).toEqual([]);
  });
});

describe('searchly engine', () => {
  const index = buildIndex(FAKES);

  it('indexes concrete pages only', () => {
    expect(index.pages.map((p) => p.url).sort()).toEqual([
      'http://comets.example/',
      'http://comets.example/songs',
      'http://school.example/',
    ]);
  });

  it('weights title over keywords over description', () => {
    const r = search('band', index);
    // title hit (3) + description hit (1) on the school home
    expect(r[0]).toMatchObject({
      url: 'http://school.example/',
      score: 3 + 1,
    });
    // comets pages: keyword (2) + description (1)
    expect(r[1]?.score).toBe(3);
    expect(search('music', index)[0]?.url).toBe('http://comets.example/songs');
  });

  it('is case-insensitive and ignores punctuation; empty queries match nothing', () => {
    expect(search('  BAND!! ', index)).toEqual(search('band', index));
    expect(search('   ', index)).toEqual([]);
    expect(search('zzzz', index)).toEqual([]);
    expect(tokenize("Hello, W0rld's")).toEqual(['hello', 'w0rld', 's']);
  });

  it('picks the top result for Lucky, falling back to the results page', () => {
    expect(luckyUrl('band', index)).toBe('http://school.example/');
    expect(luckyUrl('zzzz', index)).toBe(
      'http://searchly.example/search?q=zzzz',
    );
  });

  it('suggests a known word for one-letter typos only', () => {
    expect(didYouMean('hamstr', index)).toBe('hamster');
    expect(didYouMean('hamsterz', index)).toBe('hamster');
    expect(didYouMean('band', index)).toBeNull();
    expect(didYouMean('xylophones', index)).toBeNull();
  });
});

describe.each(LOCALES)('searchly over the registered sites (%s)', (locale) => {
  const index = buildIndex(SITES, locale);

  it('registers searchly.example', () => {
    expect(SITES.some((s) => s.host === 'searchly.example')).toBe(true);
  });

  it('finds every registered page by each word of its title', () => {
    for (const site of SITES) {
      const meta = site.meta(locale);
      for (const path of Object.keys(site.pages)) {
        if (path.includes('*')) continue;
        const url = `http://${site.host}${path}`;
        for (const word of tokenize(meta.pages[path]?.title ?? '', locale)) {
          const urls = search(word, index).map((r) => r.url);
          expect(urls, `"${word}" should find ${url}`).toContain(url);
        }
      }
    }
  });

  it('finds CheatCave for cheat and clip searches', () => {
    const top = (q: string) => search(q, index)[0]?.url;
    const cheats = locale === 'de' ? 'cheatcodes zocken' : 'cheat codes';
    expect(top(cheats)).toMatch(/^http:\/\/cheatcave\.example\//);
    expect(top('CheatCave Forum')).toBe('http://cheatcave.example/forum');
    expect(top(locale === 'de' ? 'lustige Clips' : 'funny clips')).toBe(
      'http://cheatcave.example/clips',
    );
  });

  it('finds Kickflip Kings for skate searches', () => {
    const top = (q: string) => search(q, index)[0]?.url;
    expect(top(locale === 'de' ? 'skaten' : 'skateboarding')).toMatch(
      /^http:\/\/kickflipkings\.example\//,
    );
    expect(top(locale === 'de' ? 'Trick-Tipps' : 'trick tips')).toBe(
      'http://kickflipkings.example/tricks',
    );
    expect(top(locale === 'de' ? 'Skatevideo' : 'skate video')).toBe(
      'http://kickflipkings.example/video',
    );
  });

  it('is deterministic and paginates in tens', () => {
    expect(search('web', index)).toEqual(search('web', index));
    expect(PAGE_SIZE).toBe(10);
  });
});

describe('searchly in German', () => {
  const index = buildIndex(SITES, 'de');
  const top = (q: string) => search(q, index)[0]?.url;

  it('finds German pages by German words', () => {
    expect(top('Klatsch')).toBe('http://celebgossip07.example/');
    expect(top('Gästebuch')).toBe('http://tinfoilcomets.example/guestbook');
    expect(top('Mensa')).toBe('http://westfield-high.example/cafeteria');
    expect(top('Lehrerkollegium')).toBe('http://westfield-high.example/staff');
    expect(top('Kayla auf Friendspace')).toBe(
      'http://friendspace.example/kayla',
    );
    expect(top('Surftipps')).toBe('http://about.example/tips');
  });

  it('folds umlauts in German queries', () => {
    expect(top('gastebuch')).toBe('http://tinfoilcomets.example/guestbook');
  });

  it('shows German titles and snippets, and English ones in English', () => {
    const de = search('virusguard', index)[0];
    expect(de?.title).toBe('VirusGuard 2007 - Ist Ihr Computer infiziert?');
    expect(de?.snippet).toMatch(/49,95 €/);
    const en = search('virusguard', buildIndex(SITES, 'en'))[0];
    expect(en?.title).toBe('VirusGuard 2007 - Is Your Computer Infected?');
  });

  it("doesn't match English-only words in German", () => {
    expect(search('guestbook', index)).toEqual([]);
    expect(search('cafeteria', index)).toEqual([]);
    expect(search('guestbook', buildIndex(SITES, 'en'))[0]?.url).toBe(
      'http://tinfoilcomets.example/guestbook',
    );
  });
});
