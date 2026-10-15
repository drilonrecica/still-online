// Test helper: a window's title as the titlebar renders it in the current locale.
import { getApp } from '@/apps/registry';
import { getLocale } from '@/i18n/t';
import { useWindowsStore } from '@/os/store/windows';
import { renderWindowTitle } from '@/os/wm/title';

export function titleOf(windowId: string | undefined): string | undefined {
  const win = useWindowsStore.getState().windows.find((w) => w.id === windowId);
  return win && renderWindowTitle(win, getApp(win.appId), getLocale());
}
