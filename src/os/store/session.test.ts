import { beforeEach, describe, expect, it } from 'vitest';
import { useSessionStore } from '@/os/store/session';

const s = () => useSessionStore.getState();

beforeEach(() => useSessionStore.setState({ state: 'booting' }));

describe('session transitions', () => {
  it('walks boot → login → desktop → shutdown → off → boot', () => {
    s().bootComplete();
    expect(s().state).toBe('login');
    s().logOn();
    expect(s().state).toBe('desktop');
    s().shutDown();
    expect(s().state).toBe('shuttingDown');
    s().shutdownComplete();
    expect(s().state).toBe('off');
    s().powerOn();
    expect(s().state).toBe('booting');
  });

  it('log off returns to login', () => {
    useSessionStore.setState({ state: 'desktop' });
    s().logOff();
    expect(s().state).toBe('login');
  });

  it('ignores disallowed transitions', () => {
    s().logOn();
    expect(s().state).toBe('booting');
    s().shutDown();
    expect(s().state).toBe('booting');
  });
});
