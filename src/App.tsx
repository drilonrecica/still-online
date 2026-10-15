import { useEffect, useRef, useState } from 'react';
import { getApp } from '@/apps/registry';
import { installAmplifierRouter } from '@/os/amplifierRouter';
import { Boot } from '@/os/boot/Boot';
import { DesktopIcons } from '@/os/desktop/DesktopIcons';
import { installIdle } from '@/os/idle';
import { Login } from '@/os/login/Login';
// Side-effect import: track what's playing from boot, before any app that reads it loads.
import '@/os/nowPlaying';
import { SmallScreenNotice } from '@/os/notice/SmallScreenNotice';
import { installGestureUnlock, playSound } from '@/os/sound';
import { useSessionStore } from '@/os/store/session';
import { OffScreen } from '@/os/startmenu/OffScreen';
import { StartMenu } from '@/os/startmenu/StartMenu';
import { Taskbar } from '@/os/taskbar/Taskbar';
import { ToastLayer } from '@/os/toast/ToastLayer';
import { useDesktopBackground } from '@/os/wallpapers/useDesktopBackground';
import { WindowLayer } from '@/os/wm/WindowLayer';
import { useWorldStore } from '@/os/world';

/** How long "Windows is shutting down" lasts before the screen goes black. */
const SHUTDOWN_MS = 1500;

function Desktop() {
  const [startOpen, setStartOpen] = useState(false);
  return (
    <>
      <DesktopIcons />
      <WindowLayer getApp={getApp} />
      <StartMenu open={startOpen} onClose={() => setStartOpen(false)} />
      <ToastLayer />
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
  const background = useDesktopBackground();

  useEffect(() => installGestureUnlock(), []);
  useEffect(() => installAmplifierRouter(), []);
  useEffect(() => installIdle(), []);

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

  // Days pass on a new real date or after a shutdown (docs/architecture-v0.2.md → "World").
  useEffect(() => {
    if (state === 'booting') useWorldStore.getState().onBoot();
    else if (state === 'off') useWorldStore.getState().markShutdown();
  }, [state]);

  useEffect(() => {
    if (state !== 'shuttingDown') return;
    const timer = setTimeout(shutdownComplete, SHUTDOWN_MS);
    return () => clearTimeout(timer);
  }, [state, shutdownComplete]);

  return (
    <div className="desktop-root" style={background}>
      <h1 hidden>still-online</h1>
      {state === 'booting' && <Boot />}
      {state === 'login' && <Login />}
      {state === 'desktop' && <Desktop />}
      {state === 'off' && <OffScreen />}
      <SmallScreenNotice />
    </div>
  );
}
