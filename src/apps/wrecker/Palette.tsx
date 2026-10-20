// The floating tool palette: a little tool window dragged by its title bar.
import { useRef, useState, type PointerEvent } from 'react';
import { useT } from '@/i18n/useT';
import { TOOL_IDS, TOOLS, type ToolId } from './engine';
import { PaletteIcon } from './icons';
import styles from './Wrecker.module.css';

export interface PaletteProps {
  tool: ToolId;
  repairing: boolean;
  onSelect: (tool: ToolId) => void;
  onRepair: () => void;
  onExit: () => void;
  /** The last pointer was a finger: show Reset (R) and Use (Space) as buttons too (v0.6). */
  touch?: boolean;
  /** Use (Space): starts the current tool at the last point; `onUseEnd` lets go. */
  onUse?: () => void;
  onUseEnd?: () => void;
}

const WIDTH = 116;
const MARGIN = 8;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function Palette({
  tool,
  repairing,
  onSelect,
  onRepair,
  onExit,
  touch = false,
  onUse = () => {},
  onUseEnd = () => {},
}: PaletteProps) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(MARGIN, window.innerWidth - WIDTH - 24),
    y: 24,
  }));
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const t = useT();

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setPos({
      x: clamp(e.clientX - d.dx, 0, window.innerWidth - WIDTH),
      y: clamp(e.clientY - d.dy, 0, window.innerHeight - 40),
    });
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <div
      className={styles.palette}
      style={{ left: pos.x, top: pos.y, width: WIDTH }}
      role="toolbar"
      aria-label={t('wrecker.palette')}
      aria-orientation="vertical"
    >
      <div
        className={styles.grip}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {t('wrecker.grip')}
      </div>
      <div className={styles.tools}>
        {TOOL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={styles.tool}
            aria-label={t(TOOLS[id].labelKey)}
            aria-pressed={tool === id}
            title={t('wrecker.toolHint', {
              tool: t(TOOLS[id].labelKey),
              hint: t(TOOLS[id].hintKey),
            })}
            disabled={repairing}
            onClick={() => onSelect(id)}
          >
            <PaletteIcon id={id} />
          </button>
        ))}
        <button
          type="button"
          className={styles.tool}
          aria-label={t('wrecker.repair')}
          title={t('wrecker.repairHint')}
          disabled={repairing}
          onClick={onRepair}
        >
          <PaletteIcon id="repair" />
        </button>
      </div>
      {touch && (
        <div className={styles.touchKeys}>
          <button type="button" disabled={repairing} onClick={onRepair}>
            {t('wrecker.touchReset')}
          </button>
          <button
            type="button"
            disabled={repairing}
            // Held like the Space bar: a hold tool keeps going until the finger lifts.
            onPointerDown={(e) => e.button === 0 && onUse()}
            onPointerUp={onUseEnd}
            onPointerCancel={onUseEnd}
            onPointerLeave={onUseEnd}
            onClick={(e) => {
              // Enter or Space on the focused button: one use.
              if (e.detail !== 0) return;
              onUse();
              onUseEnd();
            }}
          >
            {t('wrecker.touchUse')}
          </button>
        </div>
      )}
      <button type="button" className={styles.exit} onClick={onExit}>
        <PaletteIcon id="exit" />
        {t('wrecker.exit')}
      </button>
    </div>
  );
}
