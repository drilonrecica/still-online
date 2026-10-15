// Starts the chosen screensaver after `settings.screensaver.minutes` idle. Installed by the desktop
// (so never during boot, login or off); re-arms when the setting changes.
import { screensaverText } from '@/i18n/settingsText';
import { onIdle } from '@/os/idle';
import { useSettingsStore } from '@/os/store/settings';
import type { ScreensaverSettings } from '@/os/types';
import { useScreensaverStore } from './store';

/** Returns a cleanup that also stops a running saver. */
export function installScreensaver(): () => void {
  let disarm: () => void = () => undefined;

  const arm = ({ id, minutes }: ScreensaverSettings) => {
    disarm();
    disarm =
      id === 'none' || !(minutes > 0)
        ? () => undefined
        : onIdle(minutes, () => {
            const current = useSettingsStore.getState().screensaver;
            useScreensaverStore
              .getState()
              .startIdle(current.id, screensaverText(current));
          });
  };

  arm(useSettingsStore.getState().screensaver);
  const unsubscribe = useSettingsStore.subscribe((s, prev) => {
    const a = s.screensaver;
    const b = prev.screensaver;
    if (a.id !== b.id || a.minutes !== b.minutes) arm(a);
  });

  return () => {
    unsubscribe();
    disarm();
    useScreensaverStore.getState().stop();
  };
}
