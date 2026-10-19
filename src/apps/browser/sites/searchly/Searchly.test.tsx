import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';

const LOAD = 1400;

function open(url: string) {
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
  useSettingsStore.setState({ connectAutomatically: true, muted: true });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
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

describe('Searchly pages', () => {
  it('the home page has a hot sites box per gender', async () => {
    open('http://searchly.example/');
    await finishLoad();
    const hot = await screen.findByRole('region', {
      name: 'Hot sites this week!',
    });
    const links = () =>
      within(hot)
        .getAllByRole('link')
        .map((a) => a.textContent);
    expect(links()).toEqual([
      'Celeb Gossip 07',
      'Tinfoil Comets Fan Page',
      'Friendspace',
      'CheatCave',
      'Kickflip Kings',
    ]);
    expect(hot).toHaveTextContent(/gossip, glitter/);
    act(() => useSettingsStore.setState({ gender: 'boy' }));
    expect(links()).toEqual([
      'CheatCave',
      'Kickflip Kings',
      'Friendspace',
      'Celeb Gossip 07',
      'Tinfoil Comets Fan Page',
    ]);
    expect(hot).toHaveTextContent(/games, skating and funny clips/);
    expect(hot).not.toHaveTextContent(/glitter/i);
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(
      await screen.findByRole('region', {
        name: 'Die heißesten Seiten der Woche!',
      }),
    ).toHaveTextContent(/Täglich neu!/);
  });

  it('shows ranked results with green URLs for a query', async () => {
    open('http://searchly.example/search?q=surfing');
    await finishLoad();
    const link = await screen.findByRole('link', {
      name: 'Web Explorer Surfing Tips',
    });
    expect(link).toHaveAttribute('href', 'http://about.example/tips');
    expect(screen.getByText('about.example/tips')).toBeTruthy();
  });

  it('suggests a correction for a one-letter typo', async () => {
    open('http://searchly.example/search?q=surfin');
    await finishLoad();
    expect(await screen.findByText(/Did you mean/)).toBeTruthy();
  });

  it('shows friendly tips when nothing matches', async () => {
    open('http://searchly.example/search?q=qqqqzzzz');
    await finishLoad();
    expect((await screen.findAllByText(/couldn.t find any pages/)).length).toBe(
      1,
    );
  });

  it('Lucky opens the top result', async () => {
    const user = open('http://searchly.example/');
    await finishLoad();
    await user.type(await screen.findByLabelText('Search the web'), 'surfing');
    await user.click(screen.getByRole('button', { name: /Feeling Lucky/ }));
    await finishLoad();
    expect(screen.getByLabelText('Address')).toHaveValue(
      'http://about.example/tips',
    );
  });

  it('the toolbar link shows an install dialog stuck at 3%', async () => {
    const user = open('http://searchly.example/');
    await finishLoad();
    await user.click(await screen.findByText(/Searchly Toolbar/));
    expect(screen.getByText(/Installing Searchly Toolbar… 3%/)).toBeTruthy();
    await act(() => vi.advanceTimersByTimeAsync(30_000));
    expect(screen.getByText(/Installing Searchly Toolbar… 3%/)).toBeTruthy();
  });
});
