// Idle detection. See docs/architecture-v0.2.md → "World, network, idle".
import { events } from '@/os/events';
import type { OnIdle } from '@/os/serviceTypes';
import { scaleMs } from '@/os/speed';

const MINUTE_MS = 60_000;
const INPUT_EVENTS = [
  'pointermove',
  'pointerdown',
  'keydown',
  'wheel',
  'touchstart',
] as const;

interface Threshold {
  callbacks: Set<() => void>;
  timer: ReturnType<typeof setTimeout> | null;
}

const thresholds = new Map<number, Threshold>();
let lastActivity = Date.now();
/** At least one threshold fired since the last input. */
let idleEmitted = false;

function arm(minutes: number, threshold: Threshold) {
  if (threshold.timer !== null) clearTimeout(threshold.timer);
  const elapsed = Date.now() - lastActivity;
  const delay = Math.max(0, scaleMs(minutes * MINUTE_MS) - elapsed);
  threshold.timer = setTimeout(() => {
    threshold.timer = null;
    idleEmitted = true;
    events.emit('os:idle', { minutes });
    for (const cb of [...threshold.callbacks]) {
      try {
        cb();
      } catch (error) {
        console.error('[idle] callback threw', error);
      }
    }
  }, delay);
}

function onActivity() {
  lastActivity = Date.now();
  if (idleEmitted) {
    idleEmitted = false;
    events.emit('os:active', {});
  }
  for (const [minutes, threshold] of thresholds) arm(minutes, threshold);
}

/**
 * Calls `cb` once when the player has been idle for `minutes`; re-arms after
 * input. Returns an unsubscribe. `minutes <= 0` registers nothing.
 */
export const onIdle: OnIdle = (minutes, cb) => {
  if (!(minutes > 0)) return () => undefined;
  let threshold = thresholds.get(minutes);
  if (!threshold) {
    threshold = { callbacks: new Set(), timer: null };
    thresholds.set(minutes, threshold);
    arm(minutes, threshold);
  }
  const group = threshold;
  group.callbacks.add(cb);
  return () => {
    group.callbacks.delete(cb);
    if (group.callbacks.size > 0) return;
    if (group.timer !== null) clearTimeout(group.timer);
    if (thresholds.get(minutes) === group) thresholds.delete(minutes);
  };
};

/** Adds the passive window listeners. Call once from App.tsx; returns a cleanup. */
export function installIdle(): () => void {
  lastActivity = Date.now();
  idleEmitted = false;
  for (const type of INPUT_EVENTS) {
    window.addEventListener(type, onActivity, { passive: true });
  }
  return () => {
    for (const type of INPUT_EVENTS)
      window.removeEventListener(type, onActivity);
  };
}
