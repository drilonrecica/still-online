// friendspace.example `/<contactId>`: a friend's profile, with the comment wall up to today's day.
// Any other single-segment path lands here too and shows "Lost in orbit!".
import { useGender, usePlayerName } from '@/i18n/settingsText';
import { getProfiles } from '@/content/locale';
import { useLocale, useT } from '@/i18n/useT';
import { FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { useSiteText } from '../useSiteText';
import type { SitePageProps } from '@/content/sites/types';
import { now } from '@/os/clock';
import { useWorldStore } from '@/os/world';
import { SiteLink } from '../../SiteLink';
import { Layout } from './Layout';
import { fillName, profileName, shortDate, visibleComments } from './logic';
import {
  friendName,
  friendPicture,
  topFriendView,
  wallComment,
} from './people';
import { ProfileView } from './ProfileView';
import styles from './Friendspace.module.css';

export default function Profile({ path }: SitePageProps) {
  const { FRIENDSPACE_TEXT: T } = useSiteText(FRIENDSPACE_HOST);
  const locale = useLocale();
  const t = useT();
  const gender = useGender();
  const PROFILES = getProfiles(locale, gender);
  const day = useWorldStore((s) => s.day);
  const playerName = usePlayerName();
  const id = path.slice(1).toLowerCase();
  const profile = PROFILES.find((p) => p.contactId === id);

  if (!profile) {
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

  return (
    <Layout>
      <ProfileView
        name={profileName(id)}
        displayName={friendName(id, locale)}
        headline={profile.headline}
        mood={profile.mood}
        picture={friendPicture(id)}
        lastLogin={shortDate(now())}
        songTrackId={profile.songTrackId}
        aboutMe={fillName(profile.aboutMe, playerName)}
        wantToMeet={profile.wantToMeet}
        interests={profile.interests}
        top8={profile.top8.map((t) => topFriendView(t, playerName, locale))}
        comments={visibleComments(profile.comments, day).map((c) =>
          wallComment(c, playerName, locale),
        )}
        emptyWall={T.emptyWall}
        day={day}
        theme={profile.theme}
      />
    </Layout>
  );
}
