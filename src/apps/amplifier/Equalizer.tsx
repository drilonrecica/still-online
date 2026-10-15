// Amplifier equalizer panel: ON/AUTO, presets, preamp + 10 vertical band sliders.
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import {
  bandLabel,
  EQ_FREQUENCIES,
  EQ_MAX_DB,
  EQ_MIN_DB,
  EQ_PRESET_NAMES,
  matchPreset,
  type EqPresetName,
  type EqSettings,
} from './eq';
import styles from './Amplifier.module.css';

/** Extra window height (px) the panel adds under the main player: 92px panel + 4px gap. */
export const EQ_HEIGHT = 96;

interface Props {
  eq: EqSettings;
  onToggle: () => void;
  onPreamp: (db: number) => void;
  onBand: (band: number, db: number) => void;
  onPreset: (name: EqPresetName) => void;
}

const PRESET_KEY = {
  Flat: 'amplifier.eq.preset.flat',
  Rock: 'amplifier.eq.preset.rock',
  Pop: 'amplifier.eq.preset.pop',
  Dance: 'amplifier.eq.preset.dance',
  Classical: 'amplifier.eq.preset.classical',
  'Bass Boost': 'amplifier.eq.preset.bassBoost',
  'Treble Boost': 'amplifier.eq.preset.trebleBoost',
  "Kayla's Party": 'amplifier.eq.preset.kaylasParty',
} as const satisfies Record<EqPresetName, string>;

const dbText = (db: number) => `${db > 0 ? '+' : ''}${db} dB`;

function Slider({
  label,
  short,
  value,
  onChange,
}: {
  label: string;
  short: string;
  value: number;
  onChange: (db: number) => void;
}) {
  return (
    <label className={styles.eqBand} title={`${label}: ${dbText(value)}`}>
      <input
        type="range"
        className={styles.eqSlider}
        aria-label={label}
        aria-valuetext={dbText(value)}
        min={EQ_MIN_DB}
        max={EQ_MAX_DB}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span aria-hidden="true">{short}</span>
    </label>
  );
}

export default function Equalizer({
  eq,
  onToggle,
  onPreamp,
  onBand,
  onPreset,
}: Props) {
  // Like the light on a real skin: it glows and does nothing else.
  const t = useT();
  const [auto, setAuto] = useState(false);
  const preset = matchPreset(eq);

  return (
    <div
      className={styles.eq}
      data-testid="equalizer"
      role="group"
      aria-label={t('amplifier.equalizer')}
    >
      <div className={styles.eqHeader}>
        <button
          type="button"
          className={styles.eqToggle}
          aria-label={t('amplifier.eq.on')}
          aria-pressed={eq.on}
          onClick={onToggle}
        >
          {t('amplifier.eq.shortOn')}
        </button>
        <button
          type="button"
          className={styles.eqToggle}
          aria-label={t('amplifier.eq.auto')}
          aria-pressed={auto}
          onClick={() => setAuto((a) => !a)}
        >
          {t('amplifier.eq.shortAuto')}
        </button>
        <select
          className={styles.eqPresets}
          aria-label={t('amplifier.eq.presets')}
          value={preset ?? ''}
          onChange={(e) => {
            const name = EQ_PRESET_NAMES.find((n) => n === e.target.value);
            if (name) onPreset(name);
          }}
        >
          {preset === null && (
            <option value="" disabled>
              {t('amplifier.eq.custom')}
            </option>
          )}
          {EQ_PRESET_NAMES.map((name) => (
            <option key={name} value={name}>
              {t(PRESET_KEY[name])}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.eqSliders} data-on={eq.on}>
        <Slider
          label={t('amplifier.eq.preamp')}
          short={t('amplifier.eq.shortPreamp')}
          value={eq.preamp}
          onChange={onPreamp}
        />
        <span className={styles.eqDivider} aria-hidden="true" />
        {EQ_FREQUENCIES.map((hz, i) => (
          <Slider
            key={hz}
            label={hz >= 1000 ? `${hz / 1000} kHz` : `${hz} Hz`}
            short={bandLabel(hz)}
            value={eq.bands[i] ?? 0}
            onChange={(db) => onBand(i, db)}
          />
        ))}
      </div>
    </div>
  );
}
