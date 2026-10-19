// The shouts feed on pixlog.example `/`: friends' shouts plus generated "new album" and "new blog
// post" lines (worded by the catalog, so they follow the language), newest first.
import { getPixlogProfiles } from '@/content/locale';
import { useGender } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { postedLabel } from '../daily';
import { profileName } from '../friendspace/logic';
import { friendPicture } from '../friendspace/people';
import { Picture } from '../friendspace/Picture';
import { albumHref, shoutsFeed, tabHref, type FeedItem } from './logic';
import styles from './Pixlog.module.css';

/** How many feed lines the home page shows. */
export const FEED_LIMIT = 20;

function Line({ item }: { item: FeedItem }) {
  const t = useT();
  const name = profileName(item.contactId);
  if (item.kind === 'shout')
    return (
      <>
        <strong>{t('sites.pixlog.feed.shout', { name })}</strong> {item.text}
      </>
    );
  if (item.kind === 'album')
    return (
      <SiteLink href={albumHref(item.albumId)}>
        {t('sites.pixlog.feed.album', {
          name,
          n: item.count,
          title: item.title,
        })}
      </SiteLink>
    );
  return (
    <SiteLink href={tabHref(item.contactId, 'blog')}>
      {t('sites.pixlog.feed.blog', { name, title: item.title })}
    </SiteLink>
  );
}

export function Feed() {
  const t = useT();
  const locale = useLocale();
  const gender = useGender();
  const day = useWorldStore((s) => s.day);
  const items = shoutsFeed(getPixlogProfiles(locale, gender), day).slice(
    0,
    FEED_LIMIT,
  );
  if (items.length === 0) return <p>{t('sites.pixlog.feed.empty')}</p>;
  return (
    <ul className={styles.feed}>
      {items.map((item, i) => {
        const name = profileName(item.contactId);
        return (
          <li key={i} className={styles.feedItem}>
            <SiteLink href={`/${item.contactId}`}>
              <Picture
                {...friendPicture(item.contactId)}
                label={t('sites.pixlog.feed.picture', { name })}
                size={40}
              />
            </SiteLink>
            <div>
              <p>
                <Line item={item} />
              </p>
              <p className={styles.meta}>{postedLabel(item.day, day)}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
