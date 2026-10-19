// pixlog.example `/`: the login splash and the place where the shouts feed goes (P2-02).
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import { Layout } from './Layout';
import styles from './Pixlog.module.css';

export default function Home() {
  const { PIXLOG_TEXT: T } = useSiteText(PIXLOG_HOST);
  return (
    <Layout>
      <section className={styles.splash}>
        <h1>{T.splashHeading}</h1>
        <p>{T.splashText}</p>
        <p className={styles.loginRow}>
          <SiteLink href="/me" className={styles.button}>
            {T.loginButton}
          </SiteLink>
          <span>{T.loginHint}</span>
        </p>
      </section>
      <section className={styles.box} aria-label={T.feedHeading}>
        <h2>{T.feedHeading}</h2>
        <p>{T.feedPlaceholder}</p>
      </section>
    </Layout>
  );
}
