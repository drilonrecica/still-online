// The small XP "Open" / "Save As" dialog: FolderView limited to My Documents and below, a file name
// box and the one file type Notepad knows.
import { useState } from 'react';
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
  const nodes = useFsStore((s) => s.nodes);
  const [folderId, setFolderId] = useState(
    nodes[initialFolderId]?.type === 'folder'
      ? initialFolderId
      : FS_FOLDERS.docs,
  );
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const title = mode === 'open' ? 'Open' : 'Save As';

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
      else setError(`${trimmed}\nFile not found.`);
      return;
    }
    if (
      match &&
      !window.confirm(
        `${match.name} already exists.\nDo you want to replace it?`,
      )
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
              File name:
              <input
                value={name}
                aria-label="File name"
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
              {mode === 'open' ? 'Files of type:' : 'Save as type:'}
              <select aria-label="Files of type" defaultValue="txt">
                <option value="txt">Text Documents (*.txt)</option>
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
              {mode === 'open' ? 'Open' : 'Save'}
            </button>
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
