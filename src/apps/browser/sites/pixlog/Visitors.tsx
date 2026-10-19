// "Who visited my profile": the visitor counter and the latest visitors (friends active on Pixlog
// that day plus seeded strangers) with pictures, names and day labels. `/me` uses it (P2-03).
import { getPixlogProfiles, getPixlogStrangers } from '@/content/locale';
import { useGender } from '@/i18n/settingsText';
import { formatNumber } from '@/i18n/format';
import { useLocale, useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { postedLabel } from '../daily';
import { extraColors, profileName } from '../friendspace/logic';
import { friendPicture } from '../friendspace/people';
import { Picture } from '../friendspace/Picture';
import { recentVisitors, visitorCount } from './logic';
import styles from './Pixlog.module.css';

export function VisitorsBox() {
  const t = useT();
  const locale = useLocale();
  const gender = useGender();
  const day = useWorldStore((s) => s.day);
  const list = recentVisitors(
    getPixlogProfiles(locale, gender),
    day,
    getPixlogStrangers(locale, gender),
  );
  return (
    <section
      className={styles.box}
      aria-label={t('sites.pixlog.visitors.title')}
    >
      <h2>{t('sites.pixlog.visitors.title')}</h2>
      <p className={styles.meta}>
        {t('sites.pixlog.visitors.count', {
          n: formatNumber(visitorCount(day), locale),
        })}
      </p>
      {list.length === 0 ? (
        <p>{t('sites.pixlog.visitors.empty')}</p>
      ) : (
        <ul className={styles.visitors}>
          {list.map((v) => {
            const name =
              v.kind === 'friend' ? profileName(v.contactId) : v.name;
            const picture = (
              <Picture
                {...(v.kind === 'friend'
                  ? friendPicture(v.contactId)
                  : { seed: v.name, colors: extraColors(v.name) })}
                label={t('sites.pixlog.visitors.picture', { name })}
                size={56}
              />
            );
            return (
              <li key={`${v.kind}:${name}`}>
                {v.kind === 'friend' ? (
                  <SiteLink href={`/${v.contactId}`}>
                    {picture}
                    <span>{name}</span>
                  </SiteLink>
                ) : (
                  <>
                    {picture}
                    <span>{name}</span>
                  </>
                )}
                <span className={styles.meta}>{postedLabel(v.day, day)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
