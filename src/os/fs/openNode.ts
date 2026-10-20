// Opens an fs node by its type. Shared by Explorer and any other app that lists files.
import { events } from '@/os/events';
import { useWindowsStore } from '@/os/store/windows';
import type { FsNode } from './types';

export interface OpenHandlers {
  /** Folder → show it in the current Explorer window. */
  navigate: (folderId: string) => void;
}

export function openFsNode(node: FsNode, handlers: OpenHandlers): void {
  switch (node.type) {
    case 'folder':
      handlers.navigate(node.id);
      return;
    case 'txt':
      useWindowsStore.getState().openApp('notepad', { fileId: node.id });
      return;
    case 'image':
      useWindowsStore.getState().openApp('pictureviewer', { fileId: node.id });
      return;
    case 'audio':
      if (node.trackId) {
        events.emit('amplifier:enqueue', { trackId: node.trackId, play: true });
      }
      return;
    case 'link':
      if (node.url) events.emit('browser:open', { url: node.url });
      return;
  }
}
