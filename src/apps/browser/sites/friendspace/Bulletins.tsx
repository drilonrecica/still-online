// friendspace.example `/bulletins`: day-gated bulletins from friends and Top 8 extras. Opening the
// page marks today's bulletins as seen (clears the nav dot until a later day).
import { useEffect } from 'react';
import { getBulletins } from '@/content/locale';
import type { Bulletin } from '@/content/friendspace/types';
import { useGender, usePlayerName } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { useWebStore } from '../../store';
import { postedLabel } from '../daily';
import { rich } from '../rich';
import { Layout } from './Layout';
import { extraColors, fillName, visibleBulletins } from './logic';
import { friendName, friendPicture } from './people';
import { Picture } from './Picture';
import styles from './Friendspace.module.css';

function Sender({ from }: { from: Bulletin['from'] }) {
  const t = useT();
  const locale = useLocale();
  if ('contactId' in from) {
    const pic = friendPicture(from.contactId);
    const name = friendName(from.contactId, locale);
    return (
      <>
        <SiteLink
          href={`/${from.contactId}`}
          className={styles.bulletinPicture}
        >
          <Picture
            seed={pic.seed}
            colors={pic.colors}
            label={t('sites.friendspace.bulletins.senderPicture', { name })}
            size={48}
          />
        </SiteLink>
        <SiteLink href={`/${from.contactId}`}>{name}</SiteLink>
      </>
    );
  }
  return (
    <>
      <span className={styles.bulletinPicture}>
        <Picture
          seed={from.seed}
          colors={extraColors(from.seed)}
          label={t('sites.friendspace.bulletins.senderPicture', {
            name: from.extra,
          })}
          size={48}
        />
      </span>
      <span>{from.extra}</span>
    </>
  );
}

/** The bulletins out by today, newest first; `limit` keeps the newest few (the `/me` box). */
export function BulletinList({ limit }: { limit?: number }) {
  const t = useT();
  const locale = useLocale();
  const gender = useGender();
  const day = useWorldStore((s) => s.day);
  const playerName = usePlayerName();
  const all = visibleBulletins(getBulletins(locale, gender), day);
  const shown = limit === undefined ? all : all.slice(0, limit);
  if (shown.length === 0)
    return (
      <p className={styles.prose}>{t('sites.friendspace.bulletins.empty')}</p>
    );
  return (
    <ul className={styles.bulletinList}>
      {shown.map((b) => (
        <li key={b.id} className={styles.bulletin} data-testid="bulletin">
          <div className={styles.bulletinText}>
            <div className={styles.bulletinMeta}>
              {t('sites.friendspace.bulletins.from')} <Sender from={b.from} />
              {' · '}
              {t('sites.friendspace.bulletins.posted', {
                when: postedLabel(b.day, day),
              })}
            </div>
            <div className={styles.bulletinSubject}>
              {t('sites.friendspace.bulletins.subject')} {b.subject}
            </div>
            <p className={styles.bulletinBody}>
              {rich(fillName(b.body, playerName), {})}
            </p>
            {b.link ? <SiteLink href={b.link}>{b.link}</SiteLink> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Bulletins() {
  const t = useT();
  const day = useWorldStore((s) => s.day);
  const markSeen = useWebStore((s) => s.markBulletinsSeen);
  useEffect(() => {
    markSeen(day);
  }, [day, markSeen]);
  return (
    <Layout>
      <section className={styles.box}>
        <h2 className={styles.boxTitle}>
          {t('sites.friendspace.bulletins.title')}
        </h2>
        <div className={styles.boxBody}>
          <BulletinList />
        </div>
      </section>
    </Layout>
  );
}
