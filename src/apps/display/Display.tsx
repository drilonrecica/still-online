// Display Properties: Themes · Desktop · Screen Saver · Appearance. Edits a draft that previews
// inside the dialog; Apply/OK write it to the settings store.
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { screensaverText } from '@/i18n/settingsText';
import { translate } from '@/i18n/t';
import type { MessageKey } from '@/i18n/types';
import { useLocale, useT } from '@/i18n/useT';
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

const TABS: readonly { id: TabId; labelKey: MessageKey }[] = [
  { id: 'themes', labelKey: 'display.tabs.themes' },
  { id: 'desktop', labelKey: 'display.tabs.desktop' },
  { id: 'screensaver', labelKey: 'display.tabs.screensaver' },
  { id: 'appearance', labelKey: 'display.tabs.appearance' },
];

export const THEME_PRESETS: readonly {
  id: ThemeId;
  nameKey: MessageKey;
  wallpaper: string;
}[] = [
  { id: 'blue', nameKey: 'display.themes.blue', wallpaper: 'classic' },
  { id: 'olive', nameKey: 'display.themes.olive', wallpaper: 'autumn' },
  { id: 'silver', nameKey: 'display.themes.silver', wallpaper: 'orbit' },
];

const SCHEMES: readonly { id: ThemeId; nameKey: MessageKey }[] = [
  { id: 'blue', nameKey: 'display.schemes.blue' },
  { id: 'olive', nameKey: 'display.schemes.olive' },
  { id: 'silver', nameKey: 'display.schemes.silver' },
];

const SAVERS: readonly { id: ScreensaverId; nameKey: MessageKey }[] = [
  { id: 'none', nameKey: 'display.savers.none' },
  { id: 'pipes', nameKey: 'display.savers.pipes' },
  { id: 'panes', nameKey: 'display.savers.panes' },
  { id: 'marquee', nameKey: 'display.savers.marquee' },
  { id: 'slideshow', nameKey: 'display.savers.slideshow' },
];

const POSITIONS: readonly { id: WallpaperPosition; nameKey: MessageKey }[] = [
  { id: 'center', nameKey: 'display.positions.center' },
  { id: 'tile', nameKey: 'display.positions.tile' },
  { id: 'stretch', nameKey: 'display.positions.stretch' },
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
  const t = useT();
  return (
    <menu role="tablist" aria-label={t('apps.display.title')}>
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={tab === item.id}
          aria-controls={`display-panel-${item.id}`}
          onClick={() => onChange(item.id)}
        >
          {t(item.labelKey)}
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
  const t = useT();
  const locale = useLocale();
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
    { id: NONE, name: t('display.none') },
    ...wallpapers.map((w) => ({
      id: w.id,
      name: translate(locale, w.nameKey),
    })),
    ...(draft.wallpaper.kind === 'custom'
      ? [{ id: CUSTOM, name: t('display.customImage') }]
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
      (p) =>
        p.id === draft.theme &&
        draft.wallpaper.kind === 'builtin' &&
        draft.wallpaper.id === p.wallpaper,
    )?.id ?? null;
  const named = <T extends string>(
    items: readonly { id: T; nameKey: MessageKey }[],
  ) => items.map((item) => ({ id: item.id, name: t(item.nameKey) }));

  const saver = draft.screensaver;
  const saverText = screensaverText(saver, locale);
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
            <span>{t('display.theme')}</span>
            <Listbox
              label={t('display.themeLabel')}
              items={named(THEME_PRESETS)}
              value={themePreset}
              onSelect={(id) => {
                const preset = THEME_PRESETS.find((p) => p.id === id);
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
            <span>{t('display.background')}</span>
            <Listbox
              label={t('display.backgroundLabel')}
              items={wallpaperItems}
              value={wallpaperValue}
              onSelect={selectWallpaper}
            />
            <div className={styles.row}>
              <button type="button" onClick={() => fileRef.current?.click()}>
                {t('common.browse')}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                aria-label={t('display.browseLabel')}
                data-testid="browse-input"
                onChange={(e) => void onBrowse(e)}
              />
              <span className={styles.grow} />
              <label htmlFor="display-position">{t('display.position')}</label>
              <select
                id="display-position"
                value={draft.position}
                onChange={(e) =>
                  patch({ position: e.target.value as WallpaperPosition })
                }
              >
                {POSITIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t(p.nameKey)}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.row}>
              <span>{t('display.color')}</span>
              <div className={styles.swatches}>
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={styles.swatch}
                    style={{ background: c }}
                    aria-label={t('display.colorSwatch', { hex: c })}
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
              <label htmlFor="display-saver">{t('display.screensaver')}</label>
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
                    {t(s.nameKey)}
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
                {t('display.settings')}
              </button>
              <button
                type="button"
                disabled={saver.id === 'none'}
                onClick={() => startPreview(saver.id, saverText)}
              >
                {t('display.preview')}
              </button>
            </div>
            {editingText && saver.id === 'marquee' && (
              <div className={styles.row}>
                <label htmlFor="display-marquee-text">
                  {t('display.text')}
                </label>
                <input
                  id="display-marquee-text"
                  type="text"
                  className={styles.grow}
                  maxLength={MAX_SCREENSAVER_TEXT}
                  value={saverText}
                  onChange={(e) => setSaver({ text: e.target.value })}
                />
              </div>
            )}
            <div className={styles.row}>
              <label htmlFor="display-wait">{t('display.wait')}</label>
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
              <span>{t('display.minutes')}</span>
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
              <label htmlFor="display-scheme">{t('display.scheme')}</label>
              <select
                id="display-scheme"
                className={styles.grow}
                value={draft.theme}
                onChange={(e) => patch({ theme: e.target.value as ThemeId })}
              >
                {SCHEMES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(s.nameKey)}
                  </option>
                ))}
              </select>
            </div>
            <p className={styles.hint}>{t('display.schemeHint')}</p>
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
          {t('common.ok')}
        </button>
        <button type="button" onClick={() => closeWindow(windowId)}>
          {t('common.cancel')}
        </button>
        <button type="button" disabled={!dirty} onClick={apply}>
          {t('common.apply')}
        </button>
      </div>
    </div>
  );
}
