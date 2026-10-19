// kickflipkings.example `/crew`: Kev, Sam, Rico and Dex, each on a sticker-style card.
import { KICKFLIP_HOST } from '@/content/sites/kickflipkings';
import { useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { useSiteText } from '../useSiteText';
import styles from './KickflipKings.module.css';
import { Layout } from './Layout';
import { bestTrickOn } from './logic';

export default function Crew() {
  const { KICKFLIP_CREW, KICKFLIP_TEXT: T } = useSiteText(KICKFLIP_HOST);
  const day = useWorldStore((s) => s.day);
  const t = useT();
  return (
    <Layout>
      <h2 className={styles.heading}>{T.crewHeading}</h2>
      <p>{T.crewIntro}</p>
      <ul className={styles.crew} aria-label={t('sites.kickflipkings.crew')}>
        {KICKFLIP_CREW.map((member) => (
          <li
            key={member.handle}
            className={styles.member}
            aria-label={member.name}
          >
            <span className={styles.badge} aria-hidden="true">
              {member.name.charAt(0)}
            </span>
            <span>
              <b className={styles.cardTitle}>{member.name}</b>{' '}
              <span className={styles.meta}>({member.handle})</span>
              <br />
              <i>{member.role}</i>
              <br />
              <b>{t('sites.kickflipkings.bestTrick')}</b>{' '}
              {bestTrickOn(member, day)}
              <br />
              {member.bio}
            </span>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
