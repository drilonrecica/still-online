// Settings store. Persisted under `still-online:v1:settings`.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRecord, persistOptions } from '@/os/persist';
import {
  SETTINGS_V02_DEFAULTS,
  type SettingsStore,
  type WallpaperChoice,
  type WallpaperPosition,
} from '@/os/types';

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const WALLPAPER_POSITIONS: readonly WallpaperPosition[] = [
  'center',
  'tile',
  'stretch',
];

const nonEmpty = (v: unknown): v is string => typeof v === 'string' && !!v;

/** A valid `WallpaperChoice` from persisted data, or null. Unknown builtin ids are kept (they render as `classic`). */
export function sanitizeWallpaper(v: unknown): WallpaperChoice | null {
  if (!isRecord(v)) return null;
  if (v.kind === 'builtin' && nonEmpty(v.id)) {
    return { kind: 'builtin', id: v.id };
  }
  if (v.kind === 'custom' && nonEmpty(v.blobKey)) {
    return { kind: 'custom', blobKey: v.blobKey };
  }
  if (
    v.kind === 'color' &&
    typeof v.color === 'string' &&
    /^#[0-9a-f]{6}$/i.test(v.color)
  ) {
    return { kind: 'color', color: v.color.toLowerCase() };
  }
  return null;
}

export function sanitizeWallpaperPosition(
  v: unknown,
): WallpaperPosition | null {
  return WALLPAPER_POSITIONS.find((p) => p === v) ?? null;
}

type PersistedSettings = Pick<
  SettingsStore,
  | 'playerName'
  | 'muted'
  | 'volume'
  | 'firstBootDone'
  | 'smallScreenNoticeDismissed'
  | 'wallpaper'
  | 'wallpaperPosition'
>;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      playerName: 'Player',
      muted: false,
      volume: 0.7,
      firstBootDone: false,
      smallScreenNoticeDismissed: false,
      wallpaper: SETTINGS_V02_DEFAULTS.wallpaper,
      wallpaperPosition: SETTINGS_V02_DEFAULTS.wallpaperPosition,
      setPlayerName: (playerName) => set({ playerName }),
      setMuted: (muted) => set({ muted }),
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
      setVolume: (volume) => set({ volume: clamp01(volume) }),
      markFirstBootDone: () => set({ firstBootDone: true }),
      dismissSmallScreenNotice: () => set({ smallScreenNoticeDismissed: true }),
      setWallpaper: (wallpaper) =>
        set((s) => ({
          wallpaper: sanitizeWallpaper(wallpaper) ?? s.wallpaper,
        })),
      setWallpaperPosition: (position) =>
        set((s) => ({
          wallpaperPosition:
            sanitizeWallpaperPosition(position) ?? s.wallpaperPosition,
        })),
    }),
    persistOptions<SettingsStore, PersistedSettings>({
      name: 'settings',
      partialize: ({
        playerName,
        muted,
        volume,
        firstBootDone,
        smallScreenNoticeDismissed,
        wallpaper,
        wallpaperPosition,
      }) => ({
        playerName,
        muted,
        volume,
        firstBootDone,
        smallScreenNoticeDismissed,
        wallpaper,
        wallpaperPosition,
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
          smallScreenNoticeDismissed:
            typeof p.smallScreenNoticeDismissed === 'boolean'
              ? p.smallScreenNoticeDismissed
              : current.smallScreenNoticeDismissed,
          wallpaper: sanitizeWallpaper(p.wallpaper) ?? current.wallpaper,
          wallpaperPosition:
            sanitizeWallpaperPosition(p.wallpaperPosition) ??
            current.wallpaperPosition,
        };
      },
    }),
  ),
);
