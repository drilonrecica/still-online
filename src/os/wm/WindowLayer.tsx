// Renders every open window inside the work area (viewport minus the taskbar).
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import type { AppDefinition, AppId } from '@/os/types';
import { Window } from './Window';
import styles from './Window.module.css';

export interface WindowLayerProps {
  /** Registry lookup (M1-05 passes `getApp`). Windows of unknown apps are skipped. */
  getApp: (appId: AppId) => AppDefinition | undefined;
}

export function WindowLayer({ getApp }: WindowLayerProps) {
  const windows = useWindowsStore((s) => s.windows);
  const activeId = useWindowsStore(selectActiveWindowId);

  return (
    <div className={styles.layer} data-testid="window-layer">
      {windows.map((win) => {
        const app = getApp(win.appId);
        if (!app) return null;
        return (
          <Window
            key={win.id}
            win={win}
            app={app}
            active={win.id === activeId}
          />
        );
      })}
    </div>
  );
}
