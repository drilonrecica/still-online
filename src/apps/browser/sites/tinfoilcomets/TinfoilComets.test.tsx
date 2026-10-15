import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';

const LOAD = 1400;

function open(path: string) {
  const url = `http://${TINFOIL_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return user;
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const counter = () => screen.findByRole('img', { name: /visits$/ });

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

describe('tinfoilcomets.example', () => {
  it('home has the hamsters, construction sign, webring and counter', async () => {
    open('/');
    await finishLoad();
    expect(
      await screen.findByRole('img', { name: 'Eight dancing hamsters' }),
    ).toBeTruthy();
    expect(screen.getByText('UNDER CONSTRUCTION')).toBeTruthy();
    expect(screen.getByText(/Best viewed in 800x600/)).toBeTruthy();
    const ring = screen.getByRole('navigation', { name: 'Webring' });
    expect(within(ring).getByText('Random')).toBeTruthy();
    expect(within(ring).getByRole('link', { name: /Next/ })).toHaveAttribute(
      'href',
      expect.stringMatching(/^http:\/\/[a-z0-9-]+\.example\/$/),
    );
    expect((await counter()).getAttribute('aria-label')).toBe('004,203 visits');
  });

  it('the counter ticks up as you browse', async () => {
    const user = open('/');
    await finishLoad();
    await counter();
    const nav = screen.getByRole('navigation', { name: 'Site' });
    await user.click(within(nav).getByRole('link', { name: 'The Band' }));
    await finishLoad();
    expect((await counter()).getAttribute('aria-label')).toBe('004,204 visits');
    expect(useWebStore.getState().counters[TINFOIL_HOST]).toBe(2);
  });

  it('the MIDI button tells a muted player to turn the sound on', async () => {
    const user = open('/');
    await finishLoad();
    await user.click(
      await screen.findByRole('button', { name: /Play background MIDI/ }),
    );
    expect(screen.getByText(/ur sound is turned off/)).toBeTruthy();
  });

  it('band tour dates move on after the concert', async () => {
    open('/band');
    await finishLoad();
    expect(await screen.findByText('THIS FRIDAY!!!')).toBeTruthy();
    expect(screen.getByText('Ziggy Voltz')).toBeTruthy();
    cleanup();
    useWorldStore.setState({ day: 5 });
    open('/band');
    await finishLoad();
    expect(await screen.findByText('last friday')).toBeTruthy();
    expect(screen.queryByText('THIS FRIDAY!!!')).toBeNull();
  });

  it('pics are day-gated', async () => {
    open('/pics');
    await finishLoad();
    expect(await screen.findAllByRole('figure')).toHaveLength(4);
    cleanup();
    useWorldStore.setState({ day: 5 });
    open('/pics');
    await finishLoad();
    expect(await screen.findAllByRole('figure')).toHaveLength(8);
  });

  it("shows friends' entries by day", async () => {
    useWorldStore.setState({ day: 3 });
    open('/guestbook');
    await finishLoad();
    const list = await screen.findByRole('list', { name: 'Guestbook entries' });
    expect(within(list).getByText(/PONIES r better/)).toBeTruthy();
    expect(within(list).queryByText(/6\/10/)).toBeNull();
    expect(within(list).getByText(/WON TICKETS/)).toBeTruthy();
    expect(within(list).getAllByText(/signed today/).length).toBeGreaterThan(0);
  });

  it('the player signs it and the entry persists', async () => {
    useWorldStore.setState({ day: 2 });
    const user = open('/guestbook');
    await finishLoad();
    const name = await screen.findByLabelText('Name:');
    expect(name).toHaveValue('Ada');
    await user.click(screen.getByRole('button', { name: 'Sign it!!!' }));
    expect(screen.getByRole('alert')).toHaveTextContent(/write SOMETHING/);

    await user.type(screen.getByLabelText('Message:'), 'hamsters 4 ever');
    await user.type(screen.getByLabelText('Homepage:'), 'searchly.example');
    await user.click(screen.getByRole('button', { name: 'Sign it!!!' }));
    expect(screen.getByText(/THANK U 4 SIGNING/)).toBeTruthy();
    const list = screen.getByRole('list', { name: 'Guestbook entries' });
    const first = within(list).getAllByRole('listitem')[0];
    expect(first).toHaveTextContent('hamsters 4 ever');
    expect(within(first!).getByRole('link')).toHaveAttribute(
      'href',
      'http://searchly.example/',
    );
    expect(useWebStore.getState().guestbook[TINFOIL_HOST]).toEqual([
      {
        name: 'Ada',
        message: 'hamsters 4 ever',
        homepage: 'searchly.example',
        day: 2,
      },
    ]);
    const saved = localStorage.getItem('still-online:v1:web') ?? '';
    expect(saved).toContain('hamsters 4 ever');
  });
});
