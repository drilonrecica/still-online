// The tag cloud: every tag on today's posts, bigger when it's used more.
import type { BlogPost } from '@/content/sites/types';
import { useT } from '@/i18n/useT';
import { SiteLink } from '../../SiteLink';
import styles from './CelebGossip.module.css';
import { tagCloud, tagHref } from './logic';

export function TagCloud({ posts }: { posts: readonly BlogPost[] }) {
  const t = useT();
  return (
    <p className={styles.cloud}>
      {tagCloud(posts).map(({ tag, count, size }) => (
        <SiteLink
          key={tag}
          href={tagHref(tag)}
          className={styles[`size${size}`]}
          title={t('sites.celebgossip07.tagCount', { n: count })}
        >
          {tag}
        </SiteLink>
      ))}
    </p>
  );
}
