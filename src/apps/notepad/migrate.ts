// One-time move of the old single Notepad document into My Documents/notes.txt.
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useNotepadStore } from './store';

export const LEGACY_NOTES_NAME = 'notes.txt';

/**
 * Creates `My Documents/notes.txt` from the legacy `notepad` store's text (an empty file when there
 * is none) and clears the store. Runs once: `migrated` is persisted. If a `notes.txt` already
 * exists and there is text to keep, the text lands in `notes (2).txt` rather than being lost.
 * Returns true when it did the migration.
 */
export function migrateLegacyNotepad(): boolean {
  const { text, migrated, setText, markMigrated } = useNotepadStore.getState();
  if (migrated) return false;
  const fs = useFsStore.getState();
  const exists = fs
    .list(FS_FOLDERS.docs)
    .some((n) => n.name.toLowerCase() === LEGACY_NOTES_NAME);
  if (!exists || text) {
    fs.createFile(FS_FOLDERS.docs, {
      name: LEGACY_NOTES_NAME,
      type: 'txt',
      text,
    });
  }
  setText('');
  markMigrated();
  return true;
}
