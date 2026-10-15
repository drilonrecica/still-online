// The Konami code, on the desktop with no window focused: unlocks the `konami` wallpaper.
import { playSound } from '@/os/sound';
import { selectActiveWindowId, useWindowsStore } from '@/os/store/windows';
import { useToastStore } from '@/os/toast/store';
import { useWorldStore } from '@/os/world';

export const KONAMI_UNLOCK = 'konami';

const SEQUENCE = [
  'arrowup',
  'arrowup',
  'arrowdown',
  'arrowdown',
  'arrowleft',
  'arrowright',
  'arrowleft',
  'arrowright',
  'b',
  'a',
] as const;

/** Feed it keys (`KeyboardEvent.key`); it returns true when the sequence has just been completed. */
export function createKonamiMatcher(): (key: string) => boolean {
  let at = 0;
  return (key) => {
    const k = key.toLowerCase();
    if (k === SEQUENCE[at]) at++;
    else at = k === SEQUENCE[0] ? 1 : 0;
    if (at < SEQUENCE.length) return false;
    at = 0;
    return true;
  };
}

/** Only on the first activation does it announce itself. Returns a cleanup. */
export function installKonami(target: Window = window): () => void {
  const feed = createKonamiMatcher();
  const onKeyDown = (e: KeyboardEvent) => {
    // A focused window (or any text field) means the player is typing, not cheating.
    if (selectActiveWindowId(useWindowsStore.getState()) !== null) return;
    if (!feed(e.key)) return;
    const world = useWorldStore.getState();
    if (world.hasUnlock(KONAMI_UNLOCK)) return;
    world.unlock(KONAMI_UNLOCK);
    useToastStore.getState().push({
      title: 'Cheat activated!',
      text: 'A new wallpaper is available.',
    });
    playSound('notify');
  };
  target.addEventListener('keydown', onKeyDown);
  return () => target.removeEventListener('keydown', onKeyDown);
}
