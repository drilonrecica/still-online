import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { events } from '@/os/events';
import { installIdle, onIdle } from './idle';

const MIN = 60_000;
let uninstall: () => void;
let idleEvents: number[];
let activeEvents: number;
let offs: (() => void)[];

beforeEach(() => {
  vi.useFakeTimers();
  uninstall = installIdle();
  idleEvents = [];
  activeEvents = 0;
  offs = [
    events.on('os:idle', ({ minutes }) => idleEvents.push(minutes)),
    events.on('os:active', () => (activeEvents += 1)),
  ];
});

afterEach(() => {
  offs.forEach((off) => off());
  uninstall();
  vi.useRealTimers();
});

const input = (type = 'pointermove') => window.dispatchEvent(new Event(type));

describe('onIdle', () => {
  it('fires once per idle period', () => {
    const cb = vi.fn();
    const off = onIdle(2, cb);
    vi.advanceTimersByTime(2 * MIN - 1);
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(cb).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(10 * MIN);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(idleEvents).toEqual([2]);
    off();
  });

  it('is reset by any input and re-arms', () => {
    const cb = vi.fn();
    const off = onIdle(1, cb);
    for (const type of [
      'pointermove',
      'pointerdown',
      'keydown',
      'wheel',
      'touchstart',
    ]) {
      vi.advanceTimersByTime(MIN - 1);
      input(type);
    }
    expect(cb).not.toHaveBeenCalled();
    vi.advanceTimersByTime(MIN);
    expect(cb).toHaveBeenCalledTimes(1);
    input();
    vi.advanceTimersByTime(MIN);
    expect(cb).toHaveBeenCalledTimes(2);
    off();
  });

  it('supports multiple thresholds', () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = onIdle(1, a);
    const offB = onIdle(3, b);
    vi.advanceTimersByTime(MIN);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
    vi.advanceTimersByTime(2 * MIN);
    expect(b).toHaveBeenCalledTimes(1);
    expect(idleEvents).toEqual([1, 3]);
    offA();
    offB();
  });

  it('emits os:active only after an idle event', () => {
    const off = onIdle(1, () => undefined);
    input();
    input();
    expect(activeEvents).toBe(0);
    vi.advanceTimersByTime(MIN);
    input();
    input();
    expect(activeEvents).toBe(1);
    off();
  });

  it('unsubscribe stops the callback', () => {
    const cb = vi.fn();
    onIdle(1, cb)();
    vi.advanceTimersByTime(5 * MIN);
    expect(cb).not.toHaveBeenCalled();
    expect(idleEvents).toEqual([]);
  });

  it('ignores non-positive thresholds', () => {
    const cb = vi.fn();
    onIdle(0, cb)();
    vi.advanceTimersByTime(MIN);
    expect(cb).not.toHaveBeenCalled();
  });
});
