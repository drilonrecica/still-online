// westfield-high.example `/`: the welcome, the principal's note and the three newest announcements.
import {
  WESTFIELD_NEWS,
  WESTFIELD_TEXT as T,
} from '@/content/sites/westfieldhigh';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { upToDay } from '../daily';
import { Layout } from './Layout';
import { NewsItem } from './NewsItem';
import styles from './Westfield.module.css';

const LATEST = 3;

export default function Home() {
  const day = useWorldStore((s) => s.day);
  const news = upToDay(WESTFIELD_NEWS, day);
  return (
    <Layout>
      <h2 className={styles.heading}>{T.welcomeTitle}</h2>
      <p>{T.welcome}</p>
      <p className={styles.principal}>{T.principalNote}</p>
      <h2 className={styles.heading}>Latest Announcements</h2>
      {news.length === 0 && <p>{T.noNews}</p>}
      {news.slice(0, LATEST).map((post) => (
        <NewsItem key={post.title} post={post} day={day} />
      ))}
      {news.length > LATEST && (
        <p>
          <SiteLink href="/news">More news and announcements...</SiteLink>
        </p>
      )}
    </Layout>
  );
}
