// Pure helpers for pixlog.example: tab and album lookup, day gating, author names, and the
// derived shouts feed, visitors and visitor counter (seeded per day, so nothing drifts).
import { getContacts } from '@/content/locale';
import type {
  PixlogAlbum,
  PixlogAuthor,
  PixlogProfile,
} from '@/content/pixlog/types';
import type { ContactId } from '@/content/types';
import type { Gender } from '@/os/types';
import type { Locale } from '@/i18n/types';
import { mulberry32, randInt, seedFrom } from '@/os/random';
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

/** One line of the shouts feed. Album and blog lines get their wording from the catalog. */
export type FeedItem = { day: number; contactId: ContactId } & (
  | { kind: 'shout'; text: string }
  | { kind: 'album'; albumId: string; title: string; count: number }
  | { kind: 'blog'; postId: string; title: string }
);

/**
 * Friends' shouts plus "added N photos" and "new blog post" lines for content out by `day`,
 * newest day first; within a day, friends in content order (shouts, then albums, then posts).
 */
export function shoutsFeed(
  profiles: readonly PixlogProfile[],
  day: number,
): FeedItem[] {
  const items: FeedItem[] = profiles.flatMap((p) => {
    const contactId = p.contactId;
    return [
      ...p.shouts.map((s): FeedItem => ({ ...s, contactId, kind: 'shout' })),
      ...p.albums.map((a): FeedItem => ({
        day: a.day,
        contactId,
        kind: 'album',
        albumId: a.id,
        title: a.title,
        count: a.photos.length,
      })),
      ...p.blog.map((b): FeedItem => ({
        day: b.day,
        contactId,
        kind: 'blog',
        postId: b.id,
        title: b.title,
      })),
    ];
  });
  // Array.prototype.sort is stable, so content order survives within a day.
  return items.filter((i) => i.day <= day).sort((a, b) => b.day - a.day);
}

export type Visitor =
  { kind: 'friend'; contactId: ContactId } | { kind: 'stranger'; name: string };

export const MAX_VISITORS = 8;

/** True when the friend posted, shouted or wrote anything on Pixlog on `day`. */
function activeOn(
  profiles: readonly PixlogProfile[],
  id: ContactId,
  day: number,
): boolean {
  const own = profiles.find((p) => p.contactId === id);
  const ownItems = own ? [...own.shouts, ...own.albums, ...own.blog] : [];
  const written = profiles.flatMap((p) => [
    ...p.guestbook,
    ...p.albums.flatMap((a) => a.photos.flatMap((ph) => ph.comments)),
  ]);
  return (
    ownItems.some((i) => i.day === day) ||
    written.some((w) => w.from === id && w.day === day)
  );
}

/**
 * Who visited the player's page on `day` (at most 8): every friend active on Pixlog that day plus
 * one to three strangers, in a seeded order. Same profiles and day → same list.
 */
export function visitors(
  profiles: readonly PixlogProfile[],
  day: number,
  strangers: readonly string[],
): Visitor[] {
  const rand = mulberry32(seedFrom('pixlog:visitors:' + day));
  const friends: Visitor[] = profiles
    .filter((p) => activeOn(profiles, p.contactId, day))
    .map((p) => ({ kind: 'friend', contactId: p.contactId }));
  const pool = [...strangers];
  const room = Math.max(0, MAX_VISITORS - friends.length);
  const picked: Visitor[] = [];
  for (
    let n = randInt(rand, 1, 3);
    n > 0 && pool.length && picked.length < room;
    n--
  )
    picked.push({
      kind: 'stranger',
      name: pool.splice(randInt(rand, 0, pool.length - 1), 1)[0]!,
    });
  const all = [...friends.slice(0, MAX_VISITORS), ...picked];
  // Fisher–Yates with the same generator: friends and strangers mix.
  for (let i = all.length - 1; i > 0; i--) {
    const j = randInt(rand, 0, i);
    [all[i], all[j]] = [all[j]!, all[i]!];
  }
  return all;
}

const visitorKey = (v: Visitor) =>
  v.kind === 'friend' ? `f:${v.contactId}` : `s:${v.name}`;

/** The visitors box: the latest visit of each visitor, newest day first, at most 8. */
export function recentVisitors(
  profiles: readonly PixlogProfile[],
  day: number,
  strangers: readonly string[],
): (Visitor & { day: number })[] {
  const seen = new Set<string>();
  const out: (Visitor & { day: number })[] = [];
  for (let d = day; d >= 1 && out.length < MAX_VISITORS; d--)
    for (const v of visitors(profiles, d, strangers)) {
      if (seen.has(visitorKey(v)) || out.length >= MAX_VISITORS) continue;
      seen.add(visitorKey(v));
      out.push({ ...v, day: d });
    }
  return out;
}

const VISITOR_BASE = 23;

/** The page's visitor counter on `day`: a seeded 3–14 more each day, so it only ever grows. */
export function visitorCount(day: number): number {
  let count = VISITOR_BASE;
  for (let d = 1; d <= day; d++)
    count += randInt(mulberry32(seedFrom('pixlog:visitorCount:' + d)), 3, 14);
  return count;
}
