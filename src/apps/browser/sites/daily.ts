import { formatRelativeDay } from '@/i18n/format';
import { getLocale } from '@/i18n/t';
// Day-gated site content shared by the blog-style sites: what's out by today, and "posted" labels.

/** Items with `day <= currentDay`, newest day first; within a day, later entries first. */
export function upToDay<T extends { day: number }>(
  items: readonly T[],
  currentDay: number,
): T[] {
  return items
    .map((item, i) => ({ item, i }))
    .filter(({ item }) => item.day <= currentDay)
    .sort((a, b) => b.item.day - a.item.day || b.i - a.i)
    .map(({ item }) => item);
}

/** "today", "yesterday" or "3 days ago" (story days don't have weekday names). */
export function postedLabel(itemDay: number, currentDay: number): string {
  const ago = Math.max(0, currentDay - itemDay);
  return formatRelativeDay(ago, getLocale());
}
