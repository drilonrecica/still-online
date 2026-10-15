import { lazy } from 'react';
import { describe, expect, it } from 'vitest';
import type { SiteDefinition } from '@/content/sites/types';
import { LOCALES } from '@/i18n/types';
import { SITES, pageTitle, resolve } from '.';

const component = lazy(() => Promise.resolve({ default: () => null }));
const FAKE: SiteDefinition = {
  host: 'spaceport.example',
  meta: (locale) => ({
    title: 'Spaceport',
    description: 'friends in orbit',
    keywords: [],
    pages: {
      '/': { title: locale === 'de' ? 'Start' : 'Home' },
      '/me': { title: 'Me' },
      '/*': { title: 'Profile' },
    },
  }),
  pages: { '/': { component }, '/me': { component }, '/*': { component } },
};
const titleOf = (url: string, locale: 'en' | 'de' = 'en') => {
  const page = resolve(url, [FAKE]);
  return page && pageTitle(page, locale);
};

describe('resolve', () => {
  it('matches exact paths first, then /* for one segment', () => {
    expect(titleOf('spaceport.example')).toBe('Home');
    expect(titleOf('spaceport.example', 'de')).toBe('Start');
    expect(titleOf('http://spaceport.example/me/')).toBe('Me');
    const profile = resolve('www.spaceport.example/kayla?x=1', [FAKE]);
    expect(profile).toMatchObject({
      path: '/kayla',
      url: 'http://spaceport.example/kayla?x=1',
    });
    expect(profile?.key).toBe('/*');
    expect(titleOf('www.spaceport.example/kayla?x=1')).toBe('Profile');
    expect(profile?.query.get('x')).toBe('1');
    expect(resolve('spaceport.example/a/b', [FAKE])).toBeNull();
  });

  it('returns null for unknown hosts and paths', () => {
    expect(resolve('http://nowhere.example/')).toBeNull();
    expect(resolve('http://about.example/missing')).toBeNull();
  });

  it('resolves the about.example placeholder site', () => {
    const about = resolve('about.example');
    expect(about && pageTitle(about, 'en')).toBe('Welcome to Web Explorer');
    expect(about && pageTitle(about, 'de')).toBe('Willkommen bei Web Explorer');
    expect(resolve('about.example/tips')?.site.host).toBe('about.example');
  });

  it('registers unique lowercase .example hosts with a home page', () => {
    const hosts = SITES.map((s) => s.host);
    expect(new Set(hosts).size).toBe(hosts.length);
    for (const site of SITES) {
      expect(site.host).toMatch(/^[a-z0-9.-]+\.example$/);
      expect(site.pages['/']).toBeTruthy();
    }
  });

  it.each(LOCALES)(
    'gives every page of every site a title and keywords in %s',
    (locale) => {
      for (const site of SITES) {
        const meta = site.meta(locale);
        expect(meta.title, site.host).not.toBe('');
        expect(meta.description, site.host).not.toBe('');
        expect(meta.keywords.length, site.host).toBeGreaterThan(0);
        for (const path of Object.keys(site.pages))
          expect(meta.pages[path]?.title, `${site.host}${path}`).toBeTruthy();
        // No stray meta for pages that don't exist.
        for (const path of Object.keys(meta.pages))
          expect(site.pages[path], `${site.host}${path}`).toBeTruthy();
      }
    },
  );

  it('names every page differently in German', () => {
    for (const site of SITES) {
      const en = site.meta('en');
      const de = site.meta('de');
      expect(de.description, site.host).not.toBe(en.description);
      // Brand-only titles ("Searchly", "Celeb Gossip 07 ★ OMG!!") may stay the same.
      const changed = Object.keys(site.pages).filter(
        (p) => de.pages[p]?.title !== en.pages[p]?.title,
      );
      expect(changed.length, site.host).toBeGreaterThan(0);
    }
  });
});
