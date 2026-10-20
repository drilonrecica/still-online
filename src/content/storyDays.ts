// The story's days, shared by the content lints, the balloons and the per-day tests.

/** Days 1–10 are story days; day-gated content stays within them, later days keep day 10. */
export const STORY_DAYS = { first: 1, last: 10 } as const;

/**
 * The last story day whose content is written, per area. Each week-two content task raises one;
 * W2-03 makes them all `STORY_DAYS.last`. The chats are written through day 10 (W1-03), the mail
 * (W2-01) and the sites (W2-02) too.
 */
const CONTENT_LAST_DAY = {
  contacts: STORY_DAYS.last,
  mail: STORY_DAYS.last,
  sites: STORY_DAYS.last,
  other: 5,
} as const;

/**
 * The story days that per-day tests expect content on: days 1–10 for the chats (`'contacts'`),
 * the mail (`'mail'`) and the sites (`'sites'`), days 1–5 for everything else for now. Tests loop over this, never over a literal day list; range
 * checks use `STORY_DAYS` instead.
 */
export function contentDays(
  area: keyof typeof CONTENT_LAST_DAY = 'other',
): number[] {
  const days: number[] = [];
  for (let d = STORY_DAYS.first; d <= CONTENT_LAST_DAY[area]; d++) days.push(d);
  return days;
}
