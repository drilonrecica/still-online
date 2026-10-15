// about.example `/`: the welcome page.
import { SiteLink } from '../../SiteLink';
import styles from './About.module.css';
import { Layout } from './Layout';

export default function Home() {
  return (
    <Layout>
      <h2>Welcome to Web Explorer!</h2>
      <p>
        Congratulations, you are on the Internet! Type an address in the Address
        bar and press Enter, or pick one of the cool sites on the left.
      </p>
      <p>
        Lost? The Back button takes you to the page you were just on, and Home
        brings you back to your homepage.
      </p>
      <p>
        <SiteLink href="/tips" className={styles.button}>
          Surfing Tips &raquo;
        </SiteLink>
      </p>
    </Layout>
  );
}
