// celebgossip07.example `/celebs`: Roxi's Who's Who of (invented) celebrities.
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import { useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { SiteLink } from '../../SiteLink';
import styles from './CelebGossip.module.css';
import { Layout } from './Layout';
import { tagHref } from './logic';

export default function Celebs() {
  const { CELEBS } = useSiteText(GOSSIP_HOST);
  const t = useT();
  return (
    <Layout>
      <h2 className={styles.heading}>{t('sites.celebgossip07.whosWho')}</h2>
      {CELEBS.map((c) => (
        <section key={c.tag} className={styles.celeb} aria-label={c.name}>
          <h3>{c.name}</h3>
          <p>
            <b>{t('sites.celebgossip07.famousFor')}</b> {c.famousFor}
          </p>
          <p>
            <b>{t('sites.celebgossip07.status')}</b> {c.status}
          </p>
          <p>
            <b>{t('sites.celebgossip07.hotness')}</b>{' '}
            <span
              className={styles.stars}
              role="img"
              aria-label={t('sites.celebgossip07.stars', { n: c.stars })}
            >
              {'★'.repeat(c.stars)}
              {'☆'.repeat(5 - c.stars)}
            </span>
          </p>
          <ul>
            {c.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <SiteLink href={tagHref(c.tag)}>
            {t('sites.celebgossip07.allPostsAbout', { name: c.name })}
          </SiteLink>
        </section>
      ))}
    </Layout>
  );
}
