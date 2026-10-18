import { act, render, screen, waitFor, within } from '@testing-library/react';
import { titleOf } from '@/test/windowTitle';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MailContent } from '@/content/mail/types';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useNetworkStore } from '@/os/network';
import { useWorldStore } from '@/os/world';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import Mail from './Mail';
import {
  MAIL_DEFAULTS,
  cancelPendingReplies,
  installMailDelivery,
  playerAddress,
  useMailStore,
} from './store';
import { renderMails } from './records';

/** The mailbox as the player reads it, in English. */
const shown = () =>
  renderMails(useMailStore.getState().messages, 'en', playerAddress(), 'girl');

const CONTENT: MailContent[] = [
  {
    id: 'd1-a',
    day: 1,
    from: { name: 'Mom', address: 'mom@homemail.example' },
    subject: 'dinner at 6',
    body: 'See http://searchly.example/ for recipes.',
  },
  {
    id: 'd1-b',
    day: 1,
    from: { name: 'Jess', address: 'jess@livemail.example' },
    subject: 'itinerary',
    body: 'attached!',
    attachments: [{ name: 'itinerary.txt', type: 'txt', text: 'Fri: concert' }],
  },
  {
    id: 'd2-a',
    day: 2,
    from: { name: 'Friendspace', address: 'noreply@friendspace.example' },
    subject: '3 people viewed your profile',
    body: 'wow',
  },
];

function setStatus(status: 'online' | 'offline') {
  useNetworkStore.setState({
    status,
    kbps: status === 'online' ? 56 : 0,
    phase: status === 'online' ? 'connected' : 'idle',
    connectedAt: null,
  });
}

function renderMail() {
  const windowId = useWindowsStore.getState().openApp('mail', {});
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Mail windowId={windowId} props={{}} />);
  return user;
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({ connectAutomatically: true, muted: true });
  useMailStore.setState({ ...MAIL_DEFAULTS, messages: [], deliveredDays: [] });
  setStatus('online');
});

afterEach(() => {
  cancelPendingReplies();
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('mail store', () => {
  it('delivers each day once, only up to the current day', () => {
    const { deliver } = useMailStore.getState();
    expect(deliver(1, CONTENT, 1_000_000)).toBe(2);
    expect(useMailStore.getState().deliveredDays).toEqual([1]);
    expect(deliver(1, CONTENT)).toBe(0);
    expect(deliver(2, CONTENT)).toBe(1);
    const msgs = useMailStore.getState().messages;
    expect(msgs).toHaveLength(3);
    expect(msgs.every((m) => m.folder === 'inbox' && !m.read)).toBe(true);
    expect(msgs.every((m) => m.receivedAt < 1_000_000 || m.id === 'd2-a')).toBe(
      true,
    );
  });

  it("sorts a new day's mail above earlier days, however soon the day starts", () => {
    const { deliver } = useMailStore.getState();
    const day1 = 10 * 3_600_000;
    deliver(1, CONTENT, day1);
    deliver(2, CONTENT, day1 + 3 * 60_000); // day 2 booted three minutes later
    const at = (id: string) =>
      useMailStore.getState().messages.find((m) => m.id === id)!.receivedAt;
    expect(at('d2-a')).toBeGreaterThan(Math.max(at('d1-a'), at('d1-b')));
  });

  it('delivers a catch-up batch day by day', () => {
    useMailStore.getState().deliver(2, CONTENT, 10 * 3_600_000);
    const order = useMailStore
      .getState()
      .messages.slice()
      .sort((a, b) => b.receivedAt - a.receivedAt)
      .map((m) => m.id);
    expect(order[0]).toBe('d2-a');
  });

  it('delivers when the connection comes up', () => {
    const off = installMailDelivery();
    useWorldStore.setState({ day: 1 });
    useMailStore.setState({ messages: [], deliveredDays: [] });
    events.emit('network:connected', { kbps: 56 });
    off();
    const { messages } = useMailStore.getState();
    // The shipped content is authored in P4-07; whatever is due for day 1 arrives, once.
    expect(messages.every((m) => m.folder === 'inbox' && !m.read)).toBe(true);
  });

  it('bounces mail to a non-friend', () => {
    useMailStore
      .getState()
      .send({ to: 'nobody@nowhere.example', subject: 'hi', body: 'x' });
    const msgs = shown();
    expect(msgs.find((m) => m.folder === 'sent')?.subject).toBe('hi');
    const bounce = msgs.find((m) => m.folder === 'inbox');
    expect(bounce?.from.name).toBe('Mail Delivery Subsystem');
    expect(bounce?.read).toBe(false);
  });

  it('answers a friend after a delay, then with the "again" line', async () => {
    const { contacts } = await import('@/content/contacts');
    const handle = contacts.find((c) => c.contact.id === 'pia')!.contact.handle;
    const go = () =>
      useMailStore.getState().send({ to: handle, subject: 'hey', body: 'x' });
    go();
    expect(
      useMailStore.getState().messages.filter((m) => m.folder === 'inbox'),
    ).toHaveLength(0);
    await act(() => vi.advanceTimersByTimeAsync(20_000));
    const first = shown().filter((m) => m.folder === 'inbox');
    expect(first).toHaveLength(1);
    go();
    await act(() => vi.advanceTimersByTimeAsync(20_000));
    const all = shown().filter((m) => m.folder === 'inbox');
    expect(all).toHaveLength(2);
    expect(all[1]?.body).toMatch(/chat/i);
    expect(all[1]?.body).not.toBe(first[0]?.body);
  });

  it('moves to Deleted Items, then deletes for good', () => {
    useMailStore.getState().deliver(1, CONTENT);
    const { remove } = useMailStore.getState();
    remove('d1-a');
    expect(
      useMailStore.getState().messages.find((m) => m.id === 'd1-a')?.folder,
    ).toBe('deleted');
    remove('d1-a');
    expect(useMailStore.getState().messages.some((m) => m.id === 'd1-a')).toBe(
      false,
    );
  });
});

describe('Mail app', () => {
  beforeEach(() => {
    useMailStore.getState().deliver(2, CONTENT);
  });

  it('shows unread in bold and marks read on open', async () => {
    const user = renderMail();
    const row = screen.getByText('dinner at 6').closest('tr')!;
    expect(row).toHaveAttribute('data-unread', 'true');
    await user.click(row);
    expect(row).toHaveAttribute('data-unread', 'false');
    expect(
      useMailStore.getState().messages.find((m) => m.id === 'd1-a')?.read,
    ).toBe(true);
  });

  it('opens links in Web Explorer', async () => {
    const handler = vi.fn();
    const off = events.on('browser:open', handler);
    const user = renderMail();
    await user.click(screen.getByText('dinner at 6'));
    await user.click(
      screen.getByRole('link', { name: 'http://searchly.example/' }),
    );
    expect(handler).toHaveBeenCalledWith({ url: 'http://searchly.example/' });
    off();
  });

  it('saves an attachment to My Documents and opens it', async () => {
    const user = renderMail();
    await user.click(screen.getByText('itinerary'));
    await user.click(screen.getByRole('button', { name: /itinerary\.txt/ }));
    const saved = useFsStore
      .getState()
      .list(FS_FOLDERS.docs)
      .find((n) => n.name === 'itinerary.txt');
    expect(saved?.text).toBe('Fri: concert');
    expect(
      useWindowsStore.getState().windows.some((w) => w.appId === 'notepad'),
    ).toBe(true);
  });

  it('composes, sends and files the mail under Sent Items', async () => {
    const user = renderMail();
    await user.click(screen.getByRole('button', { name: 'Create Mail' }));
    const form = screen.getByRole('form', { name: 'Create Mail' });
    await user.type(within(form).getByLabelText('To'), 'x@nowhere.example');
    await user.type(within(form).getByLabelText('Subject'), 'hello');
    await user.click(within(form).getByRole('button', { name: 'Send' }));
    await act(() => vi.advanceTimersByTimeAsync(0));
    expect(
      shown().some((m) => m.folder === 'sent' && m.subject === 'hello'),
    ).toBe(true);
    expect(screen.getByText('hello')).toBeTruthy();
  });

  it('renders folders, the title and generated mail in German after a switch', async () => {
    useMailStore
      .getState()
      .send({ to: 'nobody@nowhere.example', subject: '', body: 'x' });
    renderMail();
    const windowId = useWindowsStore.getState().windows[0]?.id;
    expect(screen.getByText('Undeliverable: (no subject)')).toBeTruthy();
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(
      screen.getByRole('button', { name: 'Posteingang (4)' }),
    ).toBeTruthy();
    expect(screen.getByText('Unzustellbar: (kein Betreff)')).toBeTruthy();
    await waitFor(() =>
      expect(titleOf(windowId)).toBe('Posteingang (4) - Mail'),
    );
  });

  it('shows the offline notice with Connect', () => {
    setStatus('offline');
    renderMail();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Working offline. Connect to send and receive.',
    );
    expect(screen.getByRole('button', { name: 'Inbox (3)' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Connect' })).toBeTruthy();
  });
});
