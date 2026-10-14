// Spaceport profiles (P4-04): one module per friend in src/content/profiles/<contactId>.ts.
import type { ContactId } from '../types';

export interface ProfileTheme {
  /** Any CSS background (colour or gradient). */
  background: string;
  text: string;
  accent: string;
  glitter: boolean;
  /** A CSS font-family stack, no font files. */
  font: string;
}

export type TopFriend =
  /** Another friend; links to their profile. */
  | { kind: 'contact'; id: ContactId }
  /** A fictional extra with no profile page; the picture is a pattern from `seed`. */
  | { kind: 'extra'; name: string; seed: string };

export interface ProfileComment {
  /** Shows when `day <= currentDay`; newest first. */
  day: number;
  /** Display name of the author (a friend or a fictional extra). */
  from: string;
  /** Set when the author is a friend, for the picture and a link. */
  contactId?: ContactId;
  text: string;
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
  /** Exactly 8. */
  top8: readonly TopFriend[];
  comments: readonly ProfileComment[];
  /** Comments this friend leaves on the player's `/me` page. */
  commentsOnPlayer: readonly { day: number; text: string }[];
  theme: ProfileTheme;
}

/** The player's editable `/me` profile, persisted in the `web` store. */
export interface PlayerProfile {
  headline: string;
  mood: { text: string; emoticon: string };
  aboutMe: string;
  songTrackId: string | null;
  /** One of the 6 preset ids, or 'custom' with the player's colours. */
  themePreset: string;
  customColors: { background: string; text: string } | null;
  top8: ContactId[];
}
