// In-game clock: real local time of day and month/day, year forced to 2007.
import { formatLongDate as formatLongDateIn, formatTime } from '@/i18n/format';
import { getLocale } from '@/i18n/t';

export const GAME_YEAR = 2007;

/** Maps a real date to the game date. Feb 29 becomes Feb 28 (2007 is not a leap year). */
export function toGameDate(real: Date): Date {
  const month = real.getMonth();
  const day = month === 1 && real.getDate() === 29 ? 28 : real.getDate();
  return new Date(
    GAME_YEAR,
    month,
    day,
    real.getHours(),
    real.getMinutes(),
    real.getSeconds(),
    real.getMilliseconds(),
  );
}

/** The current in-game date. */
export function now(): Date {
  return toGameDate(new Date());
}

/** Tray format, e.g. `3:07 PM` (en) or `15:07` (de). */
export function formatTrayTime(date: Date): string {
  return formatTime(date, getLocale());
}

/** Tray tooltip format, e.g. `Sunday, October 14, 2007`. */
export function formatLongDate(date: Date): string {
  return formatLongDateIn(date, getLocale());
}

/** Milliseconds until the next full minute, for scheduling tray clock updates. */
export function msUntilNextMinute(date: Date): number {
  return 60_000 - (date.getSeconds() * 1000 + date.getMilliseconds());
}
