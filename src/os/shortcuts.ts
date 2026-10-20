// Data-driven launchers for the desktop and the Start menu's places column.
import { getApp } from '@/apps/registry';
import { t } from '@/i18n/t';
import type { AppDefinition, AppId, Shortcut, WindowProps } from '@/os/types';

/** A shortcut whose app is registered, with icons filled in from the app. */
export interface ResolvedShortcut {
  /**
   * Unique within a list and stable across releases (`explorer:docs`, `notepad`): the desktop
   * saves icon positions under it.
   */
  key: string;
  appId: AppId;
  props: WindowProps;
  label: string;
  icon16: string;
  icon32: string;
  /** Draws XP's little shortcut arrow; false for system icons and folders. */
  shortcut: boolean;
}

/** Desktop items that are the real thing in XP, not shortcuts to it. */
const SYSTEM_ICONS: readonly AppId[] = ['mycomputer', 'recyclebin', 'explorer'];

/** Start menu right column, in order. */
export const START_PLACES: readonly Shortcut[] = [
  { appId: 'explorer', props: { folder: 'docs' }, labelKey: 'fs.folders.docs' },
  { appId: 'explorer', props: { folder: 'pics' }, labelKey: 'fs.folders.pics' },
  {
    appId: 'explorer',
    props: { folder: 'music' },
    labelKey: 'fs.folders.music',
  },
  { appId: 'mycomputer', labelKey: 'apps.mycomputer.title' },
  { appId: 'display', labelKey: 'startMenu.controlPanel' },
  { appId: 'recyclebin', labelKey: 'apps.recyclebin.title' },
];

/**
 * Desktop icons, in order (columns fill top-down, left to right). Deliberately
 * cluttered, like a 2007 family PC: everything that was ever installed got an icon.
 */
export const DESKTOP_SHORTCUTS: readonly Shortcut[] = [
  { appId: 'explorer', props: { folder: 'docs' }, labelKey: 'fs.folders.docs' },
  { appId: 'mycomputer', labelKey: 'apps.mycomputer.title' },
  { appId: 'recyclebin', labelKey: 'apps.recyclebin.title' },
  { appId: 'browser', labelKey: 'apps.browser.title' },
  { appId: 'messenger', labelKey: 'apps.messenger.title' },
  { appId: 'mail', labelKey: 'apps.mail.title' },
  { appId: 'dialup', labelKey: 'apps.dialup.label' },
  { appId: 'amplifier', labelKey: 'apps.amplifier.title' },
  { appId: 'tunemole', labelKey: 'apps.tunemole.title' },
  {
    appId: 'explorer',
    props: { folder: 'music' },
    labelKey: 'fs.folders.music',
  },
  { appId: 'mines', labelKey: 'apps.mines.title' },
  { appId: 'henhunt', labelKey: 'apps.henhunt.title' },
  { appId: 'pinball', labelKey: 'apps.pinball.title' },
  { appId: 'wrecker', labelKey: 'apps.wrecker.title' },
  { appId: 'paint', labelKey: 'apps.paint.label' },
  { appId: 'photobooth', labelKey: 'apps.photobooth.title' },
  { appId: 'explorer', props: { folder: 'pics' }, labelKey: 'fs.folders.pics' },
  { appId: 'notepad', labelKey: 'apps.notepad.label' },
  { appId: 'messenger-history', labelKey: 'apps.messenger-history.title' },
  { appId: 'diskcleanup', labelKey: 'apps.diskcleanup.title' },
];

/** Resolves shortcuts against the registry; shortcuts to unregistered apps are dropped. */
export function resolveShortcuts(
  shortcuts: readonly Shortcut[],
  lookup: (id: AppId) => AppDefinition | undefined = getApp,
): ResolvedShortcut[] {
  const out: ResolvedShortcut[] = [];
  const keys = new Set<string>();
  shortcuts.forEach((s, i) => {
    const app = lookup(s.appId);
    if (!app) return;
    const folder = s.props?.folder;
    let key = typeof folder === 'string' ? `${s.appId}:${folder}` : s.appId;
    // Two shortcuts to the same thing still get their own keys.
    if (keys.has(key)) key = `${key}:${i}`;
    keys.add(key);
    out.push({
      key,
      appId: s.appId,
      props: s.props ?? {},
      label: t(s.labelKey),
      icon16: s.icon16 ?? app.icon16,
      icon32: s.icon32 ?? app.icon32,
      shortcut: !SYSTEM_ICONS.includes(s.appId),
    });
  });
  return out;
}

/** Wraps an app as a shortcut, for the `apps` override props. */
export function appShortcut(app: AppDefinition): Shortcut {
  return { appId: app.id, labelKey: app.labelKey ?? app.titleKey };
}
