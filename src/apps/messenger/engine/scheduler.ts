import { scaleMs } from '@/os/speed';
import type { Scheduler } from './types';

/** Browser timers. Looks the globals up on every call, so Vitest fake timers apply. */
export const realScheduler: Scheduler = {
  setTimeout: (fn, ms) => globalThis.setTimeout(fn, scaleMs(ms)),
  clearTimeout: (handle) =>
    globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
  now: () => Date.now(),
};
