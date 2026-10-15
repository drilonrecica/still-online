// celebgossip07.example `/`: every post out by today, newest first.
import { GOSSIP_HOST } from '@/content/sites/celebgossip07';
import { useSiteText } from '../useSiteText';
import { useWorldStore } from '@/os/world';
import { upToDay } from '../daily';
import { Layout } from './Layout';
import { PostCard } from './PostCard';

export default function Home() {
  const { GOSSIP_POSTS } = useSiteText(GOSSIP_HOST);
  const day = useWorldStore((s) => s.day);
  return (
    <Layout>
      {upToDay(GOSSIP_POSTS, day).map((post) => (
        <PostCard key={post.id} post={post} day={day} />
      ))}
    </Layout>
  );
}
