// One window's navigation: the history stack, the dial-up-speed page load, and what is shown.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNetworkStore } from '@/os/network';
import { scaleMs } from '@/os/speed';
import {
  canGoBack,
  canGoForward,
  createHistory,
  currentUrl,
  goBack,
  goForward,
  pushUrl,
  type History,
} from './history';
import { HOMEPAGE, normalizeUrl, resolveHref } from './url';

/** A page "downloads" for 400–1300 ms (scaled), like a 56K modem. */
export function loadDuration(random: () => number = Math.random): number {
  return scaleMs(400 + Math.floor(random() * 900));
}

export interface PageLoad {
  url: string;
  ms: number;
  /** Bumps on every load, so a Refresh remounts the page. */
  id: number;
}

export interface ShownPage {
  url: string;
  /** The network was down when the load finished: show "cannot be displayed". */
  offline: boolean;
  id: number;
}

export interface Navigation {
  history: History;
  url: string;
  loading: PageLoad | null;
  shown: ShownPage | null;
  canBack: boolean;
  canForward: boolean;
  /** An absolute or typed address (`spaceport.example`, `ponies` → Searchly). */
  go: (address: string) => void;
  /** A link inside a page; relative paths resolve against the shown page. */
  follow: (href: string) => void;
  resolveLink: (href: string) => string;
  back: () => void;
  forward: () => void;
  stop: () => void;
  refresh: () => void;
  home: () => void;
}

export function useNavigation(initialUrl: string | undefined): Navigation {
  const start = normalizeUrl(initialUrl ?? HOMEPAGE);
  const nextId = useRef(1);
  const [history, setHistory] = useState(() => createHistory(start));
  const [loading, setLoading] = useState<PageLoad | null>(() => ({
    url: start,
    ms: loadDuration(),
    id: 0,
  }));
  const [shown, setShown] = useState<ShownPage | null>(null);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      setShown({
        url: loading.url,
        offline: useNetworkStore.getState().status !== 'online',
        id: loading.id,
      });
      setLoading(null);
    }, loading.ms);
    return () => clearTimeout(timer);
  }, [loading]);

  const load = useCallback((url: string) => {
    setLoading({ url, ms: loadDuration(), id: nextId.current++ });
  }, []);

  const visit = useCallback(
    (url: string) => {
      setHistory((h) => pushUrl(h, url));
      load(url);
    },
    [load],
  );

  const base = shown?.url ?? currentUrl(history);
  const resolveLink = useCallback(
    (href: string) => resolveHref(base, href),
    [base],
  );

  const move = (next: History) => {
    if (next === history) return;
    setHistory(next);
    load(currentUrl(next));
  };

  return {
    history,
    url: currentUrl(history),
    loading,
    shown,
    canBack: canGoBack(history),
    canForward: canGoForward(history),
    go: (address) => visit(normalizeUrl(address)),
    follow: (href) => visit(resolveLink(href)),
    resolveLink,
    back: () => move(goBack(history)),
    forward: () => move(goForward(history)),
    stop: () => setLoading(null),
    refresh: () => load(currentUrl(history)),
    home: () => visit(HOMEPAGE),
  };
}
