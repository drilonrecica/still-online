import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PIXLOG_PROFILES } from '@/content/pixlog';
import { PIXLOG_SKINS } from '@/content/pixlog/types';
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';
import { buildIndex, search } from '../searchly/search';
import { SITES, resolve } from '..';
import { PIXLOG_SITE } from '.';
import { Layout } from './Layout';
import {
  findAlbum,
  photoIndex,
  profileAt,
  tabFrom,
  tabHref,
  visibleAlbums,
  visibleThread,
} from './logic';

const LOAD = 1400;
const jess = PIXLOG_PROFILES[0]!;
const album = jess.albums[0]!;

function open(path: string) {
  const url = `http://${PIXLOG_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return user;
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    gender: 'girl',
    language: 'en',
  });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
  useWorldStore.setState({ day: 5 });
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
});

afterEach(() => {
  cleanup();
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('pixlog logic', () => {
  it('tabFrom falls back to profile', () => {
    expect(tabFrom('blog')).toBe('blog');
    expect(tabFrom('nope')).toBe('profile');
    expect(tabFrom(null)).toBe('profile');
    expect(tabHref('jess', 'profile')).toBe('/jess');
    expect(tabHref('jess', 'photos')).toBe('/jess?tab=photos');
  });

  it('profileAt is case-insensitive and null for strangers', () => {
    expect(profileAt(PIXLOG_PROFILES, '/Jess')).toBe(jess);
    expect(profileAt(PIXLOG_PROFILES, '/nobody')).toBeUndefined();
  });

  it('gates albums by day', () => {
    expect(visibleAlbums(jess, 4)).toEqual([]);
    expect(visibleAlbums(jess, 5)).toEqual([album]);
    expect(findAlbum(PIXLOG_PROFILES, album.id, 4)).toBeNull();
    expect(findAlbum(PIXLOG_PROFILES, album.id, 5)?.profile).toBe(jess);
    expect(findAlbum(PIXLOG_PROFILES, 'nope', 5)).toBeNull();
    expect(findAlbum(PIXLOG_PROFILES, null, 5)).toBeNull();
  });

  it('shows thread comments from their own day, oldest first', () => {
    const comments = [
      { day: 2, text: 'a' },
      { day: 4, text: 'b' },
    ];
    expect(visibleThread(comments, 1)).toEqual([]);
    expect(visibleThread(comments, 3)).toEqual([comments[0]]);
    expect(visibleThread(comments, 5)).toEqual(comments);
  });

  it('photoIndex stays inside the album', () => {
    expect(photoIndex(null, 3)).toBe(1);
    expect(photoIndex('2', 3)).toBe(2);
    expect(photoIndex('9', 3)).toBe(3);
    expect(photoIndex('0', 3)).toBe(1);
    expect(photoIndex('x', 3)).toBe(1);
  });
});

describe('pixlog.example', () => {
  it('registers a page per friend, the album and a catch-all', () => {
    expect(SITES).toContain(PIXLOG_SITE);
    expect(Object.keys(PIXLOG_SITE.pages)).toEqual(
      expect.arrayContaining(['/', '/album', '/jess', '/*']),
    );
    expect(resolve(`http://${PIXLOG_HOST}/jess?tab=blog`)?.key).toBe('/jess');
    expect(resolve(`http://${PIXLOG_HOST}/nobody`)?.key).toBe('/*');
  });

  it('shows the login splash with a log in link and the feed', async () => {
    open('/');
    await finishLoad();
    expect(
      await screen.findByRole('heading', {
        name: 'Your pics. Your friends. Your pixlog.',
      }),
    ).toBeTruthy();
    expect(
      screen
        .getAllByRole('link', { name: 'log in' })
        .map((a) => a.getAttribute('href')),
    ).toEqual(expect.arrayContaining([`http://${PIXLOG_HOST}/me`]));
    expect(
      screen.getByRole('region', { name: 'What your friends are up to' }),
    ).toBeTruthy();
  });

  it('shows the profile tab by default: about and the latest albums', async () => {
    open('/jess');
    await finishLoad();
    expect(await screen.findByRole('heading', { name: 'Jess' })).toBeTruthy();
    expect(screen.getByText(jess.about)).toBeTruthy();
    const link = screen.getByRole('link', { name: new RegExp(album.title) });
    expect(link.getAttribute('href')).toBe(
      `http://${PIXLOG_HOST}/album?id=${album.id}`,
    );
    expect(
      screen
        .getByRole('link', { name: 'Profile' })
        .getAttribute('aria-current'),
    ).toBe('page');
  });

  it('switches tabs via ?tab=', async () => {
    const user = open('/jess?tab=photos');
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Photo albums' }),
    ).toBeTruthy();

    await user.click(screen.getByRole('link', { name: 'Blog' }));
    await finishLoad();
    expect(await screen.findByText('the countdown')).toBeTruthy();

    await user.click(screen.getByRole('link', { name: 'Surveys' }));
    await finishLoad();
    expect(await screen.findByText('pizza or burgers?')).toBeTruthy();
    expect(screen.getByText('IM duh')).toBeTruthy();

    await user.click(screen.getByRole('link', { name: 'Guestbook' }));
    await finishLoad();
    expect(await screen.findByText('luv ur page!!')).toBeTruthy();
    expect(screen.getByText(/xX_CometGirl_Xx wrote/)).toBeTruthy();
  });

  it('hides day-gated entries until their day', async () => {
    useWorldStore.setState({ day: 1 });
    open('/jess?tab=guestbook');
    await finishLoad();
    expect(
      await screen.findByText('Nobody signed the guestbook yet.'),
    ).toBeTruthy();
    expect(screen.queryByText('luv ur page!!')).toBeNull();
  });

  it('hides albums before their day', async () => {
    useWorldStore.setState({ day: 2 });
    open('/jess?tab=photos');
    await finishLoad();
    expect(await screen.findByText('No albums yet.')).toBeTruthy();
  });

  it('draws the album photo at large size with its caption and comments', async () => {
    open(`/album?id=${album.id}`);
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: album.title }),
    ).toBeTruthy();
    const photo = screen.getByRole('img', { name: 'FRONT ROW!!!!' });
    expect(photo.tagName).toBe('CANVAS');
    expect(photo.getAttribute('width')).toBe('480');
    expect(
      screen.getByText('FRONT ROW!!!!', { selector: 'figcaption' }),
    ).toBeTruthy();
    const comments = screen.getByRole('region', { name: 'Comments' });
    expect(within(comments).getByText('omg jealous!!')).toBeTruthy();
    expect(within(comments).getByText(/Kayla wrote/)).toBeTruthy();
    expect(screen.getByText('Photo 1 of 1')).toBeTruthy();
  });

  it('shows not found for an album that is not out yet', async () => {
    useWorldStore.setState({ day: 3 });
    open(`/album?id=${album.id}`);
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeTruthy();
  });

  it('shows not found for an unknown path', async () => {
    open('/nobody');
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Back to pixlog' })).toBeTruthy();
  });

  it('uses the friend’s skin', async () => {
    open('/jess');
    await finishLoad();
    await screen.findByRole('heading', { name: 'Jess' });
    expect(
      document.querySelector('[data-skin]')?.getAttribute('data-skin'),
    ).toBe(jess.skin);
  });

  it('is German when the language is German', async () => {
    useSettingsStore.setState({ language: 'de' });
    open('/jess?tab=guestbook');
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Gästebuch' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Fotos' })).toBeTruthy();
    expect(screen.getByText(/xX_CometGirl_Xx schrieb/)).toBeTruthy();
  });
});

describe('skins', () => {
  it.each(PIXLOG_SKINS)('the %s skin is set on the page frame', (skin) => {
    render(
      <Layout skin={skin}>
        <p>content</p>
      </Layout>,
    );
    expect(
      document.querySelector('[data-skin]')?.getAttribute('data-skin'),
    ).toBe(skin);
  });
});

describe('Searchly', () => {
  it('indexes the friend pages and the album in both languages', () => {
    const en = search('jess pixlog', buildIndex(SITES));
    expect(en.some((r) => r.url === `http://${PIXLOG_HOST}/jess`)).toBe(true);
    const album = search('photo album', buildIndex(SITES));
    expect(album.some((r) => r.url === `http://${PIXLOG_HOST}/album`)).toBe(
      true,
    );
    const de = search('fotoalbum', buildIndex(SITES, 'de'));
    expect(de.some((r) => r.url === `http://${PIXLOG_HOST}/album`)).toBe(true);
  });
});
