// Data-driven launchers for the desktop and the Start menu's places column.
import { getApp } from '@/apps/registry';
import type { AppDefinition, AppId, Shortcut, WindowProps } from '@/os/types';

/** A shortcut whose app is registered, with icons filled in from the app. */
export interface ResolvedShortcut {
  /** Unique within a list (several shortcuts can share an app). */
  key: string;
  appId: AppId;
  props: WindowProps;
  label: string;
  icon16: string;
  icon32: string;
}

/** Start menu right column, in order. */
export const START_PLACES: readonly Shortcut[] = [
  { appId: 'explorer', props: { folder: 'docs' }, label: 'My Documents' },
  { appId: 'explorer', props: { folder: 'pics' }, label: 'My Pictures' },
  { appId: 'explorer', props: { folder: 'music' }, label: 'My Music' },
  { appId: 'mycomputer', label: 'My Computer' },
  { appId: 'display', label: 'Control Panel' },
  { appId: 'recyclebin', label: 'Recycle Bin' },
];

/** Desktop icons, in order (top-left column first). */
export const DESKTOP_SHORTCUTS: readonly Shortcut[] = [
  { appId: 'explorer', props: { folder: 'docs' }, label: 'My Documents' },
  { appId: 'mycomputer', label: 'My Computer' },
  { appId: 'recyclebin', label: 'Recycle Bin' },
  { appId: 'messenger', label: 'Messenger' },
  { appId: 'amplifier', label: 'Amplifier' },
  { appId: 'notepad', label: 'Notepad' },
];

/** Resolves shortcuts against the registry; shortcuts to unregistered apps are dropped. */
export function resolveShortcuts(
  shortcuts: readonly Shortcut[],
  lookup: (id: AppId) => AppDefinition | undefined = getApp,
): ResolvedShortcut[] {
  const out: ResolvedShortcut[] = [];
  shortcuts.forEach((s, i) => {
    const app = lookup(s.appId);
    if (!app) return;
    out.push({
      key: `${s.appId}:${i}`,
      appId: s.appId,
      props: s.props ?? {},
      label: s.label,
      icon16: s.icon16 ?? app.icon16,
      icon32: s.icon32 ?? app.icon32,
    });
  });
  return out;
}

/** Wraps an app as a shortcut, for the `apps` override props. */
export function appShortcut(app: AppDefinition): Shortcut {
  return { appId: app.id, label: app.label ?? app.title };
}
