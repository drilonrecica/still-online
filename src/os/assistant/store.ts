// Stapley's balloon: runtime-only. One tip shows at a time; the rest wait in a queue.
// Which tips were shown or silenced persists in `settings.seenTips`.
import { create } from 'zustand';
import type { Tip, TipOption } from '@/content/assistant';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import type { AppId } from '@/os/types';

export interface ShownTip {
  tip: Tip;
  /** Set once an option with a `reply` was picked: the balloon shows this text with an OK. */
  reply?: string;
}

export interface AssistantStore {
  current: ShownTip | null;
  queue: Tip[];
  /** Shows `tip` now, queues it behind the visible one, or drops it (hidden, seen or silenced). */
  offer: (tip: Tip) => void;
  /** Runs an option of the visible tip. */
  choose: (option: TipOption) => void;
  /** Closes the visible tip and shows the next queued one. */
  dismiss: () => void;
  /** Empties the queue and closes the visible tip. For tests, log off and Hide. */
  clear: () => void;
}

/** Jokes cycle, so only the other tips are recorded as seen when they are shown. */
const isJoke = (tip: Tip) => tip.trigger.event === 'idle';

const OPEN_APP = 'openApp:';

export const useAssistantStore = create<AssistantStore>()((set, get) => {
  /** Shows the next queued tip that is still eligible. */
  function showNext() {
    const { seenTips } = useSettingsStore.getState();
    const queue = get().queue.filter((t) => !seenTips.includes(t.id));
    const [tip, ...rest] = queue;
    if (!tip) {
      set({ current: null, queue: [] });
      return;
    }
    if (!isJoke(tip)) useSettingsStore.getState().addSeenTip(tip.id);
    set({ current: { tip }, queue: rest });
  }

  return {
    current: null,
    queue: [],
    offer(tip) {
      const settings = useSettingsStore.getState();
      if (!settings.assistantEnabled || settings.seenTips.includes(tip.id)) {
        return;
      }
      const { current, queue } = get();
      if (current?.tip.id === tip.id || queue.some((t) => t.id === tip.id)) {
        return;
      }
      if (current) {
        // A joke isn't worth a place in line.
        if (!isJoke(tip)) set({ queue: [...queue, tip] });
        return;
      }
      if (!isJoke(tip)) settings.addSeenTip(tip.id);
      set({ current: { tip } });
    },
    choose(option) {
      const { current } = get();
      if (!current) return;
      if (option.action === 'never') {
        useSettingsStore.getState().addSeenTip(current.tip.id);
      } else if (option.action.startsWith(OPEN_APP)) {
        const app = option.action.slice(OPEN_APP.length) as AppId;
        try {
          useWindowsStore.getState().openApp(app);
        } catch (error) {
          console.warn('[assistant] could not open app', app, error);
        }
      }
      if (option.reply) set({ current: { ...current, reply: option.reply } });
      else get().dismiss();
    },
    dismiss: showNext,
    clear: () => set({ current: null, queue: [] }),
  };
});
