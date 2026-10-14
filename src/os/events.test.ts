import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEventBus, events } from '@/os/events';

interface TestEvents {
  ping: { n: number };
  pong: { text: string };
}

describe('createEventBus', () => {
  it('delivers payloads to listeners of that event only', () => {
    const bus = createEventBus<TestEvents>();
    const ping = vi.fn();
    const pong = vi.fn();
    bus.on('ping', ping);
    bus.on('pong', pong);

    bus.emit('ping', { n: 1 });

    expect(ping).toHaveBeenCalledWith({ n: 1 });
    expect(pong).not.toHaveBeenCalled();
  });

  it('calls every listener in subscription order', () => {
    const bus = createEventBus<TestEvents>();
    const order: string[] = [];
    bus.on('ping', () => order.push('a'));
    bus.on('ping', () => order.push('b'));
    bus.emit('ping', { n: 1 });
    expect(order).toEqual(['a', 'b']);
  });

  it('does nothing when nobody listens', () => {
    const bus = createEventBus<TestEvents>();
    expect(() => bus.emit('ping', { n: 1 })).not.toThrow();
  });

  it('unsubscribes via off and via the returned function', () => {
    const bus = createEventBus<TestEvents>();
    const a = vi.fn();
    const b = vi.fn();
    bus.on('ping', a);
    const unsubscribe = bus.on('ping', b);

    bus.off('ping', a);
    unsubscribe();
    bus.emit('ping', { n: 1 });

    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
  });

  it('adds the same listener only once', () => {
    const bus = createEventBus<TestEvents>();
    const listener = vi.fn();
    bus.on('ping', listener);
    bus.on('ping', listener);
    bus.emit('ping', { n: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('lets a listener unsubscribe another during emit without skipping the current round', () => {
    const bus = createEventBus<TestEvents>();
    const second = vi.fn();
    bus.on('ping', () => bus.off('ping', second));
    bus.on('ping', second);

    bus.emit('ping', { n: 1 });
    bus.emit('ping', { n: 2 });

    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith({ n: 1 });
  });

  it('keeps delivering when a listener throws, and logs the error', () => {
    const bus = createEventBus<TestEvents>();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const after = vi.fn();
    bus.on('ping', () => {
      throw new Error('boom');
    });
    bus.on('ping', after);

    bus.emit('ping', { n: 1 });

    expect(after).toHaveBeenCalledWith({ n: 1 });
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });

  it('clear removes all listeners', () => {
    const bus = createEventBus<TestEvents>();
    const listener = vi.fn();
    bus.on('ping', listener);
    bus.clear();
    bus.emit('ping', { n: 1 });
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('events (OS bus)', () => {
  afterEach(() => events.clear());

  it('carries amplifier events', () => {
    const listener = vi.fn();
    events.on('amplifier:trackChanged', listener);
    const payload = {
      trackId: 't1',
      artist: 'The Dial-Up Kids',
      title: 'Away Message',
      durationSec: 75,
    };
    events.emit('amplifier:trackChanged', payload);
    expect(listener).toHaveBeenCalledWith(payload);
  });
});
