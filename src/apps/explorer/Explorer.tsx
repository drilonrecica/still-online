import { useEffect, useState } from 'react';
import { FolderView } from '@/os/fs/FolderView';
import { isSystemId } from '@/os/fs/nodes';
import { openFsNode } from '@/os/fs/openNode';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS, type FsFolderId } from '@/os/fs/types';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';

export default function Explorer({ windowId, props }: AppComponentProps) {
  const initial =
    typeof props.folder === 'string' ? props.folder : FS_FOLDERS.docs;
  const nodes = useFsStore((s) => s.nodes);
  const setWindowTitle = useWindowsStore((s) => s.setWindowTitle);
  const [folderId, setFolderId] = useState(initial);

  // A purged folder falls back to My Documents rather than a dead window.
  const folder =
    nodes[folderId]?.type === 'folder'
      ? nodes[folderId]
      : nodes[FS_FOLDERS.docs];
  const currentId = folder?.id ?? FS_FOLDERS.docs;
  const name = folder?.name;

  // System folders render from their key; other folders show their (rendered) name.
  useEffect(() => {
    if (isSystemId(currentId)) {
      setWindowTitle(windowId, `fs.folders.${currentId as FsFolderId}`);
    } else {
      setWindowTitle(windowId, 'fs.folderTitle', { name: name ?? '' });
    }
  }, [windowId, currentId, name, setWindowTitle]);

  return (
    <FolderView
      folderId={currentId}
      onNavigate={setFolderId}
      onOpenFile={(node) => openFsNode(node, { navigate: setFolderId })}
    />
  );
}
