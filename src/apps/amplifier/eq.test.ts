import { describe, expect, it } from 'vitest';
import {
  bandLabel,
  clampDb,
  DEFAULT_EQ,
  EQ_FREQUENCIES,
  EQ_PRESET_NAMES,
  EQ_PRESETS,
  effectiveGains,
  matchPreset,
  presetSettings,
  sanitizeEq,
} from './eq';

describe('eq', () => {
  it('has the eight presets, each with 10 bands in range', () => {
    expect(EQ_PRESET_NAMES).toEqual([
      'Flat',
      'Rock',
      'Pop',
      'Dance',
      'Classical',
      'Bass Boost',
      'Treble Boost',
      "Kayla's Party",
    ]);
    for (const name of EQ_PRESET_NAMES) {
      const p = EQ_PRESETS[name];
      expect(p.bands).toHaveLength(EQ_FREQUENCIES.length);
      for (const db of [p.preamp, ...p.bands]) expect(clampDb(db)).toBe(db);
    }
  });

  it('presetSettings turns the EQ on and copies the curve', () => {
    const rock = presetSettings('Rock');
    expect(rock.on).toBe(true);
    expect(rock.bands).toEqual(EQ_PRESETS.Rock.bands);
    rock.bands[0] = 99;
    expect(EQ_PRESETS.Rock.bands[0]).not.toBe(99);
  });

  it('matchPreset finds the preset or null for a custom curve', () => {
    expect(matchPreset(DEFAULT_EQ)).toBe('Flat');
    expect(matchPreset(presetSettings('Dance'))).toBe('Dance');
    expect(matchPreset({ ...presetSettings("Kayla's Party"), on: false })).toBe(
      "Kayla's Party",
    );
    const custom = presetSettings('Pop');
    custom.bands[3] = 1;
    expect(matchPreset(custom)).toBeNull();
  });

  it('sanitizeEq tolerates corrupt data', () => {
    expect(sanitizeEq(null)).toEqual(DEFAULT_EQ);
    expect(sanitizeEq('loud')).toEqual(DEFAULT_EQ);
    const eq = sanitizeEq({ on: 'yes', preamp: 40, bands: [5, 'x', -99] });
    expect(eq.on).toBe(false);
    expect(eq.preamp).toBe(12);
    expect(eq.bands).toEqual([5, 0, -12, 0, 0, 0, 0, 0, 0, 0]);
    expect(sanitizeEq(presetSettings('Rock'))).toEqual(presetSettings('Rock'));
  });

  it('effectiveGains bypasses while off and converts the preamp to linear gain', () => {
    const rock = presetSettings('Rock');
    expect(effectiveGains({ ...rock, on: false })).toEqual({
      preamp: 1,
      bands: EQ_FREQUENCIES.map(() => 0),
    });
    const on = effectiveGains({ ...rock, preamp: -6 });
    expect(on.bands).toEqual(rock.bands);
    expect(on.preamp).toBeCloseTo(0.501, 3);
  });

  it('labels bands like the skin', () => {
    expect(EQ_FREQUENCIES.map(bandLabel)).toEqual([
      '60',
      '170',
      '310',
      '600',
      '1K',
      '3K',
      '6K',
      '12K',
      '14K',
      '16K',
    ]);
  });
});
