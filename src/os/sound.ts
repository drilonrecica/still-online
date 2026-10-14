// Sound service: original sounds synthesized with Web Audio (no audio assets).
// Browsers block audio before a user gesture, so playSound is a no-op until one.
import { useSettingsStore } from '@/os/store/settings';

export const SOUND_NAMES = [
  'startup',
  'logon',
  'logoff',
  'error',
  'notify',
  'nudge',
  'click',
] as const;
export type SoundName = (typeof SOUND_NAMES)[number];

interface Note {
  /** Frequency in Hz. */
  freq: number;
  /** Start offset in seconds. */
  at: number;
  /** Duration in seconds. */
  dur: number;
  /** Relative loudness, 0..1. */
  gain?: number;
  type?: OscillatorType;
}

/** Equal-tempered note frequency from a MIDI number. */
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

/** Notes of one chord, all starting together. */
const chord = (
  ns: number[],
  at: number,
  dur: number,
  gain = 0.25,
  type: OscillatorType = 'sine',
): Note[] => ns.map((n) => ({ freq: midi(n), at, dur, gain, type }));

export const SOUND_DEFS: Record<SoundName, Note[]> = {
  // Rising shimmer into a warm major chord (~3.2s).
  startup: [
    ...[60, 64, 67, 71, 74].map((n, i): Note => ({
      freq: midi(n),
      at: i * 0.28,
      dur: 0.9,
      gain: 0.18,
    })),
    ...chord([62, 66, 69, 74], 1.6, 1.6, 0.2),
  ],
  logon: [
    ...chord([67], 0, 0.35, 0.22),
    ...chord([71], 0.18, 0.35, 0.22),
    ...chord([74, 79], 0.36, 0.9, 0.2),
  ],
  logoff: [
    ...chord([79], 0, 0.3, 0.22),
    ...chord([74], 0.18, 0.3, 0.22),
    ...chord([67, 71], 0.36, 0.8, 0.2),
  ],
  error: [
    { freq: midi(64), at: 0, dur: 0.18, gain: 0.25, type: 'square' },
    { freq: midi(57), at: 0.16, dur: 0.35, gain: 0.25, type: 'square' },
  ],
  notify: [...chord([88], 0, 0.15, 0.2), ...chord([93], 0.1, 0.4, 0.2)],
  nudge: [0, 0.07, 0.14, 0.21, 0.28].map((at, i): Note => ({
    freq: midi(i % 2 ? 52 : 55),
    at,
    dur: 0.06,
    gain: 0.3,
    type: 'sawtooth',
  })),
  click: [{ freq: midi(84), at: 0, dur: 0.03, gain: 0.15, type: 'triangle' }],
};

const AudioCtor: typeof AudioContext | undefined =
  typeof window === 'undefined'
    ? undefined
    : (window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext);

let ctx: AudioContext | null = null;
let unlocked = false;

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  if (!AudioCtor) return null;
  try {
    ctx = new AudioCtor();
  } catch {
    ctx = null;
  }
  return ctx;
}

/** Marks a user gesture as seen: creates the context lazily and resumes it. */
export function unlockAudio(): void {
  unlocked = true;
  const c = getContext();
  if (c && c.state === 'suspended') void c.resume().catch(() => {});
}

/** Installs one-shot gesture listeners that unlock audio. Returns a cleanup. */
export function installGestureUnlock(target: Window = window): () => void {
  const events = ['pointerdown', 'keydown', 'touchstart'] as const;
  const handler = () => {
    unlockAudio();
    off();
  };
  const off = () =>
    events.forEach((e) => target.removeEventListener(e, handler));
  events.forEach((e) => target.addEventListener(e, handler, { passive: true }));
  return off;
}

/** Plays a named sound. No-op when muted, volume is 0, or before a gesture. */
export function playSound(name: SoundName): void {
  const { muted, volume } = useSettingsStore.getState();
  if (muted || volume <= 0 || !unlocked) return;
  const c = getContext();
  if (!c) return;
  if (c.state === 'suspended') void c.resume().catch(() => {});

  const master = c.createGain();
  master.gain.value = volume;
  master.connect(c.destination);

  const start = c.currentTime;
  for (const note of SOUND_DEFS[name]) {
    const osc = c.createOscillator();
    const env = c.createGain();
    const t0 = start + note.at;
    const peak = note.gain ?? 0.25;
    osc.type = note.type ?? 'sine';
    osc.frequency.value = note.freq;
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.linearRampToValueAtTime(peak, t0 + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + note.dur);
    osc.connect(env);
    env.connect(master);
    osc.start(t0);
    osc.stop(t0 + note.dur + 0.02);
  }
}

/** Test helper: forget the context and gesture state. */
export function resetSoundForTests(): void {
  ctx = null;
  unlocked = false;
}
