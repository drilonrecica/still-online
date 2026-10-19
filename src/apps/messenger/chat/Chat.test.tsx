import { act, render, screen, within } from '@testing-library/react';
import { titleOf } from '@/test/windowTitle';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import type { Script } from '@/content/types';
import * as sound from '@/os/sound';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { contactContent, line } from '../engine/test-helpers';
import { getMessengerEngine, setMessengerContentsForTests } from '../runtime';
import { useMessengerStore } from '../store';
import Chat from './Chat';
import { nudgeLimiter, SHAKE_MS } from './nudge';

const opening: Script = {
  id: 'opening',
  trigger: { type: 'onSignIn' },
  start: 'hi',
  nodes: {
    hi: {
      lines: [line('heyyy {name} :)', 0)],
      choices: [
        { text: 'hey lena!! whats up', label: 'Hey!', next: 'up' },
        { text: 'cant talk, brb', label: 'Busy', next: 'bye' },
      ],
    },
    up: { lines: [line('nm, u? (Y)', 500)], end: true },
    bye: { lines: [line('ok :(', 500)], end: true },
  },
};

const nudger: Script = {
  id: 'wake',
  trigger: { type: 'onSignIn' },
  start: 'n',
  nodes: { n: { lines: [line('WAKE UP', 0, { nudge: true })], end: true } },
};

const contents = [
  contactContent('lena', [opening], { displayName: 'Lena' }),
  contactContent('max', [nudger], {
    displayName: 'Max',
    signInAfterMs: 60_000,
  }),
];

function stubReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  useSettingsStore.setState({ playerName: 'Drilon', muted: true });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useWindowsStore.setState({ windows: [], topZ: 0 });
  nudgeLimiter.reset();
  setMessengerContentsForTests(contents);
});

afterEach(() => {
  setMessengerContentsForTests([]);
  vi.useRealTimers();
  vi.restoreAllMocks();
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia;
});

/** Opens the chat window for `contactId` in the store and renders it inside a window frame. */
function renderChat(contactId: string) {
  const windowId = useWindowsStore
    .getState()
    .openApp('messenger-chat', { contactId });
  render(
    <section data-window-id={windowId}>
      <Chat windowId={windowId} props={{ contactId }} />
    </section>,
  );
  return {
    windowId,
    frame: document.querySelector<HTMLElement>(
      `[data-window-id="${windowId}"]`,
    ),
  };
}

async function signIn() {
  await act(async () => {
    getMessengerEngine().signIn();
    await vi.advanceTimersByTimeAsync(3000);
  });
}

const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
const log = () => screen.getByRole('log', { name: 'Conversation' });
/** Transcript messages as `"<says line> <text>"`. */
const messages = () =>
  [...log().querySelectorAll('[data-from]')].map((el) =>
    [...el.children].map((c) => c.textContent?.trim()).join(' '),
  );

describe('chat window', () => {
  it('shows the contact header and titles the window', async () => {
    const { windowId } = renderChat('lena');
    await signIn();
    expect(screen.getByRole('banner')).toHaveTextContent(/To: .*Lena/);
    expect(screen.getByText('<lena@livemail.example>')).toBeTruthy();
    expect(screen.getByText("lena's pm")).toBeTruthy();
    expect(screen.getByRole('img', { name: "Lena's picture" })).toBeTruthy();
    const win = useWindowsStore
      .getState()
      .windows.find((w) => w.id === windowId);
    expect(titleOf(win?.id)).toBe('Lena - Conversation');
  });

  it('keeps the newest line in view after a language flip re-wraps the transcript', async () => {
    renderChat('lena');
    await signIn();
    const el = log();
    // jsdom has no layout: the transcript is 100px tall, its content 300px, then 400px in German.
    let height = 300;
    let top = 0;
    Object.defineProperty(el, 'scrollHeight', { get: () => height });
    Object.defineProperty(el, 'clientHeight', { get: () => 100 });
    Object.defineProperty(el, 'scrollTop', {
      get: () => top,
      set: (v: number) => (top = Math.min(v, height - 100)),
    });
    el.scrollTop = 300;
    el.dispatchEvent(new Event('scroll'));
    height = 400;
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(top).toBe(300);

    // Scrolled up to read: a flip back leaves the position alone.
    el.scrollTop = 50;
    el.dispatchEvent(new Event('scroll'));
    height = 300;
    act(() => useSettingsStore.setState({ language: 'en' }));
    expect(top).toBe(50);
  });

  it('renders "<name> says:" lines with emoticons', async () => {
    renderChat('lena');
    await signIn();
    const transcript = log();
    expect(messages()).toEqual(['Lena says: heyyy Drilon']);
    expect(within(transcript).getByRole('img', { name: ':)' })).toBeTruthy();
  });

  it('shows the typing indicator in the status bar', async () => {
    renderChat('lena');
    await act(async () => {
      getMessengerEngine().signIn();
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Lena is typing a message…',
    );
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('sending a choice advances the engine', async () => {
    const u = user();
    renderChat('lena');
    await signIn();

    const input = screen.getByLabelText('Message');
    const send = screen.getByRole('button', { name: 'Send' });
    expect(send).toBeDisabled();

    await u.click(screen.getByRole('button', { name: 'Hey!' }));
    expect(input).toHaveValue('hey lena!! whats up');
    expect(input).toHaveFocus();
    await u.keyboard('{Enter}');

    expect(messages()).toEqual([
      'Lena says: heyyy Drilon',
      'Drilon says: hey lena!! whats up',
    ]);
    expect(screen.queryByRole('group', { name: 'Replies' })).toBeNull();
    expect(input).toHaveValue('');

    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(messages().at(-1)).toBe('Lena says: nm, u?');
    expect(
      useMessengerStore.getState().progress.contacts.lena?.active,
    ).toBeNull();
  });

  it('the Send button sends the picked choice', async () => {
    const u = user();
    renderChat('lena');
    await signIn();
    await u.click(screen.getByRole('button', { name: 'Busy' }));
    await u.click(screen.getByRole('button', { name: 'Send' }));
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(messages().slice(1)).toEqual([
      'Drilon says: cant talk, brb',
      'Lena says: ok',
    ]);
  });

  it('marks messages read while the chat is the active window', async () => {
    renderChat('lena');
    await signIn();
    expect(useMessengerStore.getState().progress.contacts.lena?.unread).toBe(0);
  });

  it('disables replies and nudges while signed out', () => {
    renderChat('lena');
    expect(screen.getByRole('button', { name: 'Nudge' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(/signed out/);
  });
});

describe('nudges', () => {
  it('player nudge is rate-limited to one per 10s', async () => {
    const u = user();
    const nudge = vi.spyOn(getMessengerEngine(), 'playerNudge');
    renderChat('lena');
    await signIn();
    const button = screen.getByRole('button', { name: 'Nudge' });

    await u.click(button);
    expect(nudge).toHaveBeenCalledTimes(1);
    expect(log()).toHaveTextContent('You have just sent a nudge!');

    await u.click(button);
    expect(nudge).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toHaveTextContent(
      'You may not send a nudge so often',
    );

    await act(() => vi.advanceTimersByTimeAsync(10_000));
    await u.click(button);
    expect(nudge).toHaveBeenCalledTimes(2);
  });

  it('incoming nudge: line, nudge sound and a 500ms shake', async () => {
    stubReducedMotion(false);
    const play = vi.spyOn(sound, 'playSound');
    const { frame } = renderChat('max');
    await signIn(); // t = 3s; Max signs in at 60s and types 'WAKE UP' for 280ms
    await act(() => vi.advanceTimersByTimeAsync(57_300));

    expect(log()).toHaveTextContent('Max just sent you a nudge!');
    expect(play).toHaveBeenCalledWith('nudge');
    expect(frame?.dataset.shaking).toBe('true');
    await act(() => vi.advanceTimersByTimeAsync(SHAKE_MS));
    expect(frame?.dataset.shaking).toBeUndefined();
  });

  it('shake respects reduced motion (line and sound still happen)', async () => {
    stubReducedMotion(true);
    const play = vi.spyOn(sound, 'playSound');
    const { frame } = renderChat('max');
    await signIn();
    const shaking: (string | undefined)[] = [];
    const observer = new MutationObserver(() =>
      shaking.push(frame?.dataset.shaking),
    );
    if (frame) observer.observe(frame, { attributes: true });
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    observer.disconnect();

    expect(log()).toHaveTextContent('Max just sent you a nudge!');
    expect(play).toHaveBeenCalledWith('nudge');
    expect(shaking).toEqual([]);
    expect(frame?.dataset.shaking).toBeUndefined();
  });

  it('incoming nudge opens the chat window if it is closed', async () => {
    await signIn();
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(useWindowsStore.getState().windows).toMatchObject([
      { appId: 'messenger-chat', props: { contactId: 'max' } },
    ]);
  });
});
