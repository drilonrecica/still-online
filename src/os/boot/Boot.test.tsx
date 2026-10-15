import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Boot, BOOT_MS, BOOT_RETURN_MS } from '@/os/boot/Boot';
import { useWorldStore } from '@/os/world';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

beforeEach(() => {
  vi.useFakeTimers();
  useSessionStore.setState({ state: 'booting' });
  useSettingsStore.setState({ firstBootDone: false });
  mockReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia;
});

describe('Boot', () => {
  it('shows the current day', () => {
    useWorldStore.setState({ day: 4 });
    render(<Boot />);
    expect(screen.getByTestId('boot-day')).toHaveTextContent('Day 4');
    useWorldStore.setState({ day: 1 });
  });

  it('moves to login after the full duration on a first visit', () => {
    render(<Boot />);
    act(() => vi.advanceTimersByTime(BOOT_MS - 1));
    expect(useSessionStore.getState().state).toBe('booting');
    act(() => vi.advanceTimersByTime(1));
    expect(useSessionStore.getState().state).toBe('login');
  });

  it('is shortened on return visits', () => {
    useSettingsStore.setState({ firstBootDone: true });
    render(<Boot />);
    act(() => vi.advanceTimersByTime(BOOT_RETURN_MS));
    expect(useSessionStore.getState().state).toBe('login');
  });

  it('skips on click', () => {
    render(<Boot />);
    fireEvent.click(screen.getByTestId('boot-screen'));
    expect(useSessionStore.getState().state).toBe('login');
  });

  it('skips on key press', () => {
    render(<Boot />);
    fireEvent.keyDown(window, { key: 'a' });
    expect(useSessionStore.getState().state).toBe('login');
  });

  it('shows a static progress bar with reduced motion', () => {
    mockReducedMotion(true);
    render(<Boot />);
    expect(screen.getByTestId('boot-progress')).toHaveAttribute(
      'data-static',
      'true',
    );
  });

  it('animates the progress bar otherwise', () => {
    render(<Boot />);
    expect(screen.getByTestId('boot-progress')).toHaveAttribute(
      'data-static',
      'false',
    );
  });
});
