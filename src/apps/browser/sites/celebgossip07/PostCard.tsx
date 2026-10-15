// One blog post: title, "posted today", the paparazzi pic, the body, tags and the comments link.
import type { BlogPost } from '@/content/sites/types';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { SiteLink } from '../../SiteLink';
import { postedLabel } from '../daily';
import styles from './CelebGossip.module.css';
import { postHref, tagHref } from './logic';

export function PostCard({
  post,
  day,
  full = false,
}: {
  post: BlogPost;
  day: number;
  /** On the post page the title isn't a link and the comments show below. */
  full?: boolean;
}) {
  return (
    <article className={styles.post} aria-label={post.title}>
      <h2 className={styles.postTitle}>
        {full ? (
          post.title
        ) : (
          <SiteLink href={postHref(post.id)}>{post.title}</SiteLink>
        )}
      </h2>
      <p className={styles.meta}>posted by Roxi {postedLabel(post.day, day)}</p>
      {post.photo && (
        <figure className={styles.photo}>
          <PhotoCanvas
            photo={post.photo}
            width={200}
            height={150}
            label={post.photo.caption}
          />
          {post.photo.caption && <figcaption>{post.photo.caption}</figcaption>}
        </figure>
      )}
      {post.body.split('\n\n').map((para, i) => (
        <p key={i}>{para}</p>
      ))}
      <p className={styles.tags}>
        tagz:{' '}
        {post.tags.map((tag, i) => (
          <span key={tag}>
            {i > 0 && ', '}
            <SiteLink href={tagHref(tag)}>{tag}</SiteLink>
          </span>
        ))}
        {!full && (
          <>
            {' '}
            &middot;{' '}
            <SiteLink href={postHref(post.id)}>
              {post.comments.length} comments
            </SiteLink>
          </>
        )}
      </p>
      {full && (
        <section aria-label="Comments" className={styles.comments}>
          <h3>{post.comments.length} comments</h3>
          <ol>
            {post.comments.map((c, i) => (
              <li key={i}>
                <b>{c.user}</b> said:
                <p>{c.text}</p>
              </li>
            ))}
          </ol>
          <p className={styles.closed}>
            comments r closed bc of spam (thx a lot hater_patrol)
          </p>
        </section>
      )}
    </article>
  );
}
