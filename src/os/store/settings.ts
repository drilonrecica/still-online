// Settings store. Persisted under `still-online:v1:settings`.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRecord, persistOptions } from '@/os/persist';
import {
  SETTINGS_V02_DEFAULTS,
  type ScreensaverId,
  type ScreensaverSettings,
  type SettingsStore,
  type ThemeId,
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

const THEMES: readonly ThemeId[] = ['blue', 'olive', 'silver'];
const SCREENSAVER_IDS: readonly ScreensaverId[] = [
  'none',
  'pipes',
  'panes',
  'marquee',
  'slideshow',
];
export const MAX_SCREENSAVER_TEXT = 60;

export function sanitizeTheme(v: unknown): ThemeId | null {
  return THEMES.find((t) => t === v) ?? null;
}

/** Field-by-field: a bad field keeps `fallback`'s value. Minutes are whole, 0 (never) or 1–60. */
export function sanitizeScreensaver(
  v: unknown,
  fallback: ScreensaverSettings,
): ScreensaverSettings {
  if (!isRecord(v)) return fallback;
  const id = SCREENSAVER_IDS.find((s) => s === v.id) ?? fallback.id;
  const minutes =
    typeof v.minutes === 'number' && Number.isFinite(v.minutes)
      ? Math.min(60, Math.max(0, Math.round(v.minutes)))
      : fallback.minutes;
  const text =
    typeof v.text === 'string' && v.text.trim()
      ? v.text.slice(0, MAX_SCREENSAVER_TEXT)
      : fallback.text;
  return { id, minutes, text };
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
  | 'theme'
  | 'screensaver'
  | 'seenTips'
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
      theme: SETTINGS_V02_DEFAULTS.theme,
      screensaver: SETTINGS_V02_DEFAULTS.screensaver,
      seenTips: SETTINGS_V02_DEFAULTS.seenTips,
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
      setTheme: (theme) =>
        set((s) => ({ theme: sanitizeTheme(theme) ?? s.theme })),
      setScreensaver: (screensaver) =>
        set((s) => ({
          screensaver: sanitizeScreensaver(screensaver, s.screensaver),
        })),
      addSeenTip: (id) =>
        set((s) =>
          s.seenTips.includes(id) ? s : { seenTips: [...s.seenTips, id] },
        ),
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
        theme,
        screensaver,
        seenTips,
      }) => ({
        playerName,
        muted,
        volume,
        firstBootDone,
        smallScreenNoticeDismissed,
        wallpaper,
        wallpaperPosition,
        theme,
        screensaver,
        seenTips,
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
          theme: sanitizeTheme(p.theme) ?? current.theme,
          screensaver: sanitizeScreensaver(p.screensaver, current.screensaver),
          seenTips: Array.isArray(p.seenTips)
            ? [
                ...new Set(
                  p.seenTips.filter(
                    (t): t is string => typeof t === 'string' && t !== '',
                  ),
                ),
              ]
            : current.seenTips,
        };
      },
    }),
  ),
);
