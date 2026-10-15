import { formatShortDate, formatTime } from '@/i18n/format';
import { getLocale } from '@/i18n/t';
// Notepad: one buffer per window, files live in the fs store (the fs is the source of truth on save).
import { useEffect, useRef, useState } from 'react';
import { now } from '@/os/clock';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import { registerCloseGuard } from '@/os/wm/closeGuard';
import { FileDialog } from './FileDialog';
import styles from './Notepad.module.css';

/** An action that discards the buffer, so it asks about unsaved changes first. */
type Pending = 'new' | 'open' | 'exit' | 'close';

type Dialog =
  | { kind: 'open' | 'saveAs'; then?: Pending }
  | { kind: 'confirm'; action: Pending }
  | { kind: 'about' }
  | null;

type MenuId = 'file' | 'edit' | 'format' | 'help';

interface MenuItem {
  label: string;
  onSelect: () => void;
  checked?: boolean;
}

/** XP's Time/Date format: `3:07 PM 10/14/2007`. */
export function formatTimeDate(date: Date): string {
  const locale = getLocale();
  return `${formatTime(date, locale)} ${formatShortDate(date, locale)}`;
}

export default function Notepad({ windowId, props }: AppComponentProps) {
  const initialId = typeof props.fileId === 'string' ? props.fileId : null;
  const nodes = useFsStore((s) => s.nodes);
  const setWindowTitle = useWindowsStore((s) => s.setWindowTitle);

  const [fileId, setFileId] = useState<string | null>(() =>
    initialId && useFsStore.getState().get(initialId)?.type === 'txt'
      ? initialId
      : null,
  );
  const [text, setText] = useState(() =>
    fileId ? (useFsStore.getState().get(fileId)?.text ?? '') : '',
  );
  const [saved, setSaved] = useState(text);
  const [wrap, setWrap] = useState(true);
  const [menu, setMenu] = useState<MenuId | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  const file = fileId ? nodes[fileId] : undefined;
  const dirty = text !== saved;

  // Stapley's "writing a letter" tip: once each time typing makes the text start with "Dear".
  const wasLetter = useRef(/^\s*dear\b/i.test(text));
  useEffect(() => {
    const isLetter = /^\s*dear\b/i.test(text);
    if (isLetter && !wasLetter.current) events.emit('notepad:letter', {});
    wasLetter.current = isLetter;
  }, [text]);

  // While the buffer is unchanged, follow the file: an untouched seed re-renders on a language
  // switch (and another window may have saved it).
  const fileText = file?.text;
  useEffect(() => {
    if (fileText === undefined || dirty || fileText === saved) return;
    setText(fileText);
    setSaved(fileText);
  }, [fileText, dirty, saved]);

  const fileName = file?.name;
  useEffect(() => {
    if (fileName === undefined) {
      setWindowTitle(
        windowId,
        dirty ? 'notepad.untitledModified' : 'apps.notepad.title',
      );
    } else {
      setWindowTitle(
        windowId,
        dirty ? 'notepad.titleModified' : 'notepad.title',
        {
          file: fileName,
        },
      );
    }
  }, [windowId, fileName, dirty, setWindowTitle]);

  // The titlebar Close button asks first when there are unsaved changes.
  useEffect(
    () =>
      registerCloseGuard(windowId, () => {
        if (!dirty) return false;
        setDialog({ kind: 'confirm', action: 'close' });
        return true;
      }),
    [windowId, dirty],
  );

  function load(id: string | null) {
    const loaded = id ? (useFsStore.getState().get(id)?.text ?? '') : '';
    setFileId(id);
    setText(loaded);
    setSaved(loaded);
    useWindowsStore
      .getState()
      .setWindowProps(windowId, id ? { fileId: id } : {});
  }

  function run(action: Pending) {
    setDialog(null);
    if (action === 'new') load(null);
    else if (action === 'open') setDialog({ kind: 'open' });
    else useWindowsStore.getState().closeWindow(windowId);
  }

  function guarded(action: Pending) {
    setMenu(null);
    if (dirty) setDialog({ kind: 'confirm', action });
    else run(action);
  }

  /** Writes to the current file, or asks where when the document is untitled. */
  function save(then?: Pending) {
    setMenu(null);
    if (fileId && useFsStore.getState().get(fileId)) {
      useFsStore.getState().writeText(fileId, text);
      setSaved(text);
      if (then) run(then);
    } else {
      setDialog({ kind: 'saveAs', then });
    }
  }

  function saveAs(folderId: string, name: string, then?: Pending) {
    const fs = useFsStore.getState();
    const existing = fs
      .list(folderId)
      .find(
        (n) => n.type === 'txt' && n.name.toLowerCase() === name.toLowerCase(),
      );
    let id: string;
    if (existing) {
      fs.writeText(existing.id, text);
      id = existing.id;
    } else {
      id = fs.createFile(folderId, { name, type: 'txt', text });
    }
    setFileId(id);
    setSaved(text);
    useWindowsStore.getState().setWindowProps(windowId, { fileId: id });
    setDialog(null);
    if (then) run(then);
  }

  function insertTimeDate() {
    const stamp = formatTimeDate(now());
    const area = areaRef.current;
    const from = area?.selectionStart ?? text.length;
    const to = area?.selectionEnd ?? text.length;
    setText(text.slice(0, from) + stamp + text.slice(to));
    const caret = from + stamp.length;
    // After React commits the new value, put the caret behind the stamp.
    requestAnimationFrame(() => {
      area?.focus();
      area?.setSelectionRange(caret, caret);
    });
  }

  const menus: Record<MenuId, { label: string; items: MenuItem[] }> = {
    file: {
      label: 'File',
      items: [
        { label: 'New', onSelect: () => guarded('new') },
        { label: 'Open…', onSelect: () => guarded('open') },
        { label: 'Save', onSelect: () => save() },
        {
          label: 'Save As…',
          onSelect: () => {
            setMenu(null);
            setDialog({ kind: 'saveAs' });
          },
        },
        { label: 'Exit', onSelect: () => guarded('exit') },
      ],
    },
    edit: {
      label: 'Edit',
      items: [
        {
          label: 'Select All',
          onSelect: () => {
            setMenu(null);
            areaRef.current?.focus();
            areaRef.current?.select();
          },
        },
        {
          label: 'Time/Date',
          onSelect: () => {
            setMenu(null);
            insertTimeDate();
          },
        },
      ],
    },
    format: {
      label: 'Format',
      items: [
        {
          label: 'Word Wrap',
          checked: wrap,
          onSelect: () => {
            setMenu(null);
            setWrap(!wrap);
          },
        },
      ],
    },
    help: {
      label: 'Help',
      items: [
        {
          label: 'About Notepad',
          onSelect: () => {
            setMenu(null);
            setDialog({ kind: 'about' });
          },
        },
      ],
    },
  };

  const startFolder = file?.parentId ?? FS_FOLDERS.docs;

  return (
    <div className={styles.root} onClick={() => menu && setMenu(null)}>
      <div className={styles.menubar} role="menubar" aria-label="Notepad">
        {(Object.keys(menus) as MenuId[]).map((id) => (
          <div key={id} className={styles.menu}>
            <button
              type="button"
              role="menuitem"
              aria-haspopup="menu"
              aria-expanded={menu === id}
              className={styles.menuButton}
              onClick={(e) => {
                e.stopPropagation();
                setMenu(menu === id ? null : id);
              }}
              onMouseEnter={() => menu && setMenu(id)}
            >
              {menus[id].label}
            </button>
            {menu === id && (
              <div
                className={styles.dropdown}
                role="menu"
                aria-label={menus[id].label}
              >
                {menus[id].items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    role={
                      item.checked === undefined
                        ? 'menuitem'
                        : 'menuitemcheckbox'
                    }
                    aria-checked={item.checked}
                    className={styles.item}
                    onClick={(e) => {
                      e.stopPropagation();
                      item.onSelect();
                    }}
                  >
                    <span>{item.label}</span>
                    {item.checked && <span aria-hidden>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <textarea
        ref={areaRef}
        className={styles.editor}
        aria-label="Notepad document"
        spellCheck={false}
        wrap={wrap ? 'soft' : 'off'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {dialog?.kind === 'confirm' && (
        <div className={styles.overlay}>
          <div
            className={`window ${styles.dialog}`}
            role="dialog"
            aria-label="Notepad"
          >
            <div className="title-bar">
              <div className="title-bar-text">Notepad</div>
            </div>
            <div className="window-body">
              <p className={styles.message}>
                The text in the {file?.name ?? 'Untitled'} file has changed.
                <br />
                <br />
                Do you want to save the changes?
              </p>
              <div className={styles.buttons}>
                <button type="button" onClick={() => save(dialog.action)}>
                  Yes
                </button>
                <button type="button" onClick={() => run(dialog.action)}>
                  No
                </button>
                <button type="button" onClick={() => setDialog(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {dialog?.kind === 'about' && (
        <div className={styles.overlay}>
          <div
            className={`window ${styles.dialog}`}
            role="dialog"
            aria-label="About Notepad"
          >
            <div className="title-bar">
              <div className="title-bar-text">About Notepad</div>
            </div>
            <div className="window-body">
              <p className={styles.message}>
                Notepad
                <br />A still online accessory. Plain text, no strings attached.
              </p>
              <div className={styles.buttons}>
                <button type="button" onClick={() => setDialog(null)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(dialog?.kind === 'open' || dialog?.kind === 'saveAs') && (
        <FileDialog
          key={dialog.kind}
          mode={dialog.kind}
          initialFolderId={startFolder}
          initialName={dialog.kind === 'saveAs' ? (file?.name ?? '') : ''}
          onOpen={(id) => {
            setDialog(null);
            load(id);
          }}
          onSave={(folderId, name) => saveAs(folderId, name, dialog.then)}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
