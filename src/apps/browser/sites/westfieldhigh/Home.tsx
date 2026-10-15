// westfield-high.example `/`: the welcome, the principal's note and the three newest announcements.
import { WESTFIELD_HOST } from '@/content/sites/westfieldhigh';
import { useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { upToDay } from '../daily';
import { Layout } from './Layout';
import { NewsItem } from './NewsItem';
import styles from './Westfield.module.css';

const LATEST = 3;

export default function Home() {
  const { WESTFIELD_NEWS, WESTFIELD_TEXT: T } = useSiteText(WESTFIELD_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  const news = upToDay(WESTFIELD_NEWS, day);
  return (
    <Layout>
      <h2 className={styles.heading}>{T.welcomeTitle}</h2>
      <p>{T.welcome}</p>
      <p className={styles.principal}>{T.principalNote}</p>
      <h2 className={styles.heading}>{t('sites.westfieldhigh.latest')}</h2>
      {news.length === 0 && <p>{T.noNews}</p>}
      {news.slice(0, LATEST).map((post) => (
        <NewsItem key={post.title} post={post} day={day} />
      ))}
      {news.length > LATEST && (
        <p>
          <SiteLink href="/news">{t('sites.westfieldhigh.moreNews')}</SiteLink>
        </p>
      )}
    </Layout>
  );
}
