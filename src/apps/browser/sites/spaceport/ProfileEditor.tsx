// The `/me` editor: headline, mood, about me, profile song, theme (6 presets or custom colours)
// and the Top 8 order. Nothing is saved until "Save Changes".
import { useId, useState } from 'react';
import type { PlayerProfile } from '@/content/profiles/types';
import { PLAYLIST } from '@/content/playlist';
import { PROFILE_LIMITS, SPACEPORT_HOST } from '@/content/sites/spaceport';
import { useLocale, useT } from '@/i18n/useT';
import { useSiteText } from '../useSiteText';
import { cleanProfile, moveTop8 } from './logic';
import { friendName } from './people';
import styles from './Spaceport.module.css';

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
  const { MOOD_EMOTICONS, THEME_PRESETS } = useSiteText(SPACEPORT_HOST);
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
      aria-label={t('sites.spaceport.editProfile')}
      onSubmit={(e) => {
        e.preventDefault();
        onSave(cleanProfile(p));
      }}
    >
      <h2 className={styles.boxTitle}>{t('sites.spaceport.editProfile')}</h2>
      <div className={styles.editorGrid}>
        <label htmlFor={`${id}-headline`}>
          {t('sites.spaceport.editor.headline')}
        </label>
        <input
          id={`${id}-headline`}
          value={p.headline}
          maxLength={PROFILE_LIMITS.headline}
          onChange={(e) => set({ headline: e.target.value })}
        />

        <label htmlFor={`${id}-mood`}>{t('sites.spaceport.editor.mood')}</label>
        <span className={styles.row}>
          <input
            id={`${id}-mood`}
            value={p.mood.text}
            maxLength={PROFILE_LIMITS.mood}
            onChange={(e) => set({ mood: { ...p.mood, text: e.target.value } })}
          />
          <select
            aria-label={t('sites.spaceport.editor.moodEmoticon')}
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
          {t('sites.spaceport.editor.aboutMe')}
        </label>
        <textarea
          id={`${id}-about`}
          rows={5}
          value={p.aboutMe}
          maxLength={PROFILE_LIMITS.aboutMe}
          onChange={(e) => set({ aboutMe: e.target.value })}
        />

        <label htmlFor={`${id}-song`}>{t('sites.spaceport.editor.song')}</label>
        <select
          id={`${id}-song`}
          value={p.songTrackId ?? ''}
          onChange={(e) => set({ songTrackId: e.target.value || null })}
        >
          <option value="">{t('sites.spaceport.editor.noSong')}</option>
          {PLAYLIST.map((track) => (
            <option key={track.id} value={track.id}>
              {track.artist} - {track.title}
            </option>
          ))}
        </select>

        <label htmlFor={`${id}-theme`}>
          {t('sites.spaceport.editor.theme')}
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
            {t('sites.spaceport.editor.customColors')}
          </option>
        </select>

        {p.themePreset === 'custom' && (
          <>
            <span>{t('sites.spaceport.editor.colors')}</span>
            <span className={styles.row}>
              <label>
                {t('sites.spaceport.editor.background')}{' '}
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
                {t('sites.spaceport.editor.text')}{' '}
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

        <span>{t('sites.spaceport.editor.top8')}</span>
        <ol
          className={styles.orderList}
          aria-label={t('sites.spaceport.editor.top8Order')}
        >
          {p.top8.map((friend, i) => (
            <li key={friend}>
              <span className={styles.orderName}>
                {friendName(friend, locale)}
              </span>
              <button
                type="button"
                aria-label={t('sites.spaceport.editor.moveUp', {
                  name: friend,
                })}
                disabled={i === 0}
                onClick={() => set({ top8: moveTop8(p.top8, i, -1) })}
              >
                &#9650;
              </button>
              <button
                type="button"
                aria-label={t('sites.spaceport.editor.moveDown', {
                  name: friend,
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
          {t('sites.spaceport.editor.save')}
        </button>
        <button type="button" onClick={onCancel}>
          {t('sites.spaceport.editor.cancel')}
        </button>
      </div>
    </form>
  );
}
