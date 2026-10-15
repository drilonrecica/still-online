// URL helpers for Web Explorer: typed addresses, relative site links, and parsing.
import { redirectLegacyUrl } from './legacyHosts';

export const HOMEPAGE = 'http://searchly.example/';

const SCHEME = /^https?:\/\//i;
/** Starts with something host-like (`friendspace.example`, `www.x.example/y`). */
const HOSTLIKE = /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z0-9-]+(?::\d+)?(?:[/?#]|$)/i;

export interface ParsedUrl {
  /** Normalised `http://host/path?query`. */
  url: string;
  host: string;
  /** Always starts with `/`; no trailing slash except the root. */
  path: string;
  query: URLSearchParams;
}

/**
 * Adds `http://`, lowercases the host and defaults the path to `/`. Search words go to Searchly.
 * Renamed sites' old hosts become their new ones (`LEGACY_HOSTS`).
 */
export function normalizeUrl(input: string): string {
  const text = input.trim();
  if (text === '') return HOMEPAGE;
  if (!SCHEME.test(text) && !HOSTLIKE.test(text)) {
    return `http://searchly.example/search?q=${encodeURIComponent(text)}`;
  }
  const withScheme = SCHEME.test(text) ? text : `http://${text}`;
  try {
    const u = new URL(withScheme);
    // The fictional web has no TLS: everything is plain http.
    return redirectLegacyUrl(`http://${u.host}${u.pathname}${u.search}`);
  } catch {
    return redirectLegacyUrl(withScheme.toLowerCase());
  }
}

/** Resolves a link written inside a site (`/band`, `guestbook`, `friendspace.example/kayla`). */
export function resolveHref(base: string, href: string): string {
  const text = href.trim();
  if (SCHEME.test(text) || HOSTLIKE.test(text)) return normalizeUrl(text);
  try {
    return normalizeUrl(new URL(text, base).href);
  } catch {
    return normalizeUrl(text);
  }
}

export function parseUrl(url: string): ParsedUrl | null {
  try {
    const u = new URL(normalizeUrl(url));
    const host = u.hostname.replace(/^www\./, '');
    let path = u.pathname || '/';
    try {
      path = decodeURIComponent(path);
    } catch {
      // Keep the encoded form.
    }
    if (path.length > 1) path = path.replace(/\/+$/, '') || '/';
    const search = u.searchParams.toString();
    return {
      url: `http://${host}${path}${search ? `?${search}` : ''}`,
      host,
      path,
      query: u.searchParams,
    };
  } catch {
    return null;
  }
}
