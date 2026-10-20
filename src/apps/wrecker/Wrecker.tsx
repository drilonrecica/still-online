// Desktop Wrecker: a full-screen transparent overlay, portalled to document.body above the
// Start menu (Z_INDEX.wrecker), where tools draw damage over the live desktop. Nothing under it
// changes. The window itself (chrome 'none') stays empty; closing it removes the overlay.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/i18n/useT';
import { useDevice } from '@/os/device';
import { Z_INDEX } from '@/os/overlay/slots';
import { seedFrom } from '@/os/random';
import { scaleMs } from '@/os/speed';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import { useReducedMotion } from '@/os/useReducedMotion';
import { Palette } from './Palette';
import {
  TOOL_IDS,
  createEngine,
  pointerDown,
  pointerLeave,
  pointerMove,
  pointerUp,
  selectTool,
  startRepair,
  type ToolId,
} from './engine';
import { useWreckerLoop } from './useWreckerLoop';
import styles from './Wrecker.module.css';

const SEED = seedFrom('desktop-wrecker');
/** Repair's wipe, left to right. */
const REPAIR_MS = 900;
const SHAKE: Keyframe[] = [
  { transform: 'translate(0, 0)' },
  { transform: 'translate(-5px, 3px)' },
  { transform: 'translate(4px, -4px)' },
  { transform: 'translate(-3px, -2px)' },
  { transform: 'translate(2px, 3px)' },
  { transform: 'translate(0, 0)' },
];

export default function Wrecker({ windowId }: AppComponentProps) {
  const minimized = useWindowsStore(
    (s) => s.windows.find((w) => w.id === windowId)?.minimized ?? false,
  );
  const reduced = useReducedMotion();
  const t = useT();
  const device = useDevice();
  const engineRef = useRef(
    createEngine(SEED, window.innerWidth, window.innerHeight),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const damageRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<ToolId>('hammer');
  const [repairing, setRepairing] = useState(false);
  /** The last pointer was a finger: the palette adds Reset and Use buttons. */
  const [touch, setTouch] = useState(false);
  /** Where the surface was last pressed or crossed: Use (Space) works there. */
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const exit = useCallback(
    () => useWindowsStore.getState().closeWindow(windowId),
    [windowId],
  );

  const shake = useCallback(() => {
    const targets = [document.querySelector('.desktop-root'), rootRef.current];
    for (const el of targets)
      if (el instanceof HTMLElement) el.animate?.(SHAKE, { duration: 220 });
  }, []);

  useWreckerLoop(damageRef, fxRef, engineRef, {
    paused: minimized,
    reduced,
    onShake: shake,
    onCleared: () => setRepairing(false),
  });

  useEffect(() => {
    if (minimized) return;
    surfaceRef.current?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      exit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [minimized, exit]);

  const choose = (id: ToolId) => {
    selectTool(engineRef.current, id);
    setTool(id);
  };

  const repair = () => {
    if (engineRef.current.phase === 'repairing') return;
    const ms = reduced ? 0 : scaleMs(REPAIR_MS);
    startRepair(engineRef.current, ms / 1000);
    // The loop clears this when the engine reports the wipe done.
    if (ms > 0) setRepairing(true);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    lastPoint.current = { x: e.clientX, y: e.clientY };
    pointerDown(engineRef.current, e.clientX, e.clientY);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    lastPoint.current = { x: e.clientX, y: e.clientY };
    pointerMove(engineRef.current, e.clientX, e.clientY);
  };
  const onPointerUp = () => pointerUp(engineRef.current);

  /** Space, or the palette's Use button: the tool at the pointer (else the centre). */
  const applyTool = () => {
    const engine = engineRef.current;
    // A lifted finger leaves no pointer, so touch falls back to the last point first.
    const p = engine.pointer ??
      (touch ? lastPoint.current : null) ?? {
        x: engine.w / 2,
        y: engine.h / 2,
      };
    pointerDown(engine, p.x, p.y);
  };

  // Keyboard: 1–5 pick a tool, R repairs, Space/Enter uses the tool at the pointer (or centre).
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const picked = TOOL_IDS[Number(e.key) - 1];
    if (picked) choose(picked);
    else if (e.key === 'r' || e.key === 'R') repair();
    else if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) applyTool();
    else return;
    e.preventDefault();
  };
  const onKeyUp = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === ' ' || e.key === 'Enter') pointerUp(engineRef.current);
  };

  return createPortal(
    <div
      ref={rootRef}
      className={styles.root}
      style={{ zIndex: Z_INDEX.wrecker }}
      hidden={minimized}
      data-wrecker=""
      // Portalled outside `.desktop-root`, so it carries the device class itself (phone sizes).
      data-device={device}
      onPointerDownCapture={(e) => setTouch(e.pointerType === 'touch')}
    >
      <canvas ref={damageRef} className={styles.canvas} aria-hidden="true" />
      <canvas ref={fxRef} className={styles.canvas} aria-hidden="true" />
      <div
        ref={surfaceRef}
        className={styles.surface}
        role="application"
        aria-label={t('wrecker.surface')}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => pointerLeave(engineRef.current)}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      />
      <Palette
        tool={tool}
        repairing={repairing}
        onSelect={choose}
        onRepair={repair}
        onExit={exit}
        touch={touch}
        onUse={applyTool}
        onUseEnd={onPointerUp}
      />
    </div>,
    document.body,
  );
}
