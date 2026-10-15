// Hen Hunt: the shooting-gallery window. The round is simulated in `sim.ts` and drawn by
// `useGameLoop`; this file wires input, sounds, scores and the menu screens.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { now } from '@/os/clock';
import { events } from '@/os/events';
import { playSound } from '@/os/sound';
import { useGamesStore } from '@/os/store/games';
import { useSettingsStore } from '@/os/store/settings';
import { useReducedMotion } from '@/os/useReducedMotion';
import { VIEW_H, VIEW_W } from './layout';
import { HelpScreen, MenuScreen, OverScreen, ScoresScreen } from './Screens';
import {
  createGame,
  qualifies,
  reload,
  setPointer,
  shoot,
  type Game,
  type GameEvent,
} from './sim';
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

const newSeed = () => (Math.random() * 0x100000000) >>> 0;
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function HenHunt() {
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState<Screen>('menu');
  const [result, setResult] = useState<RoundResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game>(createGame(newSeed(), { attract: true }));
  const playerName = useSettingsStore((s) => s.playerName);

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
  useGameLoop(canvasRef, gameRef, {
    // A finished round keeps settling its feathers; the menu backdrop is still if reduced.
    running: playing || screen === 'over' || !reduced,
    hud: playing || screen === 'over',
    motion: !reduced,
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

  function onPointerDown(e: PointerEvent) {
    if (!playing) return;
    e.preventDefault();
    const p = aim(e);
    if (!p) return;
    if (e.button === 0) shoot(gameRef.current, p.x, p.y);
    else if (e.button === 2) reload(gameRef.current);
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
        aria-label={
          playing
            ? 'Hen Hunt field. Aim with the mouse or arrow keys, shoot with a click or Enter, reload with a right-click or Space, Esc for the menu.'
            : 'Hen Hunt countryside'
        }
        onPointerMove={(e) => playing && aim(e)}
        onPointerLeave={() => setPointer(gameRef.current, null)}
        onPointerDown={onPointerDown}
        onContextMenu={(e) => e.preventDefault()}
      />
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
  );
}
