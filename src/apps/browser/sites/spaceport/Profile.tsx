// spaceport.example `/<contactId>`: a friend's profile, with the comment wall up to today's day.
// Any other single-segment path lands here too and shows "Lost in orbit!".
import { PROFILES } from '@/content/profiles';
import { SPACEPORT_TEXT as T } from '@/content/sites/spaceport';
import type { SitePageProps } from '@/content/sites/types';
import { now } from '@/os/clock';
import { useSettingsStore } from '@/os/store/settings';
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
import styles from './Spaceport.module.css';

export default function Profile({ path }: SitePageProps) {
  const day = useWorldStore((s) => s.day);
  const playerName = useSettingsStore((s) => s.playerName);
  const id = path.slice(1).toLowerCase();
  const profile = PROFILES.find((p) => p.contactId === id);

  if (!profile) {
    return (
      <Layout>
        <div className={styles.notFound}>
          <h2>{T.notFoundTitle}</h2>
          <p>{T.notFoundText}</p>
          <SiteLink href="/">&laquo; Back to the launch pad</SiteLink>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProfileView
        name={profileName(id)}
        displayName={friendName(id)}
        headline={profile.headline}
        mood={profile.mood}
        picture={friendPicture(id)}
        lastLogin={shortDate(now())}
        songTrackId={profile.songTrackId}
        aboutMe={fillName(profile.aboutMe, playerName)}
        wantToMeet={profile.wantToMeet}
        interests={profile.interests}
        top8={profile.top8.map((t) => topFriendView(t, playerName))}
        comments={visibleComments(profile.comments, day).map((c) =>
          wallComment(c, playerName),
        )}
        emptyWall={T.emptyWall}
        day={day}
        theme={profile.theme}
      />
    </Layout>
  );
}
