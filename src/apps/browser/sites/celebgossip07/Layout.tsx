// Shared frame for celebgossip07.example: the glitter banner, nav, and a sidebar with Roxi's
// "about me", the tag cloud and today's HOT or NOT poll.
import type { ReactNode } from 'react';
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import { useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { upToDay } from '../daily';
import styles from './CelebGossip.module.css';
import { HotOrNot } from './HotOrNot';
import { TagCloud } from './TagCloud';

const NAV = [
  ['home', '/'],
  ['whosWho', '/celebs'],
  ['allTags', '/tag'],
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { GOSSIP_POSTS, GOSSIP_TEXT: T } = useSiteText(GOSSIP_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <h1 className={styles.title}>
          {T.title} <span className={styles.star}>{T.star}</span>{' '}
          <span className={styles.omg}>{T.omg}</span>
        </h1>
        <p className={styles.tagline}>{T.tagline}</p>
      </header>
      <nav
        className={styles.nav}
        aria-label={t('sites.celebgossip07.nav.label')}
      >
        {NAV.map(([key, href]) => (
          <SiteLink key={href} href={href}>
            {t(`sites.celebgossip07.nav.${key}`)}
          </SiteLink>
        ))}
      </nav>
      <div className={styles.columns}>
        <main className={styles.main}>{children}</main>
        <aside className={styles.sidebar}>
          <section className={styles.box}>
            <h2>{t('sites.celebgossip07.aboutMe')}</h2>
            <p>{T.about}</p>
          </section>
          <section
            className={styles.box}
            aria-label={t('sites.celebgossip07.tagCloud')}
          >
            <h2>{T.tagsHeading}</h2>
            <TagCloud posts={upToDay(GOSSIP_POSTS, day)} />
          </section>
          <HotOrNot day={day} />
        </aside>
      </div>
      <footer className={styles.footer}>
        <p>{T.disclaimer}</p>
        <p>{T.footer}</p>
      </footer>
    </div>
  );
}
