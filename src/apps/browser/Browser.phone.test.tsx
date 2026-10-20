// v0.6 M2-02: Web Explorer on a phone (Fit to screen / Actual size, the condensed toolbar, the
// Favorites sheet) and the unchanged desktop chrome.
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeviceStore } from '@/os/device';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Browser from './Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from './store';

const LOAD = 1400;
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));

function renderBrowser(url = 'about.example') {
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return { user };
}

const viewport = () => screen.getByTestId('browser-viewport');

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({ connectAutomatically: true, muted: true });
  useWebStore.setState({
    ...WEB_DEFAULTS,
    favorites: [...DEFAULT_FAVORITES],
    fitToScreen: undefined,
  });
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
  useDeviceStore.setState({ device: 'phone' });
});

afterEach(() => {
  useNetworkStore.getState().cancel();
  useDeviceStore.setState({ device: 'desktop' });
  vi.useRealTimers();
});

describe('Web Explorer on a phone', () => {
  it('lays the page out at the 800 px virtual width, fitted by default', async () => {
    renderBrowser();
    await finishLoad();
    expect(viewport()).toHaveAttribute('data-view', 'fit');
    const page = screen.getByTestId('browser-page');
    expect(
      await within(page).findByRole('heading', {
        name: 'Welcome to Web Explorer!',
      }),
    ).toBeTruthy();
    // jsdom has no layout: the container is 0 wide, so the zoom falls back to 1.
    expect(page.style.zoom).toBe('1');
  });

  it('switches to Actual size from the View menu and remembers it', async () => {
    const { user } = renderBrowser();
    await finishLoad();
    await user.click(screen.getByRole('menuitem', { name: 'View' }));
    const fit = screen.getByRole('menuitemradio', { name: 'Fit to screen' });
    expect(fit).toHaveAttribute('aria-checked', 'true');
    await user.click(
      screen.getByRole('menuitemradio', { name: 'Actual size' }),
    );
    expect(useWebStore.getState().fitToScreen).toBe(false);
    expect(viewport()).toHaveAttribute('data-view', 'actual');
    expect(screen.getByTestId('browser-page').style.zoom).toBe('');
    await user.click(screen.getByRole('menuitem', { name: 'View' }));
    expect(
      screen.getByRole('menuitemradio', { name: 'Actual size' }),
    ).toHaveAttribute('aria-checked', 'true');
    await user.click(
      screen.getByRole('menuitemradio', { name: 'Fit to screen' }),
    );
    expect(useWebStore.getState().fitToScreen).toBe(true);
    expect(viewport()).toHaveAttribute('data-view', 'fit');
  });

  it('condenses the toolbar to icon buttons without Stop', async () => {
    renderBrowser();
    await finishLoad();
    const toolbar = screen.getByRole('toolbar', { name: 'Standard Buttons' });
    const names = within(toolbar)
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label'));
    expect(names).toEqual(['Back', 'Forward', 'Refresh', 'Home', 'Favorites']);
    expect(toolbar.textContent).toBe('');
  });

  it('opens Favorites as a sheet that closes on a choice or a tap beside it', async () => {
    const { user } = renderBrowser();
    await finishLoad();
    const star = screen.getByRole('button', { name: 'Favorites' });
    await user.click(star);
    const sheet = screen.getByTestId('favorites-sheet');
    expect(within(sheet).getByRole('complementary')).toBeTruthy();
    await user.click(sheet);
    expect(screen.queryByTestId('favorites-sheet')).toBeNull();

    await user.click(star);
    await user.click(
      within(screen.getByTestId('favorites-sheet')).getByRole('button', {
        name: 'Searchly',
      }),
    );
    expect(screen.queryByTestId('favorites-sheet')).toBeNull();
    expect(screen.getByLabelText('Address')).toHaveValue(
      'http://searchly.example/',
    );
  });

  it('names the View items in German', async () => {
    useSettingsStore.setState({ language: 'de' });
    const { user } = renderBrowser();
    await finishLoad();
    await user.click(screen.getByRole('menuitem', { name: 'Ansicht' }));
    expect(
      screen.getByRole('menuitemradio', { name: 'An Bildschirm anpassen' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('menuitemradio', { name: 'Originalgröße' }),
    ).toBeTruthy();
  });
});

describe('Web Explorer on a desktop', () => {
  beforeEach(() => useDeviceStore.setState({ device: 'desktop' }));

  it('keeps the full toolbar, an empty View menu, the side pane and no virtual page', async () => {
    useWebStore.setState({ fitToScreen: true });
    const { user } = renderBrowser();
    await finishLoad();
    expect(screen.getByRole('menuitem', { name: 'View' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Stop' })).toBeTruthy();
    expect(viewport()).not.toHaveAttribute('data-view');
    expect(screen.queryByTestId('browser-page')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Favorites' }));
    expect(screen.queryByTestId('favorites-sheet')).toBeNull();
    expect(
      screen.getByRole('complementary', { name: 'Favorites' }),
    ).toBeTruthy();
  });

  it("a finger's leftover hover never covers Done in the status bar", async () => {
    renderBrowser();
    await finishLoad();
    const status = screen.getAllByRole('status').at(-1)!;
    expect(status).toHaveTextContent('Done');
    const link = within(viewport()).getAllByRole('link')[0]!;
    fireEvent.pointerDown(viewport(), { pointerType: 'touch' });
    fireEvent.mouseEnter(link);
    expect(status).toHaveTextContent('Done');
    // A real mouse brings the link's address back.
    fireEvent.pointerMove(viewport(), { pointerType: 'mouse' });
    fireEvent.mouseEnter(link);
    expect(status).toHaveTextContent(/^http:\/\//);
  });
});
