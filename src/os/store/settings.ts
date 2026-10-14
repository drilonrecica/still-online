// Settings store. Persistence is added by the persistence task (M1-11).
import { create } from 'zustand';
import type { SettingsStore } from '@/os/types';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export const useSettingsStore = create<SettingsStore>()((set) => ({
  playerName: 'Player',
  muted: false,
  volume: 0.7,
  firstBootDone: false,
  setPlayerName: (playerName) => set({ playerName }),
  setMuted: (muted) => set({ muted }),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
  setVolume: (volume) => set({ volume: clamp01(volume) }),
  markFirstBootDone: () => set({ firstBootDone: true }),
}));
