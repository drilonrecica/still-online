// The Spaceport frame: logo bar, nav and footer around every page.
import type { ReactNode } from 'react';
import { SPACEPORT_HOST } from '@/content/sites/spaceport';
import { useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { SiteLink } from '../../SiteLink';
import styles from './Spaceport.module.css';

export function Logo() {
  const { SPACEPORT_TEXT: T } = useSiteText(SPACEPORT_HOST);
  return (
    <span className={styles.logo}>
      <span className={styles.planet} aria-hidden />
      {T.logo}
    </span>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { SPACEPORT_TEXT: T } = useSiteText(SPACEPORT_HOST);
  const t = useT();
  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <SiteLink href="/" className={styles.logoLink}>
          <Logo />
        </SiteLink>
        <span className={styles.tagline}>{T.tagline}</span>
      </header>
      <nav className={styles.nav} aria-label={t('sites.spaceport.nav.label')}>
        <SiteLink href="/">{t('sites.spaceport.nav.home')}</SiteLink>
        <span aria-hidden> | </span>
        <SiteLink href="/me">{t('sites.spaceport.nav.myProfile')}</SiteLink>
        <span aria-hidden> | </span>
        <SiteLink href="http://searchly.example/">
          {t('sites.spaceport.nav.search')}
        </SiteLink>
      </nav>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>{T.footer}</footer>
    </div>
  );
}
