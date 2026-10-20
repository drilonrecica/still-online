// The device class: the one source of truth for phone / tablet / desktop. See docs/touch.md.
import { create } from 'zustand';
import { useWindowsStore } from '@/os/store/windows';
import { TASKBAR_HEIGHT } from '@/os/types';

export type Device = 'phone' | 'tablet' | 'desktop';

/** A viewport narrower than this is a phone (portrait, or a very narrow desktop window). */
export const DEVICE_PHONE_MAX_WIDTH = 600;
/** A viewport shorter than this is a phone (landscape). */
export const DEVICE_PHONE_MAX_HEIGHT = 500;
/** The taskbar on a phone or tablet (M1-02 sizes the taskbar itself). */
export const TOUCH_TASKBAR_HEIGHT = 40;
/** Windows re-clamp this long after the last resize. */
export const RECLAMP_DEBOUNCE_MS = 100;

/** The rule from "v0.6 touch rules": phone by size first, then tablet by a coarse pointer. */
export function classifyDevice(
  width: number,
  height: number,
  coarsePointer: boolean,
): Device {
  if (width < DEVICE_PHONE_MAX_WIDTH || height < DEVICE_PHONE_MAX_HEIGHT) {
    return 'phone';
  }
  return coarsePointer ? 'tablet' : 'desktop';
}

/** The current device class. Without `matchMedia` (jsdom) the pointer counts as fine. */
export function getDevice(target: Window = window): Device {
  const coarse =
    typeof target.matchMedia === 'function' &&
    target.matchMedia('(pointer: coarse)').matches;
  return classifyDevice(target.innerWidth, target.innerHeight, coarse);
}

/** Taskbar height in px: the v0.5 30 px on a desktop, 40 px on touch devices. */
export function taskbarHeight(device: Device): number {
  return device === 'desktop' ? TASKBAR_HEIGHT : TOUCH_TASKBAR_HEIGHT;
}

export const useDeviceStore = create<{ device: Device }>(() => ({
  device: getDevice(),
}));

/** The device class; re-renders when it changes. `App` renders it as `data-device`. */
export function useDevice(): Device {
  return useDeviceStore((s) => s.device);
}

/**
 * Keeps the device class live on `resize`, `orientationchange` and `visualViewport` resize, and
 * re-clamps the windows into the work area after the resizing stops. A phone skips the re-clamp:
 * its windows render maximized, and their stored desktop geometry must survive the trip.
 * Returns the uninstall function.
 */
export function installDevice(target: Window = window): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const update = () => {
    const device = getDevice(target);
    if (useDeviceStore.getState().device !== device) {
      useDeviceStore.setState({ device });
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (getDevice(target) !== 'phone') {
        useWindowsStore.getState().reclampAll();
      }
    }, RECLAMP_DEBOUNCE_MS);
  };
  update();
  const viewport = target.visualViewport;
  target.addEventListener('resize', update);
  target.addEventListener('orientationchange', update);
  viewport?.addEventListener('resize', update);
  return () => {
    clearTimeout(timer);
    target.removeEventListener('resize', update);
    target.removeEventListener('orientationchange', update);
    viewport?.removeEventListener('resize', update);
  };
}
