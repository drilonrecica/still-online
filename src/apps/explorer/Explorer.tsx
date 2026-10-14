import { useEffect, useMemo, useState } from 'react';
import { FolderView } from '@/os/fs/FolderView';
import { compareNodes } from '@/os/fs/nodes';
import { openFsNode } from '@/os/fs/openNode';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';
import { ImageViewer } from './ImageViewer';

export default function Explorer({ windowId, props }: AppComponentProps) {
  const initial =
    typeof props.folder === 'string' ? props.folder : FS_FOLDERS.docs;
  const nodes = useFsStore((s) => s.nodes);
  const setWindowTitle = useWindowsStore((s) => s.setWindowTitle);
  const [folderId, setFolderId] = useState(initial);
  const [viewingId, setViewingId] = useState<string | null>(null);

  // A purged folder falls back to My Documents rather than a dead window.
  const folder =
    nodes[folderId]?.type === 'folder'
      ? nodes[folderId]
      : nodes[FS_FOLDERS.docs];
  const currentId = folder?.id ?? FS_FOLDERS.docs;
  const title = folder?.name ?? 'My Documents';

  useEffect(
    () => setWindowTitle(windowId, title),
    [windowId, title, setWindowTitle],
  );

  const images = useMemo(
    () =>
      Object.values(nodes)
        .filter((n) => n.parentId === currentId && n.type === 'image')
        .sort(compareNodes),
    [nodes, currentId],
  );
  const viewIndex = images.findIndex((n) => n.id === viewingId);

  function step(delta: number) {
    if (images.length === 0) return;
    const next = (viewIndex + delta + images.length) % images.length;
    setViewingId(images[next]?.id ?? null);
  }

  const viewing = images[viewIndex];
  if (viewing) {
    return (
      <ImageViewer
        image={viewing}
        position={viewIndex + 1}
        count={images.length}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        onClose={() => setViewingId(null)}
      />
    );
  }

  return (
    <FolderView
      folderId={currentId}
      onNavigate={(id) => {
        setViewingId(null);
        setFolderId(id);
      }}
      onOpenFile={(node) =>
        openFsNode(node, { navigate: setFolderId, viewImage: setViewingId })
      }
    />
  );
}
