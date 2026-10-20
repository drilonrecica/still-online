// kickflipkings.example `/gigs`: local shows, Velvet Lantern's bean cellar night among them. A
// listing shows from its day, picks up updates, and reads as played once its `after` day comes.
import { KICKFLIP_HOST } from '@/content/sites/kickflipkings';
import { useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { useSiteText } from '../useSiteText';
import styles from './KickflipKings.module.css';
import { Layout } from './Layout';
import { visibleGigs } from './logic';

export default function Gigs() {
  const { KICKFLIP_GIGS, KICKFLIP_TEXT: T } = useSiteText(KICKFLIP_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  const gigs = visibleGigs(KICKFLIP_GIGS, day);
  return (
    <Layout>
      <h2 className={styles.heading}>{T.gigsHeading}</h2>
      <p>{T.gigsIntro}</p>
      <ul className={styles.gigs} aria-label={t('sites.kickflipkings.gigs')}>
        {gigs.map(({ gig, venue, when, note, updates, played }) => (
          <li
            key={gig.id}
            className={played ? `${styles.gig} ${styles.played}` : styles.gig}
            aria-label={gig.band}
          >
            <b className={styles.cardTitle}>{gig.band}</b>
            <br />
            <b>{t('sites.kickflipkings.where')}</b> {venue}
            <br />
            <b>{t('sites.kickflipkings.when')}</b> {when}
            <p>{note}</p>
            {updates.map((u) => (
              <p key={u.day} className={styles.tip}>
                {u.text}
              </p>
            ))}
          </li>
        ))}
      </ul>
      {!gigs.some((g) => g.gig.id.startsWith('velvet-lantern')) && (
        <p className={styles.closed}>{T.noVelvetLantern}</p>
      )}
    </Layout>
  );
}
