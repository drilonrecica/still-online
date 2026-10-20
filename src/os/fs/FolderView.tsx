import { formatDateTime } from '@/i18n/format';
import { getLocale } from '@/i18n/t';
import { useT } from '@/i18n/useT';
// XP Explorer-style folder window content: address bar, task pane, icon/details list.
// Shared by the Explorer app and the Recycle Bin.
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import folderIcon16 from '@/assets/icons/folder-16.svg';
import { useDevice } from '@/os/device';
import { composeHandlers } from '@/os/touch/compose';
import { useActivate } from '@/os/touch/useActivate';
import { useLongPress, type LongPressHandlers } from '@/os/touch/useLongPress';
import { FsIcon } from './FsIcon';
import { compareNodes, isInRecycle, pathOf } from './nodes';
import { useFsStore } from './store';
import { FS_FOLDERS, type FsNode } from './types';
import styles from './FolderView.module.css';

export interface FolderViewProps {
  folderId: string;
  /** Show another folder (double-click on a folder, Up). */
  onNavigate: (folderId: string) => void;
  /** Open a non-folder node. Omit to make files inert (the Recycle Bin). */
  onOpenFile?: (node: FsNode) => void;
  /** Picker mode (file dialogs): Up stops at this folder and the task pane is hidden. */
  rootId?: string;
  /** Picker mode: the selected node changes (null when nothing is selected). */
  onSelect?: (node: FsNode | null) => void;
  /** Picker mode: only matching nodes are listed (folders always are). */
  filter?: (node: FsNode) => boolean;
}

type ViewMode = 'icons' | 'details';

/** Long-press handlers without the right-click path: a mouse keeps the browser's own menu here. */
function touchOnly(handlers: LongPressHandlers): Partial<LongPressHandlers> {
  const rest: Partial<LongPressHandlers> = { ...handlers };
  delete rest.onContextMenu;
  return rest;
}

function formatDate(ms: number): string {
  return formatDateTime(new Date(ms), getLocale());
}

export function FolderView(props: FolderViewProps) {
  // Selection and rename state belong to one folder; remount when the folder changes.
  return <FolderViewInner key={props.folderId} {...props} />;
}

function FolderViewInner({
  folderId,
  onNavigate,
  onOpenFile,
  rootId,
  onSelect,
  filter,
}: FolderViewProps) {
  const t = useT();
  const phone = useDevice() === 'phone';
  const nodes = useFsStore((s) => s.nodes);
  const remove = useFsStore((s) => s.remove);
  const restore = useFsStore((s) => s.restore);
  const purge = useFsStore((s) => s.purge);
  const rename = useFsStore((s) => s.rename);
  const emptyRecycleBin = useFsStore((s) => s.emptyRecycleBin);

  const [mode, setMode] = useState<ViewMode>('icons');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const folder = nodes[folderId];
  const inBin = isInRecycle(nodes, folderId);
  const isBinRoot = folderId === FS_FOLDERS.recycle;
  const items = useMemo(
    () =>
      Object.values(nodes)
        .filter(
          (n) =>
            n.parentId === folderId &&
            (!filter || n.type === 'folder' || filter(n)),
        )
        .sort(compareNodes),
    [nodes, folderId, filter],
  );
  const selected = items.find((n) => n.id === selectedId) ?? null;
  const path = pathOf(nodes, folderId);
  const parentId = folderId === rootId ? null : (folder?.parentId ?? null);
  const picker = rootId !== undefined;
  const binItemSelected = isBinRoot && selected !== null;

  const canRename = !!selected && !selected.system && !inBin;
  const canDelete = !!selected && !selected.system && (!inBin || isBinRoot);

  useEffect(() => {
    onSelect?.(selected);
  }, [selected, onSelect]);

  function open(node: FsNode) {
    if (node.type === 'folder') onNavigate(node.id);
    else onOpenFile?.(node);
  }
  // Double-click or a tap opens; the list's own keys handle Enter.
  const activate = useActivate((node: FsNode) => open(node));
  // A tap opens, so a held finger selects instead (for Rename and Delete on a phone).
  const holdToSelect = useLongPress((_point, id: string) => {
    setSelectedId(id);
    listRef.current?.focus();
  });

  function deleteSelected() {
    if (!selected || !canDelete) return;
    const index = items.findIndex((n) => n.id === selected.id);
    if (inBin) {
      if (!window.confirm(t('fs.view.confirmPurge', { name: selected.name }))) {
        return;
      }
      purge(selected.id);
    } else {
      remove(selected.id);
    }
    const rest = items.filter((n) => n.id !== selected.id);
    setSelectedId(rest[Math.min(index, rest.length - 1)]?.id ?? null);
  }

  function emptyBin() {
    if (items.length === 0) return;
    if (!window.confirm(t('fs.view.confirmEmptyBin', { n: items.length }))) {
      return;
    }
    emptyRecycleBin();
    setSelectedId(null);
  }

  function restoreSelected() {
    if (!selected || !binItemSelected) return;
    restore(selected.id);
    setSelectedId(null);
  }

  function startRename() {
    if (selected && canRename) setRenamingId(selected.id);
  }

  function commitRename(id: string, name: string) {
    setRenamingId(null);
    rename(id, name);
    listRef.current?.focus();
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (renamingId) return;
    const index = items.findIndex((n) => n.id === selectedId);
    const move = (to: number) => {
      e.preventDefault();
      setSelectedId(items[to]?.id ?? null);
    };
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        if (items.length) move(Math.min(index + 1, items.length - 1));
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        if (items.length) move(Math.max(index - 1, 0));
        break;
      case 'Home':
        if (items.length) move(0);
        break;
      case 'End':
        if (items.length) move(items.length - 1);
        break;
      case 'Enter':
        if (selected) {
          e.preventDefault();
          open(selected);
        }
        break;
      case 'Delete':
        e.preventDefault();
        deleteSelected();
        break;
      case 'F2':
        e.preventDefault();
        startRename();
        break;
      case 'Backspace':
        if (parentId) {
          e.preventDefault();
          onNavigate(parentId);
        }
        break;
    }
  }

  // The task pane's actions. A phone has no room for the pane: they join the toolbar.
  const tasks = (
    <>
      {isBinRoot && (
        <>
          <button
            type="button"
            disabled={!binItemSelected}
            onClick={restoreSelected}
          >
            {t('fs.view.restore')}
          </button>
          <button
            type="button"
            disabled={items.length === 0}
            onClick={emptyBin}
          >
            {t('fs.view.emptyBin')}
          </button>
        </>
      )}
      <button type="button" disabled={!canRename} onClick={startRename}>
        {t('fs.view.rename')}
      </button>
      <button type="button" disabled={!canDelete} onClick={deleteSelected}>
        {t('fs.view.delete')}
      </button>
    </>
  );

  if (!folder) {
    return <p className={styles.empty}>{t('fs.view.unavailable')}</p>;
  }

  return (
    <div className={`${styles.view} touch-controls`}>
      <div className={styles.toolbar}>
        <button
          type="button"
          disabled={!parentId}
          onClick={() => parentId && onNavigate(parentId)}
        >
          {t('fs.view.up')}
        </button>
        <label className={styles.address}>
          <span>{t('fs.view.address')}</span>
          <input
            readOnly
            value={path}
            aria-label={t('fs.view.address')}
            style={{ backgroundImage: `url(${folderIcon16})` }}
          />
        </label>
        <div
          className={styles.modes}
          role="group"
          aria-label={t('fs.view.view')}
        >
          <button
            type="button"
            aria-pressed={mode === 'icons'}
            onClick={() => setMode('icons')}
          >
            {t('fs.view.icons')}
          </button>
          <button
            type="button"
            aria-pressed={mode === 'details'}
            onClick={() => setMode('details')}
          >
            {t('fs.view.details')}
          </button>
        </div>
        {!picker && phone && (
          <div
            className={styles.phoneTasks}
            role="group"
            aria-label={t('fs.view.tasks')}
          >
            {tasks}
          </div>
        )}
      </div>

      <div className={styles.body}>
        {!picker && !phone && (
          <nav className={styles.tasks} aria-label={t('fs.view.tasks')}>
            <h2>{t('fs.view.tasks')}</h2>
            {tasks}
          </nav>
        )}

        <div
          ref={listRef}
          className={styles.list}
          data-mode={mode}
          role="listbox"
          aria-label={folder.name}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onClick={() => setSelectedId(null)}
        >
          {mode === 'details' && (
            <div className={styles.header} aria-hidden>
              <span>{t('fs.view.colName')}</span>
              <span>{t('fs.view.colType')}</span>
              <span>{t('fs.view.colModified')}</span>
            </div>
          )}
          {items.length === 0 && (
            <p className={styles.empty}>
              {isBinRoot ? t('fs.view.binEmpty') : t('fs.view.folderEmpty')}
            </p>
          )}
          {items.map((node) => (
            <div
              key={node.id}
              role="option"
              aria-selected={node.id === selectedId}
              className={styles.item}
              data-selected={node.id === selectedId}
              {...composeHandlers(
                {
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation();
                    setSelectedId(node.id);
                    listRef.current?.focus();
                  },
                },
                activate(node),
                touchOnly(holdToSelect(node.id)),
              )}
            >
              <span className={styles.icon}>
                <FsIcon node={node} />
              </span>
              {renamingId === node.id ? (
                <RenameInput
                  initial={node.name}
                  onCommit={(name) => commitRename(node.id, name)}
                  onCancel={() => {
                    setRenamingId(null);
                    listRef.current?.focus();
                  }}
                />
              ) : (
                <span className={styles.name}>{node.name}</span>
              )}
              {mode === 'details' && (
                <>
                  <span className={styles.meta}>
                    {t(`fs.types.${node.type}`)}
                  </span>
                  <span className={styles.meta}>
                    {formatDate(node.modifiedAt)}
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.status} aria-live="polite">
        {t('fs.view.objects', { n: items.length })}
        {selected ? ` · ${selected.name}` : ''}
      </div>
    </div>
  );
}

function RenameInput({
  initial,
  onCommit,
  onCancel,
}: {
  initial: string;
  onCommit: (name: string) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [value, setValue] = useState(initial);
  const done = useRef(false);
  const finish = (commit: boolean) => {
    if (done.current) return;
    done.current = true;
    if (commit) onCommit(value);
    else onCancel();
  };
  return (
    <input
      className={styles.rename}
      aria-label={t('fs.view.rename')}
      value={value}
      autoFocus
      onFocus={(e) => {
        // Select the base name, like Explorer does.
        const dot = initial.lastIndexOf('.');
        e.currentTarget.setSelectionRange(0, dot > 0 ? dot : initial.length);
      }}
      onChange={(e) => setValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'Enter') finish(true);
        else if (e.key === 'Escape') finish(false);
      }}
      onBlur={() => finish(true)}
    />
  );
}
