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
  /** The player's own message; it also ends any now-playing line shown. */
  setPlayerPersonalMessage: (personalMessage: string) => void;
  /** Shows `line` instead of the player's message, keeping theirs to restore. */
  showNowPlayingLine: (line: string) => void;
  /** Puts the player's own message back after a now-playing line. */
  clearNowPlayingLine: () => void;
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
      setPlayer({ personalMessage, personalMessageBeforeNowPlaying: null }),
    showNowPlayingLine: (line) =>
      set((s) => {
        const p = s.progress.player;
        if (
          p.personalMessage === line &&
          p.personalMessageBeforeNowPlaying !== null
        )
          return {};
        return {
          progress: {
            ...s.progress,
            player: {
              ...p,
              personalMessage: line,
              personalMessageBeforeNowPlaying:
                p.personalMessageBeforeNowPlaying ?? p.personalMessage,
            },
          },
        };
      }),
    clearNowPlayingLine: () =>
      set((s) => {
        const p = s.progress.player;
        if (p.personalMessageBeforeNowPlaying === null) return {};
        return {
          progress: {
            ...s.progress,
            player: {
              ...p,
              personalMessage: p.personalMessageBeforeNowPlaying,
              personalMessageBeforeNowPlaying: null,
            },
          },
        };
      }),
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
