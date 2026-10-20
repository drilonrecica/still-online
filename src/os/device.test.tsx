import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import {
  classifyDevice,
  DEVICE_PHONE_MAX_HEIGHT,
  DEVICE_PHONE_MAX_WIDTH,
  getDevice,
  installDevice,
  RECLAMP_DEBOUNCE_MS,
  taskbarHeight,
  useDevice,
  useDeviceStore,
} from '@/os/device';
import {
  setAppResolver,
  useWindowsStore,
  viewportWorkArea,
} from '@/os/store/windows';
import { TASKBAR_HEIGHT } from '@/os/types';

const initialWindows = useWindowsStore.getState();

function setViewport(width: number, height: number, coarse = false) {
  Object.assign(window, { innerWidth: width, innerHeight: height });
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: coarse && query === '(pointer: coarse)',
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  vi.useRealTimers();
  Object.assign(window, { innerWidth: 1024, innerHeight: 768 });
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia;
  useDeviceStore.setState({ device: 'desktop' });
  useWindowsStore.setState(initialWindows, true);
});

describe('classifyDevice', () => {
  it('is a phone below the width or height limit', () => {
    expect(DEVICE_PHONE_MAX_WIDTH).toBe(600);
    expect(DEVICE_PHONE_MAX_HEIGHT).toBe(500);
    expect(classifyDevice(412, 915, true)).toBe('phone');
    expect(classifyDevice(915, 412, true)).toBe('phone');
    expect(classifyDevice(599, 800, false)).toBe('phone');
    expect(classifyDevice(1280, 499, false)).toBe('phone');
  });

  it('is a tablet with a coarse pointer, else a desktop', () => {
    expect(classifyDevice(1024, 768, true)).toBe('tablet');
    expect(classifyDevice(600, 500, true)).toBe('tablet');
    expect(classifyDevice(1024, 768, false)).toBe('desktop');
    expect(classifyDevice(1280, 800, false)).toBe('desktop');
  });
});

describe('getDevice', () => {
  it('reads the viewport and the pointer media query', () => {
    setViewport(412, 915, true);
    expect(getDevice()).toBe('phone');
    setViewport(915, 412, true);
    expect(getDevice()).toBe('phone');
    setViewport(1024, 768, true);
    expect(getDevice()).toBe('tablet');
    setViewport(1280, 800);
    expect(getDevice()).toBe('desktop');
  });

  it('treats a missing matchMedia (jsdom) as a fine pointer', () => {
    expect(window.matchMedia).toBeUndefined();
    expect(getDevice()).toBe('desktop');
  });
});

describe('taskbarHeight', () => {
  it('keeps 30 px on a desktop and uses 40 px on touch devices', () => {
    expect(taskbarHeight('desktop')).toBe(TASKBAR_HEIGHT);
    expect(taskbarHeight('phone')).toBe(40);
    expect(taskbarHeight('tablet')).toBe(40);
  });
});

describe('viewportWorkArea', () => {
  it('subtracts the device taskbar from the visual viewport height', () => {
    setViewport(1280, 800);
    expect(viewportWorkArea()).toEqual({ w: 1280, h: 770 });
    setViewport(1024, 768, true);
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: { height: 400.6 },
    });
    try {
      expect(viewportWorkArea()).toEqual({ w: 1024, h: 360 });
    } finally {
      // @ts-expect-error restore jsdom default (no visualViewport)
      delete window.visualViewport;
    }
  });
});

describe('installDevice', () => {
  beforeEach(() => vi.useFakeTimers());

  function Probe() {
    return <span data-testid="probe">{useDevice()}</span>;
  }

  it('updates the device class live on resize and orientationchange', () => {
    const { getByTestId } = render(<Probe />);
    const uninstall = installDevice();
    expect(getByTestId('probe').textContent).toBe('desktop');
    act(() => {
      setViewport(412, 915, true);
      window.dispatchEvent(new Event('resize'));
    });
    expect(getByTestId('probe').textContent).toBe('phone');
    act(() => {
      setViewport(1024, 768, true);
      window.dispatchEvent(new Event('orientationchange'));
    });
    expect(getByTestId('probe').textContent).toBe('tablet');
    uninstall();
    act(() => {
      setViewport(1280, 800);
      window.dispatchEvent(new Event('resize'));
    });
    expect(getByTestId('probe').textContent).toBe('tablet');
  });

  it('re-clamps the windows once, debounced, after resizing stops', () => {
    const reclampAll = vi.fn();
    useWindowsStore.setState({ reclampAll });
    const uninstall = installDevice();
    vi.advanceTimersByTime(RECLAMP_DEBOUNCE_MS);
    reclampAll.mockClear();
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(RECLAMP_DEBOUNCE_MS / 2);
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(RECLAMP_DEBOUNCE_MS - 1);
    expect(reclampAll).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(reclampAll).toHaveBeenCalledTimes(1);
    uninstall();
  });

  it('skips the re-clamp on a phone, so stored geometry survives', () => {
    const reclampAll = vi.fn();
    useWindowsStore.setState({ reclampAll });
    const uninstall = installDevice();
    setViewport(412, 915, true);
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(RECLAMP_DEBOUNCE_MS * 2);
    expect(reclampAll).not.toHaveBeenCalled();
    uninstall();
  });

  it('really moves a window back on screen after the viewport shrinks', () => {
    setAppResolver(() => ({
      id: 'notepad',
      titleKey: 'apps.notepad.title',
      defaultSize: { w: 400, h: 300 },
      singleInstance: false,
    }));
    setViewport(1280, 800);
    const uninstall = installDevice();
    const id = useWindowsStore.getState().openApp('notepad');
    useWindowsStore.getState().moveWindow(id, 1200, 700);
    setViewport(800, 600);
    window.dispatchEvent(new Event('resize'));
    vi.advanceTimersByTime(RECLAMP_DEBOUNCE_MS);
    const win = useWindowsStore.getState().windows.find((w) => w.id === id);
    expect(win?.x).toBe(800 - 40);
    expect(win?.y).toBe(600 - TASKBAR_HEIGHT - 30);
    uninstall();
  });
});
