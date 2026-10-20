// Phone tray: the XP "Show hidden icons" chevron. A tap opens a small flyout above the tray with
// the icons that don't fit (network, Messenger, Fluff); an outside tap, Escape or a window coming
// to the front (Messenger, the dial-up dialog) folds it away again.
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useT } from '@/i18n/useT';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import styles from './Taskbar.module.css';

export function HiddenIcons({ children }: { children: ReactNode }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLButtonElement>(null);
  const activeId = useWindowsStore(selectActiveWindowId);

  useEffect(() => setOpen(false), [activeId]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [open]);

  const label = t('taskbar.showHidden');
  return (
    <div
      className={styles.net}
      ref={rootRef}
      onKeyDown={(e) => {
        if (e.key !== 'Escape' || !open) return;
        setOpen(false);
        chevronRef.current?.focus();
      }}
    >
      <button
        ref={chevronRef}
        type="button"
        className={`${styles.mute} ${styles.chevron}`}
        aria-label={label}
        aria-expanded={open}
        title={label}
        data-testid="tray-chevron"
        onClick={() => setOpen((v) => !v)}
      >
        <span aria-hidden="true">{open ? '›' : '‹'}</span>
      </button>
      {open && (
        <div
          className={styles.hiddenFlyout}
          role="group"
          aria-label={label}
          data-testid="tray-hidden"
        >
          {children}
        </div>
      )}
    </div>
  );
}
