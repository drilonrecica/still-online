// Black boot screen with wordmark and XP-style progress bar. Click or any key skips.
import { useEffect } from 'react';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';
import { useReducedMotion } from '@/os/useReducedMotion';
import styles from './Boot.module.css';

export const BOOT_MS = 3000;
export const BOOT_RETURN_MS = 1000;

export function Boot() {
  const bootComplete = useSessionStore((s) => s.bootComplete);
  const returning = useSettingsStore((s) => s.firstBootDone);
  const reducedMotion = useReducedMotion();
  const duration = returning ? BOOT_RETURN_MS : BOOT_MS;

  useEffect(() => {
    const timer = setTimeout(bootComplete, duration);
    const skip = () => bootComplete();
    window.addEventListener('keydown', skip);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', skip);
    };
  }, [bootComplete, duration]);

  return (
    <div
      className={styles.boot}
      data-testid="boot-screen"
      onClick={bootComplete}
    >
      <div className={styles.wordmark}>still-online</div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Starting still-online"
        data-testid="boot-progress"
        data-static={reducedMotion ? 'true' : 'false'}
      >
        {reducedMotion ? (
          <div className={styles.staticFill} />
        ) : (
          <div
            className={styles.blocks}
            style={{ animationDuration: '1.4s' }}
          />
        )}
      </div>
    </div>
  );
}
