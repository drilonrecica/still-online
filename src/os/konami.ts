// The Konami code, on the desktop with no window focused: unlocks the `konami` wallpaper. On touch
// it is swiped on the desktop background: up, up, down, down, left, right, left, right, tap, tap.
import { t } from '@/i18n/t';
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

export type Gesture = 'up' | 'down' | 'left' | 'right' | 'tap';

const SWIPES: readonly Gesture[] = [
  'up',
  'up',
  'down',
  'down',
  'left',
  'right',
  'left',
  'right',
  'tap',
  'tap',
];

/** A finger that travels further than this is a swipe. */
export const SWIPE_MIN_PX = 40;
/** A finger that travels at most this far is a tap (as in `useLongPress`). */
export const TAP_SLOP_PX = 10;

/** One finger's travel from down to up: a swipe along its main axis, a tap, or null (neither). */
export function classifySwipe(dx: number, dy: number): Gesture | null {
  const distance = Math.hypot(dx, dy);
  if (distance <= TAP_SLOP_PX) return 'tap';
  if (distance <= SWIPE_MIN_PX) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

/** Returns true when `sequence` has just been completed; a wrong token starts over. */
function createSequenceMatcher<T>(
  sequence: readonly T[],
): (token: T | null) => boolean {
  let at = 0;
  return (token) => {
    if (token === sequence[at]) at++;
    else at = token === sequence[0] ? 1 : 0;
    if (at < sequence.length) return false;
    at = 0;
    return true;
  };
}

/** Feed it keys (`KeyboardEvent.key`); it returns true when the sequence has just been completed. */
export function createKonamiMatcher(): (key: string) => boolean {
  const feed = createSequenceMatcher<string>(SEQUENCE);
  return (key) => feed(key.toLowerCase());
}

/** Feed it gestures (null for one that is neither); true when the swipe code is complete. */
export function createKonamiSwipeMatcher(): (
  gesture: Gesture | null,
) => boolean {
  return createSequenceMatcher(SWIPES);
}

/** The desktop background itself, not an icon or its menu. */
function onDesktopBackground(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    target.closest('[data-desktop-background]') !== null &&
    target.closest('[role="option"], [role="menu"]') === null
  );
}

/** Only on the first activation does it announce itself. */
function activate() {
  const world = useWorldStore.getState();
  if (world.hasUnlock(KONAMI_UNLOCK)) return;
  world.unlock(KONAMI_UNLOCK);
  useToastStore.getState().push({
    title: t('toast.cheatTitle'),
    text: t('toast.cheatText'),
  });
  playSound('notify');
}

/** Listens for the key code and the swipe code. Returns a cleanup. */
export function installKonami(target: Window = window): () => void {
  const feed = createKonamiMatcher();
  const onKeyDown = (e: KeyboardEvent) => {
    // A focused window (or any text field) means the player is typing, not cheating.
    if (selectActiveWindowId(useWindowsStore.getState()) !== null) return;
    if (feed(e.key)) activate();
  };

  const feedSwipe = createKonamiSwipeMatcher();
  const downs = new Map<number, { x: number; y: number }>();
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch' || !onDesktopBackground(e.target)) return;
    downs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  };
  const onPointerUp = (e: PointerEvent) => {
    const down = downs.get(e.pointerId);
    if (!down) return;
    downs.delete(e.pointerId);
    if (feedSwipe(classifySwipe(e.clientX - down.x, e.clientY - down.y))) {
      activate();
    }
  };
  // A cancelled touch (the browser took it) is no gesture at all.
  const onPointerCancel = (e: PointerEvent) => {
    if (downs.delete(e.pointerId)) feedSwipe(null);
  };

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('pointerdown', onPointerDown);
  target.addEventListener('pointerup', onPointerUp);
  target.addEventListener('pointercancel', onPointerCancel);
  return () => {
    target.removeEventListener('keydown', onKeyDown);
    target.removeEventListener('pointerdown', onPointerDown);
    target.removeEventListener('pointerup', onPointerUp);
    target.removeEventListener('pointercancel', onPointerCancel);
  };
}
