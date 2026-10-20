// The story's days, shared by the content lints, the balloons and the per-day tests.

/** Days 1–10 are story days; day-gated content stays within them, later days keep day 10. */
export const STORY_DAYS = { first: 1, last: 10 } as const;

/**
 * The story days that per-day tests expect content on. Every area is written through day 10 since
 * W2-03 (the week-two tasks raised it area by area). Tests loop over this, never over a literal day
 * list; range checks use `STORY_DAYS` instead.
 */
export function contentDays(): number[] {
  const days: number[] = [];
  for (let d = STORY_DAYS.first; d <= STORY_DAYS.last; d++) days.push(d);
  return days;
}
