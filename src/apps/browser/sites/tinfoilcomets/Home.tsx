// tinfoilcomets.example `/`: marquee news, hamsters, under construction, guestbook + MIDI buttons.
import { TINFOIL_HOST } from '@/content/sites/tinfoilcomets';
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
  const news = TINFOIL_NEWS.filter((n) => n.day <= day)
    .reverse()
    .map((n) => n.text);
  return (
    <Layout>
      <div className={styles.marquee} aria-label="News">
        <span>{news.join('   ★   ')}</span>
      </div>
      <Hamsters />
      <p className={styles.welcome}>{T.welcome}</p>
      <UnderConstruction />
      <table className={styles.box}>
        <tbody>
          <tr>
            <td>
              <b>~*~ WHATS ON MY SITE ~*~</b>
              <ul>
                <li>
                  <SiteLink href="/band">The Band</SiteLink> (members, albums,
                  TOUR DATES!!!)
                </li>
                <li>
                  <SiteLink href="/pics">Pics</SiteLink> (concert pics!!!)
                </li>
                <li>
                  <SiteLink href="/guestbook">Guestbook</SiteLink> (sign it or
                  else)
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
      <p className={styles.center}>
        <SiteLink href="/guestbook" className={styles.bigButton}>
          Sign my GUESTBOOK!!
        </SiteLink>
      </p>
      <MidiButton />
    </Layout>
  );
}
