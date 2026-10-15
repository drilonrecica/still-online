// Notepad document store. Persisted under `still-online:v1:notepad` (see docs/architecture.md → Persistence).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRecord, persistOptions } from '@/os/persist';

/**
 * Legacy: before P1-07 Notepad had one persisted document (`text`). It is migrated into the fs
 * once (`migrated`) and the persisted name stays `notepad` for compatibility.
 */
export interface NotepadStore {
  text: string;
  migrated: boolean;
  setText: (text: string) => void;
  markMigrated: () => void;
}

export const useNotepadStore = create<NotepadStore>()(
  persist(
    (set) => ({
      text: '',
      migrated: false,
      setText: (text) => set({ text }),
      markMigrated: () => set({ migrated: true }),
    }),
    persistOptions<NotepadStore, { text: string; migrated: boolean }>({
      name: 'notepad',
      partialize: (state) => ({ text: state.text, migrated: state.migrated }),
      sanitize: (persisted, current) =>
        isRecord(persisted)
          ? {
              ...current,
              text: typeof persisted.text === 'string' ? persisted.text : '',
              migrated: persisted.migrated === true,
            }
          : current,
    }),
  ),
);
