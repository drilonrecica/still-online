// Turns what the player does into tip offers. Installed with the desktop, so boot, login and off
// never show tips. See docs/architecture-v0.2.md → "Stapley".
import {
  IDLE_JOKE_MINUTES,
  IDLE_JOKES,
  TIPS,
  type Tip,
  type TipEvent,
} from '@/content/assistant';
import { events } from '@/os/events';
import { onIdle } from '@/os/idle';
import { mulberry32, seedFrom } from '@/os/random';
import { scaleMs } from '@/os/speed';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { currentDay } from '@/os/world';
import { useAssistantStore } from './store';

/** Let the desktop settle before the first tip. */
const SETTLE_MS = 2500;

export const tipsForEvent = (event: TipEvent): Tip[] =>
  TIPS.filter((t) => t.trigger.event === event);

/** The first joke, then the rest in order; jokes the player silenced are skipped. */
export function createJokeCycle(
  rng: () => number,
  silenced: () => readonly string[],
): () => Tip | null {
  let next = Math.floor(rng() * IDLE_JOKES.length);
  return () => {
    for (let i = 0; i < IDLE_JOKES.length; i++) {
      const joke = IDLE_JOKES[(next + i) % IDLE_JOKES.length]!;
      if (!silenced().includes(joke.id)) {
        next = (next + i + 1) % IDLE_JOKES.length;
        return joke;
      }
    }
    return null;
  };
}

/** Returns a cleanup that drops every listener and timer and closes the balloon. */
export function installAssistant(): () => void {
  const { offer, clear } = useAssistantStore.getState();
  const offerAll = (tips: readonly Tip[]) => tips.forEach(offer);
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const later = (fn: () => void) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, scaleMs(SETTLE_MS));
    timers.add(id);
  };

  // First desktop; the show-once record keeps it from ever coming back.
  later(() => offerAll(tipsForEvent('firstBoot')));
  if (currentDay() >= 2) later(() => offerAll(tipsForEvent('newDay')));
  const offDay = events.on('world:dayChanged', ({ day }) => {
    if (day >= 2) later(() => offerAll(tipsForEvent('newDay')));
  });

  const offLetter = events.on('notepad:letter', () =>
    offerAll(tipsForEvent('notepadLetter')),
  );

  // A window of an app with a tip appeared. Windows already open at install (restored) don't count.
  const known = new Set(useWindowsStore.getState().windows.map((w) => w.id));
  const offWindows = useWindowsStore.subscribe((state) => {
    for (const win of state.windows) {
      if (known.has(win.id)) continue;
      known.add(win.id);
      offerAll(TIPS.filter((t) => t.trigger.app === win.appId));
    }
  });

  const nextJoke = createJokeCycle(
    mulberry32(seedFrom('stapley')),
    () => useSettingsStore.getState().seenTips,
  );
  const offIdle = onIdle(IDLE_JOKE_MINUTES, () => {
    const joke = nextJoke();
    if (joke) offer(joke);
  });

  // Hiding Stapley takes the balloon with it.
  const offSettings = useSettingsStore.subscribe((state, prev) => {
    if (prev.assistantEnabled && !state.assistantEnabled) clear();
  });

  return () => {
    timers.forEach(clearTimeout);
    offDay();
    offLetter();
    offWindows();
    offIdle();
    offSettings();
    clear();
  };
}
