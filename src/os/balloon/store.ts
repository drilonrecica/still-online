// Balloon store: runtime-only queue of tray balloon tips, one visible at a time.
// Seen-once ids persist in `settings.seenTips`; the queue itself does not.
import { create } from 'zustand';
import { useSettingsStore } from '@/os/store/settings';
import type { BalloonInput } from '@/os/serviceTypes';
import { scaleMs } from '@/os/speed';

/** How long a balloon stays before dismissing itself. */
export const BALLOON_MS = 9000;

export interface BalloonStore {
  current: BalloonInput | null;
  queue: BalloonInput[];
  push: (balloon: BalloonInput) => void;
  /** Closes the visible balloon and shows the next one. */
  dismiss: () => void;
  /** Empties the queue and closes the visible balloon. For tests and log off. */
  clear: () => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

function stopTimer() {
  if (timer !== null) clearTimeout(timer);
  timer = null;
}

export const useBalloonStore = create<BalloonStore>()((set, get) => {
  /** Shows the next queued balloon that hasn't been seen meanwhile. */
  function showNext() {
    stopTimer();
    const settings = useSettingsStore.getState();
    const queue = get().queue.filter(
      (b) => !b.id || !settings.seenTips.includes(b.id),
    );
    const [next, ...rest] = queue;
    set({ current: next ?? null, queue: rest });
    if (!next) return;
    if (next.id) settings.addSeenTip(next.id);
    const shown = next;
    timer = setTimeout(() => {
      if (get().current === shown) get().dismiss();
    }, scaleMs(BALLOON_MS));
  }

  return {
    current: null,
    queue: [],
    push: (balloon) => {
      const { id } = balloon;
      if (id) {
        if (useSettingsStore.getState().seenTips.includes(id)) return;
        const { current, queue } = get();
        if (current?.id === id || queue.some((b) => b.id === id)) return;
      }
      set((s) => ({ queue: [...s.queue, balloon] }));
      if (!get().current) showNext();
    },
    dismiss: () => showNext(),
    clear: () => {
      stopTimer();
      set({ current: null, queue: [] });
    },
  };
});
