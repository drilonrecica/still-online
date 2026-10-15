// Display Properties: Themes · Desktop · Screen Saver · Appearance. Edits a draft that previews
// inside the dialog; Apply/OK write it to the settings store.
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { deleteBlob, putBlob, useBlobUrl } from '@/os/blobStore';
import { useScreensaverStore } from '@/os/screensaver/store';
import { MAX_SCREENSAVER_TEXT, useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import type {
  AppComponentProps,
  ScreensaverId,
  ScreensaverSettings,
  ThemeId,
  WallpaperChoice,
  WallpaperPosition,
} from '@/os/types';
import { listWallpapers } from '@/os/wallpapers/registry';
import { usePaintersReady, wallpaperUrl } from '@/os/wallpapers/render';
import {
  backgroundStyle,
  type BackgroundSource,
} from '@/os/wallpapers/useDesktopBackground';
import { useWorldStore } from '@/os/world';
import styles from './Display.module.css';

type TabId = 'themes' | 'desktop' | 'screensaver' | 'appearance';

const TABS: readonly { id: TabId; label: string }[] = [
  { id: 'themes', label: 'Themes' },
  { id: 'desktop', label: 'Desktop' },
  { id: 'screensaver', label: 'Screen Saver' },
  { id: 'appearance', label: 'Appearance' },
];

export const THEME_PRESETS: readonly {
  id: ThemeId;
  name: string;
  wallpaper: string;
}[] = [
  { id: 'blue', name: 'still-online XP', wallpaper: 'classic' },
  { id: 'olive', name: 'Olive Afternoon', wallpaper: 'autumn' },
  { id: 'silver', name: 'Silver Night', wallpaper: 'orbit' },
];

const SCHEMES: readonly { id: ThemeId; name: string }[] = [
  { id: 'blue', name: 'Default (blue)' },
  { id: 'olive', name: 'Olive Green' },
  { id: 'silver', name: 'Silver' },
];

const SAVERS: readonly { id: ScreensaverId; name: string }[] = [
  { id: 'none', name: '(None)' },
  { id: 'pipes', name: 'Pipes' },
  { id: 'panes', name: 'Flying Panes' },
  { id: 'marquee', name: 'Marquee' },
  { id: 'slideshow', name: 'My Pictures Slideshow' },
];

const POSITIONS: readonly { id: WallpaperPosition; name: string }[] = [
  { id: 'center', name: 'Center' },
  { id: 'tile', name: 'Tile' },
  { id: 'stretch', name: 'Stretch' },
];

export const SWATCHES: readonly string[] = [
  '#000000',
  '#808080',
  '#c0c0c0',
  '#ffffff',
  '#800000',
  '#ff0000',
  '#808000',
  '#ffff00',
  '#008000',
  '#00ff00',
  '#008080',
  '#00ffff',
  '#000080',
  '#0000ff',
  '#800080',
  '#ff00ff',
];

const DEFAULT_COLOR = '#3a6ea5';

interface Draft {
  theme: ThemeId;
  wallpaper: WallpaperChoice;
  position: WallpaperPosition;
  screensaver: ScreensaverSettings;
}

function sameDraft(a: Draft, b: Draft): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/** The monitor's picture: the draft wallpaper scaled into the screen. */
function useThumbStyle(
  wallpaper: WallpaperChoice,
  position: WallpaperPosition,
) {
  const blobUrl = useBlobUrl(
    wallpaper.kind === 'custom' ? wallpaper.blobKey : null,
  );
  usePaintersReady();
  let source: BackgroundSource | null;
  if (wallpaper.kind === 'color') {
    source = { kind: 'color', color: wallpaper.color };
  } else if (wallpaper.kind === 'custom') {
    source = blobUrl ? { kind: 'image', url: blobUrl } : null;
  } else {
    const url = wallpaperUrl(wallpaper.id, 256, 256);
    source = url ? { kind: 'image', url } : null;
  }
  const style = backgroundStyle(source, position);
  if (style) {
    // The thumbnail is ~1/7 of the desktop; centre/tile read better with `auto` scaled down.
    return position === 'stretch'
      ? style
      : { ...style, backgroundSize: '40px' };
  }
  // `classic` (CSS hill) and not-yet-loaded blobs: a small sky-and-grass stand-in.
  return {
    backgroundImage:
      'linear-gradient(180deg, #1f5fd0 0%, #a9d2f5 62%, #4fa72a 62%, #2d6e17 100%)',
  };
}

function Monitor({
  wallpaper,
  position,
}: {
  wallpaper: WallpaperChoice;
  position: WallpaperPosition;
}) {
  const style = useThumbStyle(wallpaper, position);
  return (
    <div className={styles.monitorFrame} aria-hidden="true">
      <div className={styles.screen} style={style} data-testid="monitor" />
    </div>
  );
}

function Tabs({
  tab,
  onChange,
}: {
  tab: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <menu role="tablist" aria-label="Display Properties">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={tab === t.id}
          aria-controls={`display-panel-${t.id}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </menu>
  );
}

function Listbox<T extends string>({
  label,
  items,
  value,
  onSelect,
}: {
  label: string;
  items: readonly { id: T; name: string }[];
  value: T | null;
  onSelect: (id: T) => void;
}) {
  return (
    <ul className={styles.list} role="listbox" aria-label={label}>
      {items.map((item) => (
        <li
          key={item.id}
          role="option"
          aria-selected={item.id === value}
          className={styles.option}
          onClick={() => onSelect(item.id)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}

const NONE = '__none__';
const CUSTOM = '__custom__';

export default function Display({ windowId }: AppComponentProps) {
  const settings = useSettingsStore();
  const unlocks = useWorldStore((s) => s.unlocks);
  const closeWindow = useWindowsStore((s) => s.closeWindow);
  const startPreview = useScreensaverStore((s) => s.startPreview);

  const applied: Draft = {
    theme: settings.theme,
    wallpaper: settings.wallpaper,
    position: settings.wallpaperPosition,
    screensaver: settings.screensaver,
  };
  const [draft, setDraft] = useState<Draft>(applied);
  const [tab, setTab] = useState<TabId>('themes');
  const [editingText, setEditingText] = useState(false);
  const [lastColor, setLastColor] = useState(
    settings.wallpaper.kind === 'color'
      ? settings.wallpaper.color
      : DEFAULT_COLOR,
  );
  const fileRef = useRef<HTMLInputElement>(null);
  // Blobs stored by Browse… in this dialog; the ones not applied are deleted on close.
  const uploads = useRef<Set<string>>(new Set());

  useEffect(() => {
    const keys = uploads.current;
    return () => {
      const wp = useSettingsStore.getState().wallpaper;
      const keep = wp.kind === 'custom' ? wp.blobKey : null;
      for (const key of keys) if (key !== keep) void deleteBlob(key);
    };
  }, []);

  const dirty = !sameDraft(draft, applied);
  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }));

  function apply() {
    const previous = useSettingsStore.getState().wallpaper;
    settings.setTheme(draft.theme);
    settings.setWallpaper(draft.wallpaper);
    settings.setWallpaperPosition(draft.position);
    settings.setScreensaver(draft.screensaver);
    // A replaced upload is no longer reachable.
    if (
      previous.kind === 'custom' &&
      !(
        draft.wallpaper.kind === 'custom' &&
        draft.wallpaper.blobKey === previous.blobKey
      )
    ) {
      void deleteBlob(previous.blobKey);
    }
  }

  async function onBrowse(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;
    const blobKey = await putBlob(file);
    // Drop an earlier upload of this dialog that was never applied.
    const earlier = draft.wallpaper;
    const wp = useSettingsStore.getState().wallpaper;
    if (
      earlier.kind === 'custom' &&
      uploads.current.has(earlier.blobKey) &&
      !(wp.kind === 'custom' && wp.blobKey === earlier.blobKey)
    ) {
      uploads.current.delete(earlier.blobKey);
      void deleteBlob(earlier.blobKey);
    }
    uploads.current.add(blobKey);
    patch({ wallpaper: { kind: 'custom', blobKey } });
  }

  const wallpapers = listWallpapers(unlocks);
  const wallpaperItems = [
    { id: NONE, name: '(None)' },
    ...wallpapers.map((w) => ({ id: w.id, name: w.name })),
    ...(draft.wallpaper.kind === 'custom'
      ? [{ id: CUSTOM, name: 'Custom image' }]
      : []),
  ];
  const wallpaperValue =
    draft.wallpaper.kind === 'color'
      ? NONE
      : draft.wallpaper.kind === 'custom'
        ? CUSTOM
        : draft.wallpaper.id;

  function selectWallpaper(id: string) {
    if (id === NONE) {
      patch({ wallpaper: { kind: 'color', color: lastColor } });
    } else if (id !== CUSTOM) {
      patch({ wallpaper: { kind: 'builtin', id } });
    }
  }

  function pickColor(color: string) {
    setLastColor(color);
    patch({ wallpaper: { kind: 'color', color } });
  }

  const themePreset =
    THEME_PRESETS.find(
      (t) =>
        t.id === draft.theme &&
        draft.wallpaper.kind === 'builtin' &&
        draft.wallpaper.id === t.wallpaper,
    )?.id ?? null;

  const saver = draft.screensaver;
  const setSaver = (p: Partial<ScreensaverSettings>) =>
    patch({ screensaver: { ...saver, ...p } });

  return (
    <div className={styles.root}>
      <Tabs tab={tab} onChange={setTab} />
      <div
        className={`window ${styles.panel}`}
        role="tabpanel"
        id={`display-panel-${tab}`}
      >
        {tab === 'themes' && (
          <>
            <Monitor wallpaper={draft.wallpaper} position={draft.position} />
            <span>Theme:</span>
            <Listbox
              label="Theme"
              items={THEME_PRESETS}
              value={themePreset}
              onSelect={(id) => {
                const preset = THEME_PRESETS.find((t) => t.id === id);
                if (!preset) return;
                patch({
                  theme: preset.id,
                  wallpaper: { kind: 'builtin', id: preset.wallpaper },
                });
              }}
            />
          </>
        )}

        {tab === 'desktop' && (
          <>
            <Monitor wallpaper={draft.wallpaper} position={draft.position} />
            <span>Background:</span>
            <Listbox
              label="Background"
              items={wallpaperItems}
              value={wallpaperValue}
              onSelect={selectWallpaper}
            />
            <div className={styles.row}>
              <button type="button" onClick={() => fileRef.current?.click()}>
                Browse…
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                aria-label="Browse for an image"
                data-testid="browse-input"
                onChange={(e) => void onBrowse(e)}
              />
              <span className={styles.grow} />
              <label htmlFor="display-position">Position:</label>
              <select
                id="display-position"
                value={draft.position}
                onChange={(e) =>
                  patch({ position: e.target.value as WallpaperPosition })
                }
              >
                {POSITIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.row}>
              <span>Color:</span>
              <div className={styles.swatches}>
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={styles.swatch}
                    style={{ background: c }}
                    aria-label={`Color ${c}`}
                    aria-pressed={
                      draft.wallpaper.kind === 'color' &&
                      draft.wallpaper.color === c
                    }
                    onClick={() => pickColor(c)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'screensaver' && (
          <>
            <div className={styles.monitorFrame} aria-hidden="true">
              <div className={styles.screen} style={{ background: '#000' }} />
            </div>
            <div className={styles.row}>
              <label htmlFor="display-saver">Screen saver:</label>
              <select
                id="display-saver"
                className={styles.grow}
                value={saver.id}
                onChange={(e) => {
                  setSaver({ id: e.target.value as ScreensaverId });
                  setEditingText(false);
                }}
              >
                {SAVERS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.row}>
              <button
                type="button"
                disabled={saver.id !== 'marquee'}
                onClick={() => setEditingText((v) => !v)}
              >
                Settings…
              </button>
              <button
                type="button"
                disabled={saver.id === 'none'}
                onClick={() => startPreview(saver.id, saver.text)}
              >
                Preview
              </button>
            </div>
            {editingText && saver.id === 'marquee' && (
              <div className={styles.row}>
                <label htmlFor="display-marquee-text">Text:</label>
                <input
                  id="display-marquee-text"
                  type="text"
                  className={styles.grow}
                  maxLength={MAX_SCREENSAVER_TEXT}
                  value={saver.text}
                  onChange={(e) => setSaver({ text: e.target.value })}
                />
              </div>
            )}
            <div className={styles.row}>
              <label htmlFor="display-wait">Wait:</label>
              <input
                id="display-wait"
                type="number"
                min={1}
                max={60}
                value={saver.minutes}
                disabled={saver.id === 'none'}
                onChange={(e) => {
                  const n = Math.round(Number(e.target.value));
                  if (Number.isFinite(n)) {
                    setSaver({ minutes: Math.min(60, Math.max(1, n)) });
                  }
                }}
                style={{ width: 52 }}
              />
              <span>minutes</span>
            </div>
          </>
        )}

        {tab === 'appearance' && (
          <>
            <div className={styles.schemePreview} data-theme={draft.theme}>
              <div className={styles.schemeWindow}>
                <div className={styles.schemeTitle} />
              </div>
              <div className={styles.schemeTaskbar} />
            </div>
            <div className={styles.row}>
              <label htmlFor="display-scheme">Color scheme:</label>
              <select
                id="display-scheme"
                className={styles.grow}
                value={draft.theme}
                onChange={(e) => patch({ theme: e.target.value as ThemeId })}
              >
                {SCHEMES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <p className={styles.hint}>Blue, Olive Green or Silver.</p>
          </>
        )}
      </div>

      <div className={styles.buttons}>
        <button
          type="button"
          onClick={() => {
            apply();
            closeWindow(windowId);
          }}
        >
          OK
        </button>
        <button type="button" onClick={() => closeWindow(windowId)}>
          Cancel
        </button>
        <button type="button" disabled={!dirty} onClick={apply}>
          Apply
        </button>
      </div>
    </div>
  );
}
