// Pure helpers for kickflipkings.example: day-gated crew tricks and gigs, and the fake buffering.
import type { CrewMember, DayLine, Gig } from '@/content/sites/types';
import { mulberry32, seedFrom } from '@/os/random';

/** A crew member's best trick on `day` (Dex's changes when he lands the kickflip, then at the Jam). */
export function bestTrickOn(member: CrewMember, day: number): string {
  if (member.later && day >= member.later.day) return member.later.bestTrick;
  if (member.after && day >= member.after.day) return member.after.bestTrick;
  return member.bestTrick;
}

export interface ShownGig {
  gig: Gig;
  venue: string;
  when: string;
  note: string;
  /** Updates out by today, oldest first; none once the show is over. */
  updates: readonly DayLine[];
  played: boolean;
}

/**
 * Gigs listed by `day`, in listing order; a booked show reads its `moved` venue and date, a played
 * show its `after` text.
 */
export function visibleGigs(gigs: readonly Gig[], day: number): ShownGig[] {
  return gigs
    .filter((gig) => gig.day <= day)
    .map((gig) => {
      const played = gig.after !== undefined && day >= gig.after.day;
      const moved = gig.moved && day >= gig.moved.day ? gig.moved : undefined;
      return {
        gig,
        venue: moved?.venue ?? gig.venue,
        when: played && gig.after ? gig.after.when : (moved?.when ?? gig.when),
        note: played && gig.after ? gig.after.note : gig.note,
        updates: played ? [] : (gig.updates ?? []).filter((u) => u.day <= day),
        played,
      };
    });
}

/** The view counter on `day`: the newest count out by then, or null before the first one. */
export function viewsOn(
  views: readonly { day: number; views: number }[],
  day: number,
): number | null {
  let shown: number | null = null;
  for (const v of views) if (v.day <= day) shown = v.views;
  return shown;
}

/** Days until the video premieres (0 on the day and after). */
export const daysToPremiere = (day: number, premiereDay: number): number =>
  Math.max(0, premiereDay - day);

/** The buffering bar never gets past this. */
export const BUFFER_MAX = 99;

/** The buffering percentage after `step` ticks: a seeded crawl that stops at 99%. */
export function bufferAt(step: number): number {
  const rand = mulberry32(seedFrom('kickflipkings:buffer'));
  let pct = 0;
  for (let i = 0; i < step; i++) pct += 4 + Math.floor(rand() * 15);
  return Math.min(BUFFER_MAX, pct);
}
