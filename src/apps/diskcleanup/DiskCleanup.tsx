import { formatNumber } from '@/i18n/format';
import { getLocale, t } from '@/i18n/t';
import type { MessageKey } from '@/i18n/types';
import { useT } from '@/i18n/useT';
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
  'diskcleanup.scanLabels.internet',
  'diskcleanup.scanLabels.crushes',
  'diskcleanup.scanLabels.poems',
  'diskcleanup.scanLabels.homework',
  'diskcleanup.scanLabels.fanfic',
  'diskcleanup.scanLabels.drama',
] as const satisfies readonly MessageKey[];

export const DONE_MESSAGE = 'diskcleanup.done' satisfies MessageKey;

interface Category {
  id: string;
  labelKey: MessageKey;
  kb: number;
  checked: boolean;
}

const RECYCLE_KB_PER_ITEM = 1.2;

export function buildCategories(recycleItems: number): Category[] {
  return [
    {
      id: 'programs',
      labelKey: 'diskcleanup.categories.programs',
      kb: 0,
      checked: true,
    },
    {
      id: 'internet',
      labelKey: 'diskcleanup.categories.internet',
      kb: 14382,
      checked: true,
    },
    {
      id: 'recycle',
      labelKey: 'diskcleanup.categories.recycle',
      kb: Math.round(recycleItems * RECYCLE_KB_PER_ITEM),
      checked: false,
    },
    {
      id: 'crushes',
      labelKey: 'diskcleanup.categories.crushes',
      kb: 2048,
      checked: false,
    },
    {
      id: 'feelings',
      labelKey: 'diskcleanup.categories.feelings',
      kb: 0,
      checked: false,
    },
    {
      id: 'compress',
      labelKey: 'diskcleanup.categories.compress',
      kb: 9999999,
      checked: false,
    },
  ];
}

export function formatKb(kb: number): string {
  return t('diskcleanup.kb', { n: formatNumber(kb, getLocale()) });
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
  const t = useT();
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
      ? t('diskcleanup.scanning', {
          item: t(SCAN_LABELS[Math.floor(step / 4) % SCAN_LABELS.length]!),
        })
      : t('diskcleanup.cleaning');
    return (
      <div className={`${styles.root} touch-controls`}>
        <p className={styles.intro}>
          {scanning
            ? t('diskcleanup.introScanning')
            : t('diskcleanup.introCleaning')}
        </p>
        <div
          className={styles.track}
          role="progressbar"
          aria-label={
            scanning
              ? t('diskcleanup.progressScanning')
              : t('diskcleanup.progressCleaning')
          }
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
            {t('common.cancel')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.root} touch-controls`}>
      <p className={styles.intro}>
        {t('diskcleanup.intro', { size: formatKb(total) })}
      </p>
      <p className={styles.intro}>{t('diskcleanup.filesToDelete')}</p>
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
            <label htmlFor={`${id}-${c.id}`}>{t(c.labelKey)}</label>
            <span className={styles.size}>{formatKb(c.kb)}</span>
          </li>
        ))}
      </ul>
      <p className={styles.total}>
        {t('diskcleanup.total', { size: formatKb(total) })}
      </p>
      <div className={styles.buttons}>
        <button type="button" onClick={() => setPhase('confirm')}>
          {t('common.ok')}
        </button>
        <button type="button" onClick={close}>
          {t('common.cancel')}
        </button>
      </div>

      {(phase === 'confirm' || phase === 'done') && (
        <div className={styles.overlay}>
          <div
            className={`window ${styles.dialog}`}
            role="dialog"
            aria-label={t('apps.diskcleanup.title')}
          >
            <div className="title-bar">
              <div className="title-bar-text">
                {t('apps.diskcleanup.title')}
              </div>
            </div>
            <div className="window-body">
              <p className={styles.message}>
                {phase === 'confirm'
                  ? t('diskcleanup.confirm')
                  : t(DONE_MESSAGE)}
              </p>
              <div className={styles.buttons}>
                {phase === 'confirm' ? (
                  <>
                    <button type="button" onClick={() => setPhase('cleaning')}>
                      {t('common.yes')}
                    </button>
                    <button type="button" onClick={() => setPhase('list')}>
                      {t('common.no')}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={close}>
                    {t('common.ok')}
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
