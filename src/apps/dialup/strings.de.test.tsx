// P1-03: the dial-up dialog in German.
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStore } from '@/os/network';
import { NET_PHASE_MS } from '@/os/serviceTypes';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Dialup from './Dialup';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    playerName: 'Ada',
    connectAutomatically: false,
    muted: true,
    language: 'de',
  });
  useNetworkStore.getState().cancel();
  useNetworkStore.getState().disconnect();
});

afterEach(() => {
  useNetworkStore.getState().cancel();
  useSettingsStore.setState({ language: 'en' });
  vi.useRealTimers();
});

describe('Dial-up in German', () => {
  it('shows the labels, buttons and dialing status in German', async () => {
    const windowId = useWindowsStore.getState().openApp('dialup');
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Dialup windowId={windowId} props={{}} />);
    expect(screen.getByLabelText('Benutzername:')).toBeInTheDocument();
    expect(screen.getByLabelText('Kennwort:')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Eigenschaften' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Wählen' }));
    expect(screen.getByTestId('dialup-status')).toHaveTextContent('Wählen…');
    await act(() => vi.advanceTimersByTimeAsync(NET_PHASE_MS.dialing));
    expect(screen.getByTestId('dialup-status')).toHaveTextContent(
      'Benutzername und Kennwort werden überprüft…',
    );
  });
});
