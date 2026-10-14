import { useEffect, useState } from 'react';
import { getApp } from '@/apps/registry';
import { DesktopIcons } from '@/os/desktop/DesktopIcons';
import { useSessionStore } from '@/os/store/session';
import { OffScreen } from '@/os/startmenu/OffScreen';
import { StartMenu } from '@/os/startmenu/StartMenu';
import { Taskbar } from '@/os/taskbar/Taskbar';
import { WindowLayer } from '@/os/wm/WindowLayer';

/** How long "Windows is shutting down" lasts before the screen goes black. */
const SHUTDOWN_MS = 1500;

function Desktop() {
  const [startOpen, setStartOpen] = useState(false);
  return (
    <>
      <DesktopIcons />
      <WindowLayer getApp={getApp} />
      <StartMenu open={startOpen} onClose={() => setStartOpen(false)} />
      <Taskbar
        startOpen={startOpen}
        onStartClick={() => setStartOpen((open) => !open)}
      />
    </>
  );
}

export function App() {
  const state = useSessionStore((s) => s.state);
  const shutdownComplete = useSessionStore((s) => s.shutdownComplete);

  useEffect(() => {
    if (state !== 'shuttingDown') return;
    const timer = setTimeout(shutdownComplete, SHUTDOWN_MS);
    return () => clearTimeout(timer);
  }, [state, shutdownComplete]);

  return (
    <div className="desktop-root">
      <h1 hidden>still-online</h1>
      {state === 'desktop' && <Desktop />}
      {state === 'off' && <OffScreen />}
    </div>
  );
}
