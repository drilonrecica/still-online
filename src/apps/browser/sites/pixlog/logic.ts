// Pure helpers for pixlog.example: tab and album lookup, day gating, and author names.
import { getContacts } from '@/content/locale';
import type {
  PixlogAlbum,
  PixlogAuthor,
  PixlogProfile,
} from '@/content/pixlog/types';
import type { ContactId } from '@/content/types';
import type { Gender } from '@/os/types';
import type { Locale } from '@/i18n/types';
import { upToDay } from '../daily';
import { profileName } from '../friendspace/logic';

export const PIXLOG_TABS = [
  'profile',
  'photos',
  'blog',
  'surveys',
  'guestbook',
] as const;
export type PixlogTab = (typeof PIXLOG_TABS)[number];

/** The `?tab=` value, or `profile` for a missing or unknown one. */
export function tabFrom(value: string | null): PixlogTab {
  return PIXLOG_TABS.find((tab) => tab === value) ?? 'profile';
}

/** `/jess?tab=photos`; the default tab has no query. */
export function tabHref(contactId: ContactId, tab: PixlogTab): string {
  return tab === 'profile' ? `/${contactId}` : `/${contactId}?tab=${tab}`;
}

/** The profile at `/<friend>` (case-insensitive), if there is one. */
export function profileAt(
  profiles: readonly PixlogProfile[],
  path: string,
): PixlogProfile | undefined {
  const id = path.slice(1).toLowerCase();
  return profiles.find((p) => p.contactId === id);
}

/** A friend's albums that are out by `day`, newest first. */
export function visibleAlbums(
  profile: PixlogProfile,
  day: number,
): PixlogAlbum[] {
  return upToDay(profile.albums, day);
}

/** The album with this id and its owner, once it is out; null before or for an unknown id. */
export function findAlbum(
  profiles: readonly PixlogProfile[],
  id: string | null,
  day: number,
): { profile: PixlogProfile; album: PixlogAlbum } | null {
  for (const profile of profiles) {
    const album = profile.albums.find((a) => a.id === id);
    if (album) return album.day <= day ? { profile, album } : null;
  }
  return null;
}

/** Comments out by `day`, oldest first (a thread reads top to bottom). */
export function visibleThread<T extends { day: number }>(
  items: readonly T[],
  day: number,
): T[] {
  return items.filter((item) => item.day <= day);
}

/** 1-based photo position from `?n=`, kept inside the album. */
export function photoIndex(value: string | null, total: number): number {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) ? Math.min(Math.max(n, 1), Math.max(total, 1)) : 1;
}

export const albumHref = (id: string, n = 1): string =>
  n > 1 ? `/album?id=${id}&n=${n}` : `/album?id=${id}`;

/** A friend's name ("Kayla", like Friendspace's pages), or the extra's screen name as written. */
export function authorName(
  from: PixlogAuthor,
  locale: Locale,
  gender: Gender | null,
): string {
  const isFriend = getContacts(locale, gender).some(
    (c) => c.contact.id === from,
  );
  return isFriend ? profileName(from) : from;
}
