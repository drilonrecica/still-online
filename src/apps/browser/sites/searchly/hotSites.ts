// The Searchly home page's "hot sites this week" box: every site for everyone, the player's side
// of 2007 first, then the shared ones, then the other side (authored order within each group).
import type { HotSite } from '@/content/sites/searchly';
import type { Gender } from '@/os/types';

export function hotSitesFor(
  sites: readonly HotSite[],
  gender: Gender,
): HotSite[] {
  const rank = (s: HotSite) =>
    s.side === gender ? 0 : s.side === 'both' ? 1 : 2;
  return sites
    .map((site, i) => ({ site, i }))
    .sort((a, b) => rank(a.site) - rank(b.site) || a.i - b.i)
    .map(({ site }) => site);
}
