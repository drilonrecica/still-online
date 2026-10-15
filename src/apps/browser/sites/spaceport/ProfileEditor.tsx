// The `/me` editor: headline, mood, about me, profile song, theme (6 presets or custom colours)
// and the Top 8 order. Nothing is saved until "Save Changes".
import { useId, useState } from 'react';
import type { PlayerProfile } from '@/content/profiles/types';
import { PLAYLIST } from '@/content/playlist';
import {
  MOOD_EMOTICONS,
  PROFILE_LIMITS,
  THEME_PRESETS,
} from '@/content/sites/spaceport';
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
  const [p, setP] = useState(initial);
  const id = useId();
  const set = (patch: Partial<PlayerProfile>) =>
    setP((old) => ({ ...old, ...patch }));
  const colors = p.customColors ?? DEFAULT_CUSTOM;

  return (
    <form
      className={styles.editor}
      aria-label="Edit Profile"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(cleanProfile(p));
      }}
    >
      <h2 className={styles.boxTitle}>Edit Profile</h2>
      <div className={styles.editorGrid}>
        <label htmlFor={`${id}-headline`}>Headline:</label>
        <input
          id={`${id}-headline`}
          value={p.headline}
          maxLength={PROFILE_LIMITS.headline}
          onChange={(e) => set({ headline: e.target.value })}
        />

        <label htmlFor={`${id}-mood`}>Mood:</label>
        <span className={styles.row}>
          <input
            id={`${id}-mood`}
            value={p.mood.text}
            maxLength={PROFILE_LIMITS.mood}
            onChange={(e) => set({ mood: { ...p.mood, text: e.target.value } })}
          />
          <select
            aria-label="Mood emoticon"
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

        <label htmlFor={`${id}-about`}>About me:</label>
        <textarea
          id={`${id}-about`}
          rows={5}
          value={p.aboutMe}
          maxLength={PROFILE_LIMITS.aboutMe}
          onChange={(e) => set({ aboutMe: e.target.value })}
        />

        <label htmlFor={`${id}-song`}>Profile song:</label>
        <select
          id={`${id}-song`}
          value={p.songTrackId ?? ''}
          onChange={(e) => set({ songTrackId: e.target.value || null })}
        >
          <option value="">(no song)</option>
          {PLAYLIST.map((t) => (
            <option key={t.id} value={t.id}>
              {t.artist} - {t.title}
            </option>
          ))}
        </select>

        <label htmlFor={`${id}-theme`}>Theme:</label>
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
          {THEME_PRESETS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
          <option value="custom">Custom colors...</option>
        </select>

        {p.themePreset === 'custom' && (
          <>
            <span>Colors:</span>
            <span className={styles.row}>
              <label>
                Background{' '}
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
                Text{' '}
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

        <span>Top 8:</span>
        <ol className={styles.orderList} aria-label="Top 8 order">
          {p.top8.map((friend, i) => (
            <li key={friend}>
              <span className={styles.orderName}>{friendName(friend)}</span>
              <button
                type="button"
                aria-label={`Move ${friend} up`}
                disabled={i === 0}
                onClick={() => set({ top8: moveTop8(p.top8, i, -1) })}
              >
                &#9650;
              </button>
              <button
                type="button"
                aria-label={`Move ${friend} down`}
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
          Save Changes
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
