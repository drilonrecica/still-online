// P1-03: TuneMole chrome and download status labels in German.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TUNEMOLE_RESULTS } from '@/content/tunemole';
import type { TuneMoleResult } from '@/content/types';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import TuneMole from './TuneMole';
import { useTuneMoleStore } from './store';

const TRACK = TUNEMOLE_RESULTS.find(
  (r) => r.kind === 'track',
) as TuneMoleResult;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    language: 'de',
  });
  useTuneMoleStore.getState().reset();
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
});

afterEach(() => {
  useTuneMoleStore.getState().reset();
  useNetworkStore.getState().cancel();
  useSettingsStore.setState({ language: 'en' });
  vi.useRealTimers();
});

describe('TuneMole in German', () => {
  it('shows tabs, search hint and status in German', async () => {
    const windowId = useWindowsStore.getState().openApp('tunemole');
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TuneMole windowId={windowId} props={{}} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Verbunden mit 1.337 Peers',
    );
    expect(screen.getByRole('tab', { name: 'Suche' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Bibliothek' })).toBeInTheDocument();
    expect(
      screen.getByText(/Geben Sie einen Titel oder eine Band ein/),
    ).toBeInTheDocument();

    useTuneMoleStore.getState().start(TRACK);
    await user.click(screen.getByRole('tab', { name: 'Downloads' }));
    expect(screen.getByText('Verbinde…')).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Bibliothek' }));
    expect(screen.getByText('Ihre Bibliothek ist leer.')).toBeInTheDocument();
  });
});
