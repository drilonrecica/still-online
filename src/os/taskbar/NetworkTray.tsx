// Tray network icon: two little monitors. Grey offline, blinking while dialling, blue online.
// Offline → connect; dialling → show the dialog; online → a Disconnect / Status menu.
import { useEffect, useRef, useState } from 'react';
import { getLocale } from '@/i18n/t';
import { useT } from '@/i18n/useT';
import { useBalloonStore } from '@/os/balloon/store';
import { requireOnline, useNetworkStore } from '@/os/network';
import { useWindowsStore } from '@/os/store/windows';
import styles from './Taskbar.module.css';

/** `hh:mm` of a connection that has lasted `ms`. */
export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** `33.6` (en) / `33,6` (de): one decimal, the locale's separator. */
function formatSpeed(kbps: number): string {
  const text = kbps.toFixed(1);
  return getLocale() === 'de' ? text.replace('.', ',') : text;
}

function Monitors() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <rect
        className={styles.netScreen}
        x="0.5"
        y="1.5"
        width="8"
        height="6"
        rx="0.5"
      />
      <rect
        className={styles.netScreen}
        x="7.5"
        y="7.5"
        width="8"
        height="6"
        rx="0.5"
      />
      <path d="M3 9.5h3M10 15h3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function NetworkTray() {
  const t = useT();
  const status = useNetworkStore((s) => s.status);
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  // Only meaningful online; any status change closes it.
  useEffect(() => setMenuOpen(false), [status]);

  useEffect(() => {
    if (!menuOpen) return;
    firstItemRef.current?.focus();
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [menuOpen]);

  function onIconClick() {
    if (status === 'offline') void requireOnline();
    else if (status === 'dialing') useWindowsStore.getState().openApp('dialup');
    else setMenuOpen((open) => !open);
  }

  function showStatus() {
    setMenuOpen(false);
    const { kbps, connectedAt } = useNetworkStore.getState();
    useBalloonStore.getState().push({
      title: t('taskbar.network.menu'),
      text: t('taskbar.network.connected', {
        speed: formatSpeed(kbps),
        duration: formatDuration(
          connectedAt === null ? 0 : Date.now() - connectedAt,
        ),
      }),
      icon: 'network',
    });
  }

  return (
    <div className={styles.net} ref={rootRef}>
      <button
        type="button"
        className={styles.mute}
        aria-label={t('taskbar.network.label', {
          status: t(`taskbar.network.status.${status}`),
        })}
        aria-haspopup={status === 'online' ? 'menu' : undefined}
        aria-expanded={status === 'online' ? menuOpen : undefined}
        title={t('taskbar.network.title', {
          status: t(`taskbar.network.status.${status}`),
        })}
        data-status={status}
        data-testid="tray-network"
        onClick={onIconClick}
      >
        <Monitors />
      </button>
      {menuOpen && (
        <div
          className={styles.netMenu}
          role="menu"
          aria-label={t('taskbar.network.menu')}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setMenuOpen(false);
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
              e.preventDefault();
              const items = [
                ...e.currentTarget.querySelectorAll<HTMLElement>(
                  '[role="menuitem"]',
                ),
              ];
              const at = items.indexOf(document.activeElement as HTMLElement);
              const step = e.key === 'ArrowDown' ? 1 : -1;
              items[(at + step + items.length) % items.length]?.focus();
            }
          }}
        >
          <button
            ref={firstItemRef}
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              useNetworkStore.getState().disconnect();
            }}
          >
            {t('taskbar.network.disconnect')}
          </button>
          <button type="button" role="menuitem" onClick={showStatus}>
            {t('taskbar.network.statusItem')}
          </button>
        </div>
      )}
    </div>
  );
}
