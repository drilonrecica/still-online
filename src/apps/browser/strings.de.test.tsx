// P1-03: Web Explorer chrome, error page and About dialog in German.
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Browser from './Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from './store';

function render_(url?: string) {
  const windowId = useWindowsStore
    .getState()
    .openApp('browser', url ? { url } : {});
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={url ? { url } : {}} />);
  return user;
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    language: 'de',
  });
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
  useSettingsStore.setState({ language: 'en' });
  vi.useRealTimers();
});

describe('Web Explorer in German', () => {
  it('shows the toolbar, address bar and menus in German', async () => {
    render_('about.example');
    await act(() => vi.advanceTimersByTimeAsync(1400));
    expect(screen.getByLabelText('Adresse')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zurück' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Datei' })).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'Extras' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Fertig');
  });

  it('renders the error page in German for an unknown address', async () => {
    render_('nowhere.example');
    await act(() => vi.advanceTimersByTimeAsync(1400));
    expect(
      screen.getByText('Die Seite kann nicht angezeigt werden'),
    ).toBeInTheDocument();
    expect(screen.getByText('Mögliche Ursachen:')).toBeInTheDocument();
  });

  it('opens the About dialog in German', async () => {
    const user = render_('about.example');
    await act(() => vi.advanceTimersByTimeAsync(1400));
    await user.click(screen.getByRole('menuitem', { name: '?' }));
    await user.click(
      screen.getByRole('menuitem', { name: 'Info über Web Explorer' }),
    );
    expect(
      screen.getByRole('dialog', { name: 'Info über Web Explorer' }),
    ).toBeInTheDocument();
  });
});
