// Paint on touch (v0.6): one finger draws, a second cancels the stroke and pans; phone size.
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getApp } from '@/apps/registry';
import { useDeviceStore } from '@/os/device';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';
import type { PixelBuffer } from './pixels';
import { painted } from './test-helpers';

let shown: PixelBuffer | null = null;
vi.mock('./codec', () => ({
  TEXT_FONT: '16px sans-serif',
  TEXT_LINE_HEIGHT: 19,
  blitToCanvas: (_canvas: HTMLCanvasElement, buf: PixelBuffer) => {
    shown = buf;
  },
  encodePng: () => Promise.resolve(new Blob(['png'])),
  decodeImage: () => Promise.resolve(null),
  drawText: () => false,
}));

async function openPaint() {
  render(<WindowLayer getApp={getApp} />);
  act(() => void useWindowsStore.getState().openApp('paint'));
  const canvas = await screen.findByRole('img', { name: 'Picture' });
  const area = screen.getByRole('region', { name: 'Canvas' });
  return { canvas, area };
}

const finger = (id: number, x: number, y: number) => ({
  pointerType: 'touch',
  pointerId: id,
  button: 0,
  clientX: x,
  clientY: y,
});

const flush = () => act(() => vi.runOnlyPendingTimers());

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['requestAnimationFrame'] });
  shown = null;
  act(() => useWindowsStore.getState().closeAll());
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  useDeviceStore.setState({ device: 'desktop' });
});

describe('Paint touch', () => {
  it('draws with one finger', async () => {
    const { canvas } = await openPaint();
    fireEvent.pointerDown(canvas, finger(1, 5, 5));
    fireEvent.pointerMove(canvas, finger(1, 25, 5));
    fireEvent.pointerUp(canvas, finger(1, 25, 5));
    flush();
    expect(painted(shown!)).toContain('15,5');
    expect(screen.getByRole('menuitem', { name: 'File' })).toBeVisible();
  });

  it('cancels the stroke when a second finger comes down, then pans the work area', async () => {
    const { canvas, area } = await openPaint();
    fireEvent.pointerDown(canvas, finger(1, 5, 5));
    fireEvent.pointerMove(canvas, finger(1, 25, 5));
    flush();
    expect(painted(shown!).length).toBeGreaterThan(0);

    // The second finger: the line so far is gone, and it never becomes an undo step.
    fireEvent.pointerDown(canvas, finger(2, 105, 5));
    flush();
    expect(painted(shown!)).toEqual([]);

    // Both fingers move up-left by 30×20: the area scrolls down-right by as much.
    fireEvent.pointerMove(canvas, finger(1, -5, -15));
    fireEvent.pointerMove(canvas, finger(2, 75, -15));
    expect(area.scrollLeft).toBe(30);
    expect(area.scrollTop).toBe(20);

    fireEvent.pointerUp(canvas, finger(2, 75, -15));
    fireEvent.pointerUp(canvas, finger(1, -5, -15));
    flush();
    expect(painted(shown!)).toEqual([]);
    fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(screen.getByRole('menuitem', { name: /^Undo/ })).toBeDisabled();
  });

  it('keeps a mouse stroke when a touch lands elsewhere', async () => {
    const { canvas } = await openPaint();
    fireEvent.pointerDown(canvas, { ...finger(1, 5, 5), pointerType: 'mouse' });
    fireEvent.pointerMove(canvas, {
      ...finger(1, 25, 5),
      pointerType: 'mouse',
    });
    fireEvent.pointerUp(canvas, { ...finger(1, 25, 5), pointerType: 'mouse' });
    flush();
    expect(painted(shown!)).toContain('15,5');
  });
});

describe('Paint new picture size', () => {
  function areaSize(w: number, h: number) {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(w);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(h);
  }

  it('is 640×480 on a desktop', async () => {
    areaSize(400, 700);
    await openPaint();
    expect(screen.getByText('640x480')).toBeInTheDocument();
  });

  it('fills the work area on a phone (inside its padding)', async () => {
    useDeviceStore.setState({ device: 'phone' });
    areaSize(400, 700);
    await openPaint();
    expect(screen.getByText('391x691')).toBeInTheDocument();
    // Not a change: closing asks nothing.
    act(() => {
      const win = useWindowsStore.getState().windows[0]!;
      useWindowsStore.getState().closeWindow(win.id);
    });
    expect(screen.queryByRole('img', { name: 'Picture' })).toBeNull();
  });

  it('is at least 200×200 on a phone', async () => {
    useDeviceStore.setState({ device: 'phone' });
    areaSize(120, 150);
    await openPaint();
    expect(screen.getByText('200x200')).toBeInTheDocument();
  });

  it('applies to File → New too', async () => {
    useDeviceStore.setState({ device: 'phone' });
    areaSize(400, 700);
    await openPaint();
    areaSize(300, 500);
    fireEvent.click(screen.getByRole('menuitem', { name: 'File' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /^New/ }));
    expect(screen.getByText('291x491')).toBeInTheDocument();
  });
});
