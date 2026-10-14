import { useState } from 'react';
import { FolderView } from '@/os/fs/FolderView';
import { FS_FOLDERS } from '@/os/fs/types';

/** The Recycle Bin: the shared folder view on `recycle`, with restore/empty actions. */
export default function RecycleBin() {
  const [folderId, setFolderId] = useState<string>(FS_FOLDERS.recycle);
  // Files can't be opened from the bin; folders can be browsed.
  return <FolderView folderId={folderId} onNavigate={setFolderId} />;
}
