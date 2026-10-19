// Shared frame for glittercodez.example: the sparkly logo, an animated "NEW!!" badge, nav, the fake
// "layouts copied" counter and the "link back 2 us plz" box.
import type { ReactNode } from 'react';
import { GLITTERCODEZ_HOST } from '@/content/sites/glittercodez';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import styles from './GlitterCodez.module.css';

const NAV = [
  ['layouts', '/'],
  ['glitter', '/glitter'],
  ['stickers', '/stickers'],
  ['cursors', '/cursors'],
] as const;

/** An original logo: a four-point sparkle and a heart. */
function Logo() {
  return (
    <svg
      className={styles.mark}
      viewBox="0 0 40 32"
      width={40}
      height={32}
      aria-hidden
      focusable="false"
    >
      <path
        d="M14 2 L17 12 L27 15 L17 18 L14 28 L11 18 L1 15 L11 12 Z"
        fill="#ffe14d"
        stroke="#7a1d8f"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
      <path
        d="M30 30 C22 24 22 17 26.5 16 C28.5 15.6 30 17 30 18 C30 17 31.5 15.6 33.5 16 C38 17 38 24 30 30Z"
        fill="#ff3399"
        stroke="#7a1d8f"
        strokeWidth={1.2}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { GLITTERCODEZ_TEXT: T } = useSiteText(GLITTERCODEZ_HOST);
  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <Logo />
        <h1 className={styles.title}>{T.logo}</h1>
        <span className={styles.newBadge}>{T.newBadge}</span>
        <p className={styles.tagline}>{T.tagline}</p>
      </header>
      <nav className={styles.nav} aria-label={T.nav.label}>
        {NAV.map(([key, href]) => (
          <SiteLink key={href} href={href}>
            {T.nav[key]}
          </SiteLink>
        ))}
      </nav>
      <main className={styles.main}>{children}</main>
      <aside className={styles.sideBoxes}>
        <p className={styles.counter}>
          <strong>{T.counter}</strong> {T.counterLabel}
        </p>
        <section className={styles.linkBack}>
          <h2>{T.linkBackHeading}</h2>
          <p>{T.linkBack}</p>
          <span className={styles.button88}>{T.linkBackButton}</span>
        </section>
      </aside>
      <footer className={styles.footer}>{T.footer}</footer>
    </div>
  );
}
