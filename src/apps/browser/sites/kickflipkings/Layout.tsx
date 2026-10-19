// Shared frame for kickflipkings.example: the stencil banner on concrete, nav, and a sidebar with
// Kev's welcome and the sticker wall. The sticker-bomb border runs round the whole page.
import type { ReactNode } from 'react';
import { KICKFLIP_HOST } from '@/content/sites/kickflipkings';
import { useT } from '@/i18n/useT';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import styles from './KickflipKings.module.css';

const NAV = [
  ['home', '/'],
  ['crew', '/crew'],
  ['tricks', '/tricks'],
  ['video', '/video'],
  ['gigs', '/gigs'],
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { KICKFLIP_TEXT: T } = useSiteText(KICKFLIP_HOST);
  const t = useT();
  return (
    <div className={styles.page}>
      <div className={styles.frame}>
        <header className={styles.banner}>
          <h1 className={styles.title}>{T.title}</h1>
          <p className={styles.tagline}>{T.tagline}</p>
        </header>
        <nav
          className={styles.nav}
          aria-label={t('sites.kickflipkings.nav.label')}
        >
          {NAV.map(([key, href]) => (
            <SiteLink key={href} href={href}>
              {t(`sites.kickflipkings.nav.${key}`)}
            </SiteLink>
          ))}
        </nav>
        <div className={styles.columns}>
          <main className={styles.main}>{children}</main>
          <aside className={styles.sidebar}>
            <section className={styles.box}>
              <h2>{T.welcomeHeading}</h2>
              <p>{T.welcome}</p>
            </section>
            <ul
              className={styles.stickers}
              aria-label={t('sites.kickflipkings.stickers')}
            >
              {T.stickers.map((label) => (
                <li key={label} className={styles.sticker}>
                  {label}
                </li>
              ))}
            </ul>
          </aside>
        </div>
        <footer className={styles.footer}>
          <p>{T.bestViewed}</p>
          <p>{T.footer}</p>
        </footer>
      </div>
    </div>
  );
}
