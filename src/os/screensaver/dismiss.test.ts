import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createDismissal,
  GRACE_MS,
  MOVE_THRESHOLD_PX,
  swallowNextClick,
} from './dismiss';

const T = GRACE_MS + 10;

describe('createDismissal', () => {
  it('ignores input during the grace period', () => {
    const stop = createDismissal(0);
    expect(stop({ kind: 'key', time: 10 })).toBe(false);
    expect(stop({ kind: 'down', time: 10 })).toBe(false);
    expect(stop({ kind: 'key', time: T })).toBe(true);
  });

  it('stops on a click, a key or the wheel', () => {
    for (const kind of ['down', 'key', 'wheel'] as const) {
      expect(createDismissal(0)({ kind, time: T })).toBe(true);
    }
  });

  it('stops only when the pointer moves more than 4 px', () => {
    const stop = createDismissal(0);
    expect(stop({ kind: 'move', x: 100, y: 100, time: T })).toBe(false);
    expect(
      stop({ kind: 'move', x: 100 + MOVE_THRESHOLD_PX, y: 100, time: T }),
    ).toBe(false);
    expect(stop({ kind: 'move', x: 103, y: 103, time: T })).toBe(true);
  });

  it('measures from where the pointer is once the grace period ends', () => {
    const stop = createDismissal(0);
    stop({ kind: 'move', x: 0, y: 0, time: 10 });
    expect(stop({ kind: 'move', x: 50, y: 0, time: 20 })).toBe(false);
    expect(stop({ kind: 'move', x: 52, y: 0, time: T })).toBe(false);
  });
});

describe('swallowNextClick', () => {
  afterEach(() => vi.useRealTimers());

  it('eats the next click only', () => {
    const onClick = vi.fn();
    document.body.addEventListener('click', onClick);
    swallowNextClick();
    document.body.click();
    expect(onClick).not.toHaveBeenCalled();
    document.body.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    document.body.removeEventListener('click', onClick);
  });

  it('gives up after a moment without a click', () => {
    vi.useFakeTimers();
    const onClick = vi.fn();
    document.body.addEventListener('click', onClick);
    swallowNextClick();
    vi.advanceTimersByTime(1000);
    document.body.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    document.body.removeEventListener('click', onClick);
  });
});
