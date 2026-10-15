// Amplifier playlist dialogs: "From My Music…", "Shipped tracks…" and the "Burn CD…" joke.
// Rendered as overlays inside the (small) Amplifier window.
import { useEffect, useState } from 'react';
import { useT } from '@/i18n/useT';
import { FolderView } from '@/os/fs/FolderView';
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import { PLAYLIST, type PlaylistTrack } from '@/content/playlist';
import { playSound } from '@/os/sound';
import { formatTime } from './format';
import styles from './Amplifier.module.css';

const isAudio = (n: FsNode) => n.type === 'audio' && !!n.trackId;

interface ShellProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Shell({ title, onClose, children }: ShellProps) {
  const t = useT();
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialog} role="dialog" aria-label={title}>
        <div className={styles.dialogTitle}>
          <span>{title}</span>
          <button
            type="button"
            aria-label={t('amplifier.dialog.close')}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className={styles.dialogBody}>{children}</div>
      </div>
    </div>
  );
}

export function MyMusicDialog({
  onAdd,
  onClose,
}: {
  onAdd: (track: PlaylistTrack) => void;
  onClose: () => void;
}) {
  const t = useT();
  const [folderId, setFolderId] = useState<string>(FS_FOLDERS.music);
  const [selected, setSelected] = useState<FsNode | null>(null);

  function add(node: FsNode | null) {
    const track = PLAYLIST.find((p) => p.id === node?.trackId);
    if (!track) return;
    onAdd(track);
    onClose();
  }

  return (
    <Shell title={t('amplifier.dialog.myMusicTitle')} onClose={onClose}>
      <div className={styles.dialogPicker}>
        <FolderView
          folderId={folderId}
          rootId={FS_FOLDERS.music}
          filter={isAudio}
          onNavigate={setFolderId}
          onOpenFile={add}
          onSelect={setSelected}
        />
      </div>
      <div className={styles.dialogButtons}>
        <button
          type="button"
          disabled={!selected || !isAudio(selected)}
          onClick={() => add(selected)}
        >
          {t('amplifier.dialog.add')}
        </button>
        <button type="button" onClick={onClose}>
          {t('common.cancel')}
        </button>
      </div>
    </Shell>
  );
}

export function ShippedDialog({
  have,
  onAdd,
  onClose,
}: {
  have: readonly PlaylistTrack[];
  onAdd: (track: PlaylistTrack) => void;
  onClose: () => void;
}) {
  const t = useT();
  return (
    <Shell title={t('amplifier.dialog.shippedTitle')} onClose={onClose}>
      <ul className={styles.dialogList}>
        {PLAYLIST.map((tr) => {
          const listed = have.some((h) => h.id === tr.id);
          return (
            <li key={tr.id}>
              <span>
                {tr.artist} - {tr.title} ({formatTime(tr.durationSec)})
              </span>
              <button
                type="button"
                disabled={listed}
                aria-label={t('amplifier.dialog.addTrack', { title: tr.title })}
                onClick={() => onAdd(tr)}
              >
                {listed ? '✓' : t('amplifier.dialog.add')}
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.dialogButtons}>
        <button type="button" onClick={onClose}>
          {t('common.close')}
        </button>
      </div>
    </Shell>
  );
}

const STEP_MS = 40;
const STEP_PCT = 3;

/** There's no success path: the first burn dies at 37%, every later one at 89%. */
export function BurnDialog({
  attempt,
  onClose,
}: {
  /** 0 for the first burn since the Amplifier opened. */
  attempt: number;
  onClose: () => void;
}) {
  const t = useT();
  const failAt = attempt === 0 ? 37 : 89;
  const message =
    attempt === 0
      ? t('amplifier.dialog.underrun')
      : t('amplifier.dialog.insertDisc');
  const [burning, setBurning] = useState(false);
  const [percent, setPercent] = useState(0);
  const failed = burning && percent >= failAt;

  useEffect(() => {
    if (!burning || percent >= failAt) return;
    const t = setTimeout(
      () => setPercent((p) => Math.min(failAt, p + STEP_PCT)),
      STEP_MS,
    );
    return () => clearTimeout(t);
  }, [burning, percent, failAt]);

  useEffect(() => {
    if (failed) playSound('error');
  }, [failed]);

  return (
    <Shell title={t('amplifier.dialog.burnTitle')} onClose={onClose}>
      <dl className={styles.burnInfo}>
        <dt>{t('amplifier.dialog.drive')}</dt>
        <dd>(E:) CD-RW</dd>
        <dt>{t('amplifier.dialog.speed')}</dt>
        <dd>{t('amplifier.dialog.speedValue')}</dd>
      </dl>
      <progress
        className={styles.burnProgress}
        aria-label={t('amplifier.dialog.progress')}
        max={100}
        value={percent}
      />
      <div className={styles.burnPercent}>{percent}%</div>
      {failed && (
        <p role="alert" className={styles.burnError}>
          {message}
        </p>
      )}
      <div className={styles.dialogButtons}>
        {failed ? (
          <button type="button" onClick={onClose}>
            {t('common.ok')}
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={burning}
              onClick={() => setBurning(true)}
            >
              {t('amplifier.dialog.burn')}
            </button>
            <button type="button" onClick={onClose}>
              {t('common.cancel')}
            </button>
          </>
        )}
      </div>
    </Shell>
  );
}
