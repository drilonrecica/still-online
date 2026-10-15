// One announcement on the news board.
import type { NewsPost } from '@/content/sites/types';
import { postedLabel } from '../daily';
import styles from './Westfield.module.css';

export function NewsItem({ post, day }: { post: NewsPost; day: number }) {
  return (
    <article className={styles.news} aria-label={post.title}>
      <h3>{post.title}</h3>
      <p className={styles.byline}>
        Posted {postedLabel(post.day, day)} by {post.author}
      </p>
      <p>{post.body}</p>
    </article>
  );
}
