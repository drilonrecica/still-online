// P1-03: the Mail chrome in German.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { titleOf } from '@/test/windowTitle';
import '@/apps/registry';
import Mail from './Mail';
import { MAIL_DEFAULTS, cancelPendingReplies, useMailStore } from './store';

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    language: 'de',
  });
  useMailStore.setState({ ...MAIL_DEFAULTS, messages: [], deliveredDays: [] });
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
});

afterEach(() => {
  cancelPendingReplies();
  useNetworkStore.getState().cancel();
  useSettingsStore.setState({ language: 'en' });
  vi.useRealTimers();
});

describe('Mail in German', () => {
  it('shows folders, toolbar and empty state in German', async () => {
    const windowId = useWindowsStore.getState().openApp('mail', {});
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Mail windowId={windowId} props={{}} />);
    expect(
      screen.getByRole('button', { name: 'Posteingang' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Gesendete Objekte' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Gelöschte Objekte' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Neue Nachricht' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('In diesem Ordner befinden sich keine Nachrichten.'),
    ).toBeInTheDocument();
    expect(titleOf(windowId)).toBe('Posteingang - Mail');
    await user.click(screen.getByRole('button', { name: 'Neue Nachricht' }));
    expect(screen.getByLabelText('Betreff')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Senden' })).toBeInTheDocument();
  });
});
