import { lazy } from 'react';
import { describe, expect, it } from 'vitest';
import type { SiteDefinition } from '@/content/sites/types';
import { SITES, resolve } from '.';

const component = lazy(() => Promise.resolve({ default: () => null }));
const FAKE: SiteDefinition = {
  host: 'spaceport.example',
  title: 'Spaceport',
  description: 'friends in orbit',
  keywords: [],
  pages: {
    '/': { title: 'Home', component },
    '/me': { title: 'Me', component },
    '/*': { title: 'Profile', component },
  },
};

describe('resolve', () => {
  it('matches exact paths first, then /* for one segment', () => {
    expect(resolve('spaceport.example', [FAKE])?.page.title).toBe('Home');
    expect(resolve('http://spaceport.example/me/', [FAKE])?.page.title).toBe(
      'Me',
    );
    const profile = resolve('www.spaceport.example/kayla?x=1', [FAKE]);
    expect(profile).toMatchObject({
      path: '/kayla',
      url: 'http://spaceport.example/kayla?x=1',
    });
    expect(profile?.page.title).toBe('Profile');
    expect(profile?.query.get('x')).toBe('1');
    expect(resolve('spaceport.example/a/b', [FAKE])).toBeNull();
  });

  it('returns null for unknown hosts and paths', () => {
    expect(resolve('http://nowhere.example/')).toBeNull();
    expect(resolve('http://about.example/missing')).toBeNull();
  });

  it('resolves the about.example placeholder site', () => {
    expect(resolve('about.example')?.page.title).toBe(
      'Welcome to Web Explorer',
    );
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
});
