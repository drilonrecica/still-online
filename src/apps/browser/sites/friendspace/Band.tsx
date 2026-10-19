// friendspace.example `/band/<id>`: a band's profile in its theme: name, genre and hometown card,
// bio, the inline BandPlayer, day-gated upcoming shows and the band blog. Its first song autoplays.
import { getBands } from '@/content/locale';
import { FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import type { SitePageProps } from '@/content/sites/types';
import { useGender } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { now } from '@/os/clock';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import { visibleBandBlog, visibleShows } from './band';
import { BandPlayer } from './BandPlayer';
import { Layout } from './Layout';
import { dayLabel, extraColors, shortDate } from './logic';
import { Picture } from './Picture';
import { Box, themeStyle } from './ProfileView';
import { useProfileAutoplay } from './useProfileAutoplay';
import bandStyles from './Band.module.css';
import styles from './Friendspace.module.css';

export default function Band({ path }: SitePageProps) {
  const { FRIENDSPACE_TEXT: T } = useSiteText(FRIENDSPACE_HOST);
  const t = useT();
  const locale = useLocale();
  const gender = useGender();
  const day = useWorldStore((s) => s.day);
  const id = path.replace(/^\/band\//, '').toLowerCase();
  const band = getBands(locale, gender).find((b) => b.id === id);
  useProfileAutoplay(band?.trackIds[0], path);

  if (!band) {
    return (
      <Layout>
        <div className={styles.notFound}>
          <h2>{T.notFoundTitle}</h2>
          <p>{T.notFoundText}</p>
          <SiteLink href="/">{t('sites.friendspace.backToLaunchPad')}</SiteLink>
        </div>
      </Layout>
    );
  }

  const shows = visibleShows(band, day);
  const blog = visibleBandBlog(band, day);
  const seed = `band:${band.id}`;
  return (
    <Layout>
      <div
        className={`${styles.profile} ${band.theme.glitter ? styles.glitter : ''}`}
        style={themeStyle(band.theme)}
        data-testid="band"
      >
        <div className={styles.columns}>
          <div className={styles.left}>
            <h2 className={styles.displayName}>{band.name}</h2>
            <div className={styles.idCard}>
              <Picture
                seed={seed}
                colors={extraColors(seed)}
                label={t('sites.friendspace.picture', { name: band.name })}
              />
              <div>
                <dl className={bandStyles.facts}>
                  <dt>{t('sites.friendspace.band.genre')}</dt>
                  <dd>{band.genre}</dd>
                  <dt>{t('sites.friendspace.band.hometown')}</dt>
                  <dd>{band.hometown}</dd>
                </dl>
                <p className={styles.lastLogin}>
                  {t('sites.friendspace.lastLogin', { date: shortDate(now()) })}
                </p>
              </div>
            </div>
            <Box title={t('sites.friendspace.band.shows')}>
              {shows.length === 0 ? (
                <p className={styles.prose}>
                  {t('sites.friendspace.band.noShows')}
                </p>
              ) : (
                <ul className={bandStyles.list}>
                  {shows.map((s, i) => (
                    <li key={i}>{s.text}</li>
                  ))}
                </ul>
              )}
            </Box>
          </div>
          <div className={styles.right}>
            <BandPlayer name={band.name} trackIds={band.trackIds} />
            <Box title={t('sites.friendspace.band.about', { name: band.name })}>
              <p className={styles.prose}>{band.bio}</p>
            </Box>
            <Box title={t('sites.friendspace.band.blog', { name: band.name })}>
              {blog.length === 0 ? (
                <p className={styles.prose}>
                  {t('sites.friendspace.band.noBlog')}
                </p>
              ) : (
                blog.map((b, i) => (
                  <article key={i} className={bandStyles.blogEntry}>
                    <h4 className={styles.subTitle}>{b.title}</h4>
                    <span className={bandStyles.blogDate}>
                      {dayLabel(b.day, day)}
                    </span>
                    <p className={styles.prose}>{b.body}</p>
                  </article>
                ))
              )}
            </Box>
          </div>
        </div>
      </div>
    </Layout>
  );
}
