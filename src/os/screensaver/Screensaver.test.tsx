import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OverlayLayer } from '@/os/overlay/OverlayLayer';
import { GRACE_MS } from './dismiss';
import { useScreensaverStore } from './store';

let now = 0;
vi.spyOn(performance, 'now').mockImplementation(() => now);

function setReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function start(id: 'pipes' | 'marquee' = 'pipes') {
  now = 0;
  act(() => useScreensaverStore.getState().startPreview(id, 'hey'));
  now = GRACE_MS + 1;
}

afterEach(() => {
  act(() => useScreensaverStore.getState().stop());
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia;
});

describe('Screensaver overlay', () => {
  it('renders in the screensaver slot only while running', () => {
    render(<OverlayLayer />);
    expect(screen.queryByRole('dialog', { name: 'Screen saver' })).toBeNull();
    start();
    const saver = screen.getByRole('dialog', { name: 'Screen saver' });
    expect(saver).toHaveAttribute('data-saver', 'pipes');
    expect(saver.closest('[data-overlay]')).toHaveAttribute(
      'data-overlay',
      'screensaver',
    );
    expect(saver).toHaveFocus();
  });

  it('a small pointer jitter keeps it running; a real move stops it', () => {
    render(<OverlayLayer />);
    start();
    fireEvent.pointerMove(window, { clientX: 10, clientY: 10 });
    fireEvent.pointerMove(window, { clientX: 12, clientY: 12 });
    expect(useScreensaverStore.getState().running).not.toBeNull();
    fireEvent.pointerMove(window, { clientX: 30, clientY: 10 });
    expect(useScreensaverStore.getState().running).toBeNull();
  });

  it('the key that stops it is swallowed', () => {
    render(<OverlayLayer />);
    start();
    const ev = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
    act(() => void window.dispatchEvent(ev));
    expect(ev.defaultPrevented).toBe(true);
    expect(useScreensaverStore.getState().running).toBeNull();
  });

  it('the click that stops it does not reach the desktop', () => {
    const onClick = vi.fn();
    render(
      <>
        <button type="button" onClick={onClick}>
          Start
        </button>
        <OverlayLayer />
      </>,
    );
    start();
    const button = screen.getByRole('button', { name: 'Start' });
    fireEvent.pointerDown(button);
    expect(useScreensaverStore.getState().running).toBeNull();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ignores the input that started Preview', () => {
    render(<OverlayLayer />);
    now = 0;
    act(() => useScreensaverStore.getState().startPreview('marquee', 'x'));
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(useScreensaverStore.getState().running).not.toBeNull();
  });

  it('reduced motion shows a still screen instead of the animation', () => {
    setReducedMotion(true);
    render(<OverlayLayer />);
    start('marquee');
    const saver = screen.getByRole('dialog', { name: 'Screen saver' });
    expect(saver).toHaveAttribute('data-reduced', 'true');
    expect(saver.querySelector('canvas')).toBeNull();
    expect(screen.getByText('still online')).toBeInTheDocument();
  });
});
