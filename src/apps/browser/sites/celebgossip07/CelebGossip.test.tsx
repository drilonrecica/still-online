import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';

const LOAD = 1400;

function open(path: string) {
  const url = `http://${GOSSIP_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return user;
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const posts = () => screen.findAllByRole('article');

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

describe('celebgossip07.example', () => {
  it('shows only the posts out by today, newest first', async () => {
    open('/');
    await finishLoad();
    expect((await posts()).map((a) => a.getAttribute('aria-label'))).toEqual([
      'Tinfoil Comets SELL OUT Riverside Arena in 11 minutes!!!',
      'SPOTTED: Starla Vance buys FORTY scrunchies?!',
    ]);
    expect(screen.queryByText(/CONCERT RECAP/)).toBeNull();
    cleanup();

    useWorldStore.setState({ day: 5 });
    open('/');
    await finishLoad();
    const all = await posts();
    expect(all).toHaveLength(10);
    expect(all[0]?.getAttribute('aria-label')).toMatch(/Duchess/);
    expect(
      within(all[0] as HTMLElement).getByText(/posted by Roxi today/),
    ).toBeTruthy();
    expect(within(all[9] as HTMLElement).getByText(/4 days ago/)).toBeTruthy();
  });

  it('a post page shows its comments; future posts stay hidden', async () => {
    useWorldStore.setState({ day: 5 });
    open('/post?id=tinfoil-recap');
    await finishLoad();
    const comments = await screen.findByRole('region', { name: 'Comments' });
    expect(within(comments).getByText(/THAT WAS ME/)).toBeTruthy();
    cleanup();

    useWorldStore.setState({ day: 4 });
    open('/post?id=tinfoil-recap');
    await finishLoad();
    expect(await screen.findByText(/doesnt exist \(yet\?\?\)/)).toBeTruthy();
  });

  it('the tag cloud links to a tag page', async () => {
    useWorldStore.setState({ day: 3 });
    const user = open('/');
    await finishLoad();
    await posts();
    const cloud = screen.getByRole('complementary');
    await user.click(within(cloud).getByRole('link', { name: 'starla vance' }));
    await finishLoad();
    expect(await screen.findByText(/posts tagged .starla vance./)).toBeTruthy();
    expect((await posts()).map((a) => a.getAttribute('aria-label'))).toEqual([
      'FEUD ALERT: Starla Vance + Dakota Sky wear THE SAME DRESS',
      'SPOTTED: Starla Vance buys FORTY scrunchies?!',
    ]);
  });

  it("lists the invented celebs on the Who's Who page", async () => {
    open('/celebs');
    await finishLoad();
    for (const name of [
      'Starla Vance',
      '4Ever Boulevard',
      'Bianca Goldcrest',
      'Rex Hammerton',
      'Tinfoil Comets',
    ])
      expect(await screen.findByRole('region', { name })).toBeTruthy();
  });

  it('the HOT or NOT vote persists and shows results', async () => {
    const user = open('/');
    await finishLoad();
    const poll = await screen.findByRole('region', { name: 'Poll' });
    await user.click(within(poll).getByRole('button', { name: 'VOTE!!!' }));
    expect(within(poll).getByRole('alert').textContent).toMatch(/pick 1/);
    await user.click(within(poll).getByRole('radio', { name: 'NOT' }));
    await user.click(within(poll).getByRole('button', { name: 'VOTE!!!' }));
    expect(useWebStore.getState().votes).toEqual({ scrunchies: 1 });
    expect(
      within(poll).getByRole('list', { name: 'Poll results' }),
    ).toBeTruthy();
    expect(within(poll).getByText(/NOT ← u/)).toBeTruthy();
    cleanup();

    // Reopening keeps the vote; the next day brings a new poll.
    open('/');
    await finishLoad();
    expect(
      await screen.findByRole('list', { name: 'Poll results' }),
    ).toBeTruthy();
    cleanup();
    useWorldStore.setState({ day: 2 });
    open('/');
    await finishLoad();
    const next = await screen.findByRole('region', { name: 'Poll' });
    expect(
      within(next).getByText(/Kyle without the frosted tips/),
    ).toBeTruthy();
    expect(
      within(next).getByRole('radio', { name: 'who is kyle' }),
    ).toBeTruthy();
  });
});
