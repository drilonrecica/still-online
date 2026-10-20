import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import { IDLE_JOKES, TIPS } from '@/content/assistant';
import { useDeviceStore } from '@/os/device';
import { events } from '@/os/events';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { TASKBAR_HEIGHT } from '@/os/types';
import { Assistant, STATUS_BAR_LIFT } from './Assistant';
import { createJokeCycle, installAssistant } from './controller';
import { useAssistantStore } from './store';

const tip = (id: string) => TIPS.find((t) => t.id === id)!;
const balloon = () =>
  document.querySelector<HTMLElement>('[data-assistant-balloon]');

beforeEach(() => {
  vi.useFakeTimers();
  useSettingsStore.setState({ assistantEnabled: true, seenTips: [] });
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useAssistantStore.getState().clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('content', () => {
  it('has unique tip ids and the spec triggers', () => {
    const all = [...TIPS, ...IDLE_JOKES];
    expect(new Set(all.map((t) => t.id)).size).toBe(all.length);
    expect(IDLE_JOKES).toHaveLength(8);
    expect(TIPS.map((t) => t.trigger)).toEqual(
      expect.arrayContaining([
        { app: 'paint' },
        { app: 'mail' },
        { app: 'mines' },
        { event: 'firstBoot' },
        { event: 'newDay' },
        { event: 'notepadLetter' },
      ]),
    );
  });
});

describe('store', () => {
  it('shows a tip once and records it', () => {
    const { offer, dismiss } = useAssistantStore.getState();
    offer(tip('stapley-mines'));
    expect(useAssistantStore.getState().current?.tip.id).toBe('stapley-mines');
    expect(useSettingsStore.getState().seenTips).toContain('stapley-mines');
    dismiss();
    offer(tip('stapley-mines'));
    expect(useAssistantStore.getState().current).toBeNull();
  });

  it('queues a second tip behind the first', () => {
    const { offer, dismiss } = useAssistantStore.getState();
    offer(tip('stapley-mines'));
    offer(tip('stapley-mail'));
    expect(useAssistantStore.getState().current?.tip.id).toBe('stapley-mines');
    dismiss();
    expect(useAssistantStore.getState().current?.tip.id).toBe('stapley-mail');
  });

  it('shows nothing while hidden', () => {
    useSettingsStore.setState({ assistantEnabled: false });
    useAssistantStore.getState().offer(tip('stapley-mines'));
    expect(useAssistantStore.getState().current).toBeNull();
    expect(useSettingsStore.getState().seenTips).toEqual([]);
  });

  it('"never" silences a joke for good but plain jokes are not recorded', () => {
    const joke = IDLE_JOKES[0]!;
    const { offer, choose, dismiss } = useAssistantStore.getState();
    offer(joke);
    expect(useSettingsStore.getState().seenTips).toEqual([]);
    dismiss();
    offer(joke);
    expect(useAssistantStore.getState().current?.tip.id).toBe(joke.id);
    choose(joke.options!.find((o) => o.action === 'never')!);
    expect(useSettingsStore.getState().seenTips).toEqual([joke.id]);
    offer(joke);
    expect(useAssistantStore.getState().current).toBeNull();
  });

  it('the letter reply replaces the text, then OK closes', () => {
    const letter = tip('stapley-letter');
    const { offer, choose, dismiss } = useAssistantStore.getState();
    offer(letter);
    choose(letter.options![0]!);
    expect(useAssistantStore.getState().current?.reply).toBe('lol no');
    dismiss();
    expect(useAssistantStore.getState().current).toBeNull();
  });
});

describe('controller', () => {
  it('fires tips on their triggers, once', () => {
    const off = installAssistant();
    const current = () => useAssistantStore.getState().current?.tip.id;

    act(() => {
      events.emit('notepad:letter', {});
    });
    expect(current()).toBe('stapley-letter');
    useAssistantStore.getState().dismiss();
    act(() => {
      events.emit('notepad:letter', {});
    });
    expect(current()).toBeUndefined();

    act(() => {
      useWindowsStore.getState().openApp('mines');
    });
    expect(current()).toBe('stapley-mines');
    off();
    expect(current()).toBeUndefined();
  });

  it('does not count windows that were already open', () => {
    const id = useWindowsStore.getState().openApp('mail');
    expect(id).toBeTruthy();
    const off = installAssistant();
    act(() => {
      useWindowsStore.getState().focusWindow(id);
    });
    expect(useAssistantStore.getState().current).toBeNull();
    off();
  });

  it('offers the intro on the first desktop', () => {
    const off = installAssistant();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(useAssistantStore.getState().current?.tip.id).toBe('stapley-intro');
    off();
  });

  it('cycles jokes and skips silenced ones', () => {
    const silenced = [IDLE_JOKES[1]!.id];
    const next = createJokeCycle(
      () => 0,
      () => silenced,
    );
    expect(next()?.id).toBe(IDLE_JOKES[0]!.id);
    expect(next()?.id).toBe(IDLE_JOKES[2]!.id);
    const none = createJokeCycle(
      () => 0,
      () => IDLE_JOKES.map((j) => j.id),
    );
    expect(none()).toBeNull();
  });
});

describe('Assistant overlay', () => {
  it('renders nothing while hidden', () => {
    useSettingsStore.setState({ assistantEnabled: false });
    render(<Assistant />);
    expect(document.querySelector('[data-assistant]')).toBeNull();
  });

  it('shows the balloon and its options, and the choice persists', () => {
    render(<Assistant />);
    act(() => {
      useAssistantStore.getState().offer(tip('stapley-letter'));
    });
    expect(balloon()).toHaveTextContent(/writing a letter/);
    fireEvent.click(
      screen.getByRole('button', { name: "Don't show me this tip again" }),
    );
    expect(balloon()).toBeNull();
    expect(useSettingsStore.getState().seenTips).toContain('stapley-letter');
  });

  it('Hide from the balloon link', () => {
    render(<Assistant />);
    act(() => {
      useAssistantStore.getState().offer(tip('stapley-mines'));
    });
    fireEvent.click(screen.getByRole('button', { name: 'Hide Stapley' }));
    expect(useSettingsStore.getState().assistantEnabled).toBe(false);
    expect(document.querySelector('[data-assistant]')).toBeNull();
  });

  it('Hide from the right-click menu', () => {
    render(<Assistant />);
    fireEvent.contextMenu(
      screen.getByRole('button', { name: 'Stapley the stapler' }),
    );
    fireEvent.click(screen.getByRole('menuitem', { name: 'Hide Stapley' }));
    expect(useSettingsStore.getState().assistantEnabled).toBe(false);
  });

  it('folds the balloon away while the active window covers his corner', () => {
    render(<Assistant />);
    const stapley = screen.getByRole('button', { name: 'Stapley the stapler' });
    act(() => {
      useAssistantStore.getState().offer(tip('stapley-mines'));
    });
    // A small window in the top-left leaves the corner alone.
    act(() => {
      const id = useWindowsStore.getState().openApp('browser');
      useWindowsStore
        .getState()
        .resizeWindow(id, { x: 0, y: 0, w: 400, h: 300 });
    });
    act(() => vi.advanceTimersByTime(20_000));
    expect(balloon()).not.toBeNull();

    act(() => {
      const [win] = useWindowsStore.getState().windows;
      useWindowsStore.getState().toggleMaximize(win!.id);
    });
    act(() => vi.advanceTimersByTime(7000));
    expect(balloon()).not.toBeNull();
    act(() => vi.advanceTimersByTime(1000));
    expect(balloon()).toBeNull();
    // The tip is still there: a click on Stapley shows it again, for another while.
    expect(useAssistantStore.getState().current?.tip.id).toBe('stapley-mines');
    fireEvent.pointerDown(stapley, { button: 0, clientX: 5, clientY: 5 });
    fireEvent.pointerUp(stapley);
    expect(balloon()).toHaveTextContent(/phone number/);
    act(() => vi.advanceTimersByTime(8000));
    expect(balloon()).toBeNull();

    // Minimized, the window covers nothing and the balloon is back; Hide still works.
    act(() => {
      const [win] = useWindowsStore.getState().windows;
      useWindowsStore.getState().minimizeWindow(win!.id);
    });
    expect(balloon()).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Hide Stapley' }));
    expect(useSettingsStore.getState().assistantEnabled).toBe(false);
  });

  it('steps out over a full-screen phone window until the next tip', () => {
    useDeviceStore.setState({ device: 'phone' });
    try {
      render(<Assistant />);
      const here = () => document.querySelector('[data-assistant]');
      expect(here()).not.toBeNull();
      // Every phone window is full-screen: with nothing to say he leaves its buttons free.
      act(() => {
        useWindowsStore.getState().openApp('notepad');
      });
      expect(here()).toBeNull();
      // A tip brings him back with his balloon; it folds away and so does he.
      act(() => {
        useAssistantStore.getState().offer(tip('stapley-mines'));
      });
      expect(balloon()).not.toBeNull();
      act(() => vi.advanceTimersByTime(8000));
      expect(here()).toBeNull();
      // The desktop (no window in front) has room for him again.
      act(() => {
        const [win] = useWindowsStore.getState().windows;
        useWindowsStore.getState().minimizeWindow(win!.id);
      });
      expect(here()).not.toBeNull();
    } finally {
      useDeviceStore.setState({ device: 'desktop' });
    }
  });

  it('stands above the status bar of a maximized active window', () => {
    render(<Assistant />);
    const root = document.querySelector<HTMLElement>('[data-assistant]')!;
    const rest = `${TASKBAR_HEIGHT + 8}px`;
    expect(root.style.bottom).toBe(rest);
    let id = '';
    act(() => {
      id = useWindowsStore.getState().openApp('browser');
    });
    expect(root.style.bottom).toBe(rest);
    act(() => useWindowsStore.getState().toggleMaximize(id));
    expect(root.style.bottom).toBe(`${TASKBAR_HEIGHT + 8 + STATUS_BAR_LIFT}px`);
    act(() => useWindowsStore.getState().minimizeWindow(id));
    expect(root.style.bottom).toBe(rest);
  });

  it('drags', () => {
    render(<Assistant />);
    const stapley = screen.getByRole('button', { name: 'Stapley the stapler' });
    fireEvent.pointerDown(stapley, { button: 0, clientX: 500, clientY: 500 });
    fireEvent.pointerMove(stapley, { clientX: 440, clientY: 460 });
    fireEvent.pointerUp(stapley);
    expect(
      document.querySelector<HTMLElement>('[data-assistant]')!.style.transform,
    ).toBe('translate(-60px, -40px)');
  });
});
