// Mines: the minesweeper-style game. Board rules live in `board.ts`; this file is the window.
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { events } from '@/os/events';
import { useGamesStore, MINES_LEVELS, type MinesLevel } from '@/os/store/games';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import {
  CUSTOM_LIMITS,
  LEVELS,
  chord,
  clampConfig,
  createBoard,
  cycleMark,
  isWrongFlag,
  minesLeft,
  reveal,
  type Board,
  type Cell,
  type Config,
} from './board';
import { Face, FlagIcon, Lcd, MineIcon, type FaceKind } from './graphics';
import styles from './Mines.module.css';

export const CELL_PX = 16;
export const MAX_SECONDS = 999;

type Level = MinesLevel | 'custom';

export const LEVEL_LABELS: Record<MinesLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  expert: 'Expert',
};

/** Window size that fits a board of `config` exactly (menubar, header and frames included). */
export function windowSizeFor(config: Config): { w: number; h: number } {
  return {
    w: config.width * CELL_PX + 26,
    h: config.height * CELL_PX + 119,
  };
}

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
}

const CellView = memo(function CellView({
  cell,
  index,
  x,
  y,
  wrongFlag,
}: CellViewProps) {
  const open = cell.revealed;
  let label = 'hidden';
  let content: React.ReactNode = null;
  if (open && cell.mine) {
    label = cell.exploded ? 'exploded mine' : 'mine';
    content = <MineIcon />;
  } else if (open) {
    label = cell.adjacent ? String(cell.adjacent) : 'empty';
    content = cell.adjacent ? cell.adjacent : null;
  } else if (cell.mark === 'flag') {
    label = wrongFlag ? 'wrong flag' : 'flag';
    content = <FlagIcon wrong={wrongFlag} />;
  } else if (cell.mark === 'question') {
    label = 'question';
    content = '?';
  }
  const cls = [
    styles.cell,
    open && styles.open,
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
      data-index={index}
      aria-label={`Row ${y + 1}, column ${x + 1}: ${label}`}
    >
      {content}
    </button>
  );
});

export default function Mines({ windowId }: AppComponentProps) {
  const [level, setLevel] = useState<Level>('beginner');
  const [config, setConfig] = useState<Config>(LEVELS.beginner);
  const [board, setBoard] = useState<Board>(() =>
    createBoard(LEVELS.beginner, newSeed()),
  );
  const [seconds, setSeconds] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [menu, setMenu] = useState(false);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const secondsRef = useRef(0);
  /** A both-buttons chord is in progress; its button releases do nothing. */
  const chorded = useRef(false);
  const best = useGamesStore((s) => s.mines.best);
  const playerName = useSettingsStore((s) => s.playerName);

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

  function onMouseDown(e: MouseEvent) {
    if (board.status === 'won' || board.status === 'lost') return;
    const i = cellAt(e.target);
    if (i === null) return;
    // Both buttons held: chord straight away and swallow the releases.
    if (e.buttons === 3) {
      chorded.current = true;
      applyMove(chord(board, i));
      return;
    }
    if (e.button === 2) {
      applyMove(cycleMark(board, i));
    } else if (e.button === 0) {
      setPressed(true);
    }
  }
  function onMouseUp(e: MouseEvent) {
    setPressed(false);
    if (chorded.current) {
      if (e.buttons === 0) chorded.current = false;
      return;
    }
    const i = cellAt(e.target);
    if (i === null) return;
    if (e.button === 1) {
      applyMove(chord(board, i));
    } else if (e.button === 0) {
      const cell = board.cells[i]!;
      applyMove(cell.revealed ? chord(board, i) : reveal(board, i));
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'F2') {
      e.preventDefault();
      newGame();
    }
  }

  const face: FaceKind =
    board.status === 'won'
      ? 'cool'
      : board.status === 'lost'
        ? 'dead'
        : pressed
          ? 'worried'
          : 'smile';

  const gameMenu: { label: string; hint?: string; run: () => void }[] = [
    { label: 'New', hint: 'F2', run: newGame },
    ...MINES_LEVELS.map((l) => ({
      label: LEVEL_LABELS[l],
      hint: level === l ? '✓' : undefined,
      run: () => startGame(l, LEVELS[l]),
    })),
    {
      label: 'Custom…',
      hint: level === 'custom' ? '✓' : undefined,
      run: () => {
        setMenu(false);
        setDialog({ kind: 'custom' });
      },
    },
    {
      label: 'Best Times…',
      run: () => {
        setMenu(false);
        setDialog({ kind: 'best' });
      },
    },
    {
      label: 'Exit',
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
      <div className={styles.menubar} role="menubar" aria-label="Mines">
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
            Game
          </button>
          {menu && (
            <div className={styles.dropdown} role="menu" aria-label="Game">
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

      <div className={styles.game}>
        <div className={styles.header}>
          <Lcd value={minesLeft(board)} label="Mines left" />
          <button
            type="button"
            className={styles.face}
            aria-label={`New game (${face === 'cool' ? 'you won' : face === 'dead' ? 'you lost' : 'F2'})`}
            onClick={newGame}
          >
            <Face kind={face} />
          </button>
          <Lcd value={seconds} label="Time" />
        </div>
        <div
          className={styles.grid}
          role="group"
          aria-label="Mine field"
          style={{
            gridTemplateColumns: `repeat(${board.width}, ${CELL_PX}px)`,
          }}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
          onMouseLeave={() => setPressed(false)}
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
            />
          ))}
        </div>
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

function Dialog({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.overlay}>
      <div
        className={`window ${styles.dialog}`}
        role="dialog"
        aria-label={title}
      >
        <div className="title-bar">
          <div className="title-bar-text">{title}</div>
        </div>
        <div className={`window-body ${styles.dialogBody}`}>{children}</div>
      </div>
    </div>
  );
}

function CustomDialog({
  initial,
  onOk,
  onCancel,
}: {
  initial: Config;
  onOk: (c: Config) => void;
  onCancel: () => void;
}) {
  const [height, setHeight] = useState(String(initial.height));
  const [width, setWidth] = useState(String(initial.width));
  const [mines, setMines] = useState(String(initial.mines));
  const field = (
    label: string,
    value: string,
    set: (v: string) => void,
    min: number,
    max: number,
  ) => (
    <>
      <label>
        {label}
        <br />
      </label>
      <input
        aria-label={label}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
    </>
  );
  return (
    <Dialog title="Custom Field">
      <div className={styles.fields}>
        {field(
          'Height',
          height,
          setHeight,
          CUSTOM_LIMITS.minHeight,
          CUSTOM_LIMITS.maxHeight,
        )}
        {field(
          'Width',
          width,
          setWidth,
          CUSTOM_LIMITS.minWidth,
          CUSTOM_LIMITS.maxWidth,
        )}
        {field('Mines', mines, setMines, CUSTOM_LIMITS.minMines, 667)}
      </div>
      <div className={styles.buttons}>
        <button
          type="button"
          onClick={() =>
            onOk({
              width: Number(width),
              height: Number(height),
              mines: Number(mines),
            })
          }
        >
          OK
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </Dialog>
  );
}

function BestDialog({ onClose }: { onClose: () => void }) {
  const best = useGamesStore((s) => s.mines.best);
  return (
    <Dialog title="Fastest Mine Sweepers">
      <table className={styles.times}>
        <tbody>
          {MINES_LEVELS.map((l) => (
            <tr key={l}>
              <th scope="row">{LEVEL_LABELS[l]}:</th>
              <td>{best[l] ? `${best[l].seconds} seconds` : '999 seconds'}</td>
              <td>{best[l]?.name ?? 'Anonymous'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.buttons}>
        <button
          type="button"
          onClick={() => useGamesStore.getState().resetScores('mines')}
        >
          Reset Scores
        </button>
        <button type="button" onClick={onClose}>
          OK
        </button>
      </div>
    </Dialog>
  );
}

function NameDialog({
  level,
  seconds,
  initial,
  onDone,
}: {
  level: MinesLevel;
  seconds: number;
  initial: string;
  onDone: (name: string) => void;
}) {
  const [name, setName] = useState(initial);
  return (
    <Dialog title="Fastest Mine Sweepers">
      <p>
        You have the fastest time for {LEVEL_LABELS[level].toLowerCase()} level
        ({seconds} seconds).
        <br />
        Please enter your name.
      </p>
      <input
        aria-label="Your name"
        autoFocus
        maxLength={20}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onDone(name)}
      />
      <div className={styles.buttons}>
        <button type="button" onClick={() => onDone(name)}>
          OK
        </button>
      </div>
    </Dialog>
  );
}
