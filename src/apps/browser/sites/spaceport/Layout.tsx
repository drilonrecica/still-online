// The Spaceport frame: logo bar, nav and footer around every page.
import type { ReactNode } from 'react';
import { SPACEPORT_TEXT as T } from '@/content/sites/spaceport';
import { SiteLink } from '../../SiteLink';
import styles from './Spaceport.module.css';

export function Logo() {
  return (
    <span className={styles.logo}>
      <span className={styles.planet} aria-hidden />
      {T.logo}
    </span>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <SiteLink href="/" className={styles.logoLink}>
          <Logo />
        </SiteLink>
        <span className={styles.tagline}>{T.tagline}</span>
      </header>
      <nav className={styles.nav} aria-label="Spaceport">
        <SiteLink href="/">Home</SiteLink>
        <span aria-hidden> | </span>
        <SiteLink href="/me">My Profile</SiteLink>
        <span aria-hidden> | </span>
        <SiteLink href="http://searchly.example/">Search</SiteLink>
      </nav>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>{T.footer}</footer>
    </div>
  );
}
