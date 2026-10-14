// App registry: the single list of implemented apps. Registers itself as the window manager's resolver.
import { lazy } from 'react';
import { setAppResolver } from '@/os/store/windows';
import type { AppDefinition, AppId } from '@/os/types';
import amplifier16 from '@/assets/icons/amplifier-16.svg';
import amplifier32 from '@/assets/icons/amplifier-32.svg';
import folder16 from '@/assets/icons/folder-16.svg';
import folder32 from '@/assets/icons/folder-32.svg';
import messenger16 from '@/assets/icons/messenger-16.svg';
import messenger32 from '@/assets/icons/messenger-32.svg';
import myComputer16 from '@/assets/icons/mycomputer-16.svg';
import myComputer32 from '@/assets/icons/mycomputer-32.svg';
import notepad16 from '@/assets/icons/notepad-16.svg';
import notepad32 from '@/assets/icons/notepad-32.svg';
import recycleBin16 from '@/assets/icons/recyclebin-16.svg';
import recycleBin32 from '@/assets/icons/recyclebin-32.svg';

export const APPS: Readonly<Partial<Record<AppId, AppDefinition>>> = {
  explorer: {
    id: 'explorer',
    title: 'Explorer',
    icon16: folder16,
    icon32: folder32,
    component: lazy(() => import('./explorer/Explorer')),
    defaultSize: { w: 520, h: 380 },
    minSize: { w: 320, h: 220 },
    singleInstance: true,
    instanceKey: (props) =>
      typeof props.folder === 'string' ? props.folder : 'docs',
    chrome: 'xp',
    showOnDesktop: false,
    showInStartMenu: false,
    category: 'system',
  },
  mycomputer: {
    id: 'mycomputer',
    title: 'My Computer',
    icon16: myComputer16,
    icon32: myComputer32,
    component: lazy(() => import('./mycomputer/MyComputer')),
    defaultSize: { w: 460, h: 340 },
    singleInstance: true,
    chrome: 'xp',
    showOnDesktop: true,
    showInStartMenu: false,
    category: 'system',
  },
  messenger: {
    id: 'messenger',
    title: 'Messenger',
    icon16: messenger16,
    icon32: messenger32,
    component: lazy(() => import('./messenger/Messenger')),
    defaultSize: { w: 300, h: 500 },
    minSize: { w: 240, h: 320 },
    singleInstance: true,
    chrome: 'xp',
    showOnDesktop: true,
    showInStartMenu: true,
    category: 'internet',
    pinned: true,
  },
  'messenger-chat': {
    id: 'messenger-chat',
    title: 'Conversation',
    icon16: messenger16,
    icon32: messenger32,
    component: lazy(() => import('./messenger/chat/Chat')),
    defaultSize: { w: 420, h: 400 },
    minSize: { w: 300, h: 300 },
    singleInstance: true,
    instanceKey: (props) => String(props.contactId),
    chrome: 'xp',
    showOnDesktop: false,
    showInStartMenu: false,
  },
  amplifier: {
    id: 'amplifier',
    title: 'Amplifier',
    icon16: amplifier16,
    icon32: amplifier32,
    component: lazy(() => import('./amplifier/Amplifier')),
    defaultSize: { w: 275, h: 116 },
    minSize: { w: 275, h: 116 },
    singleInstance: true,
    chrome: 'none',
    showOnDesktop: true,
    showInStartMenu: true,
    category: 'entertainment',
    pinned: true,
  },
  notepad: {
    id: 'notepad',
    title: 'Untitled - Notepad',
    label: 'Notepad',
    icon16: notepad16,
    icon32: notepad32,
    component: lazy(() => import('./notepad/Notepad')),
    defaultSize: { w: 480, h: 360 },
    singleInstance: false,
    chrome: 'xp',
    showOnDesktop: true,
    showInStartMenu: true,
    category: 'accessories',
    pinned: true,
  },
  recyclebin: {
    id: 'recyclebin',
    title: 'Recycle Bin',
    icon16: recycleBin16,
    icon32: recycleBin32,
    component: lazy(() => import('./recyclebin/RecycleBin')),
    defaultSize: { w: 420, h: 300 },
    singleInstance: true,
    chrome: 'xp',
    showOnDesktop: true,
    showInStartMenu: false,
    category: 'system',
  },
};

export function getApp(appId: AppId): AppDefinition | undefined {
  return APPS[appId];
}

/** Apps in registration order, for desktop/start menu lists. */
export function listApps(): AppDefinition[] {
  return Object.values(APPS);
}

setAppResolver(getApp);
