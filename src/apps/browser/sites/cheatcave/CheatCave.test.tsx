import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CHEATCAVE_HOST } from '@/content/sites/cheatcave';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';

const LOAD = 1400;

function open(path: string) {
  const url = `http://${CHEATCAVE_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return user;
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const articles = () => screen.findAllByRole('article');
const names = (els: HTMLElement[]) =>
  els.map((a) => a.getAttribute('aria-label'));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({ connectAutomatically: true, muted: true });
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

describe('cheatcave.example', () => {
  it('home shows the news out by today, the counter and a welcome', async () => {
    useWorldStore.setState({ day: 3 });
    open('/');
    await finishLoad();
    expect(names(await articles())).toEqual([
      'Tiny Tank Takedown 2 is OUT',
      'CHEATCAVE WEEKLY #12 is out!!',
      'Thunder Kart: secret track found?!',
      'FLASH GAME OF THE WEEK: Zombie Lunchroom',
      'WELCOME 2 THE NEW CHEATCAVE!!!',
    ]);
    expect(screen.queryByText(/Grandma Ninja/)).toBeNull();
    expect(screen.getByText('UPDATED DAILY!!')).toBeTruthy();
    expect(screen.getByRole('img', { name: '13,370 visitors' })).toBeTruthy();
    expect(screen.getByText(/gamers online now/)).toBeTruthy();
    expect(screen.getByText(/hey gamer girl/)).toBeTruthy();
    expect(
      screen.getByRole('list', { name: 'Link to us buttons' }),
    ).toHaveTextContent('NO n00bs');
    expect(screen.getAllByText(/^posted by CaveKing today$/)).toHaveLength(2);
    cleanup();

    useWorldStore.setState({ day: 5 });
    open('/');
    await finishLoad();
    const all = await articles();
    expect(all).toHaveLength(8);
    expect(all[1]?.getAttribute('aria-label')).toMatch(/Grandma Ninja/);
  });

  it('greets a boy as a dude', async () => {
    useSettingsStore.setState({ gender: 'boy' });
    open('/');
    await finishLoad();
    expect(await screen.findByText(/^hey dude!!!/)).toBeTruthy();
    expect(screen.queryByText(/gamer girl/)).toBeNull();
  });

  it('lists the games and opens one with its joke cheat', async () => {
    const user = open('/cheats');
    await finishLoad();
    const games = await screen.findByRole('list', { name: 'Games' });
    for (const name of [
      'Galaxy Raiders 3',
      'Mines',
      'Hen Hunt',
      'Star Pinball',
    ])
      expect(within(games).getByRole('link', { name })).toBeTruthy();
    await user.click(within(games).getByRole('link', { name: 'Hen Hunt' }));
    await finishLoad();
    const game = await screen.findByRole('article', { name: 'Hen Hunt' });
    expect(within(game).getByText(/golden hen/)).toBeTruthy();
    expect(
      within(game).getByText(/JOKE CHEAT/).parentElement,
    ).toHaveTextContent(/BLAM/);
    cleanup();

    open('/cheats?game=nope');
    await finishLoad();
    expect(await screen.findByText(/that game isnt in the cave/)).toBeTruthy();
  });

  it('charts the top 10 clips; day 5 brings a new #1', async () => {
    open('/clips');
    await finishLoad();
    const chart = await screen.findByRole('list', {
      name: 'Top 10 funny clips',
    });
    const clips = within(chart).getAllByRole('listitem');
    expect(clips).toHaveLength(10);
    expect(clips[0]).toHaveTextContent(/#1.*cat vs ceiling fan/);
    expect(clips[0]).toHaveTextContent('98,765 views');
    cleanup();

    useWorldStore.setState({ day: 5 });
    open('/clips');
    await finishLoad();
    const next = await screen.findByRole('list', {
      name: 'Top 10 funny clips',
    });
    expect(within(next).getAllByRole('listitem')[0]).toHaveTextContent(
      /guy tries to ollie a puddle/,
    );
  });

  it('the forum is read-only and its replies arrive by day', async () => {
    const user = open('/forum');
    await finishLoad();
    const threads = await screen.findByRole('list', { name: 'Threads' });
    expect(within(threads).queryByText(/PC vs CONSOLE/)).toBeNull();
    await user.click(
      within(threads).getByRole('link', { name: /umbrella guy/ }),
    );
    await finishLoad();
    const posts = await screen.findByRole('list', { name: 'Posts' });
    expect(posts).toHaveTextContent(/sorry if this is a dumb question/);
    expect(within(posts).getAllByRole('listitem')).toHaveLength(3);
    const page = posts.closest('main') as HTMLElement;
    expect(within(page).queryByRole('textbox')).toBeNull();
    expect(within(page).queryByRole('button')).toBeNull();
    expect(screen.getByText(/new sign-ups r closed/)).toBeTruthy();
    cleanup();

    useWorldStore.setState({ day: 5 });
    open('/forum?t=best-trick-irl');
    await finishLoad();
    const trick = await screen.findByRole('list', { name: 'Posts' });
    expect(trick).toHaveTextContent('dex.kickflip wrote today:');
    expect(trick).toHaveTextContent(/camera was in my bag/);
    cleanup();

    open('/forum?t=pc-vs-console');
    await finishLoad();
    expect(
      await screen.findByRole('list', { name: 'Posts' }),
    ).toHaveTextContent(/marco\.bassline wrote today:its a band/);
    cleanup();

    useWorldStore.setState({ day: 1 });
    open('/forum?t=pc-vs-console');
    await finishLoad();
    expect(await screen.findByText(/that thread doesnt exist/)).toBeTruthy();
  });

  it('reads like a German games site', async () => {
    useSettingsStore.setState({ language: 'de', gender: 'boy' });
    useWorldStore.setState({ day: 3 });
    const user = open('/');
    await finishLoad();
    expect(
      await screen.findByRole('article', {
        name: 'CHEATCAVE WEEKLY #12 is raus!!',
      }),
    ).toBeTruthy();
    expect(screen.getByText('TÄGLICH NEU!!')).toBeTruthy();
    expect(screen.getByRole('img', { name: '13.370 Besucher' })).toBeTruthy();
    expect(screen.getByText(/^hey alter!!!/)).toBeTruthy();
    expect(screen.getAllByText(/^von CaveKing, heute$/)).toHaveLength(2);
    await user.click(screen.getByRole('link', { name: 'FORUM' }));
    await finishLoad();
    await user.click(
      await screen.findByRole('link', { name: /PC gegen KONSOLE/ }),
    );
    await finishLoad();
    const posts = await screen.findByRole('list', { name: 'Beiträge' });
    expect(posts).toHaveTextContent(/mein kleiner cousin schlägt mich/);
    expect(posts).toHaveTextContent('marco.bassline schrieb heute:');
    await user.click(screen.getByRole('link', { name: 'CHEATS' }));
    await finishLoad();
    await user.click(await screen.findByRole('link', { name: 'Hühnerjagd' }));
    await finishLoad();
    const hens = await screen.findByRole('article', { name: 'Hühnerjagd' });
    expect(
      within(hens).getByText(/WITZ-CHEAT/).parentElement,
    ).toHaveTextContent(/PENG/);
  });
});
