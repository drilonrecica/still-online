import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '@/App';
import { useSessionStore } from '@/os/store/session';
import { useWorldStore, WORLD_DEFAULTS } from '@/os/world';

beforeEach(() => {
  useSessionStore.setState({ state: 'booting' });
  useWorldStore.setState({ ...WORLD_DEFAULTS, unlocks: [] });
});

describe('App', () => {
  it('starts on the boot screen', () => {
    render(<App />);
    expect(screen.getByTestId('boot-screen')).toBeInTheDocument();
  });

  it('shows login after boot, then the desktop', () => {
    useSessionStore.setState({ state: 'login' });
    render(<App />);
    expect(screen.getByTestId('login-screen')).toBeInTheDocument();
  });

  it('boots the world, marks the shutdown when off, and advances on power on', () => {
    render(<App />);
    expect(useWorldStore.getState().lastRealDate).not.toBe('');
    expect(useWorldStore.getState().day).toBe(1);
    act(() => useSessionStore.setState({ state: 'off' }));
    expect(useWorldStore.getState().shutdownPending).toBe(true);
    act(() => useSessionStore.getState().powerOn());
    expect(useWorldStore.getState()).toMatchObject({
      day: 2,
      shutdownPending: false,
    });
  });
});
