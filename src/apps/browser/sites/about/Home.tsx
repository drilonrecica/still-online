// about.example `/`: the welcome page.
import { ABOUT_HOST } from '@/content/sites/about';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import styles from './About.module.css';
import { Layout } from './Layout';

export default function Home() {
  const { ABOUT_TEXT: T } = useSiteText(ABOUT_HOST);
  return (
    <Layout>
      <h2>{T.welcomeTitle}</h2>
      {T.welcome.map((para) => (
        <p key={para}>{para}</p>
      ))}
      <p>
        <SiteLink href="/tips" className={styles.button}>
          {T.tipsLink}
        </SiteLink>
      </p>
    </Layout>
  );
}
