// celebgossip07.example `/tag?t=`: posts with one tag. Without a tag, the whole cloud.
import { GOSSIP_POSTS, GOSSIP_TEXT as T } from '@/content/sites/celebgossip07';
import type { SitePageProps } from '@/content/sites/types';
import { useWorldStore } from '@/os/world';
import { upToDay } from '../daily';
import styles from './CelebGossip.module.css';
import { Layout } from './Layout';
import { postsWithTag } from './logic';
import { PostCard } from './PostCard';
import { TagCloud } from './TagCloud';

export default function Tag({ query }: SitePageProps) {
  const day = useWorldStore((s) => s.day);
  const posts = upToDay(GOSSIP_POSTS, day);
  const tag = query.get('t')?.trim().toLowerCase() ?? '';
  if (!tag) {
    return (
      <Layout>
        <h2 className={styles.heading}>ALL TAGZ</h2>
        <TagCloud posts={posts} />
      </Layout>
    );
  }
  const tagged = postsWithTag(posts, tag);
  return (
    <Layout>
      <h2 className={styles.heading}>posts tagged &ldquo;{tag}&rdquo;</h2>
      {tagged.length === 0 && <p className={styles.empty}>{T.noTagPosts}</p>}
      {tagged.map((post) => (
        <PostCard key={post.id} post={post} day={day} />
      ))}
    </Layout>
  );
}
