import { formatRelativeDay, formatShortDate } from '@/i18n/format';
import { getLocale } from '@/i18n/t';
// Pure helpers for friendspace.example: comment walls by day, the player's profile, themes, labels.
import type {
  PlayerProfile,
  ProfileComment,
  SavedPlayerProfile,
  ProfileContent,
  ProfileTheme,
} from '@/content/friendspace/profiles/types';
import { PLAYLIST } from '@/content/playlist';
import { getSiteText } from '@/content/locale';
import type { Gender } from '@/os/types';
import {
  PROFILE_LIMITS,
  FRIENDSPACE_HOST,
  THEME_PRESETS,
} from '@/content/sites/friendspace';
import type {
  Bulletin,
  PlayerTopEntry,
  Top8Reaction,
} from '@/content/friendspace/types';
import type { Top8WallEntry } from '@/content/sites/types';
import type { ContactId } from '@/content/types';
import type { Locale } from '@/i18n/types';
import { mulberry32, seedFrom } from '@/os/random';
import { WEB_LIMITS } from '../../webSanitize';
import { LAYOUT_CODE_MAX } from './layoutCode';

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
      ...(c.graphic && { graphic: c.graphic }),
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

/** A Top 8 entry's identity, for dedupe and React keys. */
export const topEntryKey = (e: PlayerTopEntry): string =>
  e.kind === 'extra' ? `extra:${e.seed}` : `${e.kind}:${e.id}`;

/**
 * A saved Top 8 as shown: entries in order, friends not in `known` and duplicates dropped (max 8).
 * Nothing is added back, so the player can remove friends (P1-05).
 */
export function cleanTop8(
  saved: readonly PlayerTopEntry[],
  known: readonly ContactId[],
): PlayerTopEntry[] {
  const keys = new Set<string>();
  return saved
    .filter((e) => {
      const key = topEntryKey(e);
      if (keys.has(key) || (e.kind === 'contact' && !known.includes(e.id)))
        return false;
      keys.add(key);
      return true;
    })
    .slice(0, WEB_LIMITS.top8);
}

/**
 * The starting Top 8, before the player saves one: `cleanTop8`, then any friend missing from it,
 * so every friend shows up exactly once (max 8).
 */
export function normalizeTop8(
  saved: readonly PlayerTopEntry[],
  known: readonly ContactId[],
): PlayerTopEntry[] {
  const kept = cleanTop8(saved, known);
  const have = new Set(kept.map(topEntryKey));
  const missing = known
    .filter((id) => !have.has(`contact:${id}`))
    .map((id): PlayerTopEntry => ({ kind: 'contact', id }));
  return [...kept, ...missing].slice(0, WEB_LIMITS.top8);
}

/**
 * `web.myProfile` as shown: absent fields (or no save at all) filled from the defaults for
 * `locale` and `gender`, like untouched seed files.
 */
export function effectiveProfile(
  saved: SavedPlayerProfile | null,
  known: readonly ContactId[],
  locale: Locale = 'en',
  gender: Gender = 'girl',
): PlayerProfile {
  const { DEFAULT_PLAYER_PROFILE: d } = getSiteText(
    FRIENDSPACE_HOST,
    locale,
    gender,
  );
  if (!saved) return { ...d, top8: normalizeTop8([], known) };
  return {
    ...saved,
    headline: saved.headline ?? d.headline,
    mood: saved.mood ?? d.mood,
    aboutMe: saved.aboutMe ?? d.aboutMe,
    themePreset: saved.themePreset ?? d.themePreset,
    top8: cleanTop8(saved.top8, known),
  };
}

/**
 * What Save stores: `profile` without the fields equal to `defaults` (the current language's and
 * gender's), so they keep following the language and gender.
 */
export function savedProfile(
  profile: PlayerProfile,
  defaults: Omit<PlayerProfile, 'top8'>,
): SavedPlayerProfile {
  const { headline, mood, aboutMe, themePreset, ...rest } = profile;
  const sameMood =
    mood.text === defaults.mood.text &&
    mood.emoticon === defaults.mood.emoticon;
  return {
    ...rest,
    ...(headline !== defaults.headline && { headline }),
    ...(!sameMood && { mood }),
    ...(aboutMe !== defaults.aboutMe && { aboutMe }),
    ...(themePreset !== defaults.themePreset && { themePreset }),
  };
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
    ...(p.layoutCode?.trim()
      ? { layoutCode: p.layoutCode.slice(0, LAYOUT_CODE_MAX) }
      : {}),
    ...(p.autoplay !== undefined ? { autoplay: p.autoplay } : {}),
    ...(p.moodHistory ? { moodHistory: [...p.moodHistory] } : {}),
  };
}

/** On save: a changed mood goes on top of the mood history (newest first, max 5). */
export function withMoodHistory(
  prev: PlayerProfile,
  next: PlayerProfile,
  day: number,
): PlayerProfile {
  const { text, emoticon } = next.mood;
  if (!text || (text === prev.mood.text && emoticon === prev.mood.emoticon))
    return next;
  return {
    ...next,
    moodHistory: [{ text, emoticon, day }, ...(prev.moodHistory ?? [])].slice(
      0,
      WEB_LIMITS.moodHistory,
    ),
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

/** Bulletins out by `day`: newest day first, content order within a day. */
export function visibleBulletins(
  bulletins: readonly Bulletin[],
  day: number,
): Bulletin[] {
  return bulletins.filter((b) => b.day <= day).sort((a, b) => b.day - a.day); // stable: ties keep content order
}

/** The nav dot: something new landed today and `/bulletins` hasn't been opened since. */
export function hasUnreadBulletins(
  bulletins: readonly Bulletin[],
  day: number,
  seen: number | undefined,
): boolean {
  return (seen ?? 0) < day && bulletins.some((b) => b.day === day);
}

/** Friends' Top 8 reactions (drop / re-add) as wall comments, from the saved `top8Wall` entries. */
export function top8WallComments(
  entries: readonly Top8WallEntry[],
  reactions: readonly Top8Reaction[],
): ProfileComment[] {
  return entries.flatMap((e): ProfileComment[] => {
    const text = reactions.find((r) => r.contactId === e.contactId)?.[e.kind];
    return text
      ? [{ day: e.day, from: e.contactId, contactId: e.contactId, text }]
      : [];
  });
}

/** What the Top 8 editor can add: friends first, then bands, then extras from friends' Top 8s. */
export function top8Candidates(
  known: readonly ContactId[],
  bandIds: readonly string[],
  profiles: readonly ProfileContent[],
): PlayerTopEntry[] {
  const extras = new Map<string, PlayerTopEntry>();
  for (const p of profiles)
    for (const e of p.top8)
      if (e.kind === 'extra' && !extras.has(e.seed))
        extras.set(e.seed, { kind: 'extra', name: e.name, seed: e.seed });
  return [
    ...known.map((id): PlayerTopEntry => ({ kind: 'contact', id })),
    ...bandIds.map((id): PlayerTopEntry => ({ kind: 'band', id })),
    ...extras.values(),
  ];
}

/** `/me`'s wall: friends' comments and Top 8 reactions together, newest day first (reactions first within a day). */
export function mergeWall(
  comments: readonly ProfileComment[],
  reactions: readonly ProfileComment[],
): ProfileComment[] {
  return [...[...reactions].reverse(), ...comments].sort(
    (a, b) => b.day - a.day,
  );
}
