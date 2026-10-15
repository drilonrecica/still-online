// When a running screensaver stops: a pointer move of more than 4 px, a click, a key or the wheel.
// Pure logic, fed by the overlay's window listeners; plus the click swallower used after a dismiss.

export const MOVE_THRESHOLD_PX = 4;
/** Inputs this soon after start are ignored, so the click/key that started Preview can't stop it. */
export const GRACE_MS = 400;

export type DismissInput =
  | { kind: 'move'; x: number; y: number; time: number }
  | { kind: 'down' | 'key' | 'wheel'; time: number };

/** Returns a feeder that answers "should the saver stop now?" for each input. */
export function createDismissal(
  startedAt: number,
  graceMs = GRACE_MS,
): (input: DismissInput) => boolean {
  let origin: { x: number; y: number } | null = null;
  return (input) => {
    if (input.kind === 'move') {
      // The first move only tells us where the pointer is; jitter around it is not "input".
      if (!origin || input.time - startedAt < graceMs) {
        origin = { x: input.x, y: input.y };
        return false;
      }
      return (
        Math.hypot(input.x - origin.x, input.y - origin.y) > MOVE_THRESHOLD_PX
      );
    }
    return input.time - startedAt >= graceMs;
  };
}

const SWALLOWED = ['click', 'auxclick', 'contextmenu', 'dblclick'] as const;
const SWALLOW_MS = 800;

/**
 * Eats the click that follows the pointerdown which stopped the saver, so it doesn't land on
 * whatever was under the overlay. Gives up after the first click or `SWALLOW_MS`.
 */
export function swallowNextClick(target: Window = window): void {
  const eat = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'click' || e.type === 'contextmenu') done();
  };
  const done = () => {
    clearTimeout(timer);
    for (const type of SWALLOWED) target.removeEventListener(type, eat, true);
  };
  for (const type of SWALLOWED) target.addEventListener(type, eat, true);
  const timer = setTimeout(done, SWALLOW_MS);
}
