// The small XP "Open" / "Save As" dialog: FolderView limited to My Documents and below, a file name
// box and the one file type Notepad knows.
import { useState } from 'react';
import { useT } from '@/i18n/useT';
import { FolderView } from '@/os/fs/FolderView';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import styles from './Notepad.module.css';

export interface FileDialogProps {
  mode: 'open' | 'saveAs';
  /** Folder to start in. */
  initialFolderId: string;
  initialName: string;
  /** Open: the chosen file. Save As: the folder and name to write. */
  onOpen: (fileId: string) => void;
  onSave: (folderId: string, name: string) => void;
  onCancel: () => void;
}

const isTxt = (n: FsNode) => n.type === 'txt';

function withExtension(name: string): string {
  return /\.txt$/i.test(name) ? name : `${name}.txt`;
}

export function FileDialog({
  mode,
  initialFolderId,
  initialName,
  onOpen,
  onSave,
  onCancel,
}: FileDialogProps) {
  const t = useT();
  const nodes = useFsStore((s) => s.nodes);
  const [folderId, setFolderId] = useState(
    nodes[initialFolderId]?.type === 'folder'
      ? initialFolderId
      : FS_FOLDERS.docs,
  );
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const title =
    mode === 'open'
      ? t('notepad.dialog.openTitle')
      : t('notepad.dialog.saveAsTitle');

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const match = Object.values(nodes).find(
      (n) =>
        n.parentId === folderId &&
        n.type === 'txt' &&
        n.name.toLowerCase() === withExtension(trimmed).toLowerCase(),
    );
    if (mode === 'open') {
      if (match) onOpen(match.id);
      else setError(t('notepad.dialog.notFound', { file: trimmed }));
      return;
    }
    if (
      match &&
      !window.confirm(t('notepad.dialog.replace', { file: match.name }))
    ) {
      return;
    }
    onSave(folderId, withExtension(trimmed));
  }

  return (
    <div className={styles.overlay}>
      <div
        className={`window ${styles.dialog} ${styles.fileDialog}`}
        role="dialog"
        aria-label={title}
      >
        <div className="title-bar">
          <div className="title-bar-text">{title}</div>
        </div>
        <div className={`window-body ${styles.dialogBody}`}>
          <div className={styles.picker}>
            <FolderView
              folderId={folderId}
              rootId={FS_FOLDERS.docs}
              filter={isTxt}
              onNavigate={setFolderId}
              onOpenFile={(node) =>
                mode === 'open' ? onOpen(node.id) : setName(node.name)
              }
              onSelect={(node) => {
                if (node && node.type === 'txt') {
                  setName(node.name);
                  setError('');
                }
              }}
            />
          </div>
          <div className={styles.fields}>
            <label>
              {t('notepad.dialog.fileName')}
              <input
                value={name}
                aria-label={t('notepad.dialog.fileNameLabel')}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submit();
                }}
              />
            </label>
            <label>
              {mode === 'open'
                ? t('notepad.dialog.filesOfType')
                : t('notepad.dialog.saveAsType')}
              <select
                aria-label={t('notepad.dialog.filesOfTypeLabel')}
                defaultValue="txt"
              >
                <option value="txt">{t('notepad.dialog.txtType')}</option>
              </select>
            </label>
          </div>
          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}
          <div className={styles.buttons}>
            <button type="button" onClick={submit}>
              {mode === 'open'
                ? t('notepad.dialog.open')
                : t('notepad.dialog.save')}
            </button>
            <button type="button" onClick={onCancel}>
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
