// The story's days, shared by the content lints, the balloons and the per-day tests.

/** Days 1–10 are story days; day-gated content stays within them, later days keep day 10. */
export const STORY_DAYS = { first: 1, last: 10 } as const;

/**
 * The last story day whose content is written. Each week-two content task raises it; W2-03 makes
 * it `STORY_DAYS.last`.
 */
const CONTENT_LAST_DAY = 5;

/**
 * The story days that per-day tests expect content on (days 1–5 for now). Tests loop over this,
 * never over a literal day list; range checks use `STORY_DAYS` instead.
 */
export function contentDays(): number[] {
  const days: number[] = [];
  for (let d = STORY_DAYS.first; d <= CONTENT_LAST_DAY; d++) days.push(d);
  return days;
}
