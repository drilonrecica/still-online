// Notepad document store. Persisted under `still-online:v1:notepad` (see docs/architecture.md → Persistence).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    {
      name: 'still-online:v1:notepad',
      version: 1,
      partialize: (state) => ({ text: state.text }),
    },
  ),
);
