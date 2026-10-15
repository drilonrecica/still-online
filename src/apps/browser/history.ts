// Per-window Back/Forward stack. Pure: Web Explorer keeps one in component state.

export interface History {
  entries: readonly string[];
  /** Index of the current entry. */
  index: number;
}

export function createHistory(url: string): History {
  return { entries: [url], index: 0 };
}

export function currentUrl(h: History): string {
  return h.entries[h.index] ?? '';
}

/** Visiting a new page drops the forward entries; revisiting the current one changes nothing. */
export function pushUrl(h: History, url: string): History {
  if (currentUrl(h) === url) return h;
  const entries = [...h.entries.slice(0, h.index + 1), url];
  return { entries, index: entries.length - 1 };
}

export const canGoBack = (h: History) => h.index > 0;
export const canGoForward = (h: History) => h.index < h.entries.length - 1;

export function goBack(h: History): History {
  return canGoBack(h) ? { ...h, index: h.index - 1 } : h;
}

export function goForward(h: History): History {
  return canGoForward(h) ? { ...h, index: h.index + 1 } : h;
}
