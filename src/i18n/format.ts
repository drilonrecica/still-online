// Locale-aware date, time and number formatting on top of `Intl`. Every formatter takes the
// locale explicitly; callers in React pass `useLocale()`, other code passes `getLocale()`.
import { INTL_LOCALES, type Locale } from './types';

const cache = new Map<string, Intl.DateTimeFormat | Intl.NumberFormat>();

function dateFormat(
  locale: Locale,
  id: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const key = `d:${locale}:${id}`;
  let f = cache.get(key) as Intl.DateTimeFormat | undefined;
  if (!f) {
    f = new Intl.DateTimeFormat(INTL_LOCALES[locale], options);
    cache.set(key, f);
  }
  return f;
}

function numberFormat(locale: Locale): Intl.NumberFormat {
  const key = `n:${locale}`;
  let f = cache.get(key) as Intl.NumberFormat | undefined;
  if (!f) {
    f = new Intl.NumberFormat(INTL_LOCALES[locale]);
    cache.set(key, f);
  }
  return f;
}

/** Newer ICU puts a narrow no-break space before AM/PM; the game's English output uses ' '. */
const plainSpaces = (s: string) => s.replace(/[\u202f\u00a0]/g, ' ');

/** `3:07 PM` (en) / `15:07` (de). */
export function formatTime(date: Date, locale: Locale): string {
  return plainSpaces(
    dateFormat(locale, 'time', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(date),
  );
}

/** `Sunday, October 14, 2007` (en) / `Sonntag, 14. Oktober 2007` (de). */
export function formatLongDate(date: Date, locale: Locale): string {
  return dateFormat(locale, 'long', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** `10/14/2007` (en) / `14.10.2007` (de). */
export function formatShortDate(date: Date, locale: Locale): string {
  return dateFormat(
    locale,
    'short',
    locale === 'de'
      ? { day: '2-digit', month: '2-digit', year: 'numeric' }
      : { day: 'numeric', month: 'numeric', year: 'numeric' },
  ).format(date);
}

/** Explorer's "Modified" style: `10/14/2007 15:07` (en) / `14.10.2007 15:07` (de). */
export function formatDateTime(date: Date, locale: Locale): string {
  const time = dateFormat(locale, 'time24', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  return `${formatShortDate(date, locale)} ${time}`;
}

/** `1,234` (en) / `1.234` (de). */
export function formatNumber(n: number, locale: Locale): string {
  return numberFormat(locale).format(n);
}

/** `today` / `yesterday` / `3 days ago` (en), `heute` / `gestern` / `vor 3 Tagen` (de). */
export function formatRelativeDay(daysAgo: number, locale: Locale): string {
  const n = Math.max(0, Math.floor(daysAgo));
  if (locale === 'de') {
    if (n === 0) return 'heute';
    if (n === 1) return 'gestern';
    return `vor ${n} Tagen`;
  }
  if (n === 0) return 'today';
  if (n === 1) return 'yesterday';
  return `${n} days ago`;
}
