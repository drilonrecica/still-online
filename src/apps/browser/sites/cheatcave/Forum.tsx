// cheatcave.example `/forum` (thread list) and `/forum?t=` (one thread). Read-only: sign-ups are
// "closed", so the player never posts. Threads and replies are day-gated; a later thread's id
// reads as missing.
import { CHEATCAVE_HOST } from '@/content/sites/cheatcave';
import type { SitePageProps } from '@/content/sites/types';
import { useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { postedLabel } from '../daily';
import { rich } from '../rich';
import { useSiteText } from '../useSiteText';
import styles from './CheatCave.module.css';
import { Layout } from './Layout';
import { threadHref, visibleThreads } from './logic';

export default function Forum({ query }: SitePageProps) {
  const { CHEATCAVE_THREADS, CHEATCAVE_TEXT: T } = useSiteText(CHEATCAVE_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  const threads = visibleThreads(CHEATCAVE_THREADS, day);
  const id = query.get('t');
  const shown = id === null ? null : threads.find((s) => s.thread.id === id);
  return (
    <Layout>
      <h2 className={styles.heading}>{T.forumHeading}</h2>
      {id === null ? (
        <>
          <p>{T.forumIntro}</p>
          <ul
            className={styles.threads}
            aria-label={t('sites.cheatcave.threads')}
          >
            {threads.map(({ thread, posts, lastDay }) => (
              <li key={thread.id}>
                <SiteLink href={threadHref(thread.id)}>{thread.title}</SiteLink>
                <br />
                <span className={styles.meta}>
                  {t('sites.cheatcave.board', { board: thread.board })} ·{' '}
                  {t('sites.cheatcave.startedBy', {
                    user: posts[0]?.user ?? '',
                  })}{' '}
                  · {t('sites.cheatcave.replies', { n: posts.length - 1 })} ·{' '}
                  {t('sites.cheatcave.lastPost', {
                    when: postedLabel(lastDay, day),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : shown ? (
        <article className={styles.card} aria-label={shown.thread.title}>
          <h3 className={styles.cardTitle}>{shown.thread.title}</h3>
          <p className={styles.meta}>
            {t('sites.cheatcave.board', { board: shown.thread.board })}
          </p>
          <ol className={styles.posts} aria-label={t('sites.cheatcave.posts')}>
            {shown.posts.map((post, i) => (
              <li key={i}>
                <p className={styles.meta}>
                  {rich(
                    t('sites.cheatcave.wrote', {
                      user: '{user}',
                      when: postedLabel(post.day, day),
                    }),
                    { user: <b>{post.user}</b> },
                  )}
                </p>
                <p>{post.text}</p>
              </li>
            ))}
          </ol>
          <p>
            <SiteLink href="/forum">{T.backToForum}</SiteLink>
          </p>
        </article>
      ) : (
        <p className={styles.empty}>
          {T.noThread} <SiteLink href="/forum">{T.backToForum}</SiteLink>
        </p>
      )}
      <p className={styles.closed}>{T.forumClosed}</p>
    </Layout>
  );
}
