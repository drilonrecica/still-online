// celebgossip07.example `/post?id=`: one post with its comments. Without an id, the newest post.
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import { useSiteText } from '../useSiteText';
import type { SitePageProps } from '@/content/sites/types';
import { useWorldStore } from '@/os/world';
import { upToDay } from '../daily';
import styles from './CelebGossip.module.css';
import { Layout } from './Layout';
import { PostCard } from './PostCard';

export default function Post({ query }: SitePageProps) {
  const { GOSSIP_POSTS, GOSSIP_TEXT: T } = useSiteText(GOSSIP_HOST);
  const day = useWorldStore((s) => s.day);
  const posts = upToDay(GOSSIP_POSTS, day);
  const id = query.get('id');
  // Future posts stay hidden: an id from a later day reads as "doesn't exist (yet??)".
  const post = id === null ? posts[0] : posts.find((p) => p.id === id);
  return (
    <Layout>
      {post ? (
        <PostCard post={post} day={day} full />
      ) : (
        <p className={styles.empty}>{T.noPostYet}</p>
      )}
    </Layout>
  );
}
