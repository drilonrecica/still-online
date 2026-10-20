import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getApp } from '@/apps/registry';
import { Z_INDEX } from '@/os/overlay/slots';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';

let frames = new Map<number, FrameRequestCallback>();
let nextId = 1;
let clock = 0;

function advance(ms: number, step = 16) {
  for (let t = 0; t < ms; t += step) {
    clock += step;
    const due = [...frames.values()];
    frames = new Map();
    act(() => due.forEach((cb) => cb(clock)));
  }
}

async function openWrecker() {
  render(<WindowLayer getApp={getApp} />);
  act(() => {
    useWindowsStore.getState().openApp('wrecker');
  });
  return screen.findByRole('application', { name: /Desktop Wrecker/ });
}

const overlay = () => document.body.querySelector('[data-wrecker]');

beforeEach(() => {
  localStorage.clear();
  useWindowsStore.getState().closeAll();
  frames = new Map();
  clock = 0;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextId++;
    frames.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});

afterEach(() => {
  vi.unstubAllGlobals();
  useWindowsStore.getState().closeAll();
});

describe('Desktop Wrecker', () => {
  it('portals a full-screen overlay to document.body above the Start menu', async () => {
    const surface = await openWrecker();
    const root = overlay();
    expect(root).not.toBeNull();
    expect(root?.parentElement).toBe(document.body);
    expect((root as HTMLElement).style.zIndex).toBe(String(Z_INDEX.wrecker));
    expect(Z_INDEX.wrecker).toBeGreaterThan(Z_INDEX.startMenu);
    expect(Z_INDEX.wrecker).toBeLessThan(Z_INDEX.screensaver);
    // Focus moves in a passive effect, which can land just after the element appears.
    await waitFor(() => expect(surface).toHaveFocus());
    expect(
      screen.getByRole('toolbar', { name: 'Wrecking tools' }),
    ).toBeVisible();
  });

  it('picks tools from the palette and the keyboard', async () => {
    const surface = await openWrecker();
    expect(screen.getByRole('button', { name: 'Hammer' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Chainsaw' }));
    expect(screen.getByRole('button', { name: 'Chainsaw' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    fireEvent.keyDown(surface, { key: '5' });
    expect(screen.getByRole('button', { name: 'Stamp' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('uses tools and repairs while the loop runs, without a canvas', async () => {
    const surface = await openWrecker();
    fireEvent.pointerDown(surface, { button: 0, clientX: 50, clientY: 50 });
    fireEvent.pointerUp(surface);
    fireEvent.keyDown(surface, { key: '4' });
    fireEvent.keyDown(surface, { key: ' ' });
    advance(200);
    fireEvent.keyUp(surface, { key: ' ' });
    fireEvent.click(screen.getByRole('button', { name: 'Repair' }));
    expect(screen.getByRole('button', { name: 'Hammer' })).toBeDisabled();
    advance(1500);
    expect(screen.getByRole('button', { name: 'Hammer' })).toBeEnabled();
  });

  it('Escape closes the window and unmounts the overlay cleanly', async () => {
    await openWrecker();
    expect(frames.size).toBe(1);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useWindowsStore.getState().windows).toHaveLength(0);
    expect(overlay()).toBeNull();
    // The animation loop stopped and Escape no longer does anything.
    expect(frames.size).toBe(0);
    useWindowsStore.getState().openApp('notepad');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useWindowsStore.getState().windows).toHaveLength(1);
  });

  it('Exit closes it too', async () => {
    await openWrecker();
    fireEvent.click(screen.getByRole('button', { name: 'Exit' }));
    expect(useWindowsStore.getState().windows).toHaveLength(0);
    expect(overlay()).toBeNull();
  });

  it('hides while minimized', async () => {
    await openWrecker();
    const id = useWindowsStore.getState().windows[0]!.id;
    act(() => useWindowsStore.getState().minimizeWindow(id));
    expect(overlay()).not.toBeVisible();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(useWindowsStore.getState().windows).toHaveLength(1);
  });

  it('adds Reset (R) and Use (Space) to the palette after a touch (v0.6)', async () => {
    const surface = await openWrecker();
    expect(screen.queryByRole('button', { name: 'Reset (R)' })).toBeNull();
    const finger = { pointerType: 'touch', pointerId: 4, button: 0 };
    fireEvent.pointerDown(surface, { ...finger, clientX: 60, clientY: 60 });
    fireEvent.pointerUp(surface, finger);
    const use = screen.getByRole('button', { name: 'Use (Space)' });
    fireEvent.click(screen.getByRole('button', { name: 'Machine Gun' }));
    fireEvent.pointerDown(use, finger);
    advance(200);
    fireEvent.pointerUp(use, finger);
    fireEvent.click(screen.getByRole('button', { name: 'Reset (R)' }));
    expect(screen.getByRole('button', { name: 'Hammer' })).toBeDisabled();
    expect(use).toBeDisabled();
    advance(1500);
    expect(screen.getByRole('button', { name: 'Hammer' })).toBeEnabled();
    // A mouse again: the extra buttons go.
    fireEvent.pointerDown(surface, { pointerType: 'mouse', button: 0 });
    expect(screen.queryByRole('button', { name: 'Use (Space)' })).toBeNull();
  });
});
