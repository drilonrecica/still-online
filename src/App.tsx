import { useEffect, useRef, useState } from 'react';
import { getApp } from '@/apps/registry';
import { Boot } from '@/os/boot/Boot';
import { DesktopIcons } from '@/os/desktop/DesktopIcons';
import { Login } from '@/os/login/Login';
import { installGestureUnlock, playSound } from '@/os/sound';
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

  useEffect(() => installGestureUnlock(), []);

  // Session sounds: startup at the welcome screen, logon/logoff on transitions.
  const previous = useRef(state);
  useEffect(() => {
    const from = previous.current;
    previous.current = state;
    if (state === 'login') playSound(from === 'desktop' ? 'logoff' : 'startup');
    else if (state === 'desktop') playSound('logon');
    else if (state === 'shuttingDown') playSound('logoff');
  }, [state]);

  useEffect(() => {
    const onError = () => playSound('error');
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onError);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onError);
    };
  }, []);

  useEffect(() => {
    if (state !== 'shuttingDown') return;
    const timer = setTimeout(shutdownComplete, SHUTDOWN_MS);
    return () => clearTimeout(timer);
  }, [state, shutdownComplete]);

  return (
    <div className="desktop-root">
      <h1 hidden>still-online</h1>
      {state === 'booting' && <Boot />}
      {state === 'login' && <Login />}
      {state === 'desktop' && <Desktop />}
      {state === 'off' && <OffScreen />}
    </div>
  );
}
