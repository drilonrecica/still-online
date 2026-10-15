// Runtime-only: a screensaver the player asked to see right now (Display Properties → Preview).
// P1-03's overlay renders `preview` until the first input.
import { create } from 'zustand';
import type { ScreensaverId } from '@/os/types';

export interface ScreensaverPreviewStore {
  /** The saver to run now, with its marquee text; null when not previewing. */
  preview: { id: ScreensaverId; text: string } | null;
  startPreview: (id: ScreensaverId, text: string) => void;
  stopPreview: () => void;
}

export const useScreensaverPreview = create<ScreensaverPreviewStore>()(
  (set) => ({
    preview: null,
    startPreview: (id, text) =>
      set({ preview: id === 'none' ? null : { id, text } }),
    stopPreview: () => set({ preview: null }),
  }),
);
