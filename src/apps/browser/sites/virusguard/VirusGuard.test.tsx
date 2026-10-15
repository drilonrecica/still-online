import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VIRUSGUARD_HOST } from '@/content/sites/virusguard';
import { useNetworkStore } from '@/os/network';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Browser from '../../Browser';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  useWindowsStore.setState({ windows: [], topZ: 0 });
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

describe('virusguard.example', () => {
  it('opens from the balloon url; Buy only says payments are under construction', async () => {
    // The P1-04 balloon browses to the bare host.
    const url = `http://${VIRUSGUARD_HOST}`;
    const windowId = useWindowsStore.getState().openApp('browser', { url });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Browser windowId={windowId} props={{ url }} />);
    await act(() => vi.advanceTimersByTimeAsync(1400));
    expect(await screen.findByText(/87% INFECTED/)).toBeTruthy();
    expect(screen.getByText(/This is a joke website/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'BUY NOW!!!' }));
    expect(
      await screen.findByText(/Payment system under construction/),
    ).toBeTruthy();
  });
});
