// The XP balloon: a yellow tooltip with a tail pointing down at the tray, above the clock.
import { useT } from '@/i18n/useT';
import type { BalloonIcon } from '@/os/serviceTypes';
import { useBalloonStore } from './store';
import styles from './Balloon.module.css';

const ICON_FILL: Record<BalloonIcon, string> = {
  info: '#2a5fd6',
  warning: '#e8a800',
  network: '#2e8b2e',
  shield: '#c0392b',
  sheep: '#8a8a8a',
  stapley: '#7a4fb5',
};

const ICON_GLYPH: Record<BalloonIcon, string> = {
  info: 'i',
  warning: '!',
  network: '↔',
  shield: '✓',
  sheep: '☁',
  stapley: '?',
};

function BalloonGlyph({ icon }: { icon: BalloonIcon }) {
  return (
    <span
      className={styles.icon}
      style={{ background: ICON_FILL[icon] }}
      data-icon={icon}
      aria-hidden="true"
    >
      {ICON_GLYPH[icon]}
    </span>
  );
}

export function BalloonLayer() {
  const balloon = useBalloonStore((s) => s.current);
  const dismiss = useBalloonStore((s) => s.dismiss);
  const t = useT();
  if (!balloon) return null;

  return (
    <div className={styles.balloon} role="status" data-testid="balloon">
      <button
        type="button"
        className={styles.body}
        onClick={() => {
          // Dismiss first: onClick may push a follow-up balloon, which must show immediately.
          dismiss();
          balloon.onClick?.();
        }}
      >
        <span className={styles.title}>
          <BalloonGlyph icon={balloon.icon ?? 'info'} />
          {balloon.title}
        </span>
        <span className={styles.text}>{balloon.text}</span>
      </button>
      <button
        type="button"
        className={styles.close}
        aria-label={t('balloon.close')}
        onClick={dismiss}
      >
        ×
      </button>
      <span className={styles.tail} aria-hidden="true" />
    </div>
  );
}
