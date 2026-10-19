// The `/me` editor: headline, mood, about me, profile song, autoplay, theme (6 presets or custom
// colours), a pasted layout code with a live preview, and the Top 8 order. Nothing is saved until "Save Changes".
import { useId, useState } from 'react';
import type { PlayerProfile } from '@/content/friendspace/profiles/types';
import { PLAYLIST } from '@/content/playlist';
import { PROFILE_LIMITS, FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { useLocale, useT } from '@/i18n/useT';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import { cleanProfile, moveTop8, playerTheme, topEntryKey } from './logic';
import { LAYOUT_CODE_MAX, parseLayoutCode } from './layoutCode';
import { LayoutPreview } from './LayoutPreview';
import { Mood } from './Mood';
import extrasStyles from './Extras.module.css';
import { topFriendView } from './people';
import styles from './Friendspace.module.css';

const DEFAULT_CUSTOM = { background: '#000033', text: '#ffff66' };

export function ProfileEditor({
  initial,
  onSave,
  onCancel,
}: {
  initial: PlayerProfile;
  onSave: (profile: PlayerProfile) => void;
  onCancel: () => void;
}) {
  const { MOOD_EMOTICONS, THEME_PRESETS } = useSiteText(FRIENDSPACE_HOST);
  const locale = useLocale();
  const t = useT();
  const [p, setP] = useState(initial);
  const id = useId();
  const set = (patch: Partial<PlayerProfile>) =>
    setP((old) => ({ ...old, ...patch }));
  const colors = p.customColors ?? DEFAULT_CUSTOM;

  return (
    <form
      className={styles.editor}
      aria-label={t('sites.friendspace.editProfile')}
      onSubmit={(e) => {
        e.preventDefault();
        onSave(cleanProfile(p));
      }}
    >
      <h2 className={styles.boxTitle}>{t('sites.friendspace.editProfile')}</h2>
      <div className={styles.editorGrid}>
        <label htmlFor={`${id}-headline`}>
          {t('sites.friendspace.editor.headline')}
        </label>
        <input
          id={`${id}-headline`}
          value={p.headline}
          maxLength={PROFILE_LIMITS.headline}
          onChange={(e) => set({ headline: e.target.value })}
        />

        <label htmlFor={`${id}-mood`}>
          {t('sites.friendspace.editor.mood')}
        </label>
        <span className={styles.row}>
          <input
            id={`${id}-mood`}
            value={p.mood.text}
            maxLength={PROFILE_LIMITS.mood}
            onChange={(e) => set({ mood: { ...p.mood, text: e.target.value } })}
          />
          <select
            aria-label={t('sites.friendspace.editor.moodEmoticon')}
            value={p.mood.emoticon}
            onChange={(e) =>
              set({ mood: { ...p.mood, emoticon: e.target.value } })
            }
          >
            {MOOD_EMOTICONS.map((m) => (
              <option key={m.code} value={m.code}>
                {m.code} {m.label}
              </option>
            ))}
          </select>
        </span>

        <label htmlFor={`${id}-about`}>
          {t('sites.friendspace.editor.aboutMe')}
        </label>
        <textarea
          id={`${id}-about`}
          rows={5}
          value={p.aboutMe}
          maxLength={PROFILE_LIMITS.aboutMe}
          onChange={(e) => set({ aboutMe: e.target.value })}
        />

        <label htmlFor={`${id}-song`}>
          {t('sites.friendspace.editor.song')}
        </label>
        <select
          id={`${id}-song`}
          value={p.songTrackId ?? ''}
          onChange={(e) => set({ songTrackId: e.target.value || null })}
        >
          <option value="">{t('sites.friendspace.editor.noSong')}</option>
          {PLAYLIST.map((track) => (
            <option key={track.id} value={track.id}>
              {track.artist} - {track.title}
            </option>
          ))}
        </select>

        <span aria-hidden />
        <span className={styles.row}>
          <input
            id={`${id}-autoplay`}
            type="checkbox"
            checked={p.autoplay !== false}
            onChange={(e) => set({ autoplay: e.target.checked })}
          />
          <label htmlFor={`${id}-autoplay`}>
            {t('sites.friendspace.autoplay')}
          </label>
        </span>

        <label htmlFor={`${id}-theme`}>
          {t('sites.friendspace.editor.theme')}
        </label>
        <select
          id={`${id}-theme`}
          value={p.themePreset}
          onChange={(e) =>
            set({
              themePreset: e.target.value,
              customColors:
                e.target.value === 'custom' ? colors : p.customColors,
            })
          }
        >
          {THEME_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
          <option value="custom">
            {t('sites.friendspace.editor.customColors')}
          </option>
        </select>

        {p.themePreset === 'custom' && (
          <>
            <span>{t('sites.friendspace.editor.colors')}</span>
            <span className={styles.row}>
              <label>
                {t('sites.friendspace.editor.background')}{' '}
                <input
                  type="color"
                  value={colors.background}
                  onChange={(e) =>
                    set({
                      customColors: { ...colors, background: e.target.value },
                    })
                  }
                />
              </label>
              <label>
                {t('sites.friendspace.editor.text')}{' '}
                <input
                  type="color"
                  value={colors.text}
                  onChange={(e) =>
                    set({ customColors: { ...colors, text: e.target.value } })
                  }
                />
              </label>
            </span>
          </>
        )}

        <label htmlFor={`${id}-layout`}>
          {t('sites.friendspace.editor.layoutCode')}
        </label>
        <div className={extrasStyles.layoutField}>
          <textarea
            id={`${id}-layout`}
            rows={5}
            spellCheck={false}
            value={p.layoutCode ?? ''}
            maxLength={LAYOUT_CODE_MAX}
            aria-describedby={`${id}-layout-hint`}
            onChange={(e) => set({ layoutCode: e.target.value })}
          />
          <p id={`${id}-layout-hint`} className={extrasStyles.layoutHint}>
            {t('sites.friendspace.editor.layoutHint')}
          </p>
          <SiteLink
            href="http://glittercodez.example/"
            className={extrasStyles.layoutHint}
          >
            {t('sites.friendspace.editor.layoutLink')}
          </SiteLink>
        </div>

        <span>{t('sites.friendspace.editor.layoutPreview')}</span>
        <LayoutPreview
          theme={playerTheme(p)}
          extras={parseLayoutCode(p.layoutCode)}
          title={p.headline}
          label={t('sites.friendspace.editor.layoutPreview')}
        >
          <Mood text={p.mood.text} emoticon={p.mood.emoticon} />
        </LayoutPreview>

        <span>{t('sites.friendspace.editor.top8')}</span>
        <ol
          className={styles.orderList}
          aria-label={t('sites.friendspace.editor.top8Order')}
        >
          {p.top8.map((entry, i) => (
            <li key={topEntryKey(entry)}>
              <span className={styles.orderName}>
                {topFriendView(entry, '', locale).label}
              </span>
              <button
                type="button"
                aria-label={t('sites.friendspace.editor.moveUp', {
                  name: entry.kind === 'extra' ? entry.name : entry.id,
                })}
                disabled={i === 0}
                onClick={() => set({ top8: moveTop8(p.top8, i, -1) })}
              >
                &#9650;
              </button>
              <button
                type="button"
                aria-label={t('sites.friendspace.editor.moveDown', {
                  name: entry.kind === 'extra' ? entry.name : entry.id,
                })}
                disabled={i === p.top8.length - 1}
                onClick={() => set({ top8: moveTop8(p.top8, i, 1) })}
              >
                &#9660;
              </button>
            </li>
          ))}
        </ol>
      </div>
      <div className={styles.editorButtons}>
        <button type="submit" className={styles.bigButton}>
          {t('sites.friendspace.editor.save')}
        </button>
        <button type="button" onClick={onCancel}>
          {t('sites.friendspace.editor.cancel')}
        </button>
      </div>
    </form>
  );
}
