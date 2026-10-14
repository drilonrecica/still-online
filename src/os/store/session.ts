// Session state machine store. Not persisted: every page load starts at `booting`.
import { create } from 'zustand';
import { useWindowsStore } from '@/os/store/windows';
import { SESSION_TRANSITIONS } from '@/os/types';
import type { SessionState, SessionStore } from '@/os/types';

export const useSessionStore = create<SessionStore>()((set, get) => {
  /** Moves to `to` when the transition is allowed; otherwise a no-op. */
  function go(to: SessionState, beforeChange?: () => void) {
    if (!SESSION_TRANSITIONS[get().state].includes(to)) return;
    beforeChange?.();
    set({ state: to });
  }
  const closeWindows = () => useWindowsStore.getState().closeAll();

  return {
    state: 'booting',
    bootComplete: () => go('login'),
    // Open windows come back only once the player logs on, never during boot.
    logOn: () => go('desktop', () => void useWindowsStore.persist.rehydrate()),
    logOff: () => go('login', closeWindows),
    shutDown: () => go('shuttingDown', closeWindows),
    shutdownComplete: () => go('off'),
    powerOn: () => go('booting'),
  };
});
