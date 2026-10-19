// pixlog.example `/album?id=<albumId>&n=<photo>`: one photo at a time at large size with
// prev/next, its caption and its comments that are out by today.
import { getPixlogProfiles } from '@/content/locale';
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import type { SitePageProps } from '@/content/sites/types';
import { useGender } from '@/i18n/settingsText';
import { interpolate } from '@/i18n/t';
import { useLocale } from '@/i18n/useT';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { postedLabel } from '../daily';
import { profileName } from '../friendspace/logic';
import { useSiteText } from '../useSiteText';
import { Layout } from './Layout';
import {
  albumHref,
  authorName,
  findAlbum,
  photoIndex,
  tabHref,
  visibleThread,
} from './logic';
import styles from './Pixlog.module.css';

export default function Album({ query }: SitePageProps) {
  const { PIXLOG_TEXT: T } = useSiteText(PIXLOG_HOST);
  const locale = useLocale();
  const gender = useGender();
  const day = useWorldStore((s) => s.day);
  const found = findAlbum(
    getPixlogProfiles(locale, gender),
    query.get('id'),
    day,
  );

  if (!found) {
    return (
      <Layout>
        <section className={styles.box}>
          <h2>{T.notFoundTitle}</h2>
          <p>{T.notFoundText}</p>
          <SiteLink href="/">{T.backHome}</SiteLink>
        </section>
      </Layout>
    );
  }

  const { profile, album } = found;
  const owner = profileName(profile.contactId);
  const total = album.photos.length;
  const n = photoIndex(query.get('n'), total);
  const current = album.photos[n - 1];
  const comments = current ? visibleThread(current.comments, day) : [];

  return (
    <Layout skin={profile.skin}>
      <p>
        <SiteLink href={tabHref(profile.contactId, 'photos')}>
          {interpolate(T.albumBack, { name: owner })}
        </SiteLink>
      </p>
      <h1>{album.title}</h1>
      <p className={styles.meta}>
        {interpolate(T.albumBy, { name: owner })} ·{' '}
        {postedLabel(album.day, day)}
      </p>
      {current && (
        <figure className={styles.photo}>
          <PhotoCanvas
            photo={current.photo}
            width={480}
            height={360}
            label={current.photo.caption}
            className={styles.large}
          />
          {current.photo.caption && (
            <figcaption>{current.photo.caption}</figcaption>
          )}
        </figure>
      )}
      <nav className={styles.pager} aria-label={album.title}>
        {n > 1 ? (
          <SiteLink href={albumHref(album.id, n - 1)}>{T.prev}</SiteLink>
        ) : (
          <span className={styles.disabled}>{T.prev}</span>
        )}
        <span>{interpolate(T.photoOf, { n, total })}</span>
        {n < total ? (
          <SiteLink href={albumHref(album.id, n + 1)}>{T.next}</SiteLink>
        ) : (
          <span className={styles.disabled}>{T.next}</span>
        )}
      </nav>
      <section className={styles.box} aria-label={T.commentsHeading}>
        <h2>{T.commentsHeading}</h2>
        {comments.map((c, i) => (
          <div key={i} className={styles.entry}>
            <p className={styles.meta}>
              {interpolate(T.commentFrom, {
                name: authorName(c.from, locale, gender),
                when: postedLabel(c.day, day),
              })}
            </p>
            <p>{c.text}</p>
          </div>
        ))}
        {comments.length === 0 && <p>{T.noComments}</p>}
      </section>
    </Layout>
  );
}
