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
  /** Any status but Away. Away goes through `goAway`; this also ends an auto-away. */
  setPlayerStatus: (status: PlayerStatus) => void;
  /** Sets Away with `message`; `auto` marks an idle-triggered Away (activity ends it). */
  goAway: (message: string, auto: boolean) => void;
  /** The player's own message; it also ends any now-playing line shown. */
  setPlayerPersonalMessage: (personalMessage: string) => void;
  /** Shows `line` instead of the player's message, keeping theirs to restore. */
  showNowPlayingLine: (line: string) => void;
  /** Puts the player's own message back after a now-playing line. */
  clearNowPlayingLine: () => void;
  setShowNowPlaying: (showNowPlaying: boolean) => void;
  /** Picks the player's display picture from My Pictures; null restores the default. */
  setDisplayPicture: (fileId: string | null) => void;
  /** Clears the unread count when the player looks at the chat. */
  markRead: (contactId: ContactId) => void;
  /** Empties a contact's transcript only; script progress and unread are untouched. */
  clearTranscript: (contactId: ContactId) => void;
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
    setPlayerStatus: (status) =>
      status === 'away'
        ? set((s) => {
            const p = s.progress.player;
            if (p.status === 'away') return {};
            return {
              progress: {
                ...s.progress,
                player: {
                  ...p,
                  status,
                  autoAway: false,
                  awaySince: Date.now(),
                },
              },
            };
          })
        : setPlayer({ status, autoAway: false, awaySince: null }),
    goAway: (message, auto) =>
      setPlayer({
        status: 'away',
        awayMessage: message,
        autoAway: auto,
        awaySince: Date.now(),
      }),
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
    setDisplayPicture: (fileId) =>
      setPlayer({ displayPicture: fileId ? { fileId } : null }),
    clearTranscript: (contactId) =>
      set((s) => {
        const contact = s.progress.contacts[contactId];
        if (!contact || contact.transcript.length === 0) return {};
        return {
          progress: {
            ...s.progress,
            contacts: {
              ...s.progress.contacts,
              [contactId]: { ...contact, transcript: [] },
            },
          },
        };
      }),
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
