// Shared frame for cheatcave.example: the pixel banner with "UPDATED DAILY!!", nav, and a sidebar
// with CaveKing's welcome, the fake visitor counter, "gamers online" and the link-2-us buttons.
// Every page view counts as one visit (pages remount per load), like the Tinfoil Comets counter.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CHEATCAVE_HOST } from '@/content/sites/cheatcave';
import { formatNumber } from '@/i18n/format';
import { useLocale, useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { useWebStore } from '../../store';
import { useSiteText } from '../useSiteText';
import styles from './CheatCave.module.css';
import { onlineCount, visitorCount } from './logic';

const NAV = [
  ['home', '/'],
  ['cheats', '/cheats'],
  ['clips', '/clips'],
  ['forum', '/forum'],
] as const;

function useVisit(host: string): number {
  const [hits, setHits] = useState(
    () => useWebStore.getState().counters[host] ?? 0,
  );
  const counted = useRef(false);
  useEffect(() => {
    // StrictMode replays effects; one mount is one visit.
    if (counted.current) return;
    counted.current = true;
    setHits(useWebStore.getState().hit(host));
  }, [host]);
  return hits;
}

export function Layout({ children }: { children: ReactNode }) {
  const { CHEATCAVE_TEXT: T } = useSiteText(CHEATCAVE_HOST);
  const day = useWorldStore((s) => s.day);
  const hits = useVisit(CHEATCAVE_HOST);
  const locale = useLocale();
  const t = useT();
  const visitors = formatNumber(visitorCount(day, hits), locale);
  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <h1 className={styles.title}>{T.title}</h1>
        <p className={styles.tagline}>
          {T.tagline} <span className={styles.updated}>{T.updated}</span>
        </p>
      </header>
      <nav className={styles.nav} aria-label={t('sites.cheatcave.nav.label')}>
        {NAV.map(([key, href]) => (
          <SiteLink key={href} href={href}>
            {t(`sites.cheatcave.nav.${key}`)}
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
          <section className={styles.box}>
            <p>{T.sinceLine}</p>
            <p
              className={styles.counter}
              role="img"
              aria-label={t('sites.cheatcave.visits', { n: visitors })}
            >
              {[...visitors].map((ch, i) => (
                <span
                  key={i}
                  className={/\d/.test(ch) ? styles.digit : undefined}
                >
                  {ch}
                </span>
              ))}
            </p>
            <p>{T.sinceLineEnd}</p>
            <p className={styles.online}>
              {t('sites.cheatcave.online', { n: onlineCount(day) })}
            </p>
          </section>
          <section className={styles.box}>
            <h2>{T.linkUsHeading}</h2>
            <ul
              className={styles.buttons}
              aria-label={t('sites.cheatcave.buttons')}
            >
              {T.buttons.map((label) => (
                <li key={label} className={styles.button88}>
                  {label}
                </li>
              ))}
            </ul>
            <p>{T.linkUs}</p>
          </section>
        </aside>
      </div>
      <footer className={styles.footer}>
        <p>{T.bestViewed}</p>
        <p>{T.footer}</p>
      </footer>
    </div>
  );
}
