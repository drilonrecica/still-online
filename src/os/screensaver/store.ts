// Runtime-only: the screensaver running right now, started by idle time or by Display Properties →
// Preview. The overlay renders `running` until the first input. Never persisted.
import { create } from 'zustand';
import type { ScreensaverId } from '@/os/types';

export type SaverId = Exclude<ScreensaverId, 'none'>;

export interface ScreensaverRun {
  id: SaverId;
  /** Marquee text. */
  text: string;
  reason: 'idle' | 'preview';
}

export interface ScreensaverStore {
  /** null when no saver is showing. */
  running: ScreensaverRun | null;
  /** Display Properties → Preview: starts `id` now. `none` stops. */
  startPreview: (id: ScreensaverId, text: string) => void;
  /** The idle timer fired: starts `id` unless a saver is already showing. */
  startIdle: (id: ScreensaverId, text: string) => void;
  stop: () => void;
}

export const useScreensaverStore = create<ScreensaverStore>()((set, get) => ({
  running: null,
  startPreview: (id, text) =>
    set({ running: id === 'none' ? null : { id, text, reason: 'preview' } }),
  startIdle: (id, text) => {
    if (id === 'none' || get().running) return;
    set({ running: { id, text, reason: 'idle' } });
  },
  stop: () => set({ running: null }),
}));
