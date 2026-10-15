import { lazy } from 'react';
import { describe, expect, it } from 'vitest';
import type { SiteDefinition } from '@/content/sites/types';
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
const FAKES: SiteDefinition[] = [
  {
    host: 'comets.example',
    title: 'Comets Fan Page',
    description: 'hamsters dance for the band',
    keywords: ['band', 'hamster'],
    pages: {
      '/': { title: 'Comets Home', component },
      '/songs': { title: 'Songs', keywords: ['music'], component },
      '/*': { title: 'Wildcard', component },
    },
  },
  {
    host: 'school.example',
    title: 'Westfield High',
    description: 'the band plays Friday',
    keywords: ['school'],
    pages: { '/': { title: 'Westfield High Band', component } },
  },
];

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

describe('searchly over the registered sites', () => {
  const index = buildIndex(SITES);

  it('registers searchly.example', () => {
    expect(SITES.some((s) => s.host === 'searchly.example')).toBe(true);
  });

  it('finds every registered page by each word of its title', () => {
    for (const site of SITES) {
      for (const [path, page] of Object.entries(site.pages)) {
        if (path.includes('*')) continue;
        const url = `http://${site.host}${path}`;
        for (const word of tokenize(page.title)) {
          const urls = search(word, index).map((r) => r.url);
          expect(urls, `"${word}" should find ${url}`).toContain(url);
        }
      }
    }
  });

  it('is deterministic and paginates in tens', () => {
    expect(search('web', index)).toEqual(search('web', index));
    expect(PAGE_SIZE).toBe(10);
  });
});
