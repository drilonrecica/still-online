// App registry: the single list of implemented apps. Registers itself as the window manager's resolver.
import { lazy } from 'react';
import { setAppResolver } from '@/os/store/windows';
import type { AppDefinition, AppId } from '@/os/types';
import amplifier16 from '@/assets/icons/amplifier-16.svg';
import amplifier32 from '@/assets/icons/amplifier-32.svg';
import browser16 from '@/assets/icons/browser-16.svg';
import browser32 from '@/assets/icons/browser-32.svg';
import dialup16 from '@/assets/icons/dialup-16.svg';
import dialup32 from '@/assets/icons/dialup-32.svg';
import diskCleanup16 from '@/assets/icons/diskcleanup-16.svg';
import diskCleanup32 from '@/assets/icons/diskcleanup-32.svg';
import display16 from '@/assets/icons/display-16.svg';
import display32 from '@/assets/icons/display-32.svg';
import folder16 from '@/assets/icons/folder-16.svg';
import folder32 from '@/assets/icons/folder-32.svg';
import mines16 from '@/assets/icons/mines-16.svg';
import mines32 from '@/assets/icons/mines-32.svg';
import mail16 from '@/assets/icons/mail-16.svg';
import mail32 from '@/assets/icons/mail-32.svg';
import messenger16 from '@/assets/icons/messenger-16.svg';
import messenger32 from '@/assets/icons/messenger-32.svg';
import myComputer16 from '@/assets/icons/mycomputer-16.svg';
import myComputer32 from '@/assets/icons/mycomputer-32.svg';
import notepad16 from '@/assets/icons/notepad-16.svg';
import notepad32 from '@/assets/icons/notepad-32.svg';
import paint16 from '@/assets/icons/paint-16.svg';
import paint32 from '@/assets/icons/paint-32.svg';
import photobooth16 from '@/assets/icons/photobooth-16.svg';
import photobooth32 from '@/assets/icons/photobooth-32.svg';
import tunemole16 from '@/assets/icons/tunemole-16.svg';
import tunemole32 from '@/assets/icons/tunemole-32.svg';
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
  display: {
    id: 'display',
    title: 'Display Properties',
    label: 'Display',
    icon16: display16,
    icon32: display32,
    component: lazy(() => import('./display/Display')),
    defaultSize: { w: 400, h: 440 },
    minSize: { w: 400, h: 440 },
    singleInstance: true,
    chrome: 'xp',
    fixedSize: true,
    showOnDesktop: false,
    showInStartMenu: false,
    category: 'system',
  },
  diskcleanup: {
    id: 'diskcleanup',
    title: 'Disk Cleanup',
    icon16: diskCleanup16,
    icon32: diskCleanup32,
    component: lazy(() => import('./diskcleanup/DiskCleanup')),
    defaultSize: { w: 380, h: 300 },
    minSize: { w: 380, h: 300 },
    singleInstance: true,
    chrome: 'xp',
    fixedSize: true,
    showOnDesktop: false,
    showInStartMenu: true,
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
  'messenger-history': {
    id: 'messenger-history',
    title: 'Message History',
    icon16: messenger16,
    icon32: messenger32,
    component: lazy(() => import('./messenger/history/History')),
    defaultSize: { w: 560, h: 400 },
    minSize: { w: 400, h: 260 },
    singleInstance: true,
    chrome: 'xp',
    showOnDesktop: false,
    showInStartMenu: false,
  },
  dialup: {
    id: 'dialup',
    title: 'Connect to the Internet',
    icon16: dialup16,
    icon32: dialup32,
    component: lazy(() => import('./dialup/Dialup')),
    defaultSize: { w: 360, h: 260 },
    minSize: { w: 360, h: 260 },
    singleInstance: true,
    chrome: 'xp',
    fixedSize: true,
    showOnDesktop: false,
    showInStartMenu: false,
    category: 'internet',
  },
  browser: {
    id: 'browser',
    title: 'Web Explorer',
    icon16: browser16,
    icon32: browser32,
    component: lazy(() => import('./browser/Browser')),
    defaultSize: { w: 800, h: 600 },
    minSize: { w: 400, h: 300 },
    singleInstance: false,
    chrome: 'xp',
    showOnDesktop: true,
    showInStartMenu: true,
    category: 'internet',
    pinned: true,
  },
  mail: {
    id: 'mail',
    title: 'Mail',
    icon16: mail16,
    icon32: mail32,
    component: lazy(() => import('./mail/Mail')),
    defaultSize: { w: 720, h: 500 },
    minSize: { w: 480, h: 320 },
    singleInstance: true,
    chrome: 'xp',
    showOnDesktop: true,
    showInStartMenu: true,
    category: 'internet',
    pinned: true,
  },
  tunemole: {
    id: 'tunemole',
    title: 'TuneMole',
    icon16: tunemole16,
    icon32: tunemole32,
    component: lazy(() => import('./tunemole/TuneMole')),
    defaultSize: { w: 640, h: 460 },
    minSize: { w: 480, h: 320 },
    singleInstance: true,
    chrome: 'xp',
    showOnDesktop: false,
    showInStartMenu: true,
    category: 'internet',
  },
  amplifier: {
    id: 'amplifier',
    title: 'Amplifier',
    icon16: amplifier16,
    icon32: amplifier32,
    component: lazy(() => import('./amplifier/Amplifier')),
    defaultSize: { w: 275, h: 116 },
    // Height 14 lets the windowshade strip shrink the window.
    minSize: { w: 275, h: 14 },
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
  paint: {
    id: 'paint',
    title: 'untitled - Paint',
    label: 'Paint',
    icon16: paint16,
    icon32: paint32,
    component: lazy(() => import('./paint/Paint')),
    defaultSize: { w: 720, h: 560 },
    minSize: { w: 420, h: 320 },
    singleInstance: false,
    chrome: 'xp',
    showOnDesktop: false,
    showInStartMenu: true,
    category: 'accessories',
    pinned: true,
  },
  photobooth: {
    id: 'photobooth',
    title: 'Snapshot Booth',
    icon16: photobooth16,
    icon32: photobooth32,
    component: lazy(() => import('./photobooth/Photobooth')),
    defaultSize: { w: 560, h: 480 },
    minSize: { w: 420, h: 380 },
    singleInstance: true,
    chrome: 'xp',
    showOnDesktop: false,
    showInStartMenu: true,
    category: 'accessories',
  },
  mines: {
    id: 'mines',
    title: 'Mines',
    icon16: mines16,
    icon32: mines32,
    component: lazy(() => import('./mines/Mines')),
    // Sized to the Beginner board; the app resizes the window when the level changes.
    defaultSize: { w: 170, h: 263 },
    minSize: { w: 170, h: 263 },
    singleInstance: true,
    chrome: 'xp',
    fixedSize: true,
    showOnDesktop: false,
    showInStartMenu: true,
    category: 'games',
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
