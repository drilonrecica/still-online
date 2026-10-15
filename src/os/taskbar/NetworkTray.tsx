// Tray network icon: two little monitors. Grey offline, blinking while dialling, blue online.
// Offline → connect; dialling → show the dialog; online → a Disconnect / Status menu.
import { useEffect, useRef, useState } from 'react';
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

const LABELS = {
  offline: 'Not connected',
  dialing: 'Dialing…',
  online: 'Connected',
} as const;

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
      title: 'Dial-up Connection',
      text: `Connected at ${kbps.toFixed(1)} Kbps · Duration ${formatDuration(
        connectedAt === null ? 0 : Date.now() - connectedAt,
      )}`,
      icon: 'network',
    });
  }

  return (
    <div className={styles.net} ref={rootRef}>
      <button
        type="button"
        className={styles.mute}
        aria-label={`Network: ${LABELS[status]}`}
        aria-haspopup={status === 'online' ? 'menu' : undefined}
        aria-expanded={status === 'online' ? menuOpen : undefined}
        title={`Dial-up Connection: ${LABELS[status]}`}
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
          aria-label="Dial-up Connection"
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
            Disconnect
          </button>
          <button type="button" role="menuitem" onClick={showStatus}>
            Status
          </button>
        </div>
      )}
    </div>
  );
}
