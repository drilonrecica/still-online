// Stapley: the `assistant` overlay. Bottom-right above the taskbar, draggable; a yellow help balloon
// with blue bullet options; right-click (or the balloon's link) hides him. While the active window
// covers his corner (a maximized browser), the balloon folds away after FOLD_MS; a click on him
// brings it back. Over a maximized window he stands STATUS_BAR_LIFT higher, above its status bar.
// On a phone he is drawn at PHONE_SCALE above the 40 px taskbar.
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
import type { Tip } from '@/content/assistant';
import { getTips } from '@/content/locale';
import { useGender } from '@/i18n/settingsText';
import type { Locale } from '@/i18n/types';
import { useLocale, useT } from '@/i18n/useT';
import type { Gender } from '@/os/types';
import { useSettingsStore } from '@/os/store/settings';
import { taskbarHeight, useDevice } from '@/os/device';
import {
  effectiveMaximized,
  selectActiveWindowId,
  useWindowsStore,
} from '@/os/store/windows';
import { composeHandlers } from '@/os/touch/compose';
import { useLongPress } from '@/os/touch/useLongPress';
import type { WindowState } from '@/os/types';
import { StapleySprite } from './StapleySprite';
import { useAssistantStore } from './store';
import styles from './Assistant.module.css';

/** A pointer movement under this many px is a click, not a drag. */
const DRAG_SLOP = 4;
/** Stapley's footprint, for keeping him on screen. */
const WIDTH = 72;
const HEIGHT = 64;
/** The corner the balloon takes: its max width, and its tallest text above Stapley. */
const BALLOON_WIDTH = 230;
const BALLOON_HEIGHT = 170;
/** How long the balloon stays over a window that covers the corner. */
const FOLD_MS = 8000;
/** A window's status bar (20px + its top border): how far he rises over a maximized window. */
export const STATUS_BAR_LIFT = 22;
/** On a phone he and his balloon are drawn smaller, from his bottom-right corner. */
const PHONE_SCALE = 0.8;

/** Whether `win` (the active window) lies over Stapley's balloon corner, moved by `offset`. */
function coversCorner(
  win: WindowState | undefined,
  offset: { x: number; y: number },
  taskbar: number,
): boolean {
  if (!win) return false;
  if (win.maximized) return true;
  const right = window.innerWidth - 16 + offset.x;
  const bottom = window.innerHeight - taskbar - 8 + offset.y;
  const left = right - BALLOON_WIDTH;
  const top = bottom - HEIGHT - 4 - BALLOON_HEIGHT;
  return (
    win.x < right &&
    win.x + win.w > left &&
    win.y < bottom &&
    win.y + win.h > top
  );
}

/** `tip` with its text in `locale` for `gender`: same id, same options in the same order. */
function localized(tip: Tip, locale: Locale, gender: Gender): Tip {
  const { TIPS, IDLE_JOKES } = getTips(locale, gender);
  return [...TIPS, ...IDLE_JOKES].find((t) => t.id === tip.id) ?? tip;
}

interface Drag {
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

function Stapley() {
  const setEnabled = useSettingsStore((s) => s.setAssistantEnabled);
  const current = useAssistantStore((s) => s.current);
  const choose = useAssistantStore((s) => s.choose);
  const dismiss = useAssistantStore((s) => s.dismiss);
  const locale = useLocale();
  const gender = useGender();
  const t = useT();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [menu, setMenu] = useState(false);
  const drag = useRef<Drag | null>(null);
  // A right-click or a long-press opens the menu. A long-press is not a click: no wake.
  const press = useLongPress(() => {
    drag.current = null;
    setMenu(true);
  });
  const active = useWindowsStore((s) => {
    const id = selectActiveWindowId(s);
    return s.windows.find((w) => w.id === id);
  });
  const device = useDevice();
  const taskbar = taskbarHeight(device);
  const maximized = !!active && effectiveMaximized(active, device);
  const covered = maximized || coversCorner(active, offset, taskbar);
  const lift = maximized ? STATUS_BAR_LIFT : 0;
  // Each tip (and each click on Stapley) gets one FOLD_MS over a covering window.
  const [wakes, setWakes] = useState(0);
  const [foldedKey, setFoldedKey] = useState<string | null>(null);
  const balloonKey = current
    ? `${current.tip.id}:${current.reply ? 'reply' : 'tip'}:${wakes}`
    : null;
  const folded = covered && balloonKey !== null && foldedKey === balloonKey;

  useEffect(() => {
    if (!covered || balloonKey === null) return;
    const id = setTimeout(() => setFoldedKey(balloonKey), FOLD_MS);
    return () => clearTimeout(id);
  }, [covered, balloonKey]);

  // Any click elsewhere or Escape closes the right-click menu.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [menu]);

  function hide() {
    setMenu(false);
    setEnabled(false);
  }

  function onPointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
      moved: false,
    };
  }
  function onPointerMove(e: PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (!d.moved && Math.hypot(dx, dy) < DRAG_SLOP) return;
    d.moved = true;
    // Stay inside the viewport: offsets are relative to the bottom-right rest position.
    const minX = WIDTH + 16 - window.innerWidth;
    const maxY = 0;
    const minY = HEIGHT + taskbar + 8 + lift - window.innerHeight;
    setOffset({
      x: Math.min(16, Math.max(minX, d.originX + dx)),
      y: Math.min(maxY, Math.max(minY, d.originY + dy)),
    });
  }
  function onPointerCancel() {
    drag.current = null;
  }
  function onPointerUp() {
    if (drag.current && !drag.current.moved) setWakes((n) => n + 1);
    drag.current = null;
  }
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') setMenu(false);
  }

  // The store keeps the tip that was offered; text renders in the current language.
  const shown = folded ? null : current;
  const tip = shown && localized(shown.tip, locale, gender);
  const replyIndex = current?.reply
    ? (current.tip.options ?? []).findIndex((o) => o.reply === current.reply)
    : -1;
  const reply =
    current?.reply && (tip?.options?.[replyIndex]?.reply ?? current.reply);
  return (
    <div
      className={styles.root}
      data-assistant
      style={{
        bottom: taskbar + 8 + lift,
        transform: `translate(${offset.x}px, ${offset.y}px)${device === 'phone' ? ` scale(${PHONE_SCALE})` : ''}`,
      }}
      onKeyDown={onKeyDown}
    >
      {tip && (
        <div className={styles.balloon} role="status" data-assistant-balloon>
          <p className={styles.text}>{reply || tip.text}</p>
          <ul className={styles.options}>
            {reply ? (
              <li>
                <button type="button" className={styles.link} onClick={dismiss}>
                  {t('common.ok')}
                </button>
              </li>
            ) : (
              tip.options?.map((option, i) => (
                <li key={option.label}>
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => choose(shown.tip.options?.[i] ?? option)}
                  >
                    {option.label}
                  </button>
                </li>
              ))
            )}
          </ul>
          <button
            type="button"
            className={`${styles.link} ${styles.hide}`}
            onClick={hide}
          >
            {t('assistant.hide')}
          </button>
        </div>
      )}
      {menu && (
        <ul
          className={styles.menu}
          role="menu"
          aria-label={t('assistant.name')}
        >
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={hide}
            >
              {t('assistant.hide')}
            </button>
          </li>
        </ul>
      )}
      <button
        type="button"
        className={styles.stapley}
        aria-label={t('assistant.label')}
        title={t('assistant.name')}
        {...composeHandlers(press(), {
          onPointerDown,
          onPointerMove,
          onPointerUp,
          onPointerCancel,
        })}
      >
        <StapleySprite talking={!!tip} />
      </button>
    </div>
  );
}

/** Stapley, while `settings.assistantEnabled` is on. */
export function Assistant() {
  const enabled = useSettingsStore((s) => s.assistantEnabled);
  return enabled ? <Stapley /> : null;
}
