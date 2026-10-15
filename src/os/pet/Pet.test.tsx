import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { TASKBAR_HEIGHT } from '@/os/types';
import { Pet } from './Pet';
import { PetTray } from './PetTray';

const pet = () => document.querySelector<HTMLElement>('[data-pet]');
const mode = () => pet()?.dataset.mode;
/** Fluff's feet y, from the sprite's translate. */
const feetY = () => {
  const match = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(
    pet()?.style.transform ?? '',
  );
  return match ? Number(match[2]) + 32 : NaN;
};

beforeEach(() => {
  vi.useFakeTimers();
  useSettingsStore.setState({ petEnabled: false });
  useWindowsStore.setState({ windows: [], topZ: 0 });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('Fluff overlay', () => {
  it('renders nothing while the setting is off', () => {
    render(<Pet />);
    expect(pet()).toBeNull();
  });

  it('drops onto the taskbar and walks', () => {
    useSettingsStore.setState({ petEnabled: true });
    render(<Pet />);
    expect(mode()).toBe('fall');
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(['walk', 'sit', 'graze']).toContain(mode());
    expect(feetY()).toBe(window.innerHeight - TASKBAR_HEIGHT);
  });

  it('bleats on a keyboard click', () => {
    useSettingsStore.setState({ petEnabled: true });
    render(<Pet />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    fireEvent.click(screen.getByRole('button', { name: 'Fluff the sheep' }), {
      detail: 0,
    });
    expect(mode()).toBe('baa');
    expect(screen.getByText('Baa!')).toBeInTheDocument();
  });

  it('can be picked up and thrown', () => {
    useSettingsStore.setState({ petEnabled: true });
    render(<Pet />);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    const sheep = screen.getByRole('button', { name: 'Fluff the sheep' });
    fireEvent.pointerDown(sheep, { button: 0, clientX: 300, clientY: 700 });
    expect(mode()).toBe('drag');
    fireEvent.pointerMove(sheep, { clientX: 340, clientY: 500 });
    fireEvent.pointerUp(sheep, { clientX: 340, clientY: 500 });
    expect(mode()).toBe('fall');
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(mode()).not.toBe('fall');
  });

  it('sits still on the taskbar under reduced motion', () => {
    vi.stubGlobal(
      'matchMedia',
      (query: string) =>
        ({
          matches: query.includes('reduce'),
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    useSettingsStore.setState({ petEnabled: true });
    render(<Pet />);
    const before = pet()?.style.transform;
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(mode()).toBe('sit');
    expect(pet()?.style.transform).toBe(before);
    expect(feetY()).toBe(window.innerHeight - TASKBAR_HEIGHT);
  });
});

describe('PetTray', () => {
  it('toggles Fluff and shows the state', () => {
    render(
      <>
        <PetTray />
        <Pet />
      </>,
    );
    const tray = screen.getByRole('button', { name: 'Desktop sheep' });
    expect(tray).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(tray);
    expect(useSettingsStore.getState().petEnabled).toBe(true);
    expect(tray).toHaveAttribute('aria-pressed', 'true');
    expect(pet()).not.toBeNull();
    fireEvent.click(tray);
    expect(pet()).toBeNull();
  });
});
