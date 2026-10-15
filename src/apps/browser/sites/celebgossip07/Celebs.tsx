// celebgossip07.example `/celebs`: Roxi's Who's Who of (invented) celebrities.
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import { useSiteText } from '../useSiteText';
import { SiteLink } from '../../SiteLink';
import styles from './CelebGossip.module.css';
import { Layout } from './Layout';
import { tagHref } from './logic';

export default function Celebs() {
  const { CELEBS } = useSiteText(GOSSIP_HOST);
  return (
    <Layout>
      <h2 className={styles.heading}>WHO&apos;S WHO</h2>
      {CELEBS.map((c) => (
        <section key={c.tag} className={styles.celeb} aria-label={c.name}>
          <h3>{c.name}</h3>
          <p>
            <b>famous 4:</b> {c.famousFor}
          </p>
          <p>
            <b>status:</b> {c.status}
          </p>
          <p>
            <b>hotness:</b>{' '}
            <span
              className={styles.stars}
              role="img"
              aria-label={`${c.stars} out of 5 stars`}
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
          <SiteLink href={tagHref(c.tag)}>all posts about {c.name} »</SiteLink>
        </section>
      ))}
    </Layout>
  );
}
