// Amplifier equalizer: band layout, presets and sanitizing. Pure data, no Web Audio.

/** Peaking-filter centre frequencies (Hz), low to high. */
export const EQ_FREQUENCIES = [
  60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000,
] as const;
export const EQ_Q = 1.4;
/** Gain range (dB) for the preamp and every band. */
export const EQ_MIN_DB = -12;
export const EQ_MAX_DB = 12;

export interface EqSettings {
  on: boolean;
  /** Preamp gain in dB. */
  preamp: number;
  /** One gain in dB per entry of `EQ_FREQUENCIES`. */
  bands: number[];
}

export type EqPresetName =
  | 'Flat'
  | 'Rock'
  | 'Pop'
  | 'Dance'
  | 'Classical'
  | 'Bass Boost'
  | 'Treble Boost'
  | "Kayla's Party";

interface EqPreset {
  preamp: number;
  bands: readonly number[];
}

/** Original curves; Kayla's Party is everything turned up. */
export const EQ_PRESETS: Readonly<Record<EqPresetName, EqPreset>> = {
  Flat: { preamp: 0, bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  Rock: { preamp: 0, bands: [7, 4, -4, -6, -2, 3, 7, 9, 9, 9] },
  Pop: { preamp: 0, bands: [-2, 3, 5, 6, 4, 0, -2, -2, -1, -1] },
  Dance: { preamp: 0, bands: [8, 6, 2, 0, 0, -4, -6, -6, 0, 0] },
  Classical: { preamp: 0, bands: [0, 0, 0, 0, 0, 0, -6, -6, -6, -8] },
  'Bass Boost': { preamp: -2, bands: [9, 8, 6, 3, 0, 0, 0, 0, 0, 0] },
  'Treble Boost': { preamp: -2, bands: [0, 0, 0, 0, 0, 2, 5, 8, 9, 10] },
  "Kayla's Party": { preamp: 4, bands: [12, 11, 8, 3, 0, 4, 8, 11, 12, 12] },
};

export const EQ_PRESET_NAMES = Object.keys(EQ_PRESETS) as EqPresetName[];

export const DEFAULT_EQ: EqSettings = {
  on: false,
  preamp: 0,
  bands: EQ_FREQUENCIES.map(() => 0),
};

/** Clamps to the slider range; non-numbers become 0. */
export function clampDb(db: unknown): number {
  if (typeof db !== 'number' || !Number.isFinite(db)) return 0;
  return Math.min(EQ_MAX_DB, Math.max(EQ_MIN_DB, db));
}

/** Decibels → linear gain for a GainNode. */
export const dbToGain = (db: number) => 10 ** (db / 20);

/** The settings a preset produces; picking a preset also switches the EQ on. */
export function presetSettings(name: EqPresetName): EqSettings {
  const p = EQ_PRESETS[name];
  return { on: true, preamp: p.preamp, bands: [...p.bands] };
}

/** The preset whose curve equals `eq`, or null for a custom curve. */
export function matchPreset(eq: EqSettings): EqPresetName | null {
  return (
    EQ_PRESET_NAMES.find((name) => {
      const p = EQ_PRESETS[name];
      return (
        p.preamp === eq.preamp && p.bands.every((b, i) => b === eq.bands[i])
      );
    }) ?? null
  );
}

/** Tolerates corrupt storage: wrong types fall back, values are clamped. */
export function sanitizeEq(value: unknown): EqSettings {
  if (typeof value !== 'object' || value === null) return DEFAULT_EQ;
  const v = value as Record<string, unknown>;
  const bands = Array.isArray(v.bands) ? v.bands : [];
  return {
    on: typeof v.on === 'boolean' ? v.on : DEFAULT_EQ.on,
    preamp: clampDb(v.preamp),
    bands: EQ_FREQUENCIES.map((_, i) => clampDb(bands[i])),
  };
}

/** Gains to put on the audio graph: all flat while the EQ is off (bypass). */
export function effectiveGains(eq: EqSettings): {
  preamp: number;
  bands: number[];
} {
  if (!eq.on) return { preamp: 1, bands: EQ_FREQUENCIES.map(() => 0) };
  return {
    preamp: dbToGain(clampDb(eq.preamp)),
    bands: EQ_FREQUENCIES.map((_, i) => clampDb(eq.bands[i])),
  };
}

/** "1K", "12K", "60" — the band labels under the sliders. */
export const bandLabel = (hz: number) =>
  hz >= 1000 ? `${hz / 1000}K` : String(hz);
