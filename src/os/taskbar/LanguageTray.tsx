// Tray input-language badge (flag + EN / DE). Click opens a two-item menu with a check on the current one.
import { useEffect, useRef, useState } from 'react';
import { LanguageFlag } from '@/i18n/LanguageFlag';
import { LOCALES, LOCALE_NAMES } from '@/i18n/types';
import { useLocale, useT } from '@/i18n/useT';
import { useSettingsStore } from '@/os/store/settings';
import styles from './Taskbar.module.css';

export function LanguageTray() {
  const t = useT();
  const locale = useLocale();
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    rootRef.current
      ?.querySelector<HTMLElement>('[aria-checked="true"]')
      ?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [open]);

  const label = t('language.trayLabel', { language: LOCALE_NAMES[locale] });

  return (
    <div className={styles.net} ref={rootRef}>
      <button
        ref={badgeRef}
        type="button"
        className={`${styles.mute} ${styles.langBadge}`}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        title={label}
        data-testid="tray-language"
        onClick={() => setOpen((v) => !v)}
      >
        <LanguageFlag locale={locale} size={10} />
        {locale.toUpperCase()}
      </button>
      {open && (
        <div
          className={styles.netMenu}
          role="menu"
          aria-label={t('language.trayMenu')}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
              badgeRef.current?.focus();
            }
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const items = [
                ...e.currentTarget.querySelectorAll<HTMLElement>(
                  '[role="menuitemradio"]',
                ),
              ];
              const at = items.indexOf(document.activeElement as HTMLElement);
              const step = e.key === 'ArrowDown' ? 1 : -1;
              items[(at + step + items.length) % items.length]?.focus();
            }
          }}
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === locale}
              lang={l}
              onClick={() => {
                setLanguage(l);
                setOpen(false);
                badgeRef.current?.focus();
              }}
            >
              <LanguageFlag locale={l} size={12} />
              {LOCALE_NAMES[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
