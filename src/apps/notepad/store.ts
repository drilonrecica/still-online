// Notepad document store. Persisted under `still-online:v1:notepad` (see docs/architecture.md → Persistence).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRecord, persistOptions } from '@/os/persist';

export interface NotepadStore {
  text: string;
  setText: (text: string) => void;
}

export const useNotepadStore = create<NotepadStore>()(
  persist(
    (set) => ({
      text: '',
      setText: (text) => set({ text }),
    }),
    persistOptions<NotepadStore, { text: string }>({
      name: 'notepad',
      partialize: (state) => ({ text: state.text }),
      sanitize: (persisted, current) =>
        isRecord(persisted) && typeof persisted.text === 'string'
          ? { ...current, text: persisted.text }
          : current,
    }),
  ),
);
