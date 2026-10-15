// "Background MIDI": an original 8-bar chiptune loop (square lead, triangle bass, noise hats),
// played through the sound engine's voices. Opt-in only (a button on the Tinfoil Comets fan page).
// Real time, not `scaleMs`: it's music. Stops itself when the player mutes or zeroes the volume.
import {
  getAudioContext,
  scheduleVoices,
  unlockAudio,
  type Voice,
} from './sound';
import { useSettingsStore } from './store/settings';

const BPM = 150;
/** One eighth note in seconds. */
const EIGHTH = 60 / BPM / 2;
const BAR = EIGHTH * 8;
export const BARS = 8;
export const LOOP_SECONDS = BAR * BARS;

/** Lead line as [MIDI note | rest, length in eighths]; each bar adds up to 8. */
// prettier-ignore
const MELODY: readonly (readonly [number | null, number])[] = [
  [76, 2], [79, 1], [84, 1], [83, 2], [79, 2],
  [81, 3], [79, 1], [76, 2], [72, 2],
  [77, 1], [81, 1], [84, 2], [81, 1], [77, 1], [79, 2],
  [74, 2], [79, 2], [83, 3], [null, 1],
  [76, 1], [76, 1], [79, 1], [76, 1], [84, 2], [86, 2],
  [88, 2], [84, 1], [81, 1], [83, 2], [81, 2],
  [77, 1], [79, 1], [81, 1], [84, 1], [83, 2], [79, 2],
  [86, 2], [83, 2], [84, 4],
];

/** Bass root per bar: C, Am, F, G, C, Am, F, G. */
const ROOTS = [48, 45, 41, 43, 48, 45, 41, 43] as const;

/** Every voice of one loop, starting at 0 and ending within `LOOP_SECONDS`. */
export function chiptuneVoices(): Voice[] {
  const voices: Voice[] = [];
  let t = 0;
  for (const [note, eighths] of MELODY) {
    const dur = eighths * EIGHTH;
    if (note !== null) {
      voices.push({
        kind: 'tone',
        note,
        at: t,
        dur: dur * 0.9,
        wave: 'square',
        gain: 0.06,
        cutoff: 3200,
        release: 0.04,
      });
    }
    t += dur;
  }
  ROOTS.forEach((root, bar) => {
    for (let i = 0; i < 8; i++) {
      const at = bar * BAR + i * EIGHTH;
      voices.push({
        kind: 'tone',
        note: root + (i % 2 ? 12 : 0),
        at,
        dur: EIGHTH * 0.85,
        wave: 'triangle',
        gain: 0.13,
        release: 0.03,
      });
      if (i % 2 === 0)
        voices.push({
          kind: 'noise',
          band: 8000,
          q: 1,
          at,
          dur: 0.05,
          gain: 0.04,
        });
      if (i % 4 === 0)
        voices.push({
          kind: 'tone',
          note: 45,
          glideTo: 28,
          at,
          dur: 0.12,
          gain: 0.25,
        });
    }
  });
  return voices;
}

let master: GainNode | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let unsubscribe: (() => void) | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export function isChiptunePlaying(): boolean {
  return master !== null;
}

/** Subscribes to play/stop changes (for `useSyncExternalStore`). */
export function subscribeChiptune(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Starts the loop (call from a click: it counts as the audio gesture). Returns false when muted,
 * at volume 0 or without Web Audio. Calling it while playing keeps the current loop.
 */
export function playChiptune(): boolean {
  if (master) return true;
  const { muted, volume } = useSettingsStore.getState();
  if (muted || volume <= 0) return false;
  unlockAudio();
  const c = getAudioContext();
  if (!c) return false;

  const out = c.createGain();
  out.gain.value = volume * 0.6;
  out.connect(c.destination);
  master = out;
  const voices = chiptuneVoices();
  const queue = (start: number) => {
    if (master !== out) return;
    scheduleVoices(c, voices, out, start);
    // Queue the next pass a little before this one ends.
    const lead = Math.max(0, start + LOOP_SECONDS - c.currentTime - 1) * 1000;
    timer = setTimeout(() => queue(start + LOOP_SECONDS), lead);
  };
  queue(c.currentTime + 0.05);
  unsubscribe = useSettingsStore.subscribe((s) => {
    if (s.muted || s.volume <= 0) stopChiptune();
  });
  notify();
  return true;
}

export function stopChiptune(): void {
  if (!master) return;
  try {
    master.disconnect();
  } catch {
    // Already disconnected.
  }
  master = null;
  if (timer !== null) clearTimeout(timer);
  timer = null;
  unsubscribe?.();
  unsubscribe = null;
  notify();
}
