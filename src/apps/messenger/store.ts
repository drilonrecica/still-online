// Messenger store: persisted progress (`still-online:v1:messenger`) + runtime presence.
// The conversation engine (./engine) writes it; components read it.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createStore, type StateCreator } from 'zustand/vanilla';
import { isRecord, persistOptions } from '@/os/persist';
import type {
  ContactId,
  MessengerProgress,
  PlayerStatus,
} from '@/content/types';
import { defaultProgress, sanitizeProgress } from './engine/progress';
import type { MessengerData } from './engine/types';

export interface MessengerStore extends MessengerData {
  setPlayerStatus: (status: PlayerStatus) => void;
  setPlayerPersonalMessage: (personalMessage: string) => void;
  setShowNowPlaying: (showNowPlaying: boolean) => void;
  /** Clears the unread count when the player looks at the chat. */
  markRead: (contactId: ContactId) => void;
}

interface PersistedMessenger {
  progress: MessengerProgress;
}

const creator: StateCreator<MessengerStore> = (set) => {
  const setPlayer = (patch: Partial<MessengerProgress['player']>) =>
    set((s) => ({
      progress: { ...s.progress, player: { ...s.progress.player, ...patch } },
    }));
  return {
    progress: defaultProgress(),
    signedIn: false,
    online: {},
    typing: {},
    setPlayerStatus: (status) => setPlayer({ status }),
    setPlayerPersonalMessage: (personalMessage) =>
      setPlayer({ personalMessage }),
    setShowNowPlaying: (showNowPlaying) => setPlayer({ showNowPlaying }),
    markRead: (contactId) =>
      set((s) => {
        const contact = s.progress.contacts[contactId];
        if (!contact || contact.unread === 0) return {};
        return {
          progress: {
            ...s.progress,
            contacts: {
              ...s.progress.contacts,
              [contactId]: { ...contact, unread: 0 },
            },
          },
        };
      }),
  };
};

const persisted = () =>
  persist(
    creator,
    persistOptions<MessengerStore, PersistedMessenger>({
      name: 'messenger',
      partialize: (s) => ({ progress: s.progress }),
      sanitize: (p, current) =>
        isRecord(p)
          ? { ...current, progress: sanitizeProgress(p.progress) }
          : current,
    }),
  );

/** A fresh store (hydrated from storage). Used by tests; the app uses `useMessengerStore`. */
export const createMessengerStore = () =>
  createStore<MessengerStore>()(persisted());

export const useMessengerStore = create<MessengerStore>()(persisted());
