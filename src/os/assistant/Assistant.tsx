// Stapley: the `assistant` overlay. Bottom-right above the taskbar, draggable; a yellow help balloon
// with blue bullet options; right-click (or the balloon's link) hides him.
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import { useSettingsStore } from '@/os/store/settings';
import { TASKBAR_HEIGHT } from '@/os/types';
import { StapleySprite } from './StapleySprite';
import { useAssistantStore } from './store';
import styles from './Assistant.module.css';

/** A pointer movement under this many px is a click, not a drag. */
const DRAG_SLOP = 4;
/** Stapley's footprint, for keeping him on screen. */
const WIDTH = 72;
const HEIGHT = 64;

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
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [menu, setMenu] = useState(false);
  const drag = useRef<Drag | null>(null);

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
    const minY = HEIGHT + TASKBAR_HEIGHT + 8 - window.innerHeight;
    setOffset({
      x: Math.min(16, Math.max(minX, d.originX + dx)),
      y: Math.min(maxY, Math.max(minY, d.originY + dy)),
    });
  }
  function onPointerUp() {
    drag.current = null;
  }
  function onContextMenu(e: MouseEvent) {
    e.preventDefault();
    setMenu(true);
  }
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') setMenu(false);
  }

  const tip = current?.tip;
  return (
    <div
      className={styles.root}
      data-assistant
      style={{
        bottom: TASKBAR_HEIGHT + 8,
        transform: `translate(${offset.x}px, ${offset.y}px)`,
      }}
      onKeyDown={onKeyDown}
    >
      {tip && (
        <div className={styles.balloon} role="status" data-assistant-balloon>
          <p className={styles.text}>{current.reply ?? tip.text}</p>
          <ul className={styles.options}>
            {current.reply ? (
              <li>
                <button type="button" className={styles.link} onClick={dismiss}>
                  OK
                </button>
              </li>
            ) : (
              tip.options?.map((option) => (
                <li key={option.label}>
                  <button
                    type="button"
                    className={styles.link}
                    onClick={() => choose(option)}
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
            Hide Stapley
          </button>
        </div>
      )}
      {menu && (
        <ul className={styles.menu} role="menu" aria-label="Stapley">
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className={styles.menuItem}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={hide}
            >
              Hide Stapley
            </button>
          </li>
        </ul>
      )}
      <button
        type="button"
        className={styles.stapley}
        aria-label="Stapley the stapler"
        title="Stapley"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onContextMenu={onContextMenu}
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
