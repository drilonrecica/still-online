import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import type { Script } from '@/content/types';
import * as sound from '@/os/sound';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { MAX_TOASTS, TOAST_MS, useToastStore } from '@/os/toast/store';
import { ToastLayer } from '@/os/toast/ToastLayer';
import { contactContent, line } from './engine/test-helpers';
import { getMessengerEngine, setMessengerContentsForTests } from './runtime';
import { useMessengerStore } from './store';

const LONG = 'this is a very long message that goes on and on and on';

const chatty: Script = {
  id: 'hi',
  trigger: { type: 'onSignIn' },
  start: 'n',
  nodes: { n: { lines: [line(LONG, 0)], end: true } },
};

const contents = [
  contactContent('lena', [chatty], {
    displayName: 'Lena',
    signInAfterMs: 1000,
  }),
  contactContent('max', [], { displayName: 'Max', signInAfterMs: 5000 }),
  contactContent('ann', [], { displayName: 'Ann', signInAfterMs: 5000 }),
  contactContent('bo', [], { displayName: 'Bo', signInAfterMs: 5000 }),
];

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ shouldAdvanceTime: true });
  useSettingsStore.setState({ playerName: 'Drilon', muted: true });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useToastStore.getState().clear();
  setMessengerContentsForTests(contents);
});

afterEach(() => {
  setMessengerContentsForTests([]);
  useToastStore.getState().clear();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

async function advance(ms: number) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

async function signIn(ms = 4000) {
  await act(async () => {
    getMessengerEngine().signIn();
    await vi.advanceTimersByTimeAsync(ms);
  });
}

describe('toasts', () => {
  it('shows sign-in and message toasts with their sounds, then removes them', async () => {
    const play = vi.spyOn(sound, 'playSound');
    render(<ToastLayer />);
    await signIn();
    expect(screen.getByText('Lena has just signed in.')).toBeTruthy();
    expect(screen.getByText('Lena says:')).toBeTruthy();
    expect(screen.getByText(`${LONG.slice(0, 40)}…`)).toBeTruthy();
    // Like MSN: one sound for "signed in", another for a new message.
    expect(play.mock.calls.map(([name]) => name)).toEqual(['online', 'notify']);
    await advance(TOAST_MS + 100);
    expect(screen.queryByText('Lena says:')).toBeNull();
    expect(screen.queryByText('Lena has just signed in.')).toBeNull();
  });

  it('stacks at most three toasts', async () => {
    render(<ToastLayer />);
    await signIn(6000);
    expect(useToastStore.getState().toasts).toHaveLength(MAX_TOASTS);
  });

  it('opens the chat when a toast is clicked', async () => {
    render(<ToastLayer />);
    await signIn();
    await userEvent
      .setup({ advanceTimers: vi.advanceTimersByTime })
      .click(screen.getByText('Lena says:'));
    const chat = useWindowsStore
      .getState()
      .windows.find((w) => w.appId === 'messenger-chat');
    expect(chat?.props.contactId).toBe('lena');
    expect(screen.queryByText('Lena says:')).toBeNull();
  });

  it('is suppressed for the focused chat window', async () => {
    useWindowsStore.getState().openApp('messenger-chat', { contactId: 'lena' });
    render(<ToastLayer />);
    await signIn(6000);
    expect(screen.queryByText('Lena has just signed in.')).toBeNull();
    expect(screen.queryByText('Lena says:')).toBeNull();
    // Other contacts still toast.
    expect(screen.getByText('Max has just signed in.')).toBeTruthy();
  });
});
