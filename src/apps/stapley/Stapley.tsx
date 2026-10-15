// "Stapley" in Start → All Programs → Accessories: brings the assistant back after Hide. It is an
// app with no window of its own: it switches the setting on and closes itself at once.
import { useEffect } from 'react';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import type { AppComponentProps } from '@/os/types';

export default function Stapley({ windowId }: AppComponentProps) {
  useEffect(() => {
    useSettingsStore.getState().setAssistantEnabled(true);
    useWindowsStore.getState().closeWindow(windowId);
  }, [windowId]);
  return null;
}
