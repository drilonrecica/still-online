// pixlog.example `/<friend>`: a friend's page with tabs (`?tab=`). Any other single-segment path
// lands here too and shows "Page not found".
import { getPixlogProfiles, getSurveys } from '@/content/locale';
import type { PixlogProfile } from '@/content/pixlog/types';
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import type { SitePageProps } from '@/content/sites/types';
import type { ContactId } from '@/content/types';
import { useGender } from '@/i18n/settingsText';
import { interpolate } from '@/i18n/t';
import { useLocale } from '@/i18n/useT';
import { PhotoCanvas } from '@/os/fs/FsIcon';
import { useWorldStore } from '@/os/world';
import { useWebStore } from '../../store';
import { SiteLink } from '../../SiteLink';
import { postedLabel, upToDay } from '../daily';
import { profileName } from '../friendspace/logic';
import { friendPicture } from '../friendspace/people';
import { Picture } from '../friendspace/Picture';
import { useSiteText } from '../useSiteText';
import { Layout } from './Layout';
import {
  PIXLOG_TABS,
  albumHref,
  authorName,
  friendKudos,
  profileAt,
  tabFrom,
  tabHref,
  visibleAlbums,
} from './logic';
import styles from './Pixlog.module.css';

type Text = ReturnType<typeof useSiteText<typeof PIXLOG_HOST>>['PIXLOG_TEXT'];

const countLabel = (T: Text, n: number) =>
  n === 1 ? T.photosOne : interpolate(T.photosMany, { n });

/** The friend's kudos total and the once-a-day "Give kudos ★" button. */
function Kudos({ id, day, T }: { id: ContactId; day: number; T: Text }) {
  const given = useWebStore((s) => s.pixlog?.kudosGiven[id]) ?? NONE;
  const giveKudos = useWebStore((s) => s.giveKudos);
  const done = given.includes(day);
  return (
    <p className={styles.kudos}>
      <span>
        {interpolate(T.kudos.count, { n: friendKudos(id, day, given) })}
      </span>
      <button type="button" disabled={done} onClick={() => giveKudos(id, day)}>
        {done ? T.kudos.given : T.kudos.give}
      </button>
    </p>
  );
}

const NONE: readonly number[] = [];

function Albums({
  profile,
  day,
  T,
  limit,
}: {
  profile: PixlogProfile;
  day: number;
  T: Text;
  limit?: number;
}) {
  const albums = visibleAlbums(profile, day).slice(0, limit);
  if (albums.length === 0) return <p>{T.noAlbums}</p>;
  return (
    <ul className={styles.albums}>
      {albums.map((album) => (
        <li key={album.id}>
          <SiteLink href={albumHref(album.id)} className={styles.albumLink}>
            {album.photos[0] && (
              <PhotoCanvas
                photo={album.photos[0].photo}
                width={120}
                height={120}
                className={styles.thumb}
              />
            )}
            <strong>{album.title}</strong>
          </SiteLink>
          <span className={styles.meta}>
            {countLabel(T, album.photos.length)} · {postedLabel(album.day, day)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function Friend({ path, query }: SitePageProps) {
  const { PIXLOG_TEXT: T } = useSiteText(PIXLOG_HOST);
  const locale = useLocale();
  const gender = useGender();
  const day = useWorldStore((s) => s.day);
  const profile = profileAt(getPixlogProfiles(locale, gender), path);

  if (!profile) {
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

  const id = profile.contactId;
  const name = profileName(id);
  const tab = tabFrom(query.get('tab'));
  const survey = getSurveys(locale, gender).find(
    (s) => s.id === profile.survey.surveyId,
  );

  return (
    <Layout skin={profile.skin}>
      <div className={styles.head}>
        <Picture
          {...friendPicture(id)}
          label={interpolate(T.pictureLabel, { name })}
          size={96}
        />
        <div>
          <h1>{name}</h1>
          <p className={styles.meta}>
            {interpolate(T.skinLabel, { skin: T.skins[profile.skin] })}
          </p>
          <Kudos id={id} day={day} T={T} />
        </div>
      </div>
      <nav className={styles.tabs} aria-label={T.tabsLabel}>
        {PIXLOG_TABS.map((t) => (
          <SiteLink
            key={t}
            href={tabHref(id, t)}
            className={t === tab ? styles.tabActive : styles.tab}
            aria-current={t === tab ? 'page' : undefined}
          >
            {T.tabs[t]}
          </SiteLink>
        ))}
      </nav>
      <section className={styles.panel} aria-label={T.tabs[tab]}>
        {tab === 'profile' && (
          <>
            <div className={styles.box}>
              <h2>{T.aboutHeading}</h2>
              <p>{profile.about}</p>
            </div>
            <div className={styles.box}>
              <h2>{T.latestAlbumsHeading}</h2>
              <Albums profile={profile} day={day} T={T} limit={3} />
            </div>
          </>
        )}
        {tab === 'photos' && (
          <div className={styles.box}>
            <h2>{T.albumsHeading}</h2>
            <Albums profile={profile} day={day} T={T} />
          </div>
        )}
        {tab === 'blog' && (
          <div className={styles.box}>
            <h2>{T.blogHeading}</h2>
            {upToDay(profile.blog, day).map((post) => (
              <article key={post.id} className={styles.entry}>
                <h3>{post.title}</h3>
                <p className={styles.meta}>
                  {interpolate(T.postedWhen, {
                    when: postedLabel(post.day, day),
                  })}
                </p>
                {post.body.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </article>
            ))}
            {upToDay(profile.blog, day).length === 0 && <p>{T.noBlog}</p>}
          </div>
        )}
        {tab === 'surveys' && (
          <div className={styles.box}>
            <h2>{T.surveysHeading}</h2>
            {survey ? (
              <>
                <p className={styles.meta}>
                  {interpolate(T.surveyBy, { name, title: survey.title })}
                </p>
                <dl className={styles.survey}>
                  {survey.questions.map((q, i) => (
                    <div key={q}>
                      <dt>{q}</dt>
                      <dd>{profile.survey.answers[i]}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <p>{T.noSurveys}</p>
            )}
          </div>
        )}
        {tab === 'guestbook' && (
          <div className={styles.box}>
            <h2>{T.guestbookHeading}</h2>
            {upToDay(profile.guestbook, day).map((entry, i) => (
              <div key={i} className={styles.entry}>
                <p className={styles.meta}>
                  {interpolate(T.guestbookFrom, {
                    name: authorName(entry.from, locale, gender),
                    when: postedLabel(entry.day, day),
                  })}
                </p>
                <p>{entry.text}</p>
              </div>
            ))}
            {upToDay(profile.guestbook, day).length === 0 && (
              <p>{T.noGuestbook}</p>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
}
