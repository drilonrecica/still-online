import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { events } from '@/os/events';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';
import { pageTitle, resolve } from '..';

const LOAD = 1400;

function open(path: string) {
  const url = `http://${FRIENDSPACE_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const view = render(<Browser windowId={windowId} props={{ url }} />);
  return { user, ...view };
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const comments = () =>
  within(screen.getByRole('list', { name: 'Comments' })).getAllByRole(
    'listitem',
  );

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    playerName: 'Ada',
  });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
  useWorldStore.setState({ day: 1 });
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
});

afterEach(() => {
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('friendspace.example', () => {
  it('registers a page per friend, /me and a catch-all', () => {
    const title = (path: string, locale: 'en' | 'de' = 'en') => {
      const page = resolve(`${FRIENDSPACE_HOST}${path}`);
      return page && pageTitle(page, locale);
    };
    for (const id of ['jess', 'pia', 'kayla', 'marco', 'theo', 'dex']) {
      expect(title(`/${id}`)).toMatch(/on Friendspace$/);
      expect(title(`/${id}`, 'de')).toMatch(/auf Friendspace$/);
    }
    expect(title('/me')).toBe('Friendspace - My Profile');
    expect(title('/me', 'de')).toBe('Friendspace - Mein Profil');
    expect(title('/nobody')).toBe('Friendspace - Lost in orbit');
    expect(title('/nobody', 'de')).toBe('Friendspace - Verloren im All');
  });

  it('landing lists the six friends and logs you in as the player', async () => {
    const { user } = open('/');
    await finishLoad();
    const people = await screen.findByRole('region', {
      name: 'Cool New People',
    });
    expect(within(people).getAllByRole('link')).toHaveLength(6);
    expect(within(people).getByText('~*Kayla*~ <3')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Log In' }));
    await finishLoad();
    expect(await screen.findByText(/You are logged in/)).toBeTruthy();
  });

  it('a friend profile shows header, Top 8 and comments up to the current day', async () => {
    useWorldStore.setState({ day: 2 });
    open('/kayla');
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: '~*Kayla*~ <3' }),
    ).toBeTruthy();
    expect(screen.getByText(/some ppl r just jealous/)).toBeTruthy();
    expect(screen.getByText(/Last Login: \d+\/\d+\/2007/)).toBeTruthy();
    expect(screen.getByRole('img', { name: ';)' })).toBeTruthy();
    const top8 = within(
      screen.getByRole('list', { name: 'Top 8' }),
    ).getAllByRole('listitem');
    expect(top8).toHaveLength(8);
    expect(top8[0]).toHaveTextContent('Ada');
    const wall = comments();
    expect(wall).toHaveLength(4);
    expect(wall[0]).toHaveTextContent('TWINS today');
    expect(wall[0]).toHaveTextContent('today');
    expect(wall[3]).toHaveTextContent('yesterday');
    expect(screen.queryByText(/thx 4 coming/)).toBeNull();
  });

  it('later days add comments to the wall', async () => {
    useWorldStore.setState({ day: 5 });
    open('/kayla');
    await finishLoad();
    await screen.findByRole('heading', { name: '~*Kayla*~ <3' });
    expect(comments()).toHaveLength(11);
    expect(comments()[0]).toHaveTextContent(/dex/);
  });

  it('the profile song button queues the track in Amplifier', async () => {
    const heard = vi.fn();
    const off = events.on('amplifier:enqueue', heard);
    const { user } = open('/dex');
    await finishLoad();
    const play = await screen.findByRole('button', {
      name: /Kevin MacLeod - Cool Rock/,
    });
    expect(heard).not.toHaveBeenCalled();
    await user.click(play);
    expect(heard).toHaveBeenCalledWith({ trackId: 'cool-rock', play: true });
    // The strip shows what the Amplifier reports, not its own guess.
    expect(screen.getByText('click to play')).toBeTruthy();
    act(() =>
      events.emit('amplifier:trackChanged', {
        trackId: 'cool-rock',
        artist: 'Kevin MacLeod',
        title: 'Cool Rock',
        durationSec: 209,
      }),
    );
    expect(screen.getByText('now playing in Amplifier')).toBeTruthy();
    act(() => events.emit('amplifier:stopped', { trackId: 'cool-rock' }));
    off();
  });

  it('unknown profiles are lost in orbit', async () => {
    open('/zorp');
    await finishLoad();
    expect(await screen.findByText('Lost in orbit!')).toBeTruthy();
  });

  it('/me shows friends comments from day 2', async () => {
    open('/me');
    await finishLoad();
    await screen.findByText(/You are logged in/);
    expect(screen.getByText(/Your friends will find you soon/)).toBeTruthy();
    useWorldStore.setState({ day: 3 });
    await act(async () => {});
    expect(comments().length).toBeGreaterThanOrEqual(6);
    expect(screen.getByText(/STARDUST IS MISSING/)).toBeTruthy();
  });

  it('player edits persist and render', async () => {
    const { user, unmount } = open('/me');
    await finishLoad();
    await user.click(
      await screen.findByRole('button', { name: 'Edit Profile' }),
    );
    const form = screen.getByRole('form', { name: 'Edit Profile' });
    const headline = within(form).getByLabelText('Headline:');
    await user.clear(headline);
    await user.type(headline, 'still online');
    await user.selectOptions(
      within(form).getByLabelText('Profile song:'),
      'newer-wave',
    );
    await user.selectOptions(within(form).getByLabelText('Theme:'), 'midnight');
    await user.click(
      within(form).getByRole('button', { name: 'Move pia (L) ponies (L) up' }),
    );
    await user.click(
      within(form).getByRole('button', { name: 'Save Changes' }),
    );

    const saved = useWebStore.getState().myProfile;
    expect(saved).toMatchObject({
      headline: 'still online',
      songTrackId: 'newer-wave',
      themePreset: 'midnight',
    });
    expect(saved?.top8.slice(0, 2)).toEqual([
      { kind: 'contact', id: 'pia' },
      { kind: 'contact', id: 'jess' },
    ]);
    expect(JSON.stringify(localStorage)).toContain('still online');

    expect(screen.getByText(/still online/)).toBeTruthy();
    expect(screen.getByRole('button', { name: /Newer Wave/ })).toBeTruthy();
    const top8 = within(
      screen.getByRole('list', { name: 'Top 8' }),
    ).getAllByRole('listitem');
    expect(top8[0]).toHaveTextContent('pia');
    unmount();

    // Reopening shows the saved profile.
    open('/me');
    await finishLoad();
    expect(await screen.findByText(/still online/)).toBeTruthy();
  });

  it('custom colours apply to the player profile', async () => {
    const { user } = open('/me');
    await finishLoad();
    await user.click(
      await screen.findByRole('button', { name: 'Edit Profile' }),
    );
    await user.selectOptions(screen.getByLabelText('Theme:'), 'custom');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));
    expect(useWebStore.getState().myProfile).toMatchObject({
      themePreset: 'custom',
      customColors: { background: '#000033', text: '#ffff66' },
    });
    expect(screen.getByTestId('profile')).toHaveStyle({ color: '#ffff66' });
  });
});

describe('friendspace.example bulletins', () => {
  const navLink = () => screen.getByRole('link', { name: /^Bulletins/ });

  it('shows the dot while unseen, lists day-gated bulletins and clears the dot', async () => {
    const { user } = open('/');
    await finishLoad();
    expect(navLink()).toHaveTextContent('Bulletins (new)');
    await user.click(navLink());
    await finishLoad();
    expect(await screen.findAllByTestId('bulletin')).toHaveLength(3);
    expect(screen.getByText(/TINFOIL COMETS COUNTDOWN/)).toBeTruthy();
    expect(screen.queryByText(/GOOD LUCK/)).toBeNull();
    expect(useWebStore.getState().bulletinsSeen).toBe(1);
    expect(navLink()).toHaveTextContent(/^Bulletins$/);
  });

  it('links to .example pages and brings the dot back on a later day', async () => {
    const { user } = open('/bulletins');
    await finishLoad();
    const link = await screen.findByRole('link', {
      name: 'http://tinfoilcomets.example/',
    });
    expect(link).toHaveAttribute('href', 'http://tinfoilcomets.example/');
    act(() => useWorldStore.setState({ day: 2 }));
    expect(await screen.findAllByTestId('bulletin')).toHaveLength(6);
    expect(screen.getByText(/GOOD LUCK/)).toBeTruthy();
    await user.click(screen.getByRole('link', { name: 'Home' }));
    await finishLoad();
    expect(navLink()).toHaveTextContent(/^Bulletins$/); // opened on day 2 too
  });

  it('/me shows the newest bulletins with a view-all link', async () => {
    useWorldStore.setState({ day: 2 });
    open('/me');
    await finishLoad();
    const box = await screen.findByRole('region', { name: 'Bulletin Space' });
    expect(within(box).getAllByTestId('bulletin')).toHaveLength(3);
    expect(within(box).getByText(/GOOD LUCK/)).toBeTruthy(); // newest day first
    expect(
      within(box).getByRole('link', { name: 'view all bulletins' }),
    ).toBeTruthy();
  });
});
