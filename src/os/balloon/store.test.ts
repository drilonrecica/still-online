import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { BALLOON_MS, useBalloonStore } from './store';

const state = () => useBalloonStore.getState();
const b = (title: string, id?: string) => ({ id, title, text: 't' });

beforeEach(() => {
  vi.useFakeTimers();
  useSettingsStore.setState({ seenTips: [] });
  state().clear();
});

afterEach(() => {
  state().clear();
  vi.useRealTimers();
});

describe('balloon queue', () => {
  it('shows one at a time and queues the rest', () => {
    state().push(b('a'));
    state().push(b('b'));
    expect(state().current?.title).toBe('a');
    expect(state().queue.map((x) => x.title)).toEqual(['b']);
  });

  it('auto-dismisses after the timeout and shows the next', () => {
    state().push(b('a'));
    state().push(b('b'));
    vi.advanceTimersByTime(BALLOON_MS - 1);
    expect(state().current?.title).toBe('a');
    vi.advanceTimersByTime(1);
    expect(state().current?.title).toBe('b');
    vi.advanceTimersByTime(BALLOON_MS);
    expect(state().current).toBeNull();
  });

  it('close advances immediately and restarts the timer for the next', () => {
    state().push(b('a'));
    state().push(b('b'));
    vi.advanceTimersByTime(BALLOON_MS - 1000);
    state().dismiss();
    expect(state().current?.title).toBe('b');
    vi.advanceTimersByTime(BALLOON_MS - 1);
    expect(state().current?.title).toBe('b');
  });

  it('records ids as seen when shown, and skips seen ids', () => {
    state().push(b('a', 'tip'));
    expect(useSettingsStore.getState().seenTips).toEqual(['tip']);
    state().dismiss();
    state().push(b('again', 'tip'));
    expect(state().current).toBeNull();
    expect(state().queue).toEqual([]);
  });

  it('does not queue a duplicate id, and skips queued ids seen meanwhile', () => {
    state().push(b('a'));
    state().push(b('x', 'dup'));
    state().push(b('x2', 'dup'));
    expect(state().queue).toHaveLength(1);
    useSettingsStore.setState({ seenTips: ['dup'] });
    state().dismiss();
    expect(state().current).toBeNull();
  });

  it('balloons without an id always show', () => {
    state().push(b('a'));
    state().dismiss();
    state().push(b('a'));
    expect(state().current?.title).toBe('a');
    expect(useSettingsStore.getState().seenTips).toEqual([]);
  });
});
