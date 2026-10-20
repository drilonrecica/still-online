// Hen Hunt: the shooting-gallery window. The round is simulated in `sim.ts` and drawn by
// `useGameLoop`; this file wires input, sounds, scores and the menu screens.
import { usePlayerName } from '@/i18n/settingsText';
import { useT } from '@/i18n/useT';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { now } from '@/os/clock';
import { useDevice } from '@/os/device';
import { events } from '@/os/events';
import { playSound } from '@/os/sound';
import { useGamesStore } from '@/os/store/games';
import { LONG_PRESS_SLOP } from '@/os/touch/useLongPress';
import { ScaleToFit } from '@/os/touch/ScaleToFit';
import { useGameStatus, SR_ONLY } from '@/os/useGameStatus';
import { useReducedMotion } from '@/os/useReducedMotion';
import { VIEW_H, VIEW_W } from './layout';
import { HelpScreen, MenuScreen, OverScreen, ScoresScreen } from './Screens';
import {
  createGame,
  panBy,
  qualifies,
  reload,
  setPointer,
  setTouch,
  shoot,
  type Game,
  type GameEvent,
} from './sim';
import { useWindowMinimized } from '@/os/useAnimationFrame';
import type { AppComponentProps } from '@/os/types';
import { toView, useGameLoop } from './useGameLoop';
import styles from './HenHunt.module.css';

type Screen = 'menu' | 'play' | 'over' | 'scores' | 'help';

export interface RoundResult {
  score: number;
  shots: number;
  hits: number;
  /** Earned a top-10 place (asks for a name). */
  high: boolean;
}

/** Reduced motion plays a slower game. */
export const REDUCED_PACE = 0.65;
const AIM_STEP = 20;
/** The window's content size on a desktop: a phone zooms this whole stage to fit (v0.6). */
export const STAGE_W = VIEW_W;
export const STAGE_H = VIEW_H;
/** How long the crosshair stays at a tapped point. A UI cue, so not scaled by `scaleMs`. */
export const TAP_CROSSHAIR_MS = 300;

/** A finger on the field: a tap shoots where it lifts, a drag past the slop pans instead. */
interface Drag {
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  panning: boolean;
}

const newSeed = () => (Math.random() * 0x100000000) >>> 0;
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function HenHunt({ windowId }: Partial<AppComponentProps>) {
  const minimized = useWindowMinimized(windowId);
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState<Screen>('menu');
  const [result, setResult] = useState<RoundResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game>(createGame(newSeed(), { attract: true }));
  const drag = useRef<Drag | null>(null);
  const crosshairTimer = useRef(0);
  const playerName = usePlayerName();
  const t = useT();
  const phone = useDevice() === 'phone';

  useEffect(() => () => window.clearTimeout(crosshairTimer.current), []);

  const onEvents = useCallback((list: GameEvent[]) => {
    for (const e of list) {
      if (e.type === 'shot') playSound('shot');
      else if (e.type === 'empty') playSound('click');
      else if (e.type === 'reload') playSound('reload');
      else if (e.type === 'lastTen') playSound('cluck');
      else if (e.type === 'over') {
        const g = gameRef.current;
        const high = qualifies(useGamesStore.getState().henhunt.high, e.score);
        events.emit('game:score', { game: 'henhunt', score: e.score });
        setResult({ score: e.score, shots: g.shots, hits: g.hits, high });
        setScreen('over');
      }
    }
  }, []);

  const playing = screen === 'play';
  const status = useGameStatus(() => {
    const g = gameRef.current;
    return t('henhunt.status', {
      score: g.score,
      shells: g.shells,
      seconds: Math.ceil(g.time),
    });
  }, playing);
  useGameLoop(canvasRef, gameRef, {
    // A finished round keeps settling its feathers; the menu backdrop is still if reduced.
    running: playing || screen === 'over' || !reduced,
    hud: playing || screen === 'over',
    motion: !reduced,
    active: !minimized,
    onEvents,
  });

  // In a round, keys go to the field; the other screens focus their first button.
  useEffect(() => {
    if (playing) rootRef.current?.focus();
  }, [playing]);

  const start = useCallback(() => {
    const g = createGame(newSeed(), { pace: reduced ? REDUCED_PACE : 1 });
    setPointer(g, VIEW_W / 2, VIEW_H / 2);
    gameRef.current = g;
    setResult(null);
    setScreen('play');
  }, [reduced]);

  const toMenu = useCallback(() => {
    gameRef.current = createGame(newSeed(), { attract: true });
    setScreen('menu');
  }, []);

  function aim(e: PointerEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const p = toView(canvas, e.clientX, e.clientY);
    setPointer(gameRef.current, p.x, p.y);
    return p;
  }

  function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    if (!playing) return;
    e.preventDefault();
    const g = gameRef.current;
    if (e.pointerType === 'touch') {
      // One finger at a time; it shoots or pans when it lifts or moves.
      if (drag.current) return;
      setTouch(g, true);
      e.currentTarget.setPointerCapture?.(e.pointerId);
      drag.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        panning: false,
      };
      return;
    }
    setTouch(g, false);
    const p = aim(e);
    if (!p) return;
    if (e.button === 0) shoot(gameRef.current, p.x, p.y);
    else if (e.button === 2) reload(gameRef.current);
  }

  function onPointerMove(e: PointerEvent) {
    if (!playing) return;
    if (e.pointerType !== 'touch') {
      setTouch(gameRef.current, false);
      aim(e);
      return;
    }
    const d = drag.current;
    const canvas = canvasRef.current;
    if (d?.pointerId !== e.pointerId || !canvas) return;
    if (
      !d.panning &&
      Math.hypot(e.clientX - d.startX, e.clientY - d.startY) > LONG_PRESS_SLOP
    )
      d.panning = true;
    if (!d.panning) return;
    // The field follows the finger: dragging right looks left.
    const from = toView(canvas, d.lastX, 0).x;
    panBy(gameRef.current, from - toView(canvas, e.clientX, 0).x);
    d.lastX = e.clientX;
  }

  /** A tap aims at the point and shoots (or reloads an empty gun); the crosshair shows briefly. */
  function onPointerUp(e: PointerEvent) {
    const d = drag.current;
    if (d?.pointerId !== e.pointerId) return;
    drag.current = null;
    if (!playing || d.panning) return;
    const p = aim(e);
    if (!p) return;
    const g = gameRef.current;
    if (g.shells === 0 && g.reloading === 0) reload(g);
    else shoot(g, p.x, p.y);
    window.clearTimeout(crosshairTimer.current);
    crosshairTimer.current = window.setTimeout(() => {
      if (g.touch) setPointer(g, null);
    }, TAP_CROSSHAIR_MS);
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!playing) return;
    const g = gameRef.current;
    const p = g.pointer ?? { x: VIEW_W / 2, y: VIEW_H / 2 };
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-AIM_STEP, 0],
      ArrowRight: [AIM_STEP, 0],
      ArrowUp: [0, -AIM_STEP],
      ArrowDown: [0, AIM_STEP],
    };
    const move = moves[e.key];
    if (move) {
      setTouch(g, false);
      setPointer(
        g,
        Math.min(VIEW_W, Math.max(0, p.x + move[0])),
        Math.min(VIEW_H, Math.max(0, p.y + move[1])),
      );
    } else if (e.key === ' ') {
      reload(g);
    } else if (e.key === 'Enter') {
      shoot(g, p.x, p.y);
    } else if (e.key === 'Escape') {
      toMenu();
    } else {
      return;
    }
    e.preventDefault();
  }

  function saveName(name: string) {
    if (!result) return;
    useGamesStore.getState().recordScore('henhunt', {
      name,
      score: result.score,
      date: isoDate(now()),
    });
    setResult({ ...result, high: false });
    setScreen('scores');
  }

  return (
    <ScaleToFit width={STAGE_W} height={STAGE_H} active={phone}>
      <div
        ref={rootRef}
        className={styles.root}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <canvas
          ref={canvasRef}
          className={`${styles.canvas} ${playing ? styles.aiming : ''}`}
          role="img"
          aria-describedby={playing ? 'henhunt-status' : undefined}
          aria-label={t(playing ? 'henhunt.field' : 'henhunt.countryside')}
          onPointerMove={onPointerMove}
          onPointerLeave={(e) =>
            e.pointerType !== 'touch' && setPointer(gameRef.current, null)
          }
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (drag.current = null)}
          onContextMenu={(e) => e.preventDefault()}
        />
        {playing && (
          <p id="henhunt-status" style={SR_ONLY}>
            {status}
          </p>
        )}
        {screen === 'menu' && (
          <MenuScreen
            onPlay={start}
            onScores={() => setScreen('scores')}
            onHelp={() => setScreen('help')}
          />
        )}
        {screen === 'help' && <HelpScreen onBack={toMenu} />}
        {screen === 'scores' && <ScoresScreen onBack={toMenu} onPlay={start} />}
        {screen === 'over' && result && (
          <OverScreen
            result={result}
            defaultName={playerName}
            onSaveName={saveName}
            onPlay={start}
            onScores={() => setScreen('scores')}
            onMenu={toMenu}
          />
        )}
      </div>
    </ScaleToFit>
  );
}
