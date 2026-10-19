// cheatcave.example `/`: CaveKing's news feed, every post out by today, newest first.
import { CHEATCAVE_HOST } from '@/content/sites/cheatcave';
import { useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { postedLabel, upToDay } from '../daily';
import { useSiteText } from '../useSiteText';
import styles from './CheatCave.module.css';
import { Layout } from './Layout';

export default function Home() {
  const { CHEATCAVE_NEWS, CHEATCAVE_TEXT: T } = useSiteText(CHEATCAVE_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  return (
    <Layout>
      <h2 className={styles.heading}>{T.newsHeading}</h2>
      {upToDay(CHEATCAVE_NEWS, day).map((post) => (
        <article
          key={post.title}
          className={styles.card}
          aria-label={post.title}
        >
          <h3 className={styles.cardTitle}>{post.title}</h3>
          <p className={styles.meta}>
            {t('sites.cheatcave.postedBy', {
              author: post.author,
              when: postedLabel(post.day, day),
            })}
          </p>
          <p>{post.body}</p>
        </article>
      ))}
    </Layout>
  );
}
