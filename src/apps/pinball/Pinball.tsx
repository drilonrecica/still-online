// Star Pinball: the table window. The game is simulated in `sim.ts` and drawn by `useLoop`;
// this file wires keys, pointer flippers, sounds, scores and the menu screens.
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
import { TABLE_X, VIEW_W } from './display';
import type { Side } from './physics';
import {
  type GameResult,
  HelpScreen,
  MenuScreen,
  OverScreen,
  ScoresScreen,
} from './Screens';
import {
  createGame,
  nudge,
  onPlunger,
  qualifies,
  setFlipper,
  setPlunger,
  type Game,
  type GameEvent,
} from './sim';
import { LANE_X } from './table';
import { toView, useLoop } from './useLoop';
import styles from './Pinball.module.css';

type Screen = 'menu' | 'play' | 'over' | 'scores' | 'help';
type Control = Side | 'plunger';

const newSeed = () => (Math.random() * 0x100000000) >>> 0;
const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Which control a key works: Z / left Shift, `/` / right Shift, Space / ↓. */
export function keyControl(e: { key: string; code: string }): Control | null {
  if (e.code === 'ShiftLeft' || e.key === 'z' || e.key === 'Z') return 'left';
  if (e.code === 'ShiftRight' || e.key === '/' || e.code === 'Slash')
    return 'right';
  if (e.key === ' ' || e.key === 'ArrowDown') return 'plunger';
  return null;
}

const SOUNDS: Partial<
  Record<GameEvent['type'], Parameters<typeof playSound>[0]>
> = {
  bumper: 'bumper',
  sling: 'bumper',
  flipper: 'flipper',
  launch: 'launch',
  drain: 'drain',
  tilt: 'error',
  rankUp: 'notify',
  saved: 'notify',
  target: 'click',
};

export default function Pinball() {
  const reduced = useReducedMotion();
  const [screen, setScreen] = useState<Screen>('menu');
  const [result, setResult] = useState<GameResult | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game>(createGame(newSeed(), { attract: true }));
  const pointers = useRef(new Map<number, Control>());
  const playerName = useSettingsStore((s) => s.playerName);

  const onEvents = useCallback((list: GameEvent[]) => {
    for (const e of list) {
      const sound = SOUNDS[e.type];
      if (sound) playSound(sound);
      if (e.type === 'over') {
        const high = qualifies(useGamesStore.getState().pinball.high, e.score);
        events.emit('game:score', { game: 'pinball', score: e.score });
        setResult({ score: e.score, rank: gameRef.current.rank, high });
        setScreen('over');
      }
    }
  }, []);

  const playing = screen === 'play';
  useLoop(canvasRef, gameRef, {
    running: playing || screen === 'over',
    attract: screen !== 'play' && screen !== 'over',
    motion: !reduced,
    onEvents,
  });

  useEffect(() => {
    if (playing) rootRef.current?.focus();
  }, [playing]);

  const start = useCallback(() => {
    gameRef.current = createGame(newSeed());
    pointers.current.clear();
    setResult(null);
    setScreen('play');
  }, []);

  const toMenu = useCallback(() => {
    gameRef.current = createGame(newSeed(), { attract: true });
    setScreen('menu');
  }, []);

  function control(c: Control, down: boolean) {
    const g = gameRef.current;
    if (c === 'plunger') setPlunger(g, down);
    else setFlipper(g, c, down);
  }

  function releaseAll() {
    const g = gameRef.current;
    setFlipper(g, 'left', false);
    setFlipper(g, 'right', false);
    setPlunger(g, false);
    pointers.current.clear();
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!playing) return;
    const c = keyControl(e);
    if (c) {
      if (!e.repeat) control(c, true);
    } else if (e.key === 't' || e.key === 'T') {
      if (!e.repeat) nudge(gameRef.current);
    } else if (e.key === 'Escape') {
      releaseAll();
      toMenu();
    } else return;
    e.preventDefault();
  }

  function onKeyUp(e: KeyboardEvent) {
    const c = keyControl(e);
    if (!playing || !c) return;
    control(c, false);
    e.preventDefault();
  }

  function onPointerDown(e: PointerEvent<HTMLCanvasElement>) {
    if (!playing || e.button !== 0) return;
    e.preventDefault();
    rootRef.current?.focus();
    const p = toView(e.currentTarget, e.clientX, e.clientY);
    const g = gameRef.current;
    // The launch lane works the plunger while a ball waits there; elsewhere, flippers.
    const lane = p.x - TABLE_X > LANE_X - 14 && onPlunger(g);
    const c: Control = lane ? 'plunger' : p.x < VIEW_W / 2 ? 'left' : 'right';
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, c);
    control(c, true);
  }

  function onPointerUp(e: PointerEvent) {
    const c = pointers.current.get(e.pointerId);
    if (!c) return;
    pointers.current.delete(e.pointerId);
    if (![...pointers.current.values()].includes(c)) control(c, false);
  }

  function saveName(name: string) {
    if (!result) return;
    useGamesStore.getState().recordScore('pinball', {
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
      onKeyUp={onKeyUp}
      onBlur={releaseAll}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        role="img"
        aria-label={
          playing
            ? 'Star Pinball table. Space or Down launches, Z and / (or the Shift keys, or clicking each half) work the flippers, T nudges, Esc for the menu.'
            : 'Star Pinball table'
        }
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
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
