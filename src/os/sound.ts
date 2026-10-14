// Sound service: original sounds synthesized with Web Audio (no audio assets). They aim for
// the *feel* of 2007 desktop and messenger sounds (airy pads, soft bells, a rattling nudge)
// with original melodies. Browsers block audio before a user gesture, so playSound is a
// no-op until one.
import { useSettingsStore } from '@/os/store/settings';

export const SOUND_NAMES = [
  'startup',
  'logon',
  'logoff',
  'error',
  'notify',
  'online',
  'nudge',
  'click',
] as const;
export type SoundName = (typeof SOUND_NAMES)[number];

interface VoiceBase {
  /** Start offset in seconds. */
  at: number;
  /** Total length in seconds, release included. */
  dur: number;
  /** Peak loudness, 0..1. */
  gain?: number;
  /** Seconds to reach the peak (soft pads use long attacks). */
  attack?: number;
  /** Stereo position, -1 (left) .. 1 (right). */
  pan?: number;
}

/** A plain oscillator, optionally doubled with detune and softened by a low-pass. */
export interface ToneVoice extends VoiceBase {
  kind: 'tone';
  /** MIDI note number. */
  note: number;
  wave?: OscillatorType;
  /** Cents between two detuned copies (a chorus-like width); 0 = one oscillator. */
  detune?: number;
  /** Low-pass cutoff in Hz. */
  cutoff?: number;
}

/** Two-operator FM: a bright attack that mellows, like a bell or electric piano. */
export interface BellVoice extends VoiceBase {
  kind: 'bell';
  note: number;
  /** Modulator/carrier frequency ratio: 1 warm, ~3.5 metallic. */
  ratio?: number;
  /** Modulation depth at the attack (fades to a tenth). */
  index?: number;
}

/** Band-passed white noise: rattles, ticks, breath. */
export interface NoiseVoice extends VoiceBase {
  kind: 'noise';
  /** Band centre in Hz. */
  band: number;
  q?: number;
}

export type Voice = ToneVoice | BellVoice | NoiseVoice;

export interface SoundDef {
  voices: Voice[];
  /** Reverb send, 0..1. */
  reverb?: number;
}

const tone = (
  note: number,
  at: number,
  dur: number,
  opts: Partial<Omit<ToneVoice, 'kind' | 'note' | 'at' | 'dur'>> = {},
): ToneVoice => ({ kind: 'tone', note, at, dur, ...opts });

const bell = (
  note: number,
  at: number,
  dur: number,
  opts: Partial<Omit<BellVoice, 'kind' | 'note' | 'at' | 'dur'>> = {},
): BellVoice => ({ kind: 'bell', note, at, dur, ...opts });

const noise = (
  band: number,
  at: number,
  dur: number,
  opts: Partial<Omit<NoiseVoice, 'kind' | 'band' | 'at' | 'dur'>> = {},
): NoiseVoice => ({ kind: 'noise', band, at, dur, ...opts });

/** A soft, wide pad chord: two detuned saws per note through a low-pass. */
const pad = (notes: number[], at: number, dur: number, gain = 0.07) =>
  notes.map((n, i) =>
    tone(n, at, dur, {
      wave: 'sawtooth',
      detune: 9,
      cutoff: 1800,
      attack: Math.min(0.9, dur / 3),
      gain,
      pan: (i / Math.max(1, notes.length - 1)) * 1.2 - 0.6,
    }),
  );

export const SOUND_DEFS: Record<SoundName, SoundDef> = {
  // A slow, airy swell (D♭ major 9) with a rising bell figure over it (~3.9s).
  startup: {
    reverb: 0.5,
    voices: [
      ...pad([49, 61, 65, 68, 72], 0, 3.9, 0.06),
      bell(77, 0.45, 1.6, { ratio: 1, index: 1.2, gain: 0.16, pan: -0.3 }),
      bell(80, 0.85, 1.6, { ratio: 1, index: 1.2, gain: 0.16, pan: 0.1 }),
      bell(84, 1.25, 1.8, { ratio: 1, index: 1.2, gain: 0.16, pan: 0.35 }),
      bell(82, 1.85, 2.0, { ratio: 1, index: 1.0, gain: 0.15, pan: 0 }),
      bell(89, 2.35, 1.5, { ratio: 3.5, index: 0.8, gain: 0.07, pan: 0.4 }),
      bell(85, 2.35, 1.5, { ratio: 3.5, index: 0.8, gain: 0.07, pan: -0.4 }),
    ],
  },
  // Warm rising electric-piano arpeggio over a short pad (~1.8s).
  logon: {
    reverb: 0.35,
    voices: [
      ...pad([55, 62, 67], 0.05, 1.7, 0.05),
      bell(67, 0, 0.9, { ratio: 1, index: 1.6, gain: 0.18, pan: -0.25 }),
      bell(71, 0.16, 0.9, { ratio: 1, index: 1.6, gain: 0.18, pan: 0 }),
      bell(74, 0.32, 1.4, { ratio: 1, index: 1.4, gain: 0.18, pan: 0.25 }),
      bell(79, 0.32, 1.4, { ratio: 1, index: 1.0, gain: 0.1, pan: 0.25 }),
    ],
  },
  // The same colours, falling (~1.8s).
  logoff: {
    reverb: 0.35,
    voices: [
      ...pad([55, 62], 0.05, 1.7, 0.05),
      bell(79, 0, 0.9, { ratio: 1, index: 1.6, gain: 0.18, pan: 0.25 }),
      bell(74, 0.16, 0.9, { ratio: 1, index: 1.6, gain: 0.18, pan: 0 }),
      bell(67, 0.32, 1.4, { ratio: 1, index: 1.4, gain: 0.18, pan: -0.25 }),
      bell(71, 0.32, 1.4, { ratio: 1, index: 1.0, gain: 0.1, pan: -0.25 }),
    ],
  },
  // A muffled two-chord thud (~0.7s).
  error: {
    reverb: 0.2,
    voices: [
      tone(57, 0, 0.3, { wave: 'square', cutoff: 900, gain: 0.12 }),
      tone(64, 0, 0.3, { wave: 'square', cutoff: 900, gain: 0.1 }),
      tone(52, 0.17, 0.5, { wave: 'square', cutoff: 700, gain: 0.13 }),
      tone(59, 0.17, 0.5, { wave: 'square', cutoff: 700, gain: 0.1 }),
    ],
  },
  // New message: a bright little two-bell "ding-dong" (~0.8s).
  notify: {
    reverb: 0.25,
    voices: [
      bell(81, 0, 0.5, { ratio: 3.5, index: 2.2, gain: 0.2, pan: -0.15 }),
      bell(86, 0.12, 0.7, { ratio: 3.5, index: 2.0, gain: 0.2, pan: 0.15 }),
    ],
  },
  // A contact signed in: a soft rising marimba-like triad (~0.9s).
  online: {
    reverb: 0.25,
    voices: [
      bell(74, 0, 0.45, { ratio: 4, index: 0.9, gain: 0.17, pan: -0.3 }),
      bell(78, 0.11, 0.45, { ratio: 4, index: 0.9, gain: 0.17, pan: 0 }),
      bell(81, 0.22, 0.7, { ratio: 4, index: 0.9, gain: 0.17, pan: 0.3 }),
    ],
  },
  // Nudge: a rattling buzz that shakes left/right, like a window banging (~0.9s).
  nudge: {
    reverb: 0.15,
    voices: [
      ...Array.from({ length: 9 }, (_, i) =>
        noise(i % 2 ? 700 : 950, i * 0.07, 0.09, {
          q: 3,
          gain: 0.45 - i * 0.03,
          pan: i % 2 ? 0.6 : -0.6,
        }),
      ),
      tone(40, 0, 0.7, {
        wave: 'sawtooth',
        cutoff: 420,
        gain: 0.16,
        detune: 25,
      }),
      bell(76, 0.62, 0.3, { ratio: 1.5, index: 3, gain: 0.08 }),
    ],
  },
  // A soft tick (~0.03s).
  click: {
    voices: [noise(3500, 0, 0.03, { q: 1.2, gain: 0.2 })],
  },
};

/** Where a sound ends, in seconds from its start. */
export function soundLength(name: SoundName): number {
  return Math.max(...SOUND_DEFS[name].voices.map((v) => v.at + v.dur));
}

const AudioCtor: typeof AudioContext | undefined =
  typeof window === 'undefined'
    ? undefined
    : (window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext);

let ctx: AudioContext | null = null;
let unlocked = false;
// Per context, so sounds can also be rendered offline (OfflineAudioContext).
let reverbs = new WeakMap<BaseAudioContext, AudioNode>();
let noises = new WeakMap<BaseAudioContext, AudioBuffer>();

/** The app-wide AudioContext, created lazily on first use and then reused. */
export function getAudioContext(): AudioContext | null {
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
  const c = getAudioContext();
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

/** One second of white noise, made once per context. */
function getNoise(c: BaseAudioContext): AudioBuffer | null {
  const cached = noises.get(c);
  if (cached || typeof c.createBuffer !== 'function') return cached ?? null;
  const buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  noises.set(c, buf);
  return buf;
}

/** A shared room reverb (generated impulse response) feeding the speakers, made once. */
function getReverb(c: BaseAudioContext): AudioNode | null {
  const cached = reverbs.get(c);
  if (cached) return cached;
  if (typeof c.createConvolver !== 'function') return null;
  const seconds = 2.2;
  const length = Math.floor(c.sampleRate * seconds);
  const ir = c.createBuffer(2, length, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < length; i++)
      data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
  }
  const convolver = c.createConvolver();
  convolver.buffer = ir;
  convolver.connect(c.destination);
  reverbs.set(c, convolver);
  return convolver;
}

const freqOf = (note: number) => 440 * 2 ** ((note - 69) / 12);

/** Attack to the peak, then an exponential fade to silence at the voice's end. */
function envelope(c: BaseAudioContext, v: Voice, t0: number): GainNode {
  const env = c.createGain();
  const peak = v.gain ?? 0.2;
  const attack = Math.min(v.attack ?? 0.005, v.dur * 0.8);
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.linearRampToValueAtTime(peak, t0 + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + v.dur);
  return env;
}

/** Panner (when supported) feeding `out`; returns the node voices connect to. */
function panTo(c: BaseAudioContext, pan: number | undefined, out: AudioNode) {
  if (!pan || typeof c.createStereoPanner !== 'function') return out;
  const p = c.createStereoPanner();
  p.pan.value = pan;
  p.connect(out);
  return p;
}

function lowpass(
  c: BaseAudioContext,
  cutoff: number | undefined,
  out: AudioNode,
) {
  if (!cutoff || typeof c.createBiquadFilter !== 'function') return out;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = cutoff;
  f.connect(out);
  return f;
}

function playVoice(c: BaseAudioContext, v: Voice, t0: number, out: AudioNode) {
  const env = envelope(c, v, t0);
  env.connect(panTo(c, v.pan, out));
  const stopAt = t0 + v.dur + 0.05;

  if (v.kind === 'tone') {
    const into = lowpass(c, v.cutoff, env);
    const spread = v.detune ? [-v.detune / 2, v.detune / 2] : [0];
    for (const cents of spread) {
      const osc = c.createOscillator();
      osc.type = v.wave ?? 'sine';
      osc.frequency.value = freqOf(v.note);
      if (cents && osc.detune) osc.detune.value = cents;
      osc.connect(into);
      osc.start(t0);
      osc.stop(stopAt);
    }
  } else if (v.kind === 'bell') {
    const f = freqOf(v.note);
    const carrier = c.createOscillator();
    carrier.frequency.value = f;
    carrier.connect(env);
    const mod = c.createOscillator();
    mod.frequency.value = f * (v.ratio ?? 3.5);
    const depth = c.createGain();
    const index = v.index ?? 1.5;
    depth.gain.setValueAtTime(f * index, t0);
    depth.gain.exponentialRampToValueAtTime(
      Math.max(1, f * index * 0.1),
      t0 + v.dur,
    );
    mod.connect(depth);
    depth.connect(carrier.frequency as unknown as AudioNode);
    for (const osc of [carrier, mod]) {
      osc.start(t0);
      osc.stop(stopAt);
    }
  } else {
    const buffer = getNoise(c);
    if (!buffer || typeof c.createBufferSource !== 'function') return;
    const src = c.createBufferSource();
    src.buffer = buffer;
    let into: AudioNode = env;
    if (typeof c.createBiquadFilter === 'function') {
      const f = c.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = v.band;
      f.Q.value = v.q ?? 2;
      f.connect(env);
      into = f;
    }
    src.connect(into);
    src.start(t0);
    src.stop(stopAt);
  }
}

/** Plays a named sound. No-op when muted, volume is 0, or before a gesture. */
export function playSound(name: SoundName): void {
  const { muted, volume } = useSettingsStore.getState();
  if (muted || volume <= 0 || !unlocked) return;
  const c = getAudioContext();
  if (!c) return;
  if (c.state === 'suspended') void c.resume().catch(() => {});

  scheduleSound(c, name, volume);
}

/** Schedules `name` on any context, starting now. Also used to render sounds offline. */
export function scheduleSound(
  c: BaseAudioContext,
  name: SoundName,
  volume: number,
): void {
  const def = SOUND_DEFS[name];
  const master = c.createGain();
  master.gain.value = volume;
  master.connect(c.destination);
  const reverb = def.reverb ? getReverb(c) : null;
  if (reverb && def.reverb) {
    const send = c.createGain();
    send.gain.value = def.reverb;
    master.connect(send);
    send.connect(reverb);
  }

  const start = c.currentTime;
  for (const voice of def.voices) playVoice(c, voice, start + voice.at, master);
}

/** Test helper: forget the context and gesture state. */
export function resetSoundForTests(): void {
  ctx = null;
  unlocked = false;
  reverbs = new WeakMap();
  noises = new WeakMap();
}
