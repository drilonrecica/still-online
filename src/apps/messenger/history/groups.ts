// Pure helpers for Message History: date grouping and search filtering of a transcript.
import type { TranscriptEntry } from '@/content/types';
import { formatLongDate, toGameDate } from '@/os/clock';

export interface DayGroup {
  /** e.g. "Tuesday, October 16, 2007". */
  label: string;
  entries: TranscriptEntry[];
}

/** Whether `entry` matches a (trimmed, case-insensitive) search; nudges only match an empty search. */
export function matchesSearch(entry: TranscriptEntry, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  return entry.kind === 'message' && entry.text.toLowerCase().includes(q);
}

/** Entries (matching `query`) grouped by the in-game calendar day of their `at`, in order. */
export function groupByDay(
  entries: readonly TranscriptEntry[],
  query = '',
): DayGroup[] {
  const groups: DayGroup[] = [];
  for (const entry of entries) {
    if (!matchesSearch(entry, query)) continue;
    const label = formatLongDate(toGameDate(new Date(entry.at)));
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.entries.push(entry);
    else groups.push({ label, entries: [entry] });
  }
  return groups;
}
