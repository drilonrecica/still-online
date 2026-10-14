// Shared OS contracts. See docs/architecture.md for how the pieces fit together.
import type { ComponentType, LazyExoticComponent } from 'react';

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
  | 'amplifier';

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
  title: string;
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
  title: string;
  /** Short name for desktop icons and the Start menu; defaults to `title`. */
  label?: string;
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
  /** Left ("programs") column. The right column is a fixed list: mycomputer, recyclebin. */
  showInStartMenu: boolean;
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
  /** Apps set a more specific title, e.g. "Lena - Conversation". */
  setWindowTitle: (id: string, title: string) => void;
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
  playerName: string;
  muted: boolean;
  /** 0..1 */
  volume: number;
  firstBootDone: boolean;
  /** The "best on a desktop computer" notice was dismissed. */
  smallScreenNoticeDismissed: boolean;
  setPlayerName: (name: string) => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
  setVolume: (volume: number) => void;
  markFirstBootDone: () => void;
  dismissSmallScreenNotice: () => void;
}

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
  'settings' | 'windows' | 'notepad' | 'messenger' | 'amplifier';
