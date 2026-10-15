// Taskbar: Start button, one button per open window, and the tray (network, Messenger, mute, clock).
import { useEffect, useState } from 'react';
import { getApp } from '@/apps/registry';
import {
  formatLongDate,
  formatTrayTime,
  msUntilNextMinute,
  now,
} from '@/os/clock';
import { attentionKey, useAttentionStore } from '@/os/store/attention';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import { useSettingsStore } from '@/os/store/settings';
import { useMessengerStore } from '@/apps/messenger/store';
import { StatusIcon } from '@/apps/messenger/StatusIcon';
import { NetworkTray } from './NetworkTray';
import styles from './Taskbar.module.css';

export interface TaskbarProps {
  /** Whether the Start menu is open (pressed look). */
  startOpen?: boolean;
  onStartClick?: () => void;
}

/** Re-reads the in-game time on every full minute. */
function useGameNow(): Date {
  const [date, setDate] = useState(now);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const current = now();
      setDate(current);
      timer = setTimeout(tick, msUntilNextMinute(current));
    };
    timer = setTimeout(tick, msUntilNextMinute(now()));
    return () => clearTimeout(timer);
  }, []);
  return date;
}

function TrayClock() {
  const date = useGameNow();
  return (
    <span
      className={styles.clock}
      data-testid="tray-clock"
      title={formatLongDate(date)}
    >
      {formatTrayTime(date)}
    </span>
  );
}

export function Taskbar({ startOpen = false, onStartClick }: TaskbarProps) {
  const windows = useWindowsStore((s) => s.windows);
  const activeId = useWindowsStore(selectActiveWindowId);
  const muted = useSettingsStore((s) => s.muted);
  const toggleMuted = useSettingsStore((s) => s.toggleMuted);
  const messengerSignedIn = useMessengerStore((s) => s.signedIn);
  const attention = useAttentionStore((s) => s.keys);

  function onWindowButton(id: string) {
    const actions = useWindowsStore.getState();
    if (id === activeId) actions.minimizeWindow(id);
    else actions.focusWindow(id);
  }

  return (
    <div className={styles.taskbar} role="toolbar" aria-label="Taskbar">
      <button
        type="button"
        className={styles.start}
        aria-pressed={startOpen}
        data-open={startOpen}
        data-start-button
        onClick={onStartClick}
      >
        <span className={styles.startText}>start</span>
      </button>
      <div className={styles.windows}>
        {windows.map((win) => {
          const active = win.id === activeId;
          const app = getApp(win.appId);
          const icon = app?.icon16;
          // The flash stops while the window is in front; it comes back if it still wants you.
          const flashing =
            !active &&
            attention[
              attentionKey(win.appId, app?.instanceKey?.(win.props))
            ] === true;
          return (
            <button
              key={win.id}
              type="button"
              className={styles.windowButton}
              aria-pressed={active}
              data-active={active}
              data-attention={flashing}
              aria-description={flashing ? 'wants your attention' : undefined}
              title={win.title}
              onClick={() => onWindowButton(win.id)}
            >
              {icon && (
                <img
                  src={icon}
                  alt=""
                  width={16}
                  height={16}
                  draggable={false}
                />
              )}
              <span className={styles.windowTitle}>{win.title}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.tray}>
        <NetworkTray />
        <button
          type="button"
          className={styles.mute}
          aria-label="Messenger"
          title={
            messengerSignedIn
              ? 'Messenger (signed in)'
              : 'Messenger (not signed in)'
          }
          data-signed-in={messengerSignedIn}
          onClick={() => useWindowsStore.getState().openApp('messenger')}
        >
          <StatusIcon status={messengerSignedIn ? 'online' : 'offline'} />
        </button>
        <button
          type="button"
          className={styles.mute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
          title={muted ? 'Sound is muted' : 'Sound is on'}
          onClick={toggleMuted}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M2 6h3l4-3v10l-4-3H2z" fill="currentColor" />
            {muted ? (
              <path
                d="M11 5l4 6M15 5l-4 6"
                stroke="#ff6b6b"
                strokeWidth="1.5"
              />
            ) : (
              <path
                d="M11 5.5q2 2.5 0 5M12.8 3.8q3.5 4.2 0 8.4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              />
            )}
          </svg>
        </button>
        <TrayClock />
      </div>
    </div>
  );
}
