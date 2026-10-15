import { formatRelativeDay, formatShortDate } from '@/i18n/format';
import { getLocale } from '@/i18n/t';
// Pure helpers for spaceport.example: comment walls by day, the player's profile, themes, labels.
import type {
  PlayerProfile,
  ProfileComment,
  ProfileContent,
  ProfileTheme,
} from '@/content/profiles/types';
import { PLAYLIST } from '@/content/playlist';
import { getSiteText } from '@/content/locale';
import {
  PROFILE_LIMITS,
  SPACEPORT_HOST,
  THEME_PRESETS,
} from '@/content/sites/spaceport';
import type { ContactId } from '@/content/types';
import type { Locale } from '@/i18n/types';
import { mulberry32, seedFrom } from '@/os/random';

/** `kayla` → `Kayla`. */
export function profileName(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

/** Replaces `{name}` with the player's name. */
export function fillName(text: string, name: string): string {
  return text.replaceAll('{name}', name);
}

/** Comments with `day <= currentDay`, newest day first; later entries of a day come first. */
export function visibleComments(
  comments: readonly ProfileComment[],
  currentDay: number,
): ProfileComment[] {
  return comments
    .map((c, i) => ({ c, i }))
    .filter(({ c }) => c.day <= currentDay)
    .sort((a, b) => b.c.day - a.c.day || b.i - a.i)
    .map(({ c }) => c);
}

/** Friends' comments on the player's `/me` page, as wall comments (newest first). */
export function playerWall(
  profiles: readonly ProfileContent[],
  currentDay: number,
): ProfileComment[] {
  const all = profiles.flatMap((p) =>
    p.commentsOnPlayer.map((c) => ({
      day: c.day,
      from: p.contactId,
      contactId: p.contactId,
      text: c.text,
    })),
  );
  return visibleComments(all, currentDay);
}

/** "today", "yesterday" or "3 days ago" (story days have no weekday names). */
export function dayLabel(entryDay: number, currentDay: number): string {
  const ago = Math.max(0, currentDay - entryDay);
  return formatRelativeDay(ago, getLocale());
}

/** "10/15/2007" from an in-game date. */
export function shortDate(date: Date): string {
  return formatShortDate(date, getLocale());
}

/** "Artist - Title" for a playlist track, or null when the id isn't on the playlist. */
export function trackLabel(trackId: string | null): string | null {
  const track = PLAYLIST.find((t) => t.id === trackId);
  return track ? `${track.artist} - ${track.title}` : null;
}

/** Two stable colours for a fictional extra's pattern picture. */
export function extraColors(seed: string): [string, string] {
  const rand = mulberry32(seedFrom(seed));
  const hue = Math.floor(rand() * 360);
  return [`hsl(${hue}, 70%, 85%)`, `hsl(${(hue + 150) % 360}, 60%, 35%)`];
}

/**
 * The player's Top 8 order: known friends in the saved order, then any friend missing from it
 * (unknown ids are dropped), so every friend shows up exactly once.
 */
export function normalizeTop8(
  saved: readonly string[],
  known: readonly ContactId[],
): ContactId[] {
  const kept = [...new Set(saved)].filter((id) => known.includes(id));
  return [...kept, ...known.filter((id) => !kept.includes(id))].slice(0, 8);
}

/** `web.myProfile`, or the starting profile when the player hasn't saved one yet. */
export function effectiveProfile(
  saved: PlayerProfile | null,
  known: readonly ContactId[],
  locale: Locale = 'en',
): PlayerProfile {
  const { DEFAULT_PLAYER_PROFILE } = getSiteText(SPACEPORT_HOST, locale);
  const base = saved ?? { ...DEFAULT_PLAYER_PROFILE, top8: [] };
  return { ...base, top8: normalizeTop8(base.top8, known) };
}

/** Moves the Top 8 entry at `index` by `delta` places (no-op at the ends). */
export function moveTop8<T>(
  list: readonly T[],
  index: number,
  delta: number,
): T[] {
  const to = index + delta;
  if (index < 0 || index >= list.length || to < 0 || to >= list.length)
    return [...list];
  const out = [...list];
  const [item] = out.splice(index, 1);
  if (item !== undefined) out.splice(to, 0, item);
  return out;
}

const HEX = /^#[0-9a-f]{6}$/i;

/** Trims and clamps an edited profile before it's saved. */
export function cleanProfile(p: PlayerProfile): PlayerProfile {
  const preset = THEME_PRESETS.some((t) => t.id === p.themePreset)
    ? p.themePreset
    : p.themePreset === 'custom' && p.customColors
      ? 'custom'
      : 'default';
  const colors =
    p.customColors &&
    HEX.test(p.customColors.background) &&
    HEX.test(p.customColors.text)
      ? p.customColors
      : null;
  return {
    headline: p.headline.trim().slice(0, PROFILE_LIMITS.headline),
    mood: {
      text: p.mood.text.trim().slice(0, PROFILE_LIMITS.mood),
      emoticon: p.mood.emoticon,
    },
    aboutMe: p.aboutMe.trim().slice(0, PROFILE_LIMITS.aboutMe),
    songTrackId: trackLabel(p.songTrackId) ? p.songTrackId : null,
    themePreset: preset === 'custom' && !colors ? 'default' : preset,
    customColors: colors,
    top8: [...p.top8],
  };
}

const DEFAULT_THEME = THEME_PRESETS[0]!.theme;

/** The theme the player's profile renders with. */
export function playerTheme(p: PlayerProfile): ProfileTheme {
  if (p.themePreset === 'custom' && p.customColors) {
    return {
      ...DEFAULT_THEME,
      background: p.customColors.background,
      text: p.customColors.text,
      panel: 'transparent',
    };
  }
  return (
    THEME_PRESETS.find((t) => t.id === p.themePreset)?.theme ?? DEFAULT_THEME
  );
}
