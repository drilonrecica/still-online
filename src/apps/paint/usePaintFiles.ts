// Paint's File menu flows: New/Open/Save/Save As with "save changes?" guards, background, display picture.
import { useEffect, useRef, useState } from 'react';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import { useWindowsStore } from '@/os/store/windows';
import { registerCloseGuard } from '@/os/wm/closeGuard';
import { decodeImage } from './codec';
import {
  DEFAULT_NAME,
  saveAs,
  saveOver,
  sendToDisplayPicture,
  setAsBackground,
} from './files';
import { createBuffer } from './pixels';
import { DEFAULT_SIZE, type PaintDocument } from './useDocument';

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
) {
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
      if (!pixels) return fail(`Paint cannot read this file.\n${node.name}`);
      doc.replace(pixels, true);
      setSavedRev(doc.getRevision());
      track(node.id);
    } catch {
      fail(`Paint cannot read this file.\n${node.name}`);
    }
  }

  // A restored window (or one opened on a file) shows its picture again.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    const node = initialFileId
      ? useFsStore.getState().get(initialFileId)
      : undefined;
    if (node?.type === 'image') void open(node);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, on mount
  }, []);

  function run(action: Pending, savedId: string | null = fileId) {
    setDialog(null);
    if (action === 'new') {
      doc.replace(createBuffer(DEFAULT_SIZE.w, DEFAULT_SIZE.h), true);
      setSavedRev(doc.getRevision());
      track(null);
    } else if (action === 'open') {
      setDialog({ kind: 'file', mode: 'open' });
    } else if (action === 'dp') {
      if (!savedId) return;
      sendToDisplayPicture(savedId);
      setDialog({
        kind: 'message',
        text: 'Your Messenger display picture has been changed.',
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
      fail(`Paint could not save ${current.name}.`);
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
      fail(`Paint could not save ${fileName}.`);
    }
  }

  async function background(position: 'tile' | 'center') {
    settle();
    try {
      await setAsBackground(doc.buf, position);
    } catch {
      fail('Paint could not set the desktop background.');
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
    defaultSaveName: file?.name ?? DEFAULT_NAME,
  };
}
