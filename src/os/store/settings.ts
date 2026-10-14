// Settings store. Persisted under `still-online:v1:settings`.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRecord, persistOptions } from '@/os/persist';
import type { SettingsStore } from '@/os/types';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

type PersistedSettings = Pick<
  SettingsStore,
  'playerName' | 'muted' | 'volume' | 'firstBootDone'
>;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      playerName: 'Player',
      muted: false,
      volume: 0.7,
      firstBootDone: false,
      setPlayerName: (playerName) => set({ playerName }),
      setMuted: (muted) => set({ muted }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      setVolume: (volume) => set({ volume: clamp01(volume) }),
      markFirstBootDone: () => set({ firstBootDone: true }),
    }),
    persistOptions<SettingsStore, PersistedSettings>({
      name: 'settings',
      partialize: ({ playerName, muted, volume, firstBootDone }) => ({
        playerName,
        muted,
        volume,
        firstBootDone,
      }),
      sanitize: (persisted, current) => {
        if (!isRecord(persisted)) return current;
        const p = persisted;
        return {
          ...current,
          playerName:
            typeof p.playerName === 'string' && p.playerName
              ? p.playerName
              : current.playerName,
          muted: typeof p.muted === 'boolean' ? p.muted : current.muted,
          volume:
            typeof p.volume === 'number' && Number.isFinite(p.volume)
              ? clamp01(p.volume)
              : current.volume,
          firstBootDone:
            typeof p.firstBootDone === 'boolean'
              ? p.firstBootDone
              : current.firstBootDone,
        };
      },
    }),
  ),
);
