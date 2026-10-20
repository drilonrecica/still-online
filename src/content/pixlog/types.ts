// Pixlog (pixlog.example) content shapes (P0-02): one profile per friend, shared surveys.
// See docs/architecture-v0.4.md → "Content types".
import type { PhotoSpec } from '@/os/fs/types';
import type { ContactId } from '../types';

/** Pixlog colour skins; they recolour the header and tabs. */
export const PIXLOG_SKINS = [
  'orange',
  'ocean',
  'bubblegum',
  'lime',
  'night',
  'sunset',
] as const;
export type PixlogSkinId = (typeof PIXLOG_SKINS)[number];

/** A friend, or a fictional extra's display name. */
export type PixlogAuthor = ContactId | string;

export interface PixlogPhoto {
  /** Drawn by `renderPhoto`; the caption sits inside. */
  photo: PhotoSpec;
  /** Day-gated; on the album's day or later. */
  comments: readonly { day: number; from: PixlogAuthor; text: string }[];
}

export interface PixlogAlbum {
  id: string;
  /** The album (and its "added N photos" feed line) appears on this day. */
  day: number;
  title: string;
  photos: readonly PixlogPhoto[];
}

export interface PixlogProfile {
  contactId: ContactId;
  skin: PixlogSkinId;
  about: string;
  albums: readonly PixlogAlbum[];
  blog: readonly { id: string; day: number; title: string; body: string }[];
  /** Answers in the order of the survey's questions. */
  survey: { surveyId: string; answers: readonly string[] };
  shouts: readonly { day: number; text: string }[];
  /** Days this friend gives the player a kudo. */
  kudosToPlayer: readonly number[];
  guestbook: readonly { day: number; from: PixlogAuthor; text: string }[];
}

export interface Survey {
  id: string;
  title: string;
  questions: readonly string[];
}

/** What a later story week adds to a profile (W2-03: days 6–10). */
export type PixlogWeek = Pick<
  PixlogProfile,
  'albums' | 'blog' | 'shouts' | 'kudosToPlayer' | 'guestbook'
>;

/** `profile` with `week` appended; earlier items keep their positions (and audit paths). */
export function withWeek(
  profile: PixlogProfile,
  week: PixlogWeek,
): PixlogProfile {
  return {
    ...profile,
    albums: [...profile.albums, ...week.albums],
    blog: [...profile.blog, ...week.blog],
    shouts: [...profile.shouts, ...week.shouts],
    kudosToPlayer: [...profile.kudosToPlayer, ...week.kudosToPlayer],
    guestbook: [...profile.guestbook, ...week.guestbook],
  };
}
