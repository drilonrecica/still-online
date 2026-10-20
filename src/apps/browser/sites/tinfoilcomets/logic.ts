import { formatRelativeDay } from '@/i18n/format';
import { getLocale } from '@/i18n/t';
// Pure helpers for tinfoilcomets.example: guestbook order, day labels, the odometer and the webring.
import type {
  GuestbookEntry,
  PlayerGuestbookEntry,
} from '@/content/sites/types';
import { COUNTER_START, type TourDate } from '@/content/sites/tinfoilcomets';
import type { Locale } from '@/i18n/types';

export interface ShownEntry extends GuestbookEntry {
  mine: boolean;
}

export const NAME_MAX = 32;
export const MESSAGE_MAX = 400;
export const HOMEPAGE_MAX = 60;

/**
 * Friends' entries up to `day` plus the player's, newest day first. Within a day the player's
 * entries come first (they signed after that day's entries appeared), newest first.
 */
export function guestbookEntries(
  content: readonly GuestbookEntry[],
  player: readonly PlayerGuestbookEntry[],
  day: number,
): ShownEntry[] {
  const theirs = content
    .map((e, i) => ({ e: { ...e, mine: false }, i }))
    .filter(({ e }) => e.day <= day);
  const mine = player.map((e, i) => ({
    e: { ...e, day: e.day ?? 1, mine: true },
    i,
  }));
  return [...mine, ...theirs]
    .sort(
      (a, b) =>
        b.e.day - a.e.day || Number(b.e.mine) - Number(a.e.mine) || b.i - a.i,
    )
    .map(({ e }) => e);
}

/** "today", "yesterday" or "3 days ago" (story days don't have weekday names). */
export function signedLabel(entryDay: number, currentDay: number): string {
  const ago = Math.max(0, currentDay - entryDay);
  return formatRelativeDay(ago, getLocale());
}

export type SignResult =
  | { ok: true; entry: PlayerGuestbookEntry }
  | { ok: false; error: 'noName' | 'noMessage' };

/** Trims and checks a guestbook form; the page shows CometGirl's text for the error. */
export function validateEntry(
  input: { name: string; message: string; homepage: string },
  day: number,
): SignResult {
  const name = input.name.trim().slice(0, NAME_MAX);
  const message = input.message.trim().slice(0, MESSAGE_MAX);
  const homepage = input.homepage.trim().slice(0, HOMEPAGE_MAX);
  if (!name) return { ok: false, error: 'noName' };
  if (!message) return { ok: false, error: 'noMessage' };
  return {
    ok: true,
    entry: { name, message, day, ...(homepage ? { homepage } : {}) },
  };
}

/**
 * A tour date as it reads on `day`: the show's `after` once it happened, else its `soon` date once
 * it is close and its `soldOut` note once it sold out, else as listed. `past` stops the blinking.
 */
export function tourRow(
  show: TourDate,
  day: number,
): { date: string; note: string; past: boolean } {
  if (show.after && day >= show.after.day)
    return { date: show.after.date, note: show.after.note, past: true };
  const note =
    show.soldOut && day >= show.soldOut.day ? show.soldOut.note : show.note;
  const date = show.soon && day >= show.soon.day ? show.soon.date : show.date;
  return { date, note, past: false };
}

/** Hits → the odometer value: the first visit shows `COUNTER_START`. */
export function counterValue(hits: number): number {
  return COUNTER_START + Math.max(0, hits - 1);
}

/**
 * `4203` → `004,203` (six digits, thousands separator; bigger numbers just grow). German
 * separates thousands with a dot: `004.203`.
 */
export function counterDigits(value: number, locale: Locale = 'en'): string {
  const digits = String(Math.max(0, Math.floor(value))).padStart(6, '0');
  return digits.replace(/\B(?=(\d{3})+$)/g, locale === 'de' ? '.' : ',');
}

/** The ring is every host in alphabetical order; prev/next wrap around `self`. */
export function webring(
  hosts: readonly string[],
  self: string,
): { prev: string; next: string; others: string[] } {
  const ring = [...new Set([...hosts, self])].sort();
  const at = ring.indexOf(self);
  const others = ring.filter((h) => h !== self);
  const n = ring.length;
  return {
    prev: ring[(at - 1 + n) % n] ?? self,
    next: ring[(at + 1) % n] ?? self,
    others,
  };
}
