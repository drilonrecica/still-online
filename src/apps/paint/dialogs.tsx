// Paint's dialogs: a generic message box, Image → Attributes, and Open / Save As on My Pictures.
import { useState, type ReactNode } from 'react';
import { FolderView } from '@/os/fs/FolderView';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import { withPngExtension } from './files';
import { clampSide, MAX_SIDE } from './pixels';
import styles from './Paint.module.css';

export function Dialog({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={styles.overlay}>
      <div
        className={`window ${styles.dialog} ${className ?? ''}`}
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

export interface MessageButton {
  label: string;
  onClick: () => void;
}

export function MessageBox({
  title = 'Paint',
  text,
  buttons,
}: {
  title?: string;
  text: string;
  buttons: MessageButton[];
}) {
  return (
    <Dialog title={title}>
      <p className={styles.message}>{text}</p>
      <div className={styles.buttons}>
        {buttons.map((b, i) => (
          <button
            key={b.label}
            type="button"
            autoFocus={i === 0}
            onClick={b.onClick}
          >
            {b.label}
          </button>
        ))}
      </div>
    </Dialog>
  );
}

export function AttributesDialog({
  width,
  height,
  onOk,
  onCancel,
}: {
  width: number;
  height: number;
  onOk: (w: number, h: number) => void;
  onCancel: () => void;
}) {
  const [w, setW] = useState(String(width));
  const [h, setH] = useState(String(height));
  return (
    <Dialog title="Attributes">
      <form
        className={styles.fields}
        onSubmit={(e) => {
          e.preventDefault();
          onOk(clampSide(Number(w)), clampSide(Number(h)));
        }}
      >
        <p className={styles.message}>Size in pixels (1–{MAX_SIDE}).</p>
        <label>
          Width:
          <input
            type="number"
            min={1}
            max={MAX_SIDE}
            value={w}
            onChange={(e) => setW(e.target.value)}
            autoFocus
          />
        </label>
        <label>
          Height:
          <input
            type="number"
            min={1}
            max={MAX_SIDE}
            value={h}
            onChange={(e) => setH(e.target.value)}
          />
        </label>
        <div className={styles.buttons}>
          <button type="submit">OK</button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </Dialog>
  );
}

const isImage = (n: FsNode) => n.type === 'image';

export interface ImageFileDialogProps {
  mode: 'open' | 'saveAs';
  initialFolderId: string;
  initialName: string;
  onOpen: (file: FsNode) => void;
  onSave: (folderId: string, name: string) => void;
  onCancel: () => void;
}

/** Open / Save As, browsing My Pictures and its subfolders. */
export function ImageFileDialog({
  mode,
  initialFolderId,
  initialName,
  onOpen,
  onSave,
  onCancel,
}: ImageFileDialogProps) {
  const nodes = useFsStore((s) => s.nodes);
  const [folderId, setFolderId] = useState(
    nodes[initialFolderId]?.type === 'folder'
      ? initialFolderId
      : FS_FOLDERS.pics,
  );
  const [name, setName] = useState(initialName);
  const [error, setError] = useState('');
  const title = mode === 'open' ? 'Open' : 'Save As';

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const find = (n: string) =>
      Object.values(nodes).find(
        (f) =>
          f.parentId === folderId &&
          isImage(f) &&
          f.name.toLowerCase() === n.toLowerCase(),
      );
    if (mode === 'open') {
      const match = find(trimmed) ?? find(withPngExtension(trimmed));
      if (match) onOpen(match);
      else setError(`${trimmed}\nFile not found.`);
      return;
    }
    const match = find(withPngExtension(trimmed));
    if (
      match &&
      !window.confirm(
        `${match.name} already exists.\nDo you want to replace it?`,
      )
    )
      return;
    onSave(folderId, withPngExtension(trimmed));
  }

  return (
    <Dialog title={title} className={styles.fileDialog}>
      <div className={styles.picker}>
        <FolderView
          folderId={folderId}
          rootId={FS_FOLDERS.pics}
          filter={isImage}
          onNavigate={setFolderId}
          onOpenFile={(node) =>
            mode === 'open' ? onOpen(node) : setName(node.name)
          }
          onSelect={(node) => {
            if (node && isImage(node)) {
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
          <select aria-label="Files of type" defaultValue="png">
            <option value="png">
              {mode === 'open' ? 'All Picture Files' : 'PNG (*.png)'}
            </option>
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
    </Dialog>
  );
}
