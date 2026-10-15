// Searchly's engine: an index built from site metadata (page titles, keywords, descriptions),
// weighted scoring, "did you mean" for one-letter typos and the Lucky pick.
import type { SiteDefinition } from '@/content/sites/types';

export const PAGE_SIZE = 10;
export const WEIGHTS = { title: 3, keywords: 2, description: 1 } as const;

export interface IndexedPage {
  url: string;
  host: string;
  path: string;
  title: string;
  snippet: string;
  titleTokens: ReadonlySet<string>;
  keywordTokens: ReadonlySet<string>;
  descriptionTokens: ReadonlySet<string>;
}

export interface SearchResult {
  url: string;
  title: string;
  snippet: string;
  score: number;
}

export interface SearchIndex {
  pages: readonly IndexedPage[];
  /** Every word that appears in a title, keyword or description (for typo suggestions). */
  vocabulary: ReadonlySet<string>;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** One indexed page per concrete path; the `/*` catch-all has no address of its own. */
export function buildIndex(sites: readonly SiteDefinition[]): SearchIndex {
  const pages: IndexedPage[] = [];
  const vocabulary = new Set<string>();
  for (const site of sites) {
    for (const [path, page] of Object.entries(site.pages)) {
      if (path.includes('*')) continue;
      const url = `http://${site.host}${path}`;
      const titleTokens = new Set(
        tokenize(`${page.title} ${site.host.replace(/\.example$/, '')}`),
      );
      const keywordTokens = new Set(
        tokenize([...(page.keywords ?? []), ...site.keywords].join(' ')),
      );
      const descriptionTokens = new Set(
        tokenize(`${site.title} ${site.description}`),
      );
      for (const set of [titleTokens, keywordTokens, descriptionTokens]) {
        for (const word of set) vocabulary.add(word);
      }
      pages.push({
        url,
        host: site.host,
        path,
        title: page.title,
        snippet: site.description,
        titleTokens,
        keywordTokens,
        descriptionTokens,
      });
    }
  }
  return { pages, vocabulary };
}

/** Ranked results: score = 3×title + 2×keywords + 1×description hits per distinct query word. */
export function search(query: string, index: SearchIndex): SearchResult[] {
  const terms = [...new Set(tokenize(query))];
  if (terms.length === 0) return [];
  const scored: SearchResult[] = [];
  const isHome = new Map(index.pages.map((p) => [p.url, p.path === '/']));
  for (const page of index.pages) {
    let score = 0;
    for (const term of terms) {
      if (page.titleTokens.has(term)) score += WEIGHTS.title;
      if (page.keywordTokens.has(term)) score += WEIGHTS.keywords;
      if (page.descriptionTokens.has(term)) score += WEIGHTS.description;
    }
    if (score > 0) {
      scored.push({
        url: page.url,
        title: page.title,
        snippet: page.snippet,
        score,
      });
    }
  }
  scored.sort(
    (a, b) =>
      b.score - a.score ||
      Number(isHome.get(b.url)) - Number(isHome.get(a.url)) ||
      a.title.localeCompare(b.title) ||
      a.url.localeCompare(b.url),
  );
  return scored;
}

/** True when `a` and `b` differ by exactly one substitution, insertion or deletion. */
function oneEditApart(a: string, b: string): boolean {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1);
  const [long, short] = a.length > b.length ? [a, b] : [b, a];
  return long.slice(i + 1) === short.slice(i);
}

/** A corrected query when a word is unknown but one letter away from a known word. */
export function didYouMean(query: string, index: SearchIndex): string | null {
  const words = tokenize(query);
  let changed = false;
  const fixed = words.map((word) => {
    if (word.length < 3 || index.vocabulary.has(word)) return word;
    const candidates = [...index.vocabulary]
      .filter((known) => known.length >= 3 && oneEditApart(word, known))
      .sort();
    if (candidates.length === 0) return word;
    changed = true;
    return candidates[0] ?? word;
  });
  return changed ? fixed.join(' ') : null;
}

/** "I'm Feeling Lucky": the top result, or the results page when nothing matches. */
export function luckyUrl(query: string, index: SearchIndex): string {
  const top = search(query, index)[0];
  return top ? top.url : searchUrl(query);
}

export function searchUrl(query: string, page = 1): string {
  const base = `http://searchly.example/search?q=${encodeURIComponent(query)}`;
  return page > 1 ? `${base}&p=${page}` : base;
}
