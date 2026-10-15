// tinfoilcomets.example `/`: marquee news, hamsters, under construction, guestbook + MIDI buttons.
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
import { useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { Hamsters } from './Hamsters';
import { Layout } from './Layout';
import { MidiButton } from './MidiButton';
import styles from './TinfoilComets.module.css';
import { UnderConstruction } from './UnderConstruction';

export default function Home() {
  const { TINFOIL_NEWS, TINFOIL_SITE_TEXT: T } = useSiteText(TINFOIL_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  const news = TINFOIL_NEWS.filter((n) => n.day <= day)
    .reverse()
    .map((n) => n.text);
  return (
    <Layout>
      <div
        className={styles.marquee}
        aria-label={t('sites.tinfoilcomets.news')}
      >
        <span>{news.join('   ★   ')}</span>
      </div>
      <Hamsters />
      <p className={styles.welcome}>{T.welcome}</p>
      <UnderConstruction />
      <table className={styles.box}>
        <tbody>
          <tr>
            <td>
              <b>{t('sites.tinfoilcomets.whatsOn')}</b>
              <ul>
                <li>
                  <SiteLink href="/band">
                    {t('sites.tinfoilcomets.nav.band')}
                  </SiteLink>{' '}
                  {t('sites.tinfoilcomets.whatsOnBand')}
                </li>
                <li>
                  <SiteLink href="/pics">
                    {t('sites.tinfoilcomets.nav.pics')}
                  </SiteLink>{' '}
                  {t('sites.tinfoilcomets.whatsOnPics')}
                </li>
                <li>
                  <SiteLink href="/guestbook">
                    {t('sites.tinfoilcomets.nav.guestbook')}
                  </SiteLink>{' '}
                  {t('sites.tinfoilcomets.whatsOnGuestbook')}
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
      <p className={styles.center}>
        <SiteLink href="/guestbook" className={styles.bigButton}>
          {t('sites.tinfoilcomets.signButton')}
        </SiteLink>
      </p>
      <MidiButton />
    </Layout>
  );
}
