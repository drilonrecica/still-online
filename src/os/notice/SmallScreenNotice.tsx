// XP-style dialog shown over the boot screen on narrow or touch-first devices. Dismissal persists.
import { APP_NAME } from '@/os/brand/brand';
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useSettingsStore } from '@/os/store/settings';
import styles from './SmallScreenNotice.module.css';

export const SMALL_SCREEN_QUERY = '(max-width: 899px), (pointer: coarse)';

function isSmall(): boolean {
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(SMALL_SCREEN_QUERY).matches;
  }
  return window.innerWidth < 900;
}

function useSmallScreen(): boolean {
  const [small, setSmall] = useState(isSmall);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      const onResize = () => setSmall(isSmall());
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }
    const mq = window.matchMedia(SMALL_SCREEN_QUERY);
    const onChange = () => setSmall(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return small;
}

export function SmallScreenNotice() {
  const dismissed = useSettingsStore((s) => s.smallScreenNoticeDismissed);
  const dismiss = useSettingsStore((s) => s.dismissSmallScreenNotice);
  const small = useSmallScreen();
  const t = useT();
  const button = useRef<HTMLButtonElement>(null);
  const visible = small && !dismissed;

  useEffect(() => {
    if (visible) button.current?.focus();
  }, [visible]);

  if (!visible) return null;
  return (
    <div
      className={styles.backdrop}
      data-testid="small-screen-notice"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`window ${styles.dialog}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="small-screen-title"
        aria-describedby="small-screen-text"
      >
        <div className="title-bar">
          <div className="title-bar-text" id="small-screen-title">
            {APP_NAME}
          </div>
        </div>
        <div className={`window-body ${styles.body}`}>
          <p id="small-screen-text" className={styles.text}>
            {t('notice.smallScreen', { app: APP_NAME })}
          </p>
          <div className={styles.actions}>
            <button ref={button} type="button" onClick={dismiss}>
              {t('notice.continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
