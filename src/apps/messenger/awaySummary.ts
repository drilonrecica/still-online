// "While you were away": which contacts messaged since Away began, as a toast line.
import type { ContactId, ContactProgress } from '@/content/types';

export interface AwaySummary {
  /** e.g. "3 messages from Jess, Marco". */
  text: string;
  /** The contact with the most recent away message. */
  latestContactId: ContactId;
  total: number;
}

/** Names listed before the rest fold into "and N more". */
const MAX_NAMES = 3;

export function summarizeAway(
  contacts: Readonly<Record<ContactId, ContactProgress>>,
  since: number,
  nameOf: (id: ContactId) => string,
): AwaySummary | null {
  const counts: { id: ContactId; count: number; latest: number }[] = [];
  for (const [id, c] of Object.entries(contacts)) {
    let count = 0;
    let latest = 0;
    for (const e of c.transcript) {
      if (!('whileAway' in e) || e.whileAway !== true || e.at < since) continue;
      count += 1;
      latest = Math.max(latest, e.at);
    }
    if (count > 0) counts.push({ id, count, latest });
  }
  if (counts.length === 0) return null;
  counts.sort((a, b) => b.latest - a.latest);
  const total = counts.reduce((n, c) => n + c.count, 0);
  const names = counts.slice(0, MAX_NAMES).map((c) => nameOf(c.id));
  const rest = counts.length - names.length;
  const from =
    rest > 0 ? `${names.join(', ')} and ${rest} more` : names.join(', ');
  return {
    text: `${total} message${total === 1 ? '' : 's'} from ${from}`,
    latestContactId: counts[0]!.id,
    total,
  };
}
