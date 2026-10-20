// Friendspace profiles (P4-04): one module per friend in src/content/friendspace/profiles/<contactId>.ts.
import type { ContactId } from '../../types';
import type { LayoutExtras } from '../layoutSets';
import type { BandId, PlayerTopEntry } from '../types';

export interface ProfileTheme {
  /** Any CSS background (colour or gradient). */
  background: string;
  text: string;
  accent: string;
  glitter: boolean;
  /** A CSS font-family stack, no font files. */
  font: string;
  /** Background of the content boxes (defaults to translucent white); keeps text readable. */
  panel?: string;
  /** Short sticker texts slapped on the page (Dex's skate stickers, Pia's pony ones). */
  stickers?: readonly string[];
}

export type TopFriend =
  /** Another friend; links to their profile. */
  | { kind: 'contact'; id: ContactId }
  /** A fictional extra with no profile page; the picture is a pattern from `seed`. */
  | { kind: 'extra'; name: string; seed: string }
  /** A band; links to its `/band/<id>` page (v0.4). */
  | { kind: 'band'; id: BandId }
  /** The player; links to `/me`. */
  | { kind: 'player' };

/** A small original badge drawn above a wall comment (v0.4, P1-03). */
export type CommentGraphic = 'thanks' | 'hug' | 'glitterheart';

export interface ProfileComment {
  /** Shows when `day <= currentDay`; newest first. */
  day: number;
  /** Display name of the author (a friend or a fictional extra). */
  from: string;
  /** Set when the author is a friend, for the picture and a link. */
  contactId?: ContactId;
  text: string;
  graphic?: CommentGraphic;
}

export interface ProfileContent {
  contactId: ContactId;
  headline: string;
  /** e.g. `{ text: 'hyper', emoticon: ':D' }`; the emoticon is a Messenger code. */
  mood: { text: string; emoticon: string };
  /** Playlist track id for the profile song strip. */
  songTrackId: string;
  aboutMe: string;
  wantToMeet: string;
  /** Rows like "Music", "Movies", "Heroes". */
  interests: readonly { label: string; text: string }[];
  /** Exactly 8: the player, the five other friends and two fictional extras (or bands). */
  top8: readonly TopFriend[];
  /** Text may use `{name}` (the player's name). */
  comments: readonly ProfileComment[];
  /** Comments this friend leaves on the player's `/me` page. */
  commentsOnPlayer: readonly {
    day: number;
    text: string;
    graphic?: CommentGraphic;
  }[];
  theme: ProfileTheme;
  /** Layout-code extras over `theme` (stickers, cursor, glitter…), as if the friend pasted a code. */
  layout?: LayoutExtras;
}

/** The fields whose default follows the language and gender (`DEFAULT_PLAYER_PROFILE`). */
export type ProfileDefaultField =
  'headline' | 'mood' | 'aboutMe' | 'themePreset';

/**
 * What `web.myProfile` stores: only what the player typed. An absent default field resolves to
 * the current language's and gender's default at render (`effectiveProfile`).
 */
export type SavedPlayerProfile = Omit<PlayerProfile, ProfileDefaultField> &
  Partial<Pick<PlayerProfile, ProfileDefaultField>>;

/** The player's `/me` profile as shown and edited (absent saved fields filled from the defaults). */
export interface PlayerProfile {
  headline: string;
  mood: { text: string; emoticon: string };
  aboutMe: string;
  songTrackId: string | null;
  /** One of the 6 preset ids, or 'custom' with the player's colours. */
  themePreset: string;
  customColors: { background: string; text: string } | null;
  /** At most 8, no duplicates. v0.3 saves stored contact ids; `sanitizeTop8` migrates them. */
  top8: PlayerTopEntry[];
  /** A pasted GlitterCodez layout code (≤ 2000 chars), parsed when the page renders. */
  layoutCode?: string;
  /** Play friends' and bands' profile songs on open; absent = on. */
  autoplay?: boolean;
  /** The last moods, newest first (≤ 5). */
  moodHistory?: MoodHistoryEntry[];
}

export interface MoodHistoryEntry {
  text: string;
  emoticon: string;
  day: number;
}

/** What a later story week adds to a profile's walls (W2-03: days 6–10). */
export type ProfileWeek = Pick<ProfileContent, 'comments' | 'commentsOnPlayer'>;

/** `profile` with `week`'s comments appended; earlier comments keep their positions. */
export function withWallWeek(
  profile: ProfileContent,
  week: ProfileWeek,
): ProfileContent {
  return {
    ...profile,
    comments: [...profile.comments, ...week.comments],
    commentsOnPlayer: [...profile.commentsOnPlayer, ...week.commentsOnPlayer],
  };
}
