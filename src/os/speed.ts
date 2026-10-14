// Test-only fast clock: `?speed=fast` shrinks Messenger timers (contact sign-in delays, typing
// pauses, the sign-in spinner). It never touches `now()` or toast/animation durations.

export const FAST_FACTOR = 0.01;

function readFast(): boolean {
  try {
    return (
      new URLSearchParams(globalThis.location?.search).get('speed') === 'fast'
    );
  } catch {
    return false;
  }
}

const fast = readFast();

/** `ms` scaled by the speed flag (unchanged unless `?speed=fast` is in the page URL). */
export function scaleMs(ms: number): number {
  return fast ? Math.round(ms * FAST_FACTOR) : ms;
}
