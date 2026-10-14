// In-game clock: real local time of day and month/day, year forced to 2007.

export const GAME_YEAR = 2007;

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

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

/** Tray format, e.g. `3:07 PM`. */
export function formatTrayTime(date: Date): string {
  const hours = date.getHours();
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${h12}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** Tray tooltip format, e.g. `Sunday, October 14, 2007`. */
export function formatLongDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/** Milliseconds until the next full minute, for scheduling tray clock updates. */
export function msUntilNextMinute(date: Date): number {
  return 60_000 - (date.getSeconds() * 1000 + date.getMilliseconds());
}
