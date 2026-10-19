// The `/me` editor: headline, mood, about me, profile song, autoplay, theme (6 presets or custom
// colours), a pasted layout code with a live preview, and the Top 8 order. Nothing is saved until "Save Changes".
import { useId, useState } from 'react';
import type { PlayerProfile } from '@/content/friendspace/profiles/types';
import { getBands, getProfiles } from '@/content/locale';
import { PLAYLIST } from '@/content/playlist';
import { PROFILE_LIMITS, FRIENDSPACE_HOST } from '@/content/sites/friendspace';
import { useGender } from '@/i18n/settingsText';
import { useLocale, useT } from '@/i18n/useT';
import { SiteLink } from '../../SiteLink';
import { useSiteText } from '../useSiteText';
import {
  cleanProfile,
  moveTop8,
  playerTheme,
  top8Candidates,
  topEntryKey,
} from './logic';
import { LAYOUT_CODE_MAX, parseLayoutCode } from './layoutCode';
import { LayoutPreview } from './LayoutPreview';
import { Mood } from './Mood';
import extrasStyles from './Extras.module.css';
import { FRIEND_IDS, topFriendView } from './people';
import { WEB_LIMITS } from '../../webSanitize';
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
  const gender = useGender();
  const [pick, setPick] = useState('');
  const taken = new Set(p.top8.map(topEntryKey));
  const pickable = top8Candidates(
    FRIEND_IDS,
    getBands(locale, gender).map((b) => b.id),
    getProfiles(locale, gender),
  ).filter((e) => !taken.has(topEntryKey(e)));
  const pickedKey = pickable.some((e) => topEntryKey(e) === pick)
    ? pick
    : topEntryKey(pickable[0]!);
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
        <div>
          <ol
            className={styles.orderList}
            aria-label={t('sites.friendspace.editor.top8Order')}
          >
            {p.top8.map((entry, i) => {
              const name = topFriendView(entry, '', locale).label;
              return (
                <li key={topEntryKey(entry)}>
                  <span className={styles.orderName}>{name}</span>
                  <button
                    type="button"
                    aria-label={t('sites.friendspace.editor.moveUp', { name })}
                    disabled={i === 0}
                    onClick={() => set({ top8: moveTop8(p.top8, i, -1) })}
                  >
                    &#9650;
                  </button>
                  <button
                    type="button"
                    aria-label={t('sites.friendspace.editor.moveDown', {
                      name,
                    })}
                    disabled={i === p.top8.length - 1}
                    onClick={() => set({ top8: moveTop8(p.top8, i, 1) })}
                  >
                    &#9660;
                  </button>
                  <button
                    type="button"
                    aria-label={t('sites.friendspace.editor.remove', { name })}
                    onClick={() =>
                      set({ top8: p.top8.filter((_, j) => j !== i) })
                    }
                  >
                    &#10005;
                  </button>
                </li>
              );
            })}
          </ol>
          {p.top8.length < WEB_LIMITS.top8 && pickable.length > 0 && (
            <span className={styles.row}>
              <select
                aria-label={t('sites.friendspace.editor.pick')}
                value={pickedKey}
                onChange={(e) => setPick(e.target.value)}
              >
                {(['contact', 'band', 'extra'] as const).map((kind) => {
                  const group = pickable.filter((e) => e.kind === kind);
                  return group.length > 0 ? (
                    <optgroup
                      key={kind}
                      label={t(`sites.friendspace.editor.group.${kind}`)}
                    >
                      {group.map((e) => (
                        <option key={topEntryKey(e)} value={topEntryKey(e)}>
                          {topFriendView(e, '', locale).label}
                        </option>
                      ))}
                    </optgroup>
                  ) : null;
                })}
              </select>
              <button
                type="button"
                onClick={() => {
                  const entry = pickable.find(
                    (e) => topEntryKey(e) === pickedKey,
                  );
                  if (entry) {
                    set({ top8: [...p.top8, entry] });
                    setPick('');
                  }
                }}
              >
                {t('sites.friendspace.editor.add')}
              </button>
            </span>
          )}
        </div>
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
