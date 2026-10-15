// One announcement on the news board.
import type { NewsPost } from '@/content/sites/types';
import { useT } from '@/i18n/useT';
import { postedLabel } from '../daily';
import styles from './Westfield.module.css';

export function NewsItem({ post, day }: { post: NewsPost; day: number }) {
  const t = useT();
  return (
    <article className={styles.news} aria-label={post.title}>
      <h3>{post.title}</h3>
      <p className={styles.byline}>
        {t('sites.westfieldhigh.posted', {
          when: postedLabel(post.day, day),
          author: post.author,
        })}
      </p>
      <p>{post.body}</p>
    </article>
  );
}
