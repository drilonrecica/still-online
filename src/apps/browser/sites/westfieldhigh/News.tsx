// westfield-high.example `/news`: the whole news board, newest first.
import {
  WESTFIELD_NEWS,
  WESTFIELD_TEXT as T,
} from '@/content/sites/westfieldhigh';
import { useWorldStore } from '@/os/world';
import { upToDay } from '../daily';
import { Layout } from './Layout';
import { NewsItem } from './NewsItem';
import styles from './Westfield.module.css';

export default function News() {
  const day = useWorldStore((s) => s.day);
  const news = upToDay(WESTFIELD_NEWS, day);
  return (
    <Layout>
      <h2 className={styles.heading}>News and Announcements</h2>
      <p>{T.newsIntro}</p>
      {news.length === 0 && <p>{T.noNews}</p>}
      {news.map((post) => (
        <NewsItem key={post.title} post={post} day={day} />
      ))}
    </Layout>
  );
}
