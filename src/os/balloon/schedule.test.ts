import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { events } from '@/os/events';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import { newDayBalloonText } from '@/content/balloons';
import type { Contact } from '@/content/types';
import { installBalloons } from './schedule';
import { BALLOON_MS, useBalloonStore } from './store';

const MIN = 60_000;
const current = () => useBalloonStore.getState().current;
let cleanup: () => void;

/** Lets every balloon time out so each tip is visited in order. */
const drain = () => {
  const seen: string[] = [];
  while (current()) {
    seen.push(current()!.title);
    useBalloonStore.getState().dismiss();
  }
  return seen;
};

function install(day: number) {
  useWorldStore.setState({ day });
  cleanup = installBalloons();
}

beforeEach(() => {
  vi.useFakeTimers();
  useSettingsStore.setState({ seenTips: [] });
  useBalloonStore.getState().clear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  useWorldStore.setState({ day: 1 });
});

describe('new-day balloons', () => {
  it('shows the new-day balloon 5s after mount, counting changed friends', () => {
    useWorldStore.setState({ day: 2 });
    events.emit('world:dayChanged', { day: 2 });
    cleanup = installBalloons();
    vi.advanceTimersByTime(4999);
    expect(current()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(current()?.title).toBe('A new day!');
    expect(current()?.text).toMatch(/^\d friends? changed their personal/);
    current()?.onClick?.();
    expect(
      useWindowsStore.getState().windows.some((w) => w.appId === 'messenger'),
    ).toBe(true);
  });

  it('uses the vague line from day 6 on', () => {
    expect(newDayBalloonText([], 6)).toBe('Your friends are up to something.');
    expect(newDayBalloonText([], 2)).toBe('Your friends are up to something.');
  });

  it('counts friends with a personal message for the day', () => {
    const c = (days: Contact['days']) => ({ days }) as Contact;
    expect(
      newDayBalloonText(
        [
          c({ 2: { personalMessage: 'x' } }),
          c({ 2: { status: 'away' } }),
          c({}),
        ],
        2,
      ),
    ).toBe('1 friend changed their personal message.');
  });

  it('shows the welcome balloon on a first-ever day-1 boot, once', () => {
    install(1);
    vi.advanceTimersByTime(5000);
    expect(current()?.title).toBe('Welcome to your new computer!');
    expect(useSettingsStore.getState().seenTips).toContain('welcome');
  });
});

describe('installBalloons', () => {
  it('shows the unused-icons balloon after 3 minutes, once ever', () => {
    install(1);
    vi.advanceTimersByTime(3 * MIN - 1);
    expect(current()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(current()?.title).toBe('There are unused icons on your desktop');
    expect(useSettingsStore.getState().seenTips).toContain('unused-icons');

    cleanup();
    useBalloonStore.getState().clear();
    install(1);
    vi.advanceTimersByTime(3 * MIN);
    expect(current()).toBeNull();
  });

  it('shows the daily updates balloon at 8 minutes with a day-scoped id', () => {
    install(1);
    vi.advanceTimersByTime(8 * MIN);
    const titles = drain();
    expect(titles).toContain('Updates are ready for your computer');
    expect(useSettingsStore.getState().seenTips).toContain('updates-1');
  });

  it('shows VirusGuard only from day 2, after 12 minutes', () => {
    install(1);
    vi.advanceTimersByTime(20 * MIN);
    expect(drain()).not.toContain(
      'VirusGuard 2007: Your subscription has expired!',
    );
    cleanup();
    useBalloonStore.getState().clear();
    useSettingsStore.setState({ seenTips: [] });

    install(2);
    vi.advanceTimersByTime(12 * MIN);
    expect(drain()).toContain(
      'VirusGuard 2007: Your subscription has expired!',
    );
  });

  it('introduces Fluff once, from day 2; clicking it lets Fluff out', () => {
    install(1);
    vi.advanceTimersByTime(20 * MIN);
    expect(drain()).not.toContain('Someone new moved in');
    cleanup();
    useSettingsStore.setState({ seenTips: [], petEnabled: false });

    install(2);
    vi.advanceTimersByTime(1 * MIN);
    expect(current()?.text).toBe('Click the sheep in the tray to meet Fluff!');
    expect(useSettingsStore.getState().seenTips).toContain('meet-fluff');
    current()?.onClick?.();
    expect(useSettingsStore.getState().petEnabled).toBe(true);
    useSettingsStore.setState({ petEnabled: false });
  });

  it('a new day repeats the daily balloons', () => {
    install(1);
    vi.advanceTimersByTime(8 * MIN);
    drain();
    cleanup();
    install(2);
    vi.advanceTimersByTime(8 * MIN);
    expect(current()?.title).toBe('Updates are ready for your computer');
  });

  it('shows the connection balloon on every network:connected', () => {
    install(1);
    events.emit('network:connected', { kbps: 56 });
    expect(current()?.title).toBe('Connected at 56.0 Kbps');
    useBalloonStore.getState().dismiss();
    events.emit('network:connected', { kbps: 56 });
    expect(current()?.title).toBe('Connected at 56.0 Kbps');
  });

  it('clicking updates shows an installing balloon, then nothing', () => {
    install(1);
    vi.advanceTimersByTime(8 * MIN);
    while (current()?.title !== 'Updates are ready for your computer') {
      useBalloonStore.getState().dismiss();
    }
    const click = current()!.onClick!;
    useBalloonStore.getState().dismiss();
    click();
    expect(current()?.title).toBe('Installing updates (1 of 47)…');
    vi.advanceTimersByTime(BALLOON_MS);
    expect(current()).toBeNull();
  });

  it('clicking VirusGuard opens Web Explorer, clicking unused-icons opens Disk Cleanup', () => {
    const open = vi.fn();
    useWindowsStore.setState({ openApp: open } as never);
    const urls: string[] = [];
    const off = events.on('browser:open', ({ url }) => urls.push(url));
    install(2);
    // Click each balloon while it is up (they auto-dismiss).
    for (const at of [3, 5, 4]) {
      vi.advanceTimersByTime(at * MIN);
      current()?.onClick?.();
      useBalloonStore.getState().dismiss();
    }
    off();
    expect(urls).toEqual(['http://virusguard.example']);
    expect(open).toHaveBeenCalledWith('diskcleanup');
  });

  it('cleanup cancels pending timers and clears the queue', () => {
    install(1);
    cleanup();
    vi.advanceTimersByTime(30 * MIN);
    expect(current()).toBeNull();
  });
});
