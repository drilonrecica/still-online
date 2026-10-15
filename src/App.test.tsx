import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '@/App';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';
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

  it('paints the chosen wallpaper on the desktop root', () => {
    const { container } = render(<App />);
    const root = container.querySelector<HTMLElement>('.desktop-root');
    // A builtin has no canvas in jsdom, so the CSS hill stays.
    expect(root?.style.backgroundImage).toBe('');
    act(() =>
      useSettingsStore
        .getState()
        .setWallpaper({ kind: 'color', color: '#008080' }),
    );
    expect(root?.style.backgroundColor).toBe('rgb(0, 128, 128)');
    expect(root?.style.backgroundImage).toBe('none');
    act(() =>
      useSettingsStore
        .getState()
        .setWallpaper({ kind: 'builtin', id: 'classic' }),
    );
    expect(root?.style.backgroundImage).toBe('');
  });
});
