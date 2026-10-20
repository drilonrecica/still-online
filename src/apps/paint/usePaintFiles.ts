// Paint's File menu flows: New/Open/Save/Save As with "save changes?" guards, background, display picture.
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/i18n/useT';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import { useWindowsStore } from '@/os/store/windows';
import { registerCloseGuard } from '@/os/wm/closeGuard';
import { decodeImage } from './codec';
import {
  saveAs,
  saveOver,
  sendToDisplayPicture,
  setAsBackground,
} from './files';
import { createBuffer } from './pixels';
import type { PaintDocument } from './useDocument';

/** Actions that may need the picture saved first. */
export type Pending = 'new' | 'open' | 'exit' | 'close' | 'dp';

export type PaintDialog =
  | { kind: 'file'; mode: 'open' | 'saveAs'; then?: Pending }
  | { kind: 'confirm'; action: Pending }
  | { kind: 'attributes' }
  | { kind: 'message'; text: string }
  | null;

export function usePaintFiles(
  doc: PaintDocument,
  windowId: string,
  initialFileId: string | null,
  settle: () => void,
  /** The size of a new picture (the work area on a phone, else 640×480). */
  newSize: () => { w: number; h: number },
) {
  const t = useT();
  const [fileId, setFileId] = useState<string | null>(null);
  const [savedRev, setSavedRev] = useState(0);
  const [dialog, setDialog] = useState<PaintDialog>(null);
  const file = useFsStore((s) => (fileId ? s.nodes[fileId] : undefined));
  const dirty = doc.revision !== savedRev;
  const name = file?.name;

  useEffect(() => {
    const windows = useWindowsStore.getState();
    if (name === undefined)
      windows.setWindowTitle(windowId, 'apps.paint.title');
    else windows.setWindowTitle(windowId, 'paint.title', { file: name });
  }, [windowId, name]);

  useEffect(
    () =>
      registerCloseGuard(windowId, () => {
        if (!dirty) return false;
        setDialog({ kind: 'confirm', action: 'close' });
        return true;
      }),
    [windowId, dirty],
  );

  function track(id: string | null) {
    setFileId(id);
    useWindowsStore
      .getState()
      .setWindowProps(windowId, id ? { fileId: id } : {});
  }

  const fail = (text: string) => setDialog({ kind: 'message', text });

  async function open(node: FsNode) {
    setDialog(null);
    try {
      const pixels = await decodeImage(node);
      if (!pixels) return fail(t('paint.error.read', { file: node.name }));
      doc.replace(pixels, true);
      setSavedRev(doc.getRevision());
      track(node.id);
    } catch {
      fail(t('paint.error.read', { file: node.name }));
    }
  }

  // A restored window (or one opened on a file) shows its picture again; otherwise the
  // blank picture takes the new-picture size (a phone's work area).
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    const node = initialFileId
      ? useFsStore.getState().get(initialFileId)
      : undefined;
    if (node?.type === 'image') void open(node);
    else {
      const { w, h } = newSize();
      if (w !== doc.buf.w || h !== doc.buf.h) run('new');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);

  function run(action: Pending, savedId: string | null = fileId) {
    setDialog(null);
    if (action === 'new') {
      const { w, h } = newSize();
      doc.replace(createBuffer(w, h), true);
      setSavedRev(doc.getRevision());
      track(null);
    } else if (action === 'open') {
      setDialog({ kind: 'file', mode: 'open' });
    } else if (action === 'dp') {
      if (!savedId) return;
      sendToDisplayPicture(savedId);
      setDialog({
        kind: 'message',
        text: t('paint.displayPictureChanged'),
      });
    } else {
      useWindowsStore.getState().closeWindow(windowId);
    }
  }

  /** Runs `action`, asking to save unsaved changes first. */
  function guarded(action: Pending) {
    settle();
    if (dirty) setDialog({ kind: 'confirm', action });
    else run(action);
  }

  /** Saves to the current file, or asks where when the picture is untitled. */
  async function save(then?: Pending) {
    settle();
    const current = fileId ? useFsStore.getState().get(fileId) : undefined;
    if (!current || current.type !== 'image') {
      setDialog({ kind: 'file', mode: 'saveAs', then });
      return;
    }
    const rev = doc.getRevision();
    try {
      await saveOver(current.id, doc.buf);
      setSavedRev(rev);
      if (then) run(then, current.id);
      else setDialog(null);
    } catch {
      fail(t('paint.error.save', { file: current.name }));
    }
  }

  async function saveTo(folderId: string, fileName: string, then?: Pending) {
    const rev = doc.getRevision();
    try {
      const id = await saveAs(folderId, fileName, doc.buf);
      setSavedRev(rev);
      track(id);
      if (then) run(then, id);
      else setDialog(null);
    } catch {
      fail(t('paint.error.save', { file: fileName }));
    }
  }

  async function background(position: 'tile' | 'center') {
    settle();
    try {
      await setAsBackground(doc.buf, position);
    } catch {
      fail(t('paint.error.background'));
    }
  }

  /** "Use as display picture" needs a saved file: unsaved pictures are saved first. */
  function displayPicture() {
    settle();
    if (fileId && !dirty) run('dp');
    else void save('dp');
  }

  return {
    fileId,
    file,
    name,
    dirty,
    dialog,
    setDialog,
    open,
    run,
    guarded,
    save,
    saveTo,
    background,
    displayPicture,
    startFolder: file?.parentId ?? FS_FOLDERS.pics,
    defaultSaveName: file?.name ?? t('paint.defaultName'),
  };
}
