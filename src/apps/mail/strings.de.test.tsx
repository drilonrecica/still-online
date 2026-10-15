// P1-03: the Mail chrome in German.
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { titleOf } from '@/test/windowTitle';
import '@/apps/registry';
import Mail from './Mail';
import { renderMails } from './records';
import {
  MAIL_DEFAULTS,
  cancelPendingReplies,
  playerAddress,
  useMailStore,
} from './store';

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

  it('shows delivered content mail in German and switches back with the language', async () => {
    useMailStore.getState().deliver(1);
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const windowId = useWindowsStore.getState().openApp('mail', {});
    render(<Mail windowId={windowId} props={{}} />);
    await user.click(screen.getByText('COMPUTER-REGELN (bitte lesen!!)'));
    expect(screen.getAllByText('Mama').length).toBeGreaterThan(0);
    expect(screen.getByText(/Hallo Schatz,/)).toBeInTheDocument();
    expect(screen.getByText('DAS IS JETZT PIAS EMAIL')).toBeInTheDocument();
    act(() => useSettingsStore.setState({ language: 'en' }));
    expect(screen.getByText(/Hi sweetie,/)).toBeInTheDocument();
    expect(screen.getByText('THIS IS PIAS EMAIL NOW')).toBeInTheDocument();
  });

  it("renders a friend's auto-reply in their German voice", () => {
    const [reply] = renderMails(
      [
        {
          id: 'm:1',
          folder: 'inbox',
          read: false,
          receivedAt: 0,
          kind: 'autoReply',
          contactId: 'marco',
          again: false,
          params: { subject: '' },
        },
      ],
      'de',
      playerAddress(),
    );
    expect(reply?.subject).toBe('AW: ');
    expect(reply?.body).toBe(
      'angekommen. antworte richtig, wenn ich zeit hab. - marco',
    );
  });
});
