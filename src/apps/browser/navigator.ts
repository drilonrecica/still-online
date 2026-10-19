// The browser window's navigator, shared with site pages through context (used by <SiteLink>).
import { createContext, useContext } from 'react';

export interface BrowserNavigator {
  /** Opens `href` in this window; relative paths resolve against the current page. */
  navigate: (href: string) => void;
  /** The status bar shows a hovered link's address; null restores the page status. */
  hover: (url: string | null) => void;
  /** Absolute form of `href` against the current page. */
  resolveHref: (href: string) => string;
  /** Scrolls the page area back to the top (e.g. `/me` after Save). */
  scrollToTop: () => void;
}

const noop: BrowserNavigator = {
  navigate: () => {},
  hover: () => {},
  resolveHref: (href) => href,
  scrollToTop: () => {},
};

export const NavigatorContext = createContext<BrowserNavigator>(noop);

export function useBrowserNavigator(): BrowserNavigator {
  return useContext(NavigatorContext);
}
