// kickflipkings.example `/`: Kev's news and the shoutbox, everything out by today, newest first.
// The shoutbox is read-only: visitors can't shout (spam bots), like CheatCave's forum.
import { KICKFLIP_HOST } from '@/content/sites/kickflipkings';
import { useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { postedLabel, upToDay } from '../daily';
import { useSiteText } from '../useSiteText';
import styles from './KickflipKings.module.css';
import { Layout } from './Layout';

export default function Home() {
  const {
    KICKFLIP_NEWS,
    KICKFLIP_SHOUTS,
    KICKFLIP_TEXT: T,
  } = useSiteText(KICKFLIP_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  return (
    <Layout>
      <h2 className={styles.heading}>{T.newsHeading}</h2>
      {upToDay(KICKFLIP_NEWS, day).map((post) => (
        <article
          key={post.title}
          className={styles.card}
          aria-label={post.title}
        >
          <h3 className={styles.cardTitle}>{post.title}</h3>
          <p className={styles.meta}>
            {t('sites.kickflipkings.postedBy', {
              author: post.author,
              when: postedLabel(post.day, day),
            })}
          </p>
          <p>{post.body}</p>
        </article>
      ))}
      <h2 className={styles.heading}>{T.shoutboxHeading}</h2>
      <ul
        className={styles.shouts}
        aria-label={t('sites.kickflipkings.shouts')}
      >
        {upToDay(KICKFLIP_SHOUTS, day).map((shout, i) => (
          <li key={i}>
            <b>{shout.user}</b>{' '}
            <span className={styles.meta}>({postedLabel(shout.day, day)})</span>
            : {shout.text}
          </li>
        ))}
      </ul>
      <p className={styles.closed}>{T.shoutboxClosed}</p>
    </Layout>
  );
}
