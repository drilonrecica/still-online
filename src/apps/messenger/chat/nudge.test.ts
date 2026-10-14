import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createNudgeLimiter,
  NUDGE_INTERVAL_MS,
  onShake,
  requestShake,
} from './nudge';

describe('nudge rate limit', () => {
  it('allows one nudge per contact per 10s', () => {
    let t = 1_000_000;
    const limiter = createNudgeLimiter(NUDGE_INTERVAL_MS, () => t);
    expect(NUDGE_INTERVAL_MS).toBe(10_000);
    expect(limiter.tryNudge('lena')).toBe(true);
    t += 9_999;
    expect(limiter.tryNudge('lena')).toBe(false);
    expect(limiter.tryNudge('max')).toBe(true);
    t += 1;
    expect(limiter.tryNudge('lena')).toBe(true);
  });

  it('a refused nudge does not extend the wait', () => {
    let t = 0;
    const limiter = createNudgeLimiter(10_000, () => t);
    limiter.tryNudge('lena');
    t = 5_000;
    expect(limiter.tryNudge('lena')).toBe(false);
    t = 10_000;
    expect(limiter.tryNudge('lena')).toBe(true);
  });

  it('reset clears the history', () => {
    const limiter = createNudgeLimiter(10_000, () => 0);
    limiter.tryNudge('lena');
    limiter.reset();
    expect(limiter.tryNudge('lena')).toBe(true);
  });
});

describe('shake requests', () => {
  afterEach(() => vi.useRealTimers());

  it('calls subscribed windows of that contact only', () => {
    const lena = vi.fn();
    const max = vi.fn();
    const offLena = onShake('lena', lena);
    const offMax = onShake('max', max);
    requestShake('lena');
    expect(lena).toHaveBeenCalledTimes(1);
    expect(max).not.toHaveBeenCalled();
    offLena();
    offMax();
  });

  it('a window that subscribes right after the request still shakes once', () => {
    requestShake('ida');
    const fn = vi.fn();
    const off = onShake('ida', fn);
    expect(fn).toHaveBeenCalledTimes(1);
    off();
    const again = vi.fn();
    onShake('ida', again)();
    expect(again).not.toHaveBeenCalled();
  });

  it('stale requests are dropped', () => {
    vi.useFakeTimers();
    requestShake('joe');
    vi.advanceTimersByTime(5_000);
    const fn = vi.fn();
    onShake('joe', fn)();
    expect(fn).not.toHaveBeenCalled();
  });
});
