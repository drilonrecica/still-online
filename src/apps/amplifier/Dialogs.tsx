// Amplifier playlist dialogs: "From My Music…", "Shipped tracks…" and the "Burn CD…" joke.
// Rendered as overlays inside the (small) Amplifier window.
import { useEffect, useState } from 'react';
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
  return (
    <div className={styles.dialogOverlay}>
      <div className={styles.dialog} role="dialog" aria-label={title}>
        <div className={styles.dialogTitle}>
          <span>{title}</span>
          <button type="button" aria-label="Close dialog" onClick={onClose}>
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
  const [folderId, setFolderId] = useState<string>(FS_FOLDERS.music);
  const [selected, setSelected] = useState<FsNode | null>(null);

  function add(node: FsNode | null) {
    const track = PLAYLIST.find((t) => t.id === node?.trackId);
    if (!track) return;
    onAdd(track);
    onClose();
  }

  return (
    <Shell title="Add from My Music" onClose={onClose}>
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
          Add
        </button>
        <button type="button" onClick={onClose}>
          Cancel
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
  return (
    <Shell title="Shipped tracks" onClose={onClose}>
      <ul className={styles.dialogList}>
        {PLAYLIST.map((t) => {
          const listed = have.some((h) => h.id === t.id);
          return (
            <li key={t.id}>
              <span>
                {t.artist} - {t.title} ({formatTime(t.durationSec)})
              </span>
              <button
                type="button"
                disabled={listed}
                aria-label={`Add ${t.title}`}
                onClick={() => onAdd(t)}
              >
                {listed ? '✓' : 'Add'}
              </button>
            </li>
          );
        })}
      </ul>
      <div className={styles.dialogButtons}>
        <button type="button" onClick={onClose}>
          Close
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
  const failAt = attempt === 0 ? 37 : 89;
  const message =
    attempt === 0
      ? 'Buffer underrun. The disc is now a coaster.'
      : 'Please insert a blank disc.';
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
    <Shell title="Burn Audio CD" onClose={onClose}>
      <dl className={styles.burnInfo}>
        <dt>Drive:</dt>
        <dd>(E:) CD-RW</dd>
        <dt>Speed:</dt>
        <dd>52x</dd>
      </dl>
      <progress
        className={styles.burnProgress}
        aria-label="Burn progress"
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
            OK
          </button>
        ) : (
          <>
            <button
              type="button"
              disabled={burning}
              onClick={() => setBurning(true)}
            >
              Burn
            </button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </>
        )}
      </div>
    </Shell>
  );
}
