// Settings store. Persisted under `still-online:v1:settings`.
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { detectBrowserLocale } from '@/i18n/detect';
import { DEFAULTS, type DefaultField } from '@/i18n/messages/defaults';
import { loadLocale, isLocaleLoaded } from '@/i18n/load';
import { LOCALES, isLocale, type Locale } from '@/i18n/types';
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

export const MAX_PLAYER_NAME = 20;
export const MAX_AWAY_MESSAGE = 60;
export const MAX_AWAY_MINUTES = 60;

/** Whole minutes, 0 (off) to 60. */
export function sanitizeAwayMinutes(v: unknown): number | null {
  return typeof v === 'number' && Number.isFinite(v)
    ? Math.min(MAX_AWAY_MINUTES, Math.max(0, Math.round(v)))
    : null;
}

/** True when `value` is some locale's default for `field` (so it is stored as `null`). */
function isLocalizedDefault(field: DefaultField, value: string): boolean {
  return LOCALES.some((l) => DEFAULTS[l][field] === value);
}

/** `null` for a value equal to `locale`'s default, so it follows later language switches. */
function storedText(
  field: DefaultField,
  value: string,
  locale: Locale,
): string | null {
  return DEFAULTS[locale][field] === value ? null : value;
}

/**
 * Untrusted persisted text for a field with a localized default: `null` stays `null`, and so
 * does any locale's default (v0.2 saves stored `'brb'` and `'still online...'`).
 */
function sanitizeDefaulted(
  field: DefaultField,
  v: unknown,
  max: number,
): string | null | undefined {
  if (v === null) return null;
  if (typeof v !== 'string') return undefined;
  const text = v.slice(0, max);
  return isLocalizedDefault(field, text) ? null : text;
}

/** The default names v0.2/v0.3 stored or showed; a save holding one has no real name yet. */
const LEGACY_DEFAULT_NAMES: readonly string[] = ['Player', 'Spieler'];

/** The player's name: trimmed, 1–20 chars, or `null` (not chosen yet, so Login asks). */
export function sanitizePlayerName(v: unknown): string | null | undefined {
  if (v === null) return null;
  if (typeof v !== 'string') return undefined;
  const name = v.trim().slice(0, MAX_PLAYER_NAME);
  return name && !LEGACY_DEFAULT_NAMES.includes(name) ? name : null;
}

/** `value` unless it is `undefined` (invalid); `null` is a real value here. */
const orFallback = <T>(value: T | undefined, fallback: T): T =>
  value === undefined ? fallback : value;

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
    typeof v.text === 'string' && !v.text.trim()
      ? fallback.text
      : orFallback(
          sanitizeDefaulted('screensaverText', v.text, MAX_SCREENSAVER_TEXT),
          fallback.text,
        );
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
  | 'connectAutomatically'
  | 'awayMinutes'
  | 'awayMessage'
  | 'petEnabled'
  | 'assistantEnabled'
  | 'language'
>;

/** Bumped by every `setLanguage`, so a slow load can't override a newer choice. */
let languageTicket = 0;

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => {
      const locale = () => get().language ?? detectBrowserLocale();
      return {
        playerName: null,
        muted: false,
        volume: 0.7,
        firstBootDone: false,
        smallScreenNoticeDismissed: false,
        wallpaper: SETTINGS_V02_DEFAULTS.wallpaper,
        wallpaperPosition: SETTINGS_V02_DEFAULTS.wallpaperPosition,
        theme: SETTINGS_V02_DEFAULTS.theme,
        screensaver: SETTINGS_V02_DEFAULTS.screensaver,
        seenTips: SETTINGS_V02_DEFAULTS.seenTips,
        connectAutomatically: SETTINGS_V02_DEFAULTS.connectAutomatically,
        awayMinutes: SETTINGS_V02_DEFAULTS.awayMinutes,
        awayMessage: SETTINGS_V02_DEFAULTS.awayMessage,
        petEnabled: SETTINGS_V02_DEFAULTS.petEnabled,
        assistantEnabled: SETTINGS_V02_DEFAULTS.assistantEnabled,
        language: null,
        setPlayerName: (playerName) =>
          set({
            playerName: playerName.trim().slice(0, MAX_PLAYER_NAME) || null,
          }),
        setMuted: (muted) => set({ muted }),
        toggleMuted: () => set((s) => ({ muted: !s.muted })),
        setVolume: (volume) => set({ volume: clamp01(volume) }),
        markFirstBootDone: () => set({ firstBootDone: true }),
        dismissSmallScreenNotice: () =>
          set({ smallScreenNoticeDismissed: true }),
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
          set((s) => {
            const next = sanitizeScreensaver(screensaver, s.screensaver);
            return {
              screensaver: {
                ...next,
                text:
                  next.text === null
                    ? null
                    : storedText('screensaverText', next.text, locale()),
              },
            };
          }),
        addSeenTip: (id) =>
          set((s) =>
            s.seenTips.includes(id) ? s : { seenTips: [...s.seenTips, id] },
          ),
        setConnectAutomatically: (connectAutomatically) =>
          set({ connectAutomatically }),
        setAwayMinutes: (minutes) =>
          set((s) => ({
            awayMinutes: sanitizeAwayMinutes(minutes) ?? s.awayMinutes,
          })),
        setAwayMessage: (message) =>
          set({
            awayMessage: storedText(
              'awayMessage',
              message.trim().slice(0, MAX_AWAY_MESSAGE),
              locale(),
            ),
          }),
        setPetEnabled: (petEnabled) => set({ petEnabled }),
        setAssistantEnabled: (assistantEnabled) => set({ assistantEnabled }),
        setLanguage: (language) => {
          const next = isLocale(language) ? language : null;
          const ticket = ++languageTicket;
          const target = next ?? detectBrowserLocale();
          // A loaded language switches at once (same tick); otherwise its catalog and content
          // load first, and only the newest request wins.
          if (isLocaleLoaded(target)) {
            set({ language: next });
            return;
          }
          loadLocale(target).then(
            () => {
              if (ticket === languageTicket) set({ language: next });
            },
            (error: unknown) => {
              console.warn(`could not load language "${target}"`, error);
            },
          );
        },
      };
    },
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
        connectAutomatically,
        awayMinutes,
        awayMessage,
        petEnabled,
        assistantEnabled,
        language,
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
        connectAutomatically,
        awayMinutes,
        awayMessage,
        petEnabled,
        assistantEnabled,
        language,
      }),
      sanitize: (persisted, current) => {
        if (!isRecord(persisted)) return current;
        const p = persisted;
        return {
          ...current,
          playerName: orFallback(
            sanitizePlayerName(p.playerName),
            current.playerName,
          ),
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
          connectAutomatically:
            typeof p.connectAutomatically === 'boolean'
              ? p.connectAutomatically
              : current.connectAutomatically,
          awayMinutes:
            sanitizeAwayMinutes(p.awayMinutes) ?? current.awayMinutes,
          awayMessage: orFallback(
            sanitizeDefaulted('awayMessage', p.awayMessage, MAX_AWAY_MESSAGE),
            current.awayMessage,
          ),
          petEnabled:
            typeof p.petEnabled === 'boolean'
              ? p.petEnabled
              : current.petEnabled,
          assistantEnabled:
            typeof p.assistantEnabled === 'boolean'
              ? p.assistantEnabled
              : current.assistantEnabled,
          // Unknown or missing → null: not chosen yet, so detection decides.
          language: isLocale(p.language) ? p.language : null,
        };
      },
    }),
  ),
);
