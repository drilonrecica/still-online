// The tag cloud: every tag on today's posts, bigger when it's used more.
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import type { BlogPost } from '@/content/sites/types';
import { useT } from '@/i18n/useT';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import styles from './CelebGossip.module.css';
import { tagCloud, tagHref } from './logic';

export function TagCloud({ posts }: { posts: readonly BlogPost[] }) {
  const t = useT();
  const { GOSSIP_TAG_LABELS } = useSiteText(GOSSIP_HOST);
  return (
    <p className={styles.cloud}>
      {tagCloud(posts, GOSSIP_TAG_LABELS).map(({ tag, label, count, size }) => (
        <SiteLink
          key={tag}
          href={tagHref(tag)}
          className={styles[`size${size}`]}
          title={t('sites.celebgossip07.tagCount', { n: count })}
        >
          {label}
        </SiteLink>
      ))}
    </p>
  );
}
