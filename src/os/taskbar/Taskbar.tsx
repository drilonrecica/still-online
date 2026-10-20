// Taskbar: Start button, one button per open window, and the tray (network, Messenger, Fluff, mute, clock).
// On a phone the window buttons are icon-only and network, Messenger and Fluff sit behind the
// tray's "Show hidden icons" chevron.
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getApp } from '@/apps/registry';
import { useLocale, useT } from '@/i18n/useT';
import {
  formatLongDate,
  formatTrayTime,
  msUntilNextMinute,
  now,
} from '@/os/clock';
import { attentionKey, useAttentionStore } from '@/os/store/attention';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import { useSettingsStore } from '@/os/store/settings';
import { useDevice } from '@/os/device';
import { useWorldStore } from '@/os/world';
import { useMessengerStore } from '@/apps/messenger/store';
import { StatusIcon } from '@/apps/messenger/StatusIcon';
import { PetTray } from '@/os/pet/PetTray';
import { HiddenIcons } from './HiddenIcons';
import { LanguageTray } from './LanguageTray';
import { NetworkTray } from './NetworkTray';
import { renderWindowTitle } from '@/os/wm/title';
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
  const day = useWorldStore((s) => s.day);
  const t = useT();
  return (
    <span
      className={styles.clock}
      data-testid="tray-clock"
      title={t('taskbar.clockTitle', {
        date: formatLongDate(date),
        day,
      })}
    >
      {formatTrayTime(date)}
    </span>
  );
}

function MessengerTray() {
  const t = useT();
  const signedIn = useMessengerStore((s) => s.signedIn);
  return (
    <button
      type="button"
      className={styles.mute}
      aria-label={t('taskbar.messenger')}
      title={
        signedIn
          ? t('taskbar.messengerSignedIn')
          : t('taskbar.messengerSignedOut')
      }
      data-signed-in={signedIn}
      onClick={() => useWindowsStore.getState().openApp('messenger')}
    >
      <StatusIcon status={signedIn ? 'online' : 'offline'} />
    </button>
  );
}

export function Taskbar({ startOpen = false, onStartClick }: TaskbarProps) {
  const windows = useWindowsStore((s) => s.windows);
  const locale = useLocale();
  const t = useT();
  const activeId = useWindowsStore(selectActiveWindowId);
  const muted = useSettingsStore((s) => s.muted);
  const toggleMuted = useSettingsStore((s) => s.toggleMuted);
  const attention = useAttentionStore((s) => s.keys);
  const phone = useDevice() === 'phone';

  // The icons a phone tucks behind the chevron.
  const hidden: ReactNode = (
    <>
      <NetworkTray />
      <MessengerTray />
      <PetTray className={styles.mute} />
    </>
  );

  function onWindowButton(id: string) {
    const actions = useWindowsStore.getState();
    if (id === activeId) actions.minimizeWindow(id);
    else actions.focusWindow(id);
  }

  return (
    <div
      className={styles.taskbar}
      role="toolbar"
      aria-label={t('taskbar.label')}
    >
      <button
        type="button"
        className={styles.start}
        aria-pressed={startOpen}
        data-open={startOpen}
        data-start-button
        onClick={onStartClick}
      >
        <span className={styles.startText}>{t('taskbar.start')}</span>
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
          const title = renderWindowTitle(win, app, locale);
          return (
            <button
              key={win.id}
              type="button"
              className={styles.windowButton}
              aria-pressed={active}
              data-active={active}
              data-attention={flashing}
              aria-description={flashing ? t('taskbar.attention') : undefined}
              aria-label={phone ? title : undefined}
              title={title}
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
              {!phone && <span className={styles.windowTitle}>{title}</span>}
            </button>
          );
        })}
      </div>
      <div className={styles.tray}>
        {phone ? (
          <>
            <HiddenIcons>{hidden}</HiddenIcons>
            <LanguageTray />
          </>
        ) : (
          <>
            <LanguageTray />
            {hidden}
          </>
        )}
        <button
          type="button"
          className={styles.mute}
          aria-pressed={muted}
          aria-label={muted ? t('taskbar.unmute') : t('taskbar.mute')}
          title={muted ? t('taskbar.muted') : t('taskbar.soundOn')}
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
