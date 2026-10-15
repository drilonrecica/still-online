// Shared frame for tinfoilcomets.example: rainbow title, nav, webring, hit counter, footer.
// Every page view counts as one visit (pages remount per load), so the counter ticks as you browse.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useSiteText } from '../useSiteText';
import { SiteLink } from '../../SiteLink';
import { useWebStore } from '../../store';
import { HitCounter } from './HitCounter';
import { counterValue } from './logic';
import styles from './TinfoilComets.module.css';
import { Webring } from './Webring';

const NAV = [
  ['HOME', '/'],
  ['The Band', '/band'],
  ['Pics', '/pics'],
  ['Guestbook', '/guestbook'],
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
  const { TINFOIL_SITE_TEXT: T } = useSiteText(TINFOIL_HOST);
  const hits = useVisit(TINFOIL_HOST);
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>
        <span>{T.title}</span>
      </h1>
      <nav className={styles.nav} aria-label="Site">
        {NAV.map(([label, href], i) => (
          <span key={href}>
            {i > 0 && <span aria-hidden> ~*~ </span>}
            <SiteLink href={href}>{label}</SiteLink>
          </span>
        ))}
      </nav>
      <main className={styles.main}>{children}</main>
      <Webring />
      <div className={styles.counterLine}>
        {T.sinceLine} <HitCounter value={counterValue(hits)} /> {T.sinceLineEnd}
      </div>
      <p className={styles.bestViewed}>{T.bestViewed}</p>
      <p className={styles.footer}>
        {T.footer}
        <br />
        {T.updated}
      </p>
    </div>
  );
}
