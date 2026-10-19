import { act, render, screen, within } from '@testing-library/react';
import { titleOf } from '@/test/windowTitle';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Browser from './Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from './store';
import { loadDuration } from './useNavigation';

/** Longest unscaled page load (400 + 900 ms) plus slack. */
const LOAD = 1400;

function setStatus(status: 'online' | 'offline') {
  useNetworkStore.setState({
    status,
    kbps: status === 'online' ? 56 : 0,
    phase: status === 'online' ? 'connected' : 'idle',
    connectedAt: null,
  });
}

function renderBrowser(url?: string) {
  const windowId = useWindowsStore
    .getState()
    .openApp('browser', url ? { url } : {});
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={url ? { url } : {}} />);
  const title = () => titleOf(windowId);
  return { user, windowId, title };
}

const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const status = () => screen.getByRole('status');

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({ connectAutomatically: true, muted: true });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
  setStatus('online');
});

afterEach(() => {
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('Web Explorer', () => {
  it('loads a page with status-bar progress, then shows it and the title', async () => {
    const { title } = renderBrowser('about.example');
    expect(screen.getByLabelText('Address')).toHaveValue(
      'http://about.example/',
    );
    expect(status()).toHaveTextContent('Opening page http://about.example/...');
    expect(screen.getByLabelText('Page loading')).toBeTruthy();
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Welcome to Web Explorer!' }),
    ).toBeTruthy();
    expect(status()).toHaveTextContent('Done');
    expect(screen.queryByLabelText('Page loading')).toBeNull();
    expect(title()).toBe('Welcome to Web Explorer - Web Explorer');
  });

  it('page loads last 400–1300 ms', () => {
    expect(loadDuration(() => 0)).toBe(400);
    expect(loadDuration(() => 0.999)).toBe(1299);
  });

  it('follows site links and walks Back/Forward', async () => {
    const { user, windowId } = renderBrowser('http://about.example/');
    await finishLoad();
    const back = screen.getByRole('button', { name: 'Back' });
    const forward = screen.getByRole('button', { name: 'Forward' });
    expect(back).toBeDisabled();

    const link = await screen.findByRole('link', { name: /Surfing Tips/ });
    await user.hover(link);
    expect(status()).toHaveTextContent('http://about.example/tips');
    await user.click(link);
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Surfing Tips' }),
    ).toBeTruthy();
    expect(screen.getByLabelText('Address')).toHaveValue(
      'http://about.example/tips',
    );
    expect(useWindowsStore.getState().windows[0]?.props).toEqual({
      url: 'http://about.example/tips',
    });
    expect(windowId).toBeTruthy();

    await user.click(back);
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Welcome to Web Explorer!' }),
    ).toBeTruthy();
    expect(forward).toBeEnabled();
    await user.click(forward);
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Surfing Tips' }),
    ).toBeTruthy();
    expect(forward).toBeDisabled();
  });

  it('typing an address navigates; Stop keeps the old page', async () => {
    const { user } = renderBrowser('about.example/tips');
    await finishLoad();
    const address = screen.getByLabelText('Address');
    await user.clear(address);
    await user.type(address, 'ABOUT.example{Enter}');
    expect(status()).toHaveTextContent('Opening page http://about.example/...');
    await user.click(screen.getByRole('button', { name: 'Stop' }));
    expect(status()).toHaveTextContent('Done');
    expect(screen.getByRole('heading', { name: 'Surfing Tips' })).toBeTruthy();
  });

  it('shows "cannot be displayed" for unknown hosts', async () => {
    const { title } = renderBrowser('http://nowhere.example/');
    await finishLoad();
    const page = screen.getByTestId('page-cannot-be-displayed');
    expect(page).toHaveTextContent('The page cannot be displayed');
    expect(page).toHaveTextContent('Most likely causes:');
    expect(page).toHaveTextContent('What you can try:');
    expect(page).not.toHaveTextContent('not connected');
    expect(title()).toBe('Cannot find server - Web Explorer');
  });

  it('offline: shows the error page, and Connect dials then reloads', async () => {
    setStatus('offline');
    const { user } = renderBrowser('about.example');
    await finishLoad();
    const page = screen.getByTestId('page-cannot-be-displayed');
    expect(page).toHaveTextContent('You are not connected to the Internet.');

    await user.click(within(page).getByRole('button', { name: 'Connect' }));
    expect(useWindowsStore.getState().windows.map((w) => w.appId)).toContain(
      'dialup',
    );
    expect(useNetworkStore.getState().status).toBe('dialing');
    await act(() => vi.advanceTimersByTimeAsync(6000));
    expect(useNetworkStore.getState().status).toBe('online');
    expect(status()).toHaveTextContent('Opening page http://about.example/');
    await finishLoad();
    expect(
      await screen.findByRole('heading', { name: 'Welcome to Web Explorer!' }),
    ).toBeTruthy();
  });

  it('adds and removes favorites from the Favorites menu', async () => {
    const { user } = renderBrowser('about.example');
    await finishLoad();
    await screen.findByRole('heading', { name: 'Welcome to Web Explorer!' });
    await user.click(screen.getByRole('menuitem', { name: 'Favorites' }));
    const menu = screen.getByRole('menu', { name: 'Favorites' });
    expect(
      within(menu).getByRole('menuitem', { name: 'Friendspace' }),
    ).toBeTruthy();
    await user.click(
      within(menu).getByRole('menuitem', { name: 'Add to Favorites...' }),
    );
    expect(useWebStore.getState().favorites.at(-1)).toEqual({
      title: 'Welcome to Web Explorer',
      url: 'http://about.example/',
    });

    await user.click(screen.getByRole('menuitem', { name: 'Favorites' }));
    await user.click(
      screen.getByRole('menuitem', { name: 'Remove from Favorites' }),
    );
    expect(useWebStore.getState().favorites).toHaveLength(5);
  });

  it('names the default favorites in the current language', async () => {
    const { user } = renderBrowser('about.example/tips');
    await finishLoad();
    await user.click(screen.getByRole('button', { name: 'Favorites' }));
    const pane = screen.getByRole('complementary', { name: 'Favorites' });
    expect(within(pane).getByText('Westfield High')).toBeTruthy();
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(within(pane).getByText('Westfield-Gymnasium')).toBeTruthy();
  });

  it('untouched favorites follow the gender; customized ones stay', async () => {
    const { user } = renderBrowser('about.example/tips');
    await finishLoad();
    await user.click(screen.getByRole('button', { name: 'Favorites' }));
    const pane = screen.getByRole('complementary', { name: 'Favorites' });
    expect(within(pane).getByText('Celeb Gossip 07')).toBeTruthy();
    act(() => useSettingsStore.setState({ gender: 'boy' }));
    expect(within(pane).getByText('CheatCave')).toBeTruthy();
    expect(within(pane).getByText('Kickflip Kings')).toBeTruthy();
    expect(within(pane).queryByText('Celeb Gossip 07')).toBeNull();
    await user.click(
      within(pane).getByRole('button', { name: 'Delete Westfield High' }),
    );
    act(() => useSettingsStore.setState({ gender: 'girl' }));
    expect(within(pane).getByText('CheatCave')).toBeTruthy();
    expect(within(pane).queryByText('Tinfoil Comets')).toBeNull();
  });

  it('the Favorites pane opens and deletes favorites', async () => {
    const { user } = renderBrowser('about.example/tips');
    await finishLoad();
    await user.click(screen.getByRole('button', { name: 'Favorites' }));
    const pane = screen.getByRole('complementary', { name: 'Favorites' });
    await user.click(
      within(pane).getByRole('button', { name: 'Delete Friendspace' }),
    );
    expect(useWebStore.getState().favorites.map((f) => f.url)).not.toContain(
      'http://friendspace.example/',
    );
    await user.click(within(pane).getByRole('button', { name: 'Searchly' }));
    expect(screen.getByLabelText('Address')).toHaveValue(
      'http://searchly.example/',
    );
  });

  it('only Favorites and Help are enabled; Help → About opens a dialog', async () => {
    const { user } = renderBrowser('about.example');
    for (const name of ['File', 'Edit', 'View', 'Tools'])
      expect(screen.getByRole('menuitem', { name })).toBeDisabled();
    await user.click(screen.getByRole('menuitem', { name: 'Help' }));
    await user.click(
      screen.getByRole('menuitem', { name: 'About Web Explorer' }),
    );
    const dialog = screen.getByRole('dialog', { name: 'About Web Explorer' });
    await user.click(within(dialog).getByRole('button', { name: 'OK' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Home goes to Searchly and defaults to it without a url', async () => {
    const { user } = renderBrowser();
    expect(screen.getByLabelText('Address')).toHaveValue(
      'http://searchly.example/',
    );
    await finishLoad();
    await user.click(screen.getByRole('button', { name: 'Home' }));
    expect(status()).toHaveTextContent('Opening page http://searchly.example/');
  });
});
