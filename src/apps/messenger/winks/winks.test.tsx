import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import { WINK_IDS, type Script } from '@/content/types';
import * as sound from '@/os/sound';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import Chat from '../chat/Chat';
import { contactContent, line } from '../engine/test-helpers';
import { getMessengerEngine, setMessengerContentsForTests } from '../runtime';
import { useMessengerStore } from '../store';
import { WINK_MAX_MS, WINK_STILL_MS, WINKS } from './catalog';

const pickle: Script = {
  id: 'dance',
  trigger: { type: 'onSignIn' },
  start: 'a',
  nodes: { a: { lines: [line('look!!', 0, { wink: 'pickle' })], end: true } },
};

const contents = [
  contactContent('lena', [], { displayName: 'Lena' }),
  contactContent('max', [pickle], {
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
  setMessengerContentsForTests(contents);
});

afterEach(() => {
  setMessengerContentsForTests([]);
  vi.useRealTimers();
  vi.restoreAllMocks();
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia;
});

function renderChat(contactId: string) {
  const windowId = useWindowsStore
    .getState()
    .openApp('messenger-chat', { contactId });
  return render(<Chat windowId={windowId} props={{ contactId }} />);
}

async function signIn() {
  await act(async () => {
    getMessengerEngine().signIn();
    await vi.advanceTimersByTimeAsync(3000);
  });
}

const user = () => userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
const log = () => screen.getByRole('log', { name: 'Conversation' });
const overlay = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-wink]');

describe('wink catalog', () => {
  it('names every wink and keeps each at or under 4 s', () => {
    expect(Object.keys(WINKS).sort()).toEqual([...WINK_IDS].sort());
    for (const id of WINK_IDS) {
      expect(WINKS[id].durationMs).toBeGreaterThan(0);
      expect(WINKS[id].durationMs).toBeLessThanOrEqual(WINK_MAX_MS);
    }
  });
});

describe('sending winks', () => {
  it('the menu lists 6 winks with previews and is disabled while signed out', async () => {
    const u = user();
    renderChat('lena');
    const button = screen.getByRole('button', { name: 'Winks ▾' });
    expect(button).toBeDisabled();
    await signIn();
    expect(button).toBeEnabled();
    await u.click(button);
    const menu = screen.getByRole('menu', { name: 'Winks' });
    expect(within(menu).getAllByRole('menuitem')).toHaveLength(6);
    for (const id of WINK_IDS)
      expect(
        within(menu).getByRole('menuitem', { name: WINKS[id].name }),
      ).toBeTruthy();
    expect(menu.querySelectorAll('svg[data-wink-art]')).toHaveLength(6);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('is keyboard operable: arrows move in the 3×2 grid, Escape closes', async () => {
    const u = user();
    renderChat('lena');
    await signIn();
    const button = screen.getByRole('button', { name: 'Winks ▾' });
    button.focus();
    await u.keyboard('{Enter}');
    expect(screen.getByRole('menuitem', { name: 'Kiss' })).toHaveFocus();
    await u.keyboard('{ArrowRight}');
    expect(screen.getByRole('menuitem', { name: 'Hamster' })).toHaveFocus();
    await u.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Fireworks' })).toHaveFocus();
    await u.keyboard('{ArrowLeft}');
    expect(screen.getByRole('menuitem', { name: 'Pickle' })).toHaveFocus();
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();
    expect(button).toHaveFocus();
  });

  it('picking one adds the transcript line, plays notify and the wink once', async () => {
    stubReducedMotion(false);
    const u = user();
    const play = vi.spyOn(sound, 'playSound');
    const { container } = renderChat('lena');
    await signIn();
    await u.click(screen.getByRole('button', { name: 'Winks ▾' }));
    await u.click(screen.getByRole('menuitem', { name: 'Hamster' }));

    expect(screen.queryByRole('menu')).toBeNull();
    expect(log()).toHaveTextContent('You sent a wink: Hamster');
    expect(
      useMessengerStore.getState().progress.contacts.lena?.transcript.at(-1),
    ).toMatchObject({ kind: 'wink', from: 'player', wink: 'hamster' });
    expect(play).toHaveBeenCalledWith('notify');
    expect(overlay(container)?.dataset.wink).toBe('hamster');
    expect(overlay(container)?.dataset.still).toBeUndefined();

    await act(() => vi.advanceTimersByTimeAsync(WINKS.hamster.durationMs));
    expect(overlay(container)).toBeNull();
  });

  it('reduced motion shows the still frame for 1.5 s', async () => {
    stubReducedMotion(true);
    const u = user();
    const { container } = renderChat('lena');
    await signIn();
    await u.click(screen.getByRole('button', { name: 'Winks ▾' }));
    await u.click(screen.getByRole('menuitem', { name: 'Fireworks' }));
    expect(overlay(container)?.dataset.still).toBe('true');
    await act(() => vi.advanceTimersByTimeAsync(WINK_STILL_MS - 50));
    expect(overlay(container)).not.toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(50));
    expect(overlay(container)).toBeNull();
  });
});

describe('receiving winks', () => {
  it('a contact wink opens the chat like a nudge and plays there', async () => {
    const play = vi.spyOn(sound, 'playSound');
    await signIn(); // t = 3s; Max signs in at 60s and types 'look!!' for 240ms
    await act(() => vi.advanceTimersByTimeAsync(57_300));
    expect(useWindowsStore.getState().windows).toMatchObject([
      { appId: 'messenger-chat', props: { contactId: 'max' } },
    ]);
    expect(play).toHaveBeenCalledWith('notify');
    expect(play).not.toHaveBeenCalledWith('nudge');

    // The window mounts a moment later and still gets the wink.
    const win = useWindowsStore.getState().windows[0]!;
    const { container } = render(
      <Chat windowId={win.id} props={{ contactId: 'max' }} />,
    );
    expect(overlay(container)?.dataset.wink).toBe('pickle');
    expect(log()).toHaveTextContent('Max sent you a wink: Pickle');
  });
});
