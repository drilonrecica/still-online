// Disk Cleanup: a never-quick "scan", a list of joke categories, and a cleanup that frees 0 KB.
import { useEffect, useId, useState } from 'react';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { scaleMs } from '@/os/speed';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import { useReducedMotion } from '@/os/useReducedMotion';
import styles from './DiskCleanup.module.css';

export const SCAN_MS = 6000;
export const CLEAN_MS = 2500;
const SCAN_STEPS = 24;
const CLEAN_STEPS = 10;

export const SCAN_LABELS = [
  'Temporary Internet Files',
  'Old crushes',
  'Embarrassing poems',
  'Unfinished homework',
  'Pony fan fiction',
  'Kayla drama archive',
] as const;

export const DONE_MESSAGE =
  'Disk Cleanup freed 0 KB on (C:). Your computer is as messy as before.';

interface Category {
  id: string;
  label: string;
  kb: number;
  checked: boolean;
}

const RECYCLE_KB_PER_ITEM = 1.2;

export function buildCategories(recycleItems: number): Category[] {
  return [
    { id: 'programs', label: 'Downloaded Program Files', kb: 0, checked: true },
    {
      id: 'internet',
      label: 'Temporary Internet Files',
      kb: 14382,
      checked: true,
    },
    {
      id: 'recycle',
      label: 'Recycle Bin',
      kb: Math.round(recycleItems * RECYCLE_KB_PER_ITEM),
      checked: false,
    },
    { id: 'crushes', label: 'Old crushes', kb: 2048, checked: false },
    { id: 'feelings', label: 'Feelings', kb: 0, checked: false },
    {
      id: 'compress',
      label: 'Compress old files',
      kb: 9999999,
      checked: false,
    },
  ];
}

export function formatKb(kb: number): string {
  return `${kb.toLocaleString('en-US')} KB`;
}

type Phase = 'scanning' | 'list' | 'confirm' | 'cleaning' | 'done';

/**
 * Runs `steps` ticks that add up to at least `totalMs`. Outside reduced motion each tick may
 * take an extra random pause; with reduced motion the ticks are even but the steps are the same.
 */
function useCrawl(
  active: boolean,
  steps: number,
  totalMs: number,
  reduced: boolean,
  onDone: () => void,
): number {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!active) return;
    setStep(0);
    const base = scaleMs(totalMs) / steps;
    const pauseBudget = reduced ? 0 : base * 0.6;
    let current = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      current += 1;
      setStep(current);
      if (current >= steps) {
        onDone();
        return;
      }
      schedule();
    };
    const schedule = () => {
      const pause = Math.random() < 0.3 ? Math.random() * pauseBudget : 0;
      timer = setTimeout(tick, base + pause);
    };
    schedule();
    return () => clearTimeout(timer);
    // `onDone` is intentionally excluded: only the latest phase transition matters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, steps, totalMs, reduced]);
  return step;
}

export default function DiskCleanup({ windowId }: AppComponentProps) {
  const reduced = useReducedMotion();
  const id = useId();
  const [phase, setPhase] = useState<Phase>('scanning');
  const [categories, setCategories] = useState<Category[]>([]);

  const scanStep = useCrawl(
    phase === 'scanning',
    SCAN_STEPS,
    SCAN_MS,
    reduced,
    () => {
      const recycleItems = useFsStore
        .getState()
        .list(FS_FOLDERS.recycle).length;
      setCategories(buildCategories(recycleItems));
      setPhase('list');
    },
  );
  const cleanStep = useCrawl(
    phase === 'cleaning',
    CLEAN_STEPS,
    CLEAN_MS,
    reduced,
    () => setPhase('done'),
  );

  const close = () => useWindowsStore.getState().closeWindow(windowId);
  const total = categories
    .filter((c) => c.checked)
    .reduce((sum, c) => sum + c.kb, 0);

  if (phase === 'scanning' || phase === 'cleaning') {
    const scanning = phase === 'scanning';
    const step = scanning ? scanStep : cleanStep;
    const steps = scanning ? SCAN_STEPS : CLEAN_STEPS;
    const label = scanning
      ? `Scanning: ${SCAN_LABELS[Math.floor(step / 4) % SCAN_LABELS.length]}`
      : 'Cleaning up…';
    return (
      <div className={styles.root}>
        <p className={styles.intro}>
          {scanning
            ? 'Disk Cleanup is calculating how much space you will be able to free on (C:). This may take a few minutes to complete.'
            : 'Disk Cleanup is cleaning up the selected files on (C:).'}
        </p>
        <div
          className={styles.track}
          role="progressbar"
          aria-label={scanning ? 'Calculating' : 'Cleaning up'}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((step / steps) * 100)}
        >
          <div
            className={styles.fill}
            data-static={reduced}
            style={{ width: `${(step / steps) * 100}%` }}
          />
        </div>
        <p className={styles.scanLabel} role="status">
          {label}
        </p>
        <div className={styles.buttons}>
          <button type="button" onClick={close}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <p className={styles.intro}>
        You can use Disk Cleanup to free up to {formatKb(total)} of disk space
        on (C:).
      </p>
      <p className={styles.intro}>Files to delete:</p>
      <ul className={styles.list}>
        {categories.map((c) => (
          <li key={c.id} className={styles.item}>
            <input
              id={`${id}-${c.id}`}
              type="checkbox"
              checked={c.checked}
              onChange={(e) =>
                setCategories((cs) =>
                  cs.map((x) =>
                    x.id === c.id ? { ...x, checked: e.target.checked } : x,
                  ),
                )
              }
            />
            <label htmlFor={`${id}-${c.id}`}>{c.label}</label>
            <span className={styles.size}>{formatKb(c.kb)}</span>
          </li>
        ))}
      </ul>
      <p className={styles.total}>
        Total amount of disk space you gain: {formatKb(total)}
      </p>
      <div className={styles.buttons}>
        <button type="button" onClick={() => setPhase('confirm')}>
          OK
        </button>
        <button type="button" onClick={close}>
          Cancel
        </button>
      </div>

      {(phase === 'confirm' || phase === 'done') && (
        <div className={styles.overlay}>
          <div
            className={`window ${styles.dialog}`}
            role="dialog"
            aria-label="Disk Cleanup"
          >
            <div className="title-bar">
              <div className="title-bar-text">Disk Cleanup</div>
            </div>
            <div className="window-body">
              <p className={styles.message}>
                {phase === 'confirm'
                  ? 'Are you sure you want to perform these actions?'
                  : DONE_MESSAGE}
              </p>
              <div className={styles.buttons}>
                {phase === 'confirm' ? (
                  <>
                    <button type="button" onClick={() => setPhase('cleaning')}>
                      Yes
                    </button>
                    <button type="button" onClick={() => setPhase('list')}>
                      No
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={close}>
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
