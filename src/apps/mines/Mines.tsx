// Mines: the minesweeper-style game. Board rules live in `board.ts`; this file is the window.
import { usePlayerName } from '@/i18n/settingsText';
import { useT } from '@/i18n/useT';
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { useDevice } from '@/os/device';
import { events } from '@/os/events';
import { useGamesStore, MINES_LEVELS, type MinesLevel } from '@/os/store/games';
import { useWindowsStore } from '@/os/store/windows';
import { composeHandlers } from '@/os/touch/compose';
import { ScaleToFit } from '@/os/touch/ScaleToFit';
import { useLongPress } from '@/os/touch/useLongPress';
import type { AppComponentProps } from '@/os/types';
import {
  LEVELS,
  chord,
  clampConfig,
  createBoard,
  cycleMark,
  isWrongFlag,
  minesLeft,
  reveal,
  toggleFlag,
  type Board,
  type Cell,
  type Config,
} from './board';
import { BestDialog, CustomDialog, LEVEL_KEYS, NameDialog } from './Dialogs';
import { Face, FlagIcon, Lcd, MineIcon, type FaceKind } from './graphics';
import {
  INPUT_IDLE,
  chordedChange,
  minesInput,
  type InputEvent,
  type MoveKind,
} from './input';
import styles from './Mines.module.css';

export const CELL_PX = 16;
export const MAX_SECONDS = 999;

type Level = MinesLevel | 'custom';

/** Window size that fits a board of `config` exactly (menubar, header and frames included). */
export function windowSizeFor(config: Config): { w: number; h: number } {
  return {
    w: config.width * CELL_PX + 26,
    h: config.height * CELL_PX + 119,
  };
}

/** The framed game (header and field, with its margin): what a phone or tablet zooms to fit. */
export function stageSizeFor(config: Config): { w: number; h: number } {
  return {
    w: config.width * CELL_PX + 30,
    h: config.height * CELL_PX + 75,
  };
}

const MOVES: Record<MoveKind, (b: Board, i: number) => Board> = {
  reveal,
  mark: cycleMark,
  flag: toggleFlag,
  chord,
};

const newSeed = () => (Math.random() * 0x100000000) >>> 0;

type Dialog =
  | { kind: 'custom' }
  | { kind: 'best' }
  | { kind: 'name'; level: MinesLevel; seconds: number };

interface CellViewProps {
  cell: Cell;
  index: number;
  x: number;
  y: number;
  wrongFlag: boolean;
  /** The keyboard cursor is on this cell. */
  cursor: boolean;
}

const CellView = memo(function CellView({
  cell,
  index,
  x,
  y,
  wrongFlag,
  cursor,
}: CellViewProps) {
  const t = useT();
  const open = cell.revealed;
  let label = t('mines.state.hidden');
  let content: React.ReactNode = null;
  if (open && cell.mine) {
    label = t(cell.exploded ? 'mines.state.explodedMine' : 'mines.state.mine');
    content = <MineIcon />;
  } else if (open) {
    label = cell.adjacent ? String(cell.adjacent) : t('mines.state.empty');
    content = cell.adjacent ? cell.adjacent : null;
  } else if (cell.mark === 'flag') {
    label = t(wrongFlag ? 'mines.state.wrongFlag' : 'mines.state.flag');
    content = <FlagIcon wrong={wrongFlag} />;
  } else if (cell.mark === 'question') {
    label = t('mines.state.question');
    content = '?';
  }
  const cls = [
    styles.cell,
    open && styles.open,
    cursor && styles.cursor,
    cell.exploded && styles.boom,
    open && !cell.mine && cell.adjacent > 0 && styles[`n${cell.adjacent}`],
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      tabIndex={-1}
      className={cls}
      id={`mines-cell-${index}`}
      data-index={index}
      aria-label={t('mines.cell', { row: y + 1, col: x + 1, state: label })}
    >
      {content}
    </button>
  );
});

export default function Mines({ windowId }: AppComponentProps) {
  const t = useT();
  const [level, setLevel] = useState<Level>('beginner');
  const [config, setConfig] = useState<Config>(LEVELS.beginner);
  const [board, setBoard] = useState<Board>(() =>
    createBoard(LEVELS.beginner, newSeed()),
  );
  const [seconds, setSeconds] = useState(0);
  const [pressed, setPressed] = useState(false);
  /** Keyboard cursor over the field (null until the field is used by keyboard). */
  const [cursor, setCursor] = useState<number | null>(null);
  const [menu, setMenu] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const secondsRef = useRef(0);
  const input = useRef(INPUT_IDLE);
  /** Taps flag instead of reveal (the 🚩 button, shown on touch devices). */
  const [flagMode, setFlagMode] = useState(false);
  const device = useDevice();
  const best = useGamesStore((s) => s.mines.best);
  const playerName = usePlayerName();

  const playing = board.status === 'playing';
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      secondsRef.current = Math.min(MAX_SECONDS, secondsRef.current + 1);
      setSeconds(secondsRef.current);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  useEffect(() => rootRef.current?.focus(), []);

  const startGame = useCallback(
    (nextLevel: Level, nextConfig: Config) => {
      const fitted = clampConfig(nextConfig);
      setLevel(nextLevel);
      setConfig(fitted);
      setBoard(createBoard(fitted, newSeed()));
      secondsRef.current = 0;
      setSeconds(0);
      setPressed(false);
      setCursor(null);
      setDialog(null);
      setMenu(false);
      const win = useWindowsStore
        .getState()
        .windows.find((w) => w.id === windowId);
      if (win) {
        const size = windowSizeFor(fitted);
        useWindowsStore
          .getState()
          .resizeWindow(windowId, { x: win.x, y: win.y, ...size });
      }
    },
    [windowId],
  );

  const newGame = useCallback(
    () => startGame(level, config),
    [startGame, level, config],
  );

  /** Takes a board produced by a move, starting the clock and handling a finished game. */
  function applyMove(next: Board) {
    if (next === board) return;
    if (board.status === 'ready' && next.status !== 'ready') {
      secondsRef.current = 1;
      setSeconds(1);
    }
    setBoard(next);
    if (next.status !== 'won' || board.status === 'won') return;
    const time = Math.max(1, secondsRef.current);
    events.emit('game:score', { game: 'mines', score: time, detail: level });
    if (level !== 'custom') {
      const current = best[level];
      if (!current || time < current.seconds) {
        setDialog({ kind: 'name', level, seconds: time });
      }
    }
  }

  function cellAt(target: EventTarget): number | null {
    const el = (target as HTMLElement).closest?.('[data-index]');
    return el ? Number((el as HTMLElement).dataset.index) : null;
  }

  /** Runs one pointer event through the input reducer and applies its move. */
  function send(e: InputEvent) {
    const result = minesInput(input.current, e, {
      over: board.status === 'won' || board.status === 'lost',
      revealed: (i) => board.cells[i]?.revealed ?? false,
      flagMode,
    });
    input.current = result.state;
    setPressed(result.state.pressed);
    const move = result.move;
    if (move) applyMove(MOVES[move.kind](board, move.cell));
  }

  const pointer = (type: 'down' | 'up', e: PointerEvent): InputEvent => ({
    type,
    pointerType: e.pointerType,
    button: e.button,
    buttons: e.buttons,
    cell: cellAt(e.target),
  });

  const longPress = useLongPress((point) =>
    send({ type: 'longPress', cell: cellAt(point.target) }),
  );

  const fieldPointer = composeHandlers(longPress(), {
    onPointerDown: (e: PointerEvent) => send(pointer('down', e)),
    onPointerMove: (e: PointerEvent) => {
      // A mouse's second button: a move with `button` set (see `chordedChange`).
      if (e.pointerType !== 'mouse') return;
      const change = chordedChange(e.button, e.buttons);
      if (change) send(pointer(change, e));
    },
    onPointerUp: (e: PointerEvent) => send(pointer('up', e)),
    onPointerCancel: () => send({ type: 'cancel' }),
    onPointerLeave: (e: PointerEvent) =>
      e.pointerType === 'mouse' && send({ type: 'cancel' }),
  });

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'F2') {
      e.preventDefault();
      newGame();
    }
  }

  /** Keyboard play: arrows move, Space/Enter reveal (or chord), F/M cycle the mark. */
  function onFieldKeyDown(e: KeyboardEvent) {
    const w = board.width;
    const at = cursor ?? 0;
    const x = at % w;
    const y = Math.floor(at / w);
    const moves: Record<string, number> = {
      ArrowLeft: x > 0 ? at - 1 : at,
      ArrowRight: x < w - 1 ? at + 1 : at,
      ArrowUp: y > 0 ? at - w : at,
      ArrowDown: y < board.height - 1 ? at + w : at,
      Home: y * w,
      End: y * w + w - 1,
    };
    const over = board.status === 'won' || board.status === 'lost';
    if (e.key in moves) {
      setCursor(cursor === null ? 0 : moves[e.key]!);
    } else if (over) {
      return;
    } else if (e.key === ' ' || e.key === 'Enter') {
      const cell = board.cells[at]!;
      applyMove(cell.revealed ? chord(board, at) : reveal(board, at));
    } else if (e.key === 'f' || e.key === 'F' || e.key === 'm') {
      applyMove(cycleMark(board, at));
    } else {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
  }

  const stage = stageSizeFor(config);
  const face: FaceKind =
    board.status === 'won'
      ? 'cool'
      : board.status === 'lost'
        ? 'dead'
        : pressed
          ? 'worried'
          : 'smile';

  const gameMenu: { label: string; hint?: string; run: () => void }[] = [
    { label: t('mines.menu.new'), hint: 'F2', run: newGame },
    ...MINES_LEVELS.map((l) => ({
      label: t(LEVEL_KEYS[l]),
      hint: level === l ? '✓' : undefined,
      run: () => startGame(l, LEVELS[l]),
    })),
    {
      label: t('mines.menu.custom'),
      hint: level === 'custom' ? '✓' : undefined,
      run: () => {
        setMenu(false);
        setDialog({ kind: 'custom' });
      },
    },
    {
      label: t('mines.menu.bestTimes'),
      run: () => {
        setMenu(false);
        setDialog({ kind: 'best' });
      },
    },
    {
      label: t('mines.menu.exit'),
      run: () => useWindowsStore.getState().closeWindow(windowId),
    },
  ];

  return (
    <div
      ref={rootRef}
      className={styles.root}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      onClick={() => menu && setMenu(false)}
    >
      <div
        className={styles.menubar}
        role="menubar"
        aria-label={t('mines.menuBar')}
      >
        <div className={styles.menu}>
          <button
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={menu}
            className={styles.menuButton}
            onClick={(e) => {
              e.stopPropagation();
              setMenu(!menu);
            }}
          >
            {t('mines.menu.game')}
          </button>
          {menu && (
            <div
              className={styles.dropdown}
              role="menu"
              aria-label={t('mines.menu.game')}
            >
              {gameMenu.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={styles.item}
                  onClick={(e) => {
                    e.stopPropagation();
                    item.run();
                  }}
                >
                  <span>{item.label}</span>
                  {item.hint && <span aria-hidden>{item.hint}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={device === 'desktop' ? undefined : styles.fit}>
        <ScaleToFit
          width={stage.w}
          height={stage.h}
          active={device !== 'desktop'}
          grow={device === 'phone'}
        >
          <div className={styles.game}>
            <div className={styles.header}>
              <Lcd value={minesLeft(board)} label={t('mines.minesLeft')} />
              <div className={styles.faceGroup}>
                <button
                  type="button"
                  className={styles.face}
                  aria-label={t(
                    face === 'cool'
                      ? 'mines.newGameWon'
                      : face === 'dead'
                        ? 'mines.newGameLost'
                        : 'mines.newGame',
                  )}
                  onClick={newGame}
                >
                  <Face kind={face} />
                </button>
                {device !== 'desktop' && (
                  <button
                    type="button"
                    className={`${styles.face} ${styles.flagMode}`}
                    aria-label={t('mines.flagMode')}
                    aria-pressed={flagMode}
                    title={t('mines.flagMode')}
                    onClick={() => setFlagMode(!flagMode)}
                  >
                    <FlagIcon />
                  </button>
                )}
              </div>
              <Lcd value={seconds} label={t('mines.time')} />
            </div>
            <div
              className={styles.grid}
              role="group"
              aria-label={t('mines.field')}
              tabIndex={0}
              aria-activedescendant={
                cursor === null ? undefined : `mines-cell-${cursor}`
              }
              onKeyDown={onFieldKeyDown}
              onFocus={() => cursor === null && setCursor(0)}
              style={{
                gridTemplateColumns: `repeat(${board.width}, ${CELL_PX}px)`,
              }}
              {...fieldPointer}
              // A right-click cycles the mark on pointerdown; the long-press hook's own handler
              // would mark a second time, so this only stops the browser menu.
              onContextMenu={(e) => e.preventDefault()}
            >
              {board.cells.map((cell, i) => (
                <CellView
                  key={i}
                  cell={cell}
                  index={i}
                  x={i % board.width}
                  y={Math.floor(i / board.width)}
                  wrongFlag={isWrongFlag(board, i)}
                  cursor={cursor === i}
                />
              ))}
            </div>
          </div>
        </ScaleToFit>
      </div>

      {dialog?.kind === 'custom' && (
        <CustomDialog
          initial={config}
          onCancel={() => setDialog(null)}
          onOk={(c) => startGame('custom', c)}
        />
      )}
      {dialog?.kind === 'best' && (
        <BestDialog onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'name' && (
        <NameDialog
          level={dialog.level}
          seconds={dialog.seconds}
          initial={playerName}
          onDone={(name) => {
            useGamesStore.getState().recordScore('mines', {
              name,
              score: dialog.seconds,
              level: dialog.level,
            });
            setDialog({ kind: 'best' });
          }}
        />
      )}
    </div>
  );
}
