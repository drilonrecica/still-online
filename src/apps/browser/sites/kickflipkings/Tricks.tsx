// kickflipkings.example `/tricks`: ollie → pop shove-it → kickflip, step by step. From day 4 Dex's
// "how i landed it" story sits under the kickflip.
import { KICKFLIP_HOST } from '@/content/sites/kickflipkings';
import { useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { useSiteText } from '../useSiteText';
import styles from './KickflipKings.module.css';
import { Layout } from './Layout';

export default function Tricks() {
  const {
    DEX_STORY,
    KICKFLIP_TEXT: T,
    KICKFLIP_TRICKS,
  } = useSiteText(KICKFLIP_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  return (
    <Layout>
      <h2 className={styles.heading}>{T.tricksHeading}</h2>
      <p>{T.tricksIntro}</p>
      {KICKFLIP_TRICKS.map((trick) => (
        <article key={trick.id} className={styles.card} aria-label={trick.name}>
          <h3 className={styles.cardTitle}>{trick.name}</h3>
          <p className={styles.meta}>{trick.level}</p>
          <ol
            className={styles.steps}
            aria-label={t('sites.kickflipkings.steps', { trick: trick.name })}
          >
            {trick.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p className={styles.tip}>
            <b>{t('sites.kickflipkings.tip')}</b> {trick.tip}
          </p>
        </article>
      ))}
      <section className={styles.story} aria-label={T.dexStoryHeading}>
        <h3 className={styles.cardTitle}>{T.dexStoryHeading}</h3>
        {day >= DEX_STORY.day ? (
          DEX_STORY.lines.map((line) => <p key={line}>{line}</p>)
        ) : (
          <p className={styles.closed}>{T.dexStoryLater}</p>
        )}
      </section>
    </Layout>
  );
}
