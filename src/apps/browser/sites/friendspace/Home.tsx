// friendspace.example `/`: the launch pad. Sign Up and Log In both just log you in as the player.
import { FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { useLocale } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import type { SitePageProps } from '@/content/sites/types';
import { SiteLink } from '../../SiteLink';
import { Layout } from './Layout';
import { FRIEND_IDS, friendName, friendPicture } from './people';
import { Picture } from './Picture';
import styles from './Friendspace.module.css';

export default function Home({ navigate }: SitePageProps) {
  const { FRIENDSPACE_TEXT: T } = useSiteText(FRIENDSPACE_HOST);
  const locale = useLocale();
  return (
    <Layout>
      <div className={styles.landing}>
        <section className={styles.hero}>
          <h2>{T.tagline}</h2>
          <p>{T.welcome}</p>
          <div className={styles.heroButtons}>
            <button
              type="button"
              className={styles.bigButton}
              onClick={() => navigate('/me')}
            >
              {T.signUp}
            </button>
            <button
              type="button"
              className={styles.bigButton}
              onClick={() => navigate('/me')}
            >
              {T.logIn}
            </button>
          </div>
          <ul className={styles.news}>
            {T.news.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
        <section className={styles.coolPeople} aria-label={T.coolNewPeople}>
          <h3 className={styles.boxTitle}>{T.coolNewPeople}</h3>
          <ul>
            {FRIEND_IDS.map((id) => {
              const pic = friendPicture(id);
              return (
                <li key={id}>
                  <SiteLink href={`/${id}`}>
                    <Picture
                      seed={pic.seed}
                      colors={pic.colors}
                      label=""
                      size={64}
                    />
                    <span>{friendName(id, locale)}</span>
                  </SiteLink>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Layout>
  );
}
