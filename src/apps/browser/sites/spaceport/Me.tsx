// spaceport.example `/me`: the player's own profile, editable (persisted in `web.myProfile`).
// Friends comment on it on days 2–5.
import { usePlayerName } from '@/i18n/settingsText';
import { useState } from 'react';
import { getProfiles } from '@/content/locale';
import { useLocale } from '@/i18n/useT';
import { SPACEPORT_HOST } from '@/content/sites/spaceport';
import { useSiteText } from '../useSiteText';
import { now } from '@/os/clock';
import { useWorldStore } from '@/os/world';
import { useWebStore } from '../../store';
import { Layout } from './Layout';
import { effectiveProfile, playerTheme, playerWall, shortDate } from './logic';
import {
  FRIEND_IDS,
  playerPicture,
  topFriendView,
  wallComment,
} from './people';
import { ProfileEditor } from './ProfileEditor';
import { ProfileView } from './ProfileView';
import styles from './Spaceport.module.css';

export default function Me() {
  const { SPACEPORT_TEXT: T } = useSiteText(SPACEPORT_HOST);
  const locale = useLocale();
  const PROFILES = getProfiles(locale);
  const day = useWorldStore((s) => s.day);
  const playerName = usePlayerName();
  const saved = useWebStore((s) => s.myProfile);
  const save = useWebStore((s) => s.saveProfile);
  const [editing, setEditing] = useState(false);
  const profile = effectiveProfile(saved, FRIEND_IDS, locale);

  if (editing) {
    return (
      <Layout>
        <ProfileEditor
          initial={profile}
          onSave={(p) => {
            save(p);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <p className={styles.loggedIn}>
        Hello, <b>{playerName}</b>! You are logged in.
      </p>
      <ProfileView
        name={playerName}
        displayName={playerName}
        headline={profile.headline}
        mood={profile.mood}
        picture={playerPicture(playerName)}
        lastLogin={shortDate(now())}
        songTrackId={profile.songTrackId}
        aboutMe={profile.aboutMe}
        top8={profile.top8.map((id) =>
          topFriendView({ kind: 'contact', id }, playerName, locale),
        )}
        comments={playerWall(PROFILES, day).map((c) =>
          wallComment(c, playerName, locale),
        )}
        emptyWall={T.myEmptyWall}
        day={day}
        theme={playerTheme(profile)}
        actions={
          <button
            type="button"
            className={styles.bigButton}
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        }
      />
    </Layout>
  );
}
