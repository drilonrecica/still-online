import { beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import {
  DEFAULT_FAVORITES,
  WEB_DEFAULTS,
  defaultFavoritesFor,
  isUntouchedFavorites,
  renderFavorites,
  sanitizeWeb,
  useWebStore,
} from './store';

const web = () => useWebStore.getState();

beforeEach(() => {
  localStorage.clear();
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
});

describe('web store', () => {
  it('seeds the five favorite sites, named in the current language', () => {
    expect(web().favorites.every((f) => f.title === undefined)).toBe(true);
    const names = (locale: 'en' | 'de') =>
      renderFavorites(web().favorites, locale, 'girl').map((f) => f.title);
    expect(names('en')).toEqual([
      'Searchly',
      'Tinfoil Comets',
      'Friendspace',
      'Westfield High',
      'Celeb Gossip 07',
    ]);
    expect(names('de')).toContain('Westfield-Gymnasium');
  });

  it('migrates v0.2 favorites: untouched defaults drop their English title', () => {
    const out = sanitizeWeb(
      {
        favorites: [
          { title: 'Searchly', url: 'http://searchly.example/' },
          { title: 'My School', url: 'http://westfield-high.example/' },
          { title: 'Friendspace', url: 'http://friendspace.example/me' },
        ],
      },
      WEB_DEFAULTS,
    );
    expect(out.favorites).toEqual([
      { url: 'http://searchly.example/' },
      { title: 'My School', url: 'http://westfield-high.example/' },
      { title: 'Friendspace', url: 'http://friendspace.example/me' },
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
    web().removeFavorite('http://friendspace.example/');
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

describe('per-gender default favorites', () => {
  const titles = (gender: 'girl' | 'boy', locale: 'en' | 'de' = 'en') =>
    renderFavorites(web().favorites, locale, gender).map((f) => f.title);

  it('shares Searchly, Friendspace and Westfield High; the rest follows the gender', () => {
    expect(titles('girl')).toEqual([
      'Searchly',
      'Tinfoil Comets',
      'Friendspace',
      'Westfield High',
      'Celeb Gossip 07',
    ]);
    expect(titles('boy')).toEqual([
      'Searchly',
      'CheatCave',
      'Kickflip Kings',
      'Friendspace',
      'Westfield High',
    ]);
    expect(titles('boy', 'de')).toContain('Westfield-Gymnasium');
    expect(DEFAULT_FAVORITES).toEqual(defaultFavoritesFor('girl'));
  });

  it('either default list counts as untouched; any change makes it custom', () => {
    expect(isUntouchedFavorites(defaultFavoritesFor('girl'))).toBe(true);
    expect(isUntouchedFavorites(defaultFavoritesFor('boy'))).toBe(true);
    const [first, ...rest] = defaultFavoritesFor('boy');
    expect(isUntouchedFavorites([...rest, first!])).toBe(false);
    expect(
      isUntouchedFavorites([{ ...first!, title: 'my search' }, ...rest]),
    ).toBe(false);
    expect(isUntouchedFavorites(rest)).toBe(false);
  });

  it('a boy edits his own defaults; customized favorites stay put on a switch', () => {
    useSettingsStore.setState({ gender: 'boy' });
    web().addFavorite({ title: 'Mines tips', url: 'http://about.example/' });
    expect(web().favorites.map((f) => f.url)).toEqual([
      ...defaultFavoritesFor('boy').map((f) => f.url),
      'http://about.example/',
    ]);
    expect(titles('girl')).toEqual(titles('boy'));
    expect(titles('girl')).toContain('CheatCave');
  });

  it('removing a default as a boy keeps his other defaults', () => {
    useSettingsStore.setState({ gender: 'boy' });
    web().removeFavorite('http://cheatcave.example/');
    expect(titles('girl')).toEqual([
      'Searchly',
      'Kickflip Kings',
      'Friendspace',
      'Westfield High',
    ]);
  });

  it('migrates untouched v0.2 and v0.3 favorites so they follow the gender', () => {
    const v02 = sanitizeWeb(
      {
        favorites: [
          { title: 'Searchly', url: 'http://searchly.example/' },
          { title: 'Tinfoil Comets', url: 'http://tinfoilcomets.example/' },
          { title: 'Spaceport', url: 'http://spaceport.example/' },
          { title: 'Westfield High', url: 'http://westfield-high.example/' },
          { title: 'Celeb Gossip 07', url: 'http://celebgossip07.example/' },
        ],
      },
      WEB_DEFAULTS,
    ).favorites;
    const v03 = sanitizeWeb(
      { favorites: defaultFavoritesFor('girl') },
      WEB_DEFAULTS,
    ).favorites;
    for (const saved of [v02, v03]) {
      expect(isUntouchedFavorites(saved)).toBe(true);
      expect(renderFavorites(saved, 'en', 'boy').map((f) => f.title)).toEqual([
        'Searchly',
        'CheatCave',
        'Kickflip Kings',
        'Friendspace',
        'Westfield High',
      ]);
    }
  });

  it('a v0.4 boy save with the old untouched order still follows the gender', () => {
    const v04Boy = sanitizeWeb(
      {
        favorites: [
          { url: 'http://searchly.example/' },
          { url: 'http://cheatcave.example/' },
          { url: 'http://friendspace.example/' },
          { url: 'http://westfield-high.example/' },
          { url: 'http://kickflipkings.example/' },
        ],
      },
      WEB_DEFAULTS,
    ).favorites;
    expect(isUntouchedFavorites(v04Boy)).toBe(true);
    expect(renderFavorites(v04Boy, 'en', 'boy').map((f) => f.title)).toEqual([
      'Searchly',
      'CheatCave',
      'Kickflip Kings',
      'Friendspace',
      'Westfield High',
    ]);
    expect(renderFavorites(v04Boy, 'en', 'girl').map((f) => f.title)).toContain(
      'Celeb Gossip 07',
    );
  });
});

describe('web store: site actions', () => {
  it('hit counts visits per host and returns the new total', () => {
    expect(web().hit('tinfoilcomets.example')).toBe(1);
    expect(web().hit('tinfoilcomets.example')).toBe(2);
    expect(web().hit('other.example')).toBe(1);
    expect(web().counters).toEqual({
      'tinfoilcomets.example': 2,
      'other.example': 1,
    });
  });

  it('signGuestbook appends player entries per host', () => {
    web().signGuestbook('a.example', { name: 'Ada', message: 'hi', day: 2 });
    web().signGuestbook('a.example', { name: 'Ada', message: 'again' });
    expect(web().guestbook['a.example']?.map((e) => e.message)).toEqual([
      'hi',
      'again',
    ]);
  });

  it('sanitize keeps a valid guestbook day and drops a bad one', () => {
    const out = sanitizeWeb(
      {
        guestbook: {
          'a.example': [
            { name: 'A', message: 'x', day: 3 },
            { name: 'B', message: 'y', day: -1 },
            { name: 'C', message: 'z', day: 'two' },
          ],
        },
      },
      WEB_DEFAULTS,
    );
    expect(out.guestbook['a.example']).toEqual([
      { name: 'A', message: 'x', day: 3 },
      { name: 'B', message: 'y' },
      { name: 'C', message: 'z' },
    ]);
  });

  it('vote records the first answer per poll and persists it', () => {
    web().vote('scrunchies', 1);
    web().vote('scrunchies', 0);
    web().vote('kyle-hair', 2);
    web().vote('bad', -1);
    expect(web().votes).toEqual({ scrunchies: 1, 'kyle-hair': 2 });
    const saved = JSON.parse(
      localStorage.getItem('still-online:v1:web') ?? '{}',
    );
    expect(saved.state.votes).toEqual({ scrunchies: 1, 'kyle-hair': 2 });
  });
});
