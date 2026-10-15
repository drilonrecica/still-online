// Shared OS contracts. See docs/architecture.md for how the pieces fit together.
import type { ComponentType, LazyExoticComponent } from 'react';
import type { Locale, MessageArgs, MessageKey, TextParams } from '@/i18n/types';

// ---------------------------------------------------------------------------
// Session state machine
// ---------------------------------------------------------------------------

export type SessionState =
  'booting' | 'login' | 'desktop' | 'shuttingDown' | 'off';

/** Allowed transitions. `desktop → login` is Log Off; `off → booting` is power on. */
export const SESSION_TRANSITIONS: Readonly<
  Record<SessionState, readonly SessionState[]>
> = {
  booting: ['login'],
  login: ['desktop'],
  desktop: ['login', 'shuttingDown'],
  shuttingDown: ['off'],
  off: ['booting'],
};

export interface SessionStore {
  state: SessionState;
  /** booting → login (boot finished or skipped). */
  bootComplete: () => void;
  /** login → desktop. Caller saves the name in settings first. */
  logOn: () => void;
  /** desktop → login; closes all windows. */
  logOff: () => void;
  /** desktop → shuttingDown; closes all windows. */
  shutDown: () => void;
  /** shuttingDown → off. */
  shutdownComplete: () => void;
  /** off → booting. */
  powerOn: () => void;
}

// ---------------------------------------------------------------------------
// Apps & windows
// ---------------------------------------------------------------------------

/** Every app id that exists or is planned. The registry only lists implemented ones. */
export type AppId =
  | 'mycomputer'
  | 'notepad'
  | 'recyclebin'
  | 'messenger'
  | 'messenger-chat'
  | 'amplifier'
  // v0.2 (docs/architecture-v0.2.md → "Apps")
  | 'explorer'
  | 'display'
  | 'dialup'
  | 'diskcleanup'
  | 'messenger-history'
  | 'browser'
  | 'mail'
  | 'tunemole'
  | 'paint'
  | 'photobooth'
  | 'mines'
  | 'henhunt'
  | 'pinball'
  | 'wrecker'
  | 'stapley';

/** Start menu → All Programs submenus, in display order. */
export const APP_CATEGORIES = [
  'accessories',
  'games',
  'internet',
  'entertainment',
  'system',
] as const;

export type AppCategory = (typeof APP_CATEGORIES)[number];

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** Per-window launch props. JSON-only because open windows are persisted. */
export type WindowProps = Readonly<Record<string, JsonValue>>;

export interface Size {
  w: number;
  h: number;
}

export interface WindowState {
  id: string;
  appId: AppId;
  /**
   * A title set at runtime (`setWindowTitle`); without it the title is the app's `titleKey`.
   * Rendered in the current locale (`renderWindowTitle`), never stored as text.
   */
  titleKey?: MessageKey;
  titleParams?: TextParams;
  /** Restore geometry in px, relative to the work area (viewport minus taskbar). Kept while maximized. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Stacking order; higher is in front. The front-most non-minimized window is the active one. */
  z: number;
  minimized: boolean;
  maximized: boolean;
  props: WindowProps;
}

/** What the window manager passes to every app component. */
export interface AppComponentProps {
  windowId: string;
  props: WindowProps;
}

export interface AppDefinition {
  id: AppId;
  /** Catalog key of the default window title (`apps.<id>.title`). */
  titleKey: MessageKey;
  /** Short name for the Start menu; defaults to `titleKey`. */
  labelKey?: MessageKey;
  /** Imported SVG URLs (`import icon from '@/assets/icons/x-16.svg'`). */
  icon16: string;
  icon32: string;
  /** `React.lazy(() => import('./X'))`; the module default-exports the component. */
  component: LazyExoticComponent<ComponentType<AppComponentProps>>;
  defaultSize: Size;
  /** Falls back to WM_MIN_SIZE when omitted. */
  minSize?: Size;
  /**
   * When true, `openApp` focuses an existing window instead of opening another.
   * With `instanceKey`, uniqueness is per key (e.g. one chat window per contactId).
   */
  singleInstance: boolean;
  instanceKey?: (props: WindowProps) => string;
  /** `'none'`: no XP frame; the app draws its own and uses `useWindowDrag(id)`. */
  chrome: 'xp' | 'none';
  showOnDesktop: boolean;
  /** Legacy flag; the Start menu now lists `pinned` apps and the All Programs flyout. */
  showInStartMenu: boolean;
  /** All Programs submenu. Omitted = not launchable from menus (e.g. messenger-chat). */
  category?: AppCategory;
  /** Shown in the Start menu's left column (32px icon). */
  pinned?: boolean;
  /** No resize handles and no maximize (dialogs such as Display Properties). */
  fixedSize?: boolean;
}

/**
 * A launcher entry on the desktop or in the Start menu's right column. Launching calls
 * `openApp(appId, props)`. Label/icons default to the app's; entries whose app isn't registered
 * are skipped.
 */
export interface Shortcut {
  appId: AppId;
  props?: WindowProps;
  label: string;
  icon16?: string;
  icon32?: string;
}

export interface WindowsStore {
  windows: WindowState[];
  /** Highest z handed out so far; focus assigns `topZ + 1`. */
  topZ: number;
  openApp: (appId: AppId, props?: WindowProps) => string;
  closeWindow: (id: string) => void;
  closeAll: () => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximize: (id: string) => void;
  /**
   * Apps set a more specific title as a catalog key + params, e.g.
   * `setWindowTitle(id, 'messenger.chatTitle', { name: 'Lena' })`. Params are names the title
   * shows (a file the player named, a contact); the app sets them again on a language switch.
   */
  setWindowTitle: <K extends MessageKey>(
    id: string,
    key: K,
    ...args: MessageArgs<K>
  ) => void;
  /** Apps keep `props` in step with what the window shows, so a restore reopens the same thing. */
  setWindowProps: (id: string, props: WindowProps) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (
    id: string,
    geometry: { x: number; y: number; w: number; h: number },
  ) => void;
}

// Window manager constants (see "Defaults" in tasks.md).
export const TASKBAR_HEIGHT = 30;
export const WM_MIN_SIZE: Size = { w: 240, h: 140 };
export const CASCADE_ORIGIN = 24;
export const CASCADE_STEP = 24;
/** Horizontal px of titlebar that must stay on screen; the titlebar's top edge stays ≥ 0. */
export const MIN_VISIBLE_TITLEBAR = 40;
/** Approximate xp.css titlebar height, used for the bottom clamp. */
export const TITLEBAR_HEIGHT = 30;

// ---------------------------------------------------------------------------
// Settings & sound
// ---------------------------------------------------------------------------

export interface SettingsStore {
  /** `null` = the localized default (`Player`/`Spieler`); read it with `getPlayerName()`. */
  playerName: string | null;
  muted: boolean;
  /** 0..1 */
  volume: number;
  firstBootDone: boolean;
  /** The "best on a desktop computer" notice was dismissed. */
  smallScreenNoticeDismissed: boolean;
  wallpaper: WallpaperChoice;
  wallpaperPosition: WallpaperPosition;
  theme: ThemeId;
  screensaver: ScreensaverSettings;
  /** Balloon tip ids already shown once. */
  seenTips: string[];
  /** The dial-up dialog dials as soon as something needs a connection. */
  connectAutomatically: boolean;
  /** Idle minutes before Messenger goes Away; 0 = off. */
  awayMinutes: number;
  /**
   * The away message auto-away and the manual prompt start from. `null` = the localized default
   * (`brb`/`bin gleich wieder da`); read it with `getAwayMessage()`. `''` is a real (empty) value.
   */
  awayMessage: string | null;
  /** Fluff the sheep walks the desktop. */
  petEnabled: boolean;
  /** Stapley the stapler offers tips. */
  assistantEnabled: boolean;
  /**
   * The language the player chose; `null` = not chosen yet, so `detectLocale` decides. Read the
   * effective locale only through `getLocale()`/`useLocale()` from `src/i18n/`.
   */
  language: Locale | null;
  /** A name equal to the current locale's default is stored as `null`. */
  setPlayerName: (name: string) => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setVolume: (volume: number) => void;
  markFirstBootDone: () => void;
  dismissSmallScreenNotice: () => void;
  setWallpaper: (wallpaper: WallpaperChoice) => void;
  setWallpaperPosition: (position: WallpaperPosition) => void;
  setTheme: (theme: ThemeId) => void;
  setScreensaver: (screensaver: ScreensaverSettings) => void;
  /** Records a show-once tip id; no-op if already recorded. */
  addSeenTip: (id: string) => void;
  setConnectAutomatically: (on: boolean) => void;
  setAwayMinutes: (minutes: number) => void;
  /** Trimmed; a message equal to the current locale's default is stored as `null`. */
  setAwayMessage: (message: string) => void;
  setPetEnabled: (on: boolean) => void;
  setAssistantEnabled: (on: boolean) => void;
  /** `null` goes back to detection. */
  setLanguage: (language: Locale | null) => void;
}

// v0.2 settings fields. Each implementing task moves its fields into `SettingsStore` (with a
// sanitize) and its setter; the shapes and defaults below are fixed.

export type WallpaperChoice =
  /** A procedural homage from `src/os/wallpapers/`; `classic` is the CSS rolling hill. */
  | { kind: 'builtin'; id: string }
  /** The player's own image in the blob store. */
  | { kind: 'custom'; blobKey: string }
  /** "(None)" with a solid colour, `#rrggbb`. */
  | { kind: 'color'; color: string };

export type WallpaperPosition = 'center' | 'tile' | 'stretch';

export type ThemeId = 'blue' | 'olive' | 'silver';

export type ScreensaverId =
  'none' | 'pipes' | 'panes' | 'marquee' | 'slideshow';

export interface ScreensaverSettings {
  id: ScreensaverId;
  /** Idle minutes before it starts, 1–60; 0 = never. */
  minutes: number;
  /** Marquee text; `null` = the localized default (`screensaverText()`). */
  text: string | null;
}

export interface SettingsV02 {
  wallpaper: WallpaperChoice; // P1-01
  wallpaperPosition: WallpaperPosition; // P1-01
  theme: ThemeId; // P1-02
  screensaver: ScreensaverSettings; // P1-02 / P1-03
  /** Idle minutes before Messenger goes Away; 0 = off. */
  awayMinutes: number; // P3-01
  awayMessage: string | null; // P3-01
  connectAutomatically: boolean; // P1-05
  petEnabled: boolean; // P6-05
  assistantEnabled: boolean; // P6-06
  /** Balloon and Stapley tip ids already shown once. */
  seenTips: string[]; // P1-04 / P6-06
}

export const SETTINGS_V02_DEFAULTS: Readonly<SettingsV02> = {
  wallpaper: { kind: 'builtin', id: 'classic' },
  wallpaperPosition: 'stretch',
  theme: 'blue',
  screensaver: { id: 'panes', minutes: 5, text: null },
  awayMinutes: 5,
  awayMessage: null,
  connectAutomatically: true,
  petEnabled: false,
  assistantEnabled: true,
  seenTips: [],
};

export type SoundName =
  'startup' | 'logon' | 'logoff' | 'error' | 'notify' | 'nudge' | 'click';

/** Runtime-only (not persisted). Mute/volume live in settings. */
export interface SoundStore {
  /** True once a user gesture has resumed the AudioContext. */
  unlocked: boolean;
  unlock: () => void;
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/** Stores persisted under `still-online:v1:<name>`. */
export type PersistedStoreName =
  | 'settings'
  | 'windows'
  | 'notepad'
  | 'messenger'
  | 'amplifier'
  | 'fs'
  | 'world'
  | 'mail'
  | 'web'
  | 'games';

// ---------------------------------------------------------------------------
// Games
// ---------------------------------------------------------------------------

/** Games that report scores (`game:score`, the `games` store, friend reactions). */
export const GAME_IDS = ['mines', 'henhunt', 'pinball'] as const;
export type GameId = (typeof GAME_IDS)[number];

export const isGameId = (v: unknown): v is GameId =>
  (GAME_IDS as readonly unknown[]).includes(v);
