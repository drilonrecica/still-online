// A link inside a fictional site: navigates the current Web Explorer window.
import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { useBrowserNavigator } from './navigator';

export interface SiteLinkProps extends Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  href: string;
}

export function SiteLink({
  href,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...rest
}: SiteLinkProps) {
  const nav = useBrowserNavigator();
  const url = nav.resolveHref(href);
  return (
    <a
      {...rest}
      href={url}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        e.preventDefault();
        nav.hover(null);
        nav.navigate(href);
      }}
      onMouseEnter={(e) => {
        onMouseEnter?.(e);
        nav.hover(url);
      }}
      onMouseLeave={(e) => {
        onMouseLeave?.(e);
        nav.hover(null);
      }}
      onFocus={(e) => {
        onFocus?.(e);
        nav.hover(url);
      }}
      onBlur={(e) => {
        onBlur?.(e);
        nav.hover(null);
      }}
    />
  );
}
