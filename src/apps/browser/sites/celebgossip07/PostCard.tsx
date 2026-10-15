// One blog post: title, "posted today", the paparazzi pic, the body, tags and the comments link.
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import type { BlogPost } from '@/content/sites/types';
import { useT } from '@/i18n/useT';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { SiteLink } from '../../SiteLink';
import { postedLabel } from '../daily';
import { useSiteText } from '../useSiteText';
import { rich } from '../rich';
import styles from './CelebGossip.module.css';
import { postHref, tagHref, tagLabel } from './logic';

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
  const { GOSSIP_TEXT: T, GOSSIP_TAG_LABELS } = useSiteText(GOSSIP_HOST);
  const t = useT();
  return (
    <article className={styles.post} aria-label={post.title}>
      <h2 className={styles.postTitle}>
        {full ? (
          post.title
        ) : (
          <SiteLink href={postHref(post.id)}>{post.title}</SiteLink>
        )}
      </h2>
      <p className={styles.meta}>
        {t('sites.celebgossip07.postedBy', {
          owner: T.owner,
          when: postedLabel(post.day, day),
        })}
      </p>
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
        {t('sites.celebgossip07.tags')}{' '}
        {post.tags.map((tag, i) => (
          <span key={tag}>
            {i > 0 && ', '}
            <SiteLink href={tagHref(tag)}>
              {tagLabel(tag, GOSSIP_TAG_LABELS)}
            </SiteLink>
          </span>
        ))}
        {!full && (
          <>
            {' '}
            &middot;{' '}
            <SiteLink href={postHref(post.id)}>
              {t('sites.celebgossip07.comments', { n: post.comments.length })}
            </SiteLink>
          </>
        )}
      </p>
      {full && (
        <section
          aria-label={t('sites.celebgossip07.commentsLabel')}
          className={styles.comments}
        >
          <h3>
            {t('sites.celebgossip07.comments', { n: post.comments.length })}
          </h3>
          <ol>
            {post.comments.map((c, i) => (
              <li key={i}>
                {rich(t('sites.celebgossip07.said', { user: '{user}' }), {
                  user: <b>{c.user}</b>,
                })}
                <p>{c.text}</p>
              </li>
            ))}
          </ol>
          <p className={styles.closed}>{T.commentsClosed}</p>
        </section>
      )}
    </article>
  );
}
