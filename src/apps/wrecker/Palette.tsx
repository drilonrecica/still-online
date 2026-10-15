// The floating tool palette: a little tool window dragged by its title bar.
import { useRef, useState, type PointerEvent } from 'react';
import { TOOL_IDS, TOOLS, type ToolId } from './engine';
import { PaletteIcon } from './icons';
import styles from './Wrecker.module.css';

export interface PaletteProps {
  tool: ToolId;
  repairing: boolean;
  onSelect: (tool: ToolId) => void;
  onRepair: () => void;
  onExit: () => void;
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
}: PaletteProps) {
  const [pos, setPos] = useState(() => ({
    x: Math.max(MARGIN, window.innerWidth - WIDTH - 24),
    y: 24,
  }));
  const drag = useRef<{ dx: number; dy: number } | null>(null);

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
      aria-label="Wrecking tools"
      aria-orientation="vertical"
    >
      <div
        className={styles.grip}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        Wrecker
      </div>
      <div className={styles.tools}>
        {TOOL_IDS.map((id) => (
          <button
            key={id}
            type="button"
            className={styles.tool}
            aria-label={TOOLS[id].label}
            aria-pressed={tool === id}
            title={`${TOOLS[id].label}: ${TOOLS[id].hint}`}
            disabled={repairing}
            onClick={() => onSelect(id)}
          >
            <PaletteIcon id={id} />
          </button>
        ))}
        <button
          type="button"
          className={styles.tool}
          aria-label="Repair"
          title="Repair: sweep the glass away"
          disabled={repairing}
          onClick={onRepair}
        >
          <PaletteIcon id="repair" />
        </button>
      </div>
      <button type="button" className={styles.exit} onClick={onExit}>
        <PaletteIcon id="exit" />
        Exit
      </button>
    </div>
  );
}
