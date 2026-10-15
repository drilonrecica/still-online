import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_FAVORITES,
  WEB_DEFAULTS,
  sanitizeWeb,
  useWebStore,
} from './store';

const web = () => useWebStore.getState();

beforeEach(() => {
  localStorage.clear();
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
});

describe('web store', () => {
  it('seeds the five favorite sites', () => {
    expect(web().favorites.map((f) => f.title)).toEqual([
      'Searchly',
      'Tinfoil Comets',
      'Spaceport',
      'Westfield High',
      'Celeb Gossip 07',
    ]);
  });

  it('adds, renames and removes favorites by normalised url', () => {
    web().addFavorite({ title: 'Welcome', url: 'About.example' });
    expect(web().favorites.at(-1)).toEqual({
      title: 'Welcome',
      url: 'http://about.example/',
    });
    web().addFavorite({ title: 'Hi', url: 'http://about.example/' });
    expect(web().favorites).toHaveLength(6);
    expect(web().favorites.at(-1)?.title).toBe('Hi');
    web().removeFavorite('about.example');
    web().removeFavorite('http://searchly.example/');
    expect(web().favorites.map((f) => f.title)).not.toContain('Searchly');
    expect(web().favorites).toHaveLength(4);
  });

  it('persists favorites under still-online:v1:web', () => {
    web().removeFavorite('http://spaceport.example/');
    const saved = JSON.parse(
      localStorage.getItem('still-online:v1:web') ?? '{}',
    );
    expect(saved.state.favorites).toHaveLength(4);
    expect(saved.state.addFavorite).toBeUndefined();
  });

  it('sanitizes corrupt data field by field', () => {
    const out = sanitizeWeb(
      {
        favorites: [{ title: 'A', url: 'a.example' }, { title: 3 }, 'x'],
        counters: { 'a.example': 5, bad: -1, worse: 'x' },
        guestbook: { 'a.example': [{ name: 'n', message: 'm' }, { name: 1 }] },
        votes: 'nope',
        myProfile: { headline: 1 },
      },
      WEB_DEFAULTS,
    );
    expect(out.favorites).toEqual([{ title: 'A', url: 'http://a.example/' }]);
    expect(out.counters).toEqual({ 'a.example': 5 });
    expect(out.guestbook).toEqual({
      'a.example': [{ name: 'n', message: 'm' }],
    });
    expect(out.votes).toEqual({});
    expect(out.myProfile).toBeNull();
    expect(sanitizeWeb('garbage', WEB_DEFAULTS)).toBe(WEB_DEFAULTS);
  });
});
