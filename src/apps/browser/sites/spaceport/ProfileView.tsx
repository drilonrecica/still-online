// The profile layout shared by friends' pages and the player's `/me`: themed header, picture,
// mood, song strip, about me, interests, Top 8 and the comment wall.
import type { CSSProperties, ReactNode } from 'react';
import type { ProfileTheme } from '@/content/profiles/types';
import { useT } from '@/i18n/useT';
import { SiteLink } from '../../SiteLink';
import { Mood } from './Mood';
import { Picture } from './Picture';
import { rich } from '../rich';
import { SongStrip } from './SongStrip';
import { dayLabel } from './logic';
import styles from './Spaceport.module.css';

export interface PictureSpec {
  seed: string;
  colors: readonly [string, string];
}

export interface TopFriendView {
  key: string;
  label: string;
  picture: PictureSpec;
  href?: string;
}

export interface WallComment {
  day: number;
  from: string;
  picture: PictureSpec;
  href?: string;
  text: string;
}

export interface ProfileViewProps {
  name: string;
  displayName: string;
  headline: string;
  mood: { text: string; emoticon: string };
  picture: PictureSpec;
  lastLogin: string;
  songTrackId: string | null;
  aboutMe: string;
  wantToMeet?: string;
  interests?: readonly { label: string; text: string }[];
  top8: readonly TopFriendView[];
  comments: readonly WallComment[];
  emptyWall: string;
  day: number;
  theme: ProfileTheme;
  /** Extra controls under the picture (the player's "Edit Profile"). */
  actions?: ReactNode;
}

function Box({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className={styles.box} aria-label={title}>
      <h3 className={styles.boxTitle}>{title}</h3>
      <div className={styles.boxBody}>{children}</div>
    </section>
  );
}

export function ProfileView(p: ProfileViewProps) {
  const t = useT();
  const style = {
    background: p.theme.background,
    color: p.theme.text,
    fontFamily: p.theme.font,
    '--sp-accent': p.theme.accent,
    '--sp-panel': p.theme.panel ?? 'rgba(255, 255, 255, 0.88)',
  } as CSSProperties;
  return (
    <div
      className={`${styles.profile} ${p.theme.glitter ? styles.glitter : ''}`}
      style={style}
      data-testid="profile"
    >
      {p.theme.stickers && (
        <div className={styles.stickers} aria-hidden>
          {p.theme.stickers.map((s, i) => (
            <span key={s} className={styles.sticker} data-n={i % 4}>
              {s}
            </span>
          ))}
        </div>
      )}
      <div className={styles.columns}>
        <div className={styles.left}>
          <h2 className={styles.displayName}>{p.displayName}</h2>
          <div className={styles.idCard}>
            <Picture
              seed={p.picture.seed}
              colors={p.picture.colors}
              label={t('sites.spaceport.picture', { name: p.name })}
            />
            <div>
              <p className={styles.headline}>
                {t('sites.spaceport.headlineQuoted', { headline: p.headline })}
              </p>
              <Mood text={p.mood.text} emoticon={p.mood.emoticon} />
              <p className={styles.lastLogin}>
                {t('sites.spaceport.lastLogin', { date: p.lastLogin })}
              </p>
            </div>
          </div>
          {p.actions}
          <SongStrip key={p.songTrackId ?? ''} trackId={p.songTrackId} />
          {p.interests && p.interests.length > 0 && (
            <Box title={t('sites.spaceport.interests', { name: p.name })}>
              <table className={styles.interests}>
                <tbody>
                  {p.interests.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.text}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </div>
        <div className={styles.right}>
          <Box title={t('sites.spaceport.aboutMe')}>
            <p className={styles.prose}>{p.aboutMe}</p>
            {p.wantToMeet && (
              <>
                <h4 className={styles.subTitle}>
                  {t('sites.spaceport.wantToMeet')}
                </h4>
                <p className={styles.prose}>{p.wantToMeet}</p>
              </>
            )}
          </Box>
          <Box title={t('sites.spaceport.friendSpace', { name: p.name })}>
            <p>
              {rich(
                t('sites.spaceport.top8Count', { name: p.name, n: '{n}' }),
                { n: <b>{p.top8.length}</b> },
              )}
            </p>
            <ol className={styles.top8} aria-label={t('sites.spaceport.top8')}>
              {p.top8.map((f) => {
                const inner = (
                  <>
                    <Picture
                      seed={f.picture.seed}
                      colors={f.picture.colors}
                      label=""
                      size={56}
                    />
                    <span>{f.label}</span>
                  </>
                );
                return (
                  <li key={f.key}>
                    {f.href ? (
                      <SiteLink href={f.href}>{inner}</SiteLink>
                    ) : (
                      inner
                    )}
                  </li>
                );
              })}
            </ol>
          </Box>
          <Box title={t('sites.spaceport.friendsComments', { name: p.name })}>
            <p>
              {rich(t('sites.spaceport.displaying', { n: '{n}' }), {
                n: <b>{p.comments.length}</b>,
              })}
            </p>
            {p.comments.length === 0 ? (
              <p className={styles.empty}>{p.emptyWall}</p>
            ) : (
              <ol
                className={styles.wall}
                aria-label={t('sites.spaceport.commentsLabel')}
              >
                {p.comments.map((c, i) => (
                  <li key={i}>
                    <div className={styles.commenter}>
                      {c.href ? (
                        <SiteLink href={c.href}>{c.from}</SiteLink>
                      ) : (
                        <b>{c.from}</b>
                      )}
                      <Picture
                        seed={c.picture.seed}
                        colors={c.picture.colors}
                        label=""
                        size={48}
                      />
                    </div>
                    <div className={styles.commentBody}>
                      <span className={styles.commentDate}>
                        {dayLabel(c.day, p.day)}
                      </span>
                      <p>{c.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Box>
        </div>
      </div>
    </div>
  );
}
