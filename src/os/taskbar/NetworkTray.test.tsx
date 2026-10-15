import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import '@/apps/registry';
import { useBalloonStore } from '@/os/balloon/store';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { formatDuration, NetworkTray } from './NetworkTray';

const icon = () => screen.getByTestId('tray-network');

beforeEach(() => {
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: false,
    muted: true,
    seenTips: [],
  });
  useBalloonStore.getState().clear();
  useNetworkStore.getState().cancel();
  useNetworkStore.setState({
    status: 'offline',
    kbps: 0,
    phase: 'idle',
    connectedAt: null,
  });
});

describe('tray network icon', () => {
  it('formats the connection duration as hh:mm', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(65 * 60_000 + 59_000)).toBe('01:05');
  });

  it('reflects the status and opens the dial-up dialog when offline', async () => {
    const user = userEvent.setup();
    render(<NetworkTray />);
    expect(icon()).toHaveAttribute('data-status', 'offline');
    expect(icon()).toHaveAccessibleName('Network: Not connected');
    await user.click(icon());
    expect(useWindowsStore.getState().windows.map((w) => w.appId)).toEqual([
      'dialup',
    ]);
    act(() => useNetworkStore.setState({ status: 'dialing' }));
    expect(icon()).toHaveAttribute('data-status', 'dialing');
  });

  it('online: the menu disconnects', async () => {
    const user = userEvent.setup();
    useNetworkStore.setState({
      status: 'online',
      kbps: 56,
      phase: 'connected',
    });
    render(<NetworkTray />);
    await user.click(icon());
    const menu = screen.getByRole('menu');
    expect(screen.getByRole('menuitem', { name: 'Disconnect' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Status' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(menu).not.toBeInTheDocument();

    await user.click(icon());
    await user.click(screen.getByRole('menuitem', { name: 'Disconnect' }));
    expect(useNetworkStore.getState().status).toBe('offline');
    expect(icon()).toHaveAttribute('data-status', 'offline');
  });

  it('online: Status shows a balloon with speed and duration', async () => {
    const user = userEvent.setup();
    useNetworkStore.setState({
      status: 'online',
      kbps: 56,
      phase: 'connected',
      connectedAt: Date.now() - 3 * 60_000,
    });
    render(<NetworkTray />);
    await user.click(icon());
    await user.click(screen.getByRole('menuitem', { name: 'Status' }));
    expect(useBalloonStore.getState().current).toMatchObject({
      text: 'Connected at 56.0 Kbps · Duration 00:03',
      icon: 'network',
    });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
