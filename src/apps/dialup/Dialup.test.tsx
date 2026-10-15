import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { requireOnline, useNetworkStore } from '@/os/network';
import { NET_PHASE_MS } from '@/os/serviceTypes';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Dialup, { userNameFor } from './Dialup';

const net = () => useNetworkStore.getState();
const dialogIds = () =>
  useWindowsStore
    .getState()
    .windows.filter((w) => w.appId === 'dialup')
    .map((w) => w.id);

function renderDialog() {
  const windowId = useWindowsStore.getState().openApp('dialup');
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Dialup windowId={windowId} props={{}} />);
  return { user, windowId };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    playerName: 'Ada Lovelace',
    connectAutomatically: true,
    muted: true,
  });
  net().cancel();
  net().disconnect();
  useNetworkStore.setState({
    status: 'offline',
    kbps: 0,
    phase: 'idle',
    connectedAt: null,
  });
});

afterEach(() => {
  net().cancel();
  vi.useRealTimers();
});

describe('Connect to the Internet', () => {
  it('shows the XP form with the player as user name', () => {
    renderDialog();
    expect(userNameFor('Ada Lovelace')).toBe('adalovelace');
    expect(userNameFor('!!')).toBe('player');
    expect(screen.getByLabelText('User name:')).toHaveValue('adalovelace');
    expect(screen.getByLabelText('Password:')).toBeDisabled();
    expect(screen.getByLabelText('Save password')).toBeChecked();
    expect(screen.getByLabelText('Dial:')).toHaveValue('555-0137');
    expect(screen.getByLabelText('Connect automatically')).toBeChecked();
    for (const name of ['Dial', 'Cancel', 'Properties'])
      expect(screen.getByRole('button', { name })).toBeTruthy();
  });

  it('binds "Connect automatically" to the setting', async () => {
    const { user } = renderDialog();
    await user.click(screen.getByLabelText('Connect automatically'));
    expect(useSettingsStore.getState().connectAutomatically).toBe(false);
  });

  it('Dial walks through the phases, then closes itself', async () => {
    const { user } = renderDialog();
    await user.click(screen.getByRole('button', { name: 'Dial' }));
    const status = screen.getByTestId('dialup-status');
    expect(status).toHaveTextContent('Dialing…');
    expect(screen.getByRole('button', { name: 'Dial' })).toBeDisabled();

    await act(() => vi.advanceTimersByTimeAsync(NET_PHASE_MS.dialing));
    expect(status).toHaveTextContent('Verifying user name and password…');
    await act(() => vi.advanceTimersByTimeAsync(NET_PHASE_MS.verifying));
    expect(status).toHaveTextContent(
      'Registering your computer on the network…',
    );
    await act(() => vi.advanceTimersByTimeAsync(NET_PHASE_MS.registering));
    expect(net().status).toBe('online');
    expect(dialogIds()).toEqual([]);
  });

  it('auto-dials when opened by requireOnline', async () => {
    let result: boolean | undefined;
    act(() => {
      void requireOnline().then((ok) => (result = ok));
    });
    const [windowId = ''] = dialogIds();
    render(<Dialup windowId={windowId} props={{}} />);
    expect(screen.getByTestId('dialup-status')).toHaveTextContent('Dialing…');
    await act(() => vi.advanceTimersByTimeAsync(5700));
    expect(result).toBe(true);
  });

  it('does not dial on open when "Connect automatically" is off', () => {
    useSettingsStore.setState({ connectAutomatically: false });
    act(() => {
      void requireOnline();
    });
    expect(net().status).toBe('offline');
    expect(dialogIds()).toHaveLength(1);
  });

  it('Cancel aborts a dial, then closes the dialog when idle', async () => {
    const { user } = renderDialog();
    await user.click(screen.getByRole('button', { name: 'Dial' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(net().status).toBe('offline');
    expect(dialogIds()).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Dial' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(dialogIds()).toEqual([]);
  });

  it('shows the speed when opened while online', () => {
    useNetworkStore.setState({
      status: 'online',
      kbps: 56,
      phase: 'connected',
    });
    renderDialog();
    expect(screen.getByTestId('dialup-status')).toHaveTextContent(
      'Connected at 56.0 Kbps.',
    );
    expect(screen.getByRole('button', { name: 'Dial' })).toBeDisabled();
  });
});
