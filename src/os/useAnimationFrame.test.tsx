import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnimationFrame } from './useAnimationFrame';

let pending = new Map<number, FrameRequestCallback>();
let nextId = 1;
let now = 0;

function flush() {
  const cbs = [...pending.values()];
  pending = new Map();
  now += 16;
  cbs.forEach((cb) => cb(now));
}

function setHidden(value: boolean) {
  Object.defineProperty(document, 'hidden', { value, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}

function Probe({
  active,
  onFrame,
}: {
  active: boolean;
  onFrame: (dt: number) => void;
}) {
  useAnimationFrame((_t, dt) => onFrame(dt), active);
  return null;
}

beforeEach(() => {
  pending = new Map();
  nextId = 1;
  now = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextId++;
    pending.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => pending.delete(id));
});

afterEach(() => {
  setHidden(false);
  vi.unstubAllGlobals();
});

describe('useAnimationFrame', () => {
  it('runs while active and passes dt', () => {
    const onFrame = vi.fn();
    render(<Probe active onFrame={onFrame} />);
    act(flush);
    act(flush);
    expect(onFrame).toHaveBeenCalledTimes(2);
    expect(onFrame.mock.calls[0]?.[0]).toBe(0);
    expect(onFrame.mock.calls[1]?.[0]).toBe(16);
  });

  it('schedules nothing while inactive, and resumes when activated', () => {
    const onFrame = vi.fn();
    const { rerender } = render(<Probe active={false} onFrame={onFrame} />);
    expect(pending.size).toBe(0);
    rerender(<Probe active onFrame={onFrame} />);
    expect(pending.size).toBe(1);
    rerender(<Probe active={false} onFrame={onFrame} />);
    expect(pending.size).toBe(0);
  });

  it('stops while the document is hidden and restarts with dt 0', () => {
    const onFrame = vi.fn();
    render(<Probe active onFrame={onFrame} />);
    act(flush);
    act(() => setHidden(true));
    expect(pending.size).toBe(0);
    act(() => setHidden(false));
    expect(pending.size).toBe(1);
    onFrame.mockClear();
    act(flush);
    expect(onFrame).toHaveBeenCalledWith(0);
  });

  it('cancels on unmount', () => {
    const { unmount } = render(<Probe active onFrame={() => {}} />);
    expect(pending.size).toBe(1);
    unmount();
    expect(pending.size).toBe(0);
  });
});
