// One requestAnimationFrame loop that stops while it shouldn't run: `active` is false (window
// minimized, overlay off) or the tab is hidden. Resuming starts with dt = 0, so a pause never
// shows up as one long frame.
import { useEffect, useRef } from 'react';
import { useWindowsStore } from '@/os/store/windows';

/** `time` is the rAF timestamp; `dt` is milliseconds since the previous frame (0 after a resume). */
export type FrameCallback = (time: number, dt: number) => void;

export function useAnimationFrame(
  callback: FrameCallback,
  active: boolean,
): void {
  const cbRef = useRef(callback);
  useEffect(() => {
    cbRef.current = callback;
  });

  useEffect(() => {
    if (!active) return;
    let frame = 0;
    let last: number | null = null;
    const tick = (time: number) => {
      frame = requestAnimationFrame(tick);
      const dt = last === null ? 0 : time - last;
      last = time;
      cbRef.current(time, dt);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = null;
      if (!document.hidden) frame = requestAnimationFrame(tick);
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [active]);
}

/** True while the window with this id is minimized (hidden, but its app stays mounted). */
export function useWindowMinimized(windowId: string | undefined): boolean {
  return useWindowsStore(
    (s) => s.windows.find((w) => w.id === windowId)?.minimized ?? false,
  );
}
