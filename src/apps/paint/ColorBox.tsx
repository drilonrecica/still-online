// The colour box: current colours (primary over secondary) and the 28-colour palette.
// Left click picks the primary colour, right click (or Shift+click / Shift+Enter) the secondary.
import { useT } from '@/i18n/useT';
import { PALETTE } from './palette';
import styles from './Paint.module.css';

export interface ColorBoxProps {
  primary: string;
  secondary: string;
  onPick: (hex: string, secondary: boolean) => void;
}

export function ColorBox({ primary, secondary, onPick }: ColorBoxProps) {
  const t = useT();
  return (
    <div className={styles.colorBox}>
      <div
        className={styles.current}
        role="img"
        aria-label={t('paint.colorCurrent', { primary, secondary })}
      >
        <span className={styles.secondary} style={{ background: secondary }} />
        <span className={styles.primary} style={{ background: primary }} />
      </div>
      <div
        className={styles.palette}
        role="group"
        aria-label={t('paint.colors')}
      >
        {PALETTE.map((hex) => (
          <button
            key={hex}
            type="button"
            className={styles.swatch}
            style={{ background: hex }}
            aria-label={t('paint.color', { hex })}
            title={hex}
            onClick={(e) => onPick(hex, e.shiftKey)}
            onContextMenu={(e) => {
              e.preventDefault();
              onPick(hex, true);
            }}
          />
        ))}
      </div>
    </div>
  );
}
