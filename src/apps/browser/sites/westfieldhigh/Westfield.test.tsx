import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WESTFIELD_HOST } from '@/content/sites/westfieldhigh';
import { useNetworkStore } from '@/os/network';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';

const LOAD = 1400;

function open(path: string) {
  const url = `http://${WESTFIELD_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  render(<Browser windowId={windowId} props={{ url }} />);
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const titles = async () =>
  (await screen.findAllByRole('article')).map((a) =>
    a.getAttribute('aria-label'),
  );

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
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

describe('westfield-high.example', () => {
  it('home shows the welcome and the newest announcements by day', async () => {
    open('/');
    await finishLoad();
    expect(await titles()).toEqual([
      'Wildcat Bake Sale: Volunteers Needed',
      'Biology: Cell Project Models Due at the End of the Week',
    ]);
    expect(
      screen.getByText(/Welcome to the Westfield High School Web Site/),
    ).toBeTruthy();
    expect(screen.queryByRole('link', { name: /More news/ })).toBeNull();
    cleanup();

    useWorldStore.setState({ day: 5 });
    open('/');
    await finishLoad();
    expect(await titles()).toEqual([
      'Bake Sale Results',
      'Biology: Cell Project Grades Posted',
      'Science Fair Sign-Ups Now Open',
    ]);
    expect(screen.getByRole('link', { name: /More news/ })).toBeTruthy();
  });

  it('the news board lists every post out by today', async () => {
    useWorldStore.setState({ day: 3 });
    open('/news');
    await finishLoad();
    const news = await titles();
    expect(news).toHaveLength(6);
    expect(news).toContain('Reminder: No MP3 Players in Class');
    expect(news).toContain('Biology: A Note About Jello');
    expect(news).not.toContain('Biology: Cell Project Grades Posted');
    expect(screen.getAllByText(/Posted today by/)).toHaveLength(2);
  });

  it('the staff page lists Mr Dalton, Biology, Room 12', async () => {
    open('/staff');
    await finishLoad();
    const row = (await screen.findByText('Mr Dalton')).closest('tr');
    expect(row).toBeTruthy();
    expect(within(row as HTMLElement).getByText('Biology')).toBeTruthy();
    expect(within(row as HTMLElement).getByText('Room 12')).toBeTruthy();
  });

  it('the cafeteria menu renders, with no hit counter anywhere', async () => {
    open('/cafeteria');
    await finishLoad();
    expect(await screen.findByText("Chef's Surprise Loaf")).toBeTruthy();
    expect(screen.queryByRole('img', { name: /visits/ })).toBeNull();
  });
});
