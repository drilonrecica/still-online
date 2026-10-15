// Mines: the minesweeper-style game. Board rules live in `board.ts`; this file is the window.
import { usePlayerName } from '@/i18n/settingsText';
import type { MessageKey } from '@/i18n/types';
import { useT } from '@/i18n/useT';
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
import { scoreName } from '@/i18n/scoreName';
import { Face, FlagIcon, Lcd, MineIcon, type FaceKind } from './graphics';
import styles from './Mines.module.css';

export const CELL_PX = 16;
export const MAX_SECONDS = 999;

type Level = MinesLevel | 'custom';

export const LEVEL_KEYS = {
  beginner: 'mines.level.beginner',
  intermediate: 'mines.level.intermediate',
  expert: 'mines.level.expert',
} as const satisfies Record<MinesLevel, MessageKey>;

const LEVEL_INLINE_KEYS = {
  beginner: 'mines.levelInline.beginner',
  intermediate: 'mines.levelInline.intermediate',
  expert: 'mines.levelInline.expert',
} as const satisfies Record<MinesLevel, MessageKey>;

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
  /** A both-buttons chord is in progress; its button releases do nothing. */
  const chorded = useRef(false);
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

      <div className={styles.game}>
        <div className={styles.header}>
          <Lcd value={minesLeft(board)} label={t('mines.minesLeft')} />
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
              cursor={cursor === i}
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
  const t = useT();
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
    <Dialog title={t('mines.custom.title')}>
      <div className={styles.fields}>
        {field(
          t('mines.custom.height'),
          height,
          setHeight,
          CUSTOM_LIMITS.minHeight,
          CUSTOM_LIMITS.maxHeight,
        )}
        {field(
          t('mines.custom.width'),
          width,
          setWidth,
          CUSTOM_LIMITS.minWidth,
          CUSTOM_LIMITS.maxWidth,
        )}
        {field(
          t('mines.custom.mines'),
          mines,
          setMines,
          CUSTOM_LIMITS.minMines,
          667,
        )}
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
          {t('common.ok')}
        </button>
        <button type="button" onClick={onCancel}>
          {t('common.cancel')}
        </button>
      </div>
    </Dialog>
  );
}

function BestDialog({ onClose }: { onClose: () => void }) {
  const best = useGamesStore((s) => s.mines.best);
  const t = useT();
  return (
    <Dialog title={t('mines.best.title')}>
      <table className={styles.times}>
        <tbody>
          {MINES_LEVELS.map((l) => (
            <tr key={l}>
              <th scope="row">{t(LEVEL_KEYS[l])}:</th>
              <td>
                <div>
                  {t('mines.best.seconds', { n: best[l]?.seconds ?? 999 })}
                </div>
                <div>{scoreName(best[l]?.name, t)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={styles.buttons}>
        <button
          type="button"
          onClick={() => useGamesStore.getState().resetScores('mines')}
        >
          {t('mines.best.reset')}
        </button>
        <button type="button" onClick={onClose}>
          {t('common.ok')}
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
  const t = useT();
  return (
    <Dialog title={t('mines.best.title')}>
      <p>
        {t('mines.name.prompt', {
          level: t(LEVEL_INLINE_KEYS[level]),
          seconds,
        })}
        <br />
        {t('mines.name.enter')}
      </p>
      <input
        aria-label={t('mines.name.label')}
        autoFocus
        maxLength={20}
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onDone(name)}
      />
      <div className={styles.buttons}>
        <button type="button" onClick={() => onDone(name)}>
          {t('common.ok')}
        </button>
      </div>
    </Dialog>
  );
}
