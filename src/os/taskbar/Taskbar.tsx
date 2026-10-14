// Taskbar: Start button, one button per open window, and the tray (mute toggle + clock).
import { useEffect, useState } from 'react';
import { getApp } from '@/apps/registry';
import {
  formatLongDate,
  formatTrayTime,
  msUntilNextMinute,
  now,
} from '@/os/clock';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import { useSettingsStore } from '@/os/store/settings';
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
        onClick={onStartClick}
      >
        <span className={styles.startText}>start</span>
      </button>
      <div className={styles.windows}>
        {windows.map((win) => {
          const active = win.id === activeId;
          const icon = getApp(win.appId)?.icon16;
          return (
            <button
              key={win.id}
              type="button"
              className={styles.windowButton}
              aria-pressed={active}
              data-active={active}
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
