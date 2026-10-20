// Mines' dialogs (Custom Field, Fastest Mine Sweepers, the name prompt) and level labels.
import type { MessageKey } from '@/i18n/types';
import { scoreName } from '@/i18n/scoreName';
import { useT } from '@/i18n/useT';
import { useState } from 'react';
import { useGamesStore, MINES_LEVELS, type MinesLevel } from '@/os/store/games';
import { CUSTOM_LIMITS, type Config } from './board';
import styles from './Mines.module.css';

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

export function CustomDialog({
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

export function BestDialog({ onClose }: { onClose: () => void }) {
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

export function NameDialog({
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
