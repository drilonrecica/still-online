import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import type { Script, TranscriptEntry } from '@/content/types';
import { installIdle } from '@/os/idle';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useToastStore } from '@/os/toast/store';
import { useWorldStore } from '@/os/world';
import Messenger from './Messenger';
import { summarizeAway } from './awaySummary';
import { AWAY_REPLY_DELAY_MS } from './engine/runner';
import { contactContent, line } from './engine/test-helpers';
import { getMessengerEngine, setMessengerContentsForTests } from './runtime';
import { useMessengerStore } from './store';

const MIN = 60_000;

const hello = (id: string, at: number): Script => ({
  id: `hi-${id}`,
  trigger: { type: 'afterMinutes', minutes: at },
  start: 'n',
  nodes: { n: { lines: [line(`ping from ${id}`, 0)], end: true } },
});

const contents = [
  contactContent('lena', [hello('lena', 10)], {
    displayName: 'Lena',
    awayReply: 'away? ok',
  }),
  contactContent('max', [hello('max', 20)], { displayName: 'Max' }),
];

let uninstall: () => void;

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: false });
  useSettingsStore.setState({
    playerName: 'Drilon',
    muted: true,
    awayMinutes: 5,
    awayMessage: 'brb',
  });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useToastStore.getState().clear();
  useWorldStore.setState({ day: 1 });
  uninstall = installIdle();
  setMessengerContentsForTests(contents);
});

afterEach(() => {
  setMessengerContentsForTests([]);
  uninstall();
  useToastStore.getState().clear();
  vi.useRealTimers();
});

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

async function signIn() {
  await act(async () => {
    getMessengerEngine().signIn();
    await vi.advanceTimersByTimeAsync(0);
  });
}

const player = () => useMessengerStore.getState().progress.player;
const input = () => act(() => void window.dispatchEvent(new Event('keydown')));

describe('auto-away', () => {
  it('goes Away with the message when idle, and back Online on input', async () => {
    await signIn();
    await advance(5 * MIN);
    expect(player().status).toBe('away');
    expect(player().autoAway).toBe(true);
    expect(player().awayMessage).toBe('brb');
    input();
    expect(player().status).toBe('online');
    expect(player().autoAway).toBe(false);
    expect(player().awaySince).toBeNull();
  });

  it('respects awayMinutes = 0 and a changed awayMinutes', async () => {
    useSettingsStore.setState({ awayMinutes: 0 });
    await signIn();
    await advance(30 * MIN);
    expect(player().status).toBe('online');
    act(() => useSettingsStore.getState().setAwayMinutes(2));
    input();
    await advance(2 * MIN);
    expect(player().status).toBe('away');
  });

  it('only fires from Online, and not while signed out', async () => {
    await signIn();
    useMessengerStore.getState().setPlayerStatus('busy');
    await advance(6 * MIN);
    expect(player().status).toBe('busy');
    act(() => getMessengerEngine().signOut());
    useMessengerStore.getState().setPlayerStatus('online');
    input();
    await advance(6 * MIN);
    expect(player().status).toBe('online');
  });

  it('does not restore a manual Away on input', async () => {
    await signIn();
    act(() => useMessengerStore.getState().goAway('lunch', false));
    await advance(6 * MIN);
    input();
    expect(player().status).toBe('away');
    expect(player().awayMessage).toBe('lunch');
  });
});

describe('while you were away', () => {
  it('flags messages, summarises on return and opens the latest chat', async () => {
    await signIn();
    act(() => useMessengerStore.getState().goAway('brb', false));
    await advance(21 * MIN);
    const lena = useMessengerStore.getState().progress.contacts.lena!;
    const flagged = lena.transcript.filter(
      (e) => e.kind === 'message' && e.whileAway === true,
    );
    expect(flagged.length).toBeGreaterThan(0);

    render(<div />);
    act(() => useMessengerStore.getState().setPlayerStatus('online'));
    const toast = useToastStore
      .getState()
      .toasts.find((t) => t.title === 'While you were away');
    expect(toast?.title).toBe('While you were away');
    expect(toast?.text).toMatch(/^3 messages from Max, Lena$/);
    act(() => toast?.onClick?.());
    const chat = useWindowsStore
      .getState()
      .windows.find((w) => w.appId === 'messenger-chat');
    expect(chat?.props.contactId).toBe('max');
  });

  it('shows no toast when nothing arrived, and none for messages from before', async () => {
    await signIn();
    await advance(10 * MIN); // lena speaks while Online
    act(() => useMessengerStore.getState().goAway('brb', false));
    act(() => useMessengerStore.getState().setPlayerStatus('online'));
    expect(
      useToastStore
        .getState()
        .toasts.some((t) => t.title === 'While you were away'),
    ).toBe(false);
  });

  it('sends awayReply once per day', async () => {
    const chatty: Script = {
      id: 'chat',
      trigger: { type: 'afterMinutes', minutes: 1 },
      start: 'n',
      nodes: { n: { lines: [line('one', 0), line('two', 0)], end: true } },
    };
    setMessengerContentsForTests([
      contactContent('lena', [chatty], { awayReply: 'away? ok' }),
    ]);
    await signIn();
    act(() => useMessengerStore.getState().goAway('brb', false));
    await advance(MIN + AWAY_REPLY_DELAY_MS + 2000);
    const texts = () =>
      useMessengerStore
        .getState()
        .progress.contacts.lena!.transcript.map((e) =>
          e.kind === 'message' ? e.text : '',
        );
    expect(texts()).toEqual(['one', 'two', 'away? ok']);
    expect(
      useMessengerStore.getState().progress.contacts.lena!.awayReplyDay,
    ).toBe(1);
  });

  it('does not send awayReply while Online', async () => {
    const chatty: Script = {
      id: 'chat',
      trigger: { type: 'afterMinutes', minutes: 1 },
      start: 'n',
      nodes: { n: { lines: [line('one', 0)], end: true } },
    };
    setMessengerContentsForTests([
      contactContent('lena', [chatty], { awayReply: 'away? ok' }),
    ]);
    await signIn();
    await advance(MIN + AWAY_REPLY_DELAY_MS + 2000);
    const t = useMessengerStore.getState().progress.contacts.lena!.transcript;
    expect(t).toHaveLength(1);
  });
});

describe('summarizeAway', () => {
  const at = (n: number, whileAway = true): TranscriptEntry =>
    whileAway
      ? { kind: 'message', from: 'contact', text: 'x', at: n, whileAway: true }
      : { kind: 'message', from: 'contact', text: 'x', at: n };
  const base = {
    everSignedIn: true,
    status: 'online' as const,
    personalMessage: '',
    active: null,
    queue: [],
    scripts: {},
    unread: 0,
    presenceDay: 1,
  };

  it('counts flagged messages since the cutoff, newest contact first', () => {
    const out = summarizeAway(
      {
        a: { ...base, transcript: [at(5), at(1)] },
        b: { ...base, transcript: [at(9), at(8, false)] },
      },
      3,
      (id) => id.toUpperCase(),
    );
    expect(out).toEqual({
      text: '2 messages from B, A',
      latestContactId: 'b',
      total: 2,
    });
  });

  it('is null with nothing flagged', () => {
    expect(
      summarizeAway({ a: { ...base, transcript: [at(5, false)] } }, 0, String),
    ).toBeNull();
  });
});

describe('Messenger UI', () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  it('asks for an away message (prefilled) and shows it in the header', async () => {
    const user = userEvent.setup({ delay: null });
    useMessengerStore.setState({ signedIn: true });
    render(<Messenger />);
    await user.selectOptions(screen.getByLabelText('My status'), 'away');
    const input = screen.getByLabelText(
      /Show this message while you're away/,
    ) as HTMLInputElement;
    expect(input.value).toBe('brb');
    await user.clear(input);
    await user.type(input, 'at lunch');
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(player().status).toBe('away');
    expect(player().awayMessage).toBe('at lunch');
    expect(player().autoAway).toBe(false);
    expect(screen.getByText('(Away: at lunch)')).toBeTruthy();
  });

  it('cancelling the prompt keeps the status', async () => {
    const user = userEvent.setup({ delay: null });
    useMessengerStore.setState({ signedIn: true });
    render(<Messenger />);
    await user.selectOptions(screen.getByLabelText('My status'), 'away');
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(player().status).toBe('online');
  });

  it('Options saves the away settings', async () => {
    const user = userEvent.setup({ delay: null });
    useMessengerStore.setState({ signedIn: true });
    render(<Messenger />);
    await user.click(screen.getByRole('menuitem', { name: 'File' }));
    await user.click(screen.getByRole('menuitem', { name: 'Options…' }));
    const minutes = screen.getByLabelText(/idle minutes/);
    await user.clear(minutes);
    await user.type(minutes, '12');
    const msg = screen.getByLabelText('Away message:');
    await user.clear(msg);
    await user.type(msg, 'gone fishing');
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(useSettingsStore.getState().awayMinutes).toBe(12);
    expect(useSettingsStore.getState().awayMessage).toBe('gone fishing');
  });
});
