// Toast store: runtime-only queue of tray notifications (not persisted).
import { create } from 'zustand';

/** Toasts visible at once; a newer toast pushes the oldest one out. */
export const MAX_TOASTS = 3;
/** How long a toast stays before sliding away. */
export const TOAST_MS = 4000;

/** A toast line: fixed, or built at each render so it follows a language or gender switch. */
export type ToastText = string | (() => string);

export const toastText = (text: ToastText): string =>
  typeof text === 'function' ? text() : text;

export interface ToastInput {
  /** Bold first line. */
  title: ToastText;
  /** Optional second line. */
  text?: ToastText;
  /** Icon URL (16px-ish). */
  icon?: string;
  /** Runs when the toast is clicked; the toast is dismissed afterwards. */
  onClick?: () => void;
}

export interface Toast extends ToastInput {
  id: number;
}

export interface ToastStore {
  toasts: Toast[];
  push: (toast: ToastInput) => number;
  dismiss: (id: number) => void;
  clear: () => void;
}

let nextId = 1;

export const useToastStore = create<ToastStore>()((set) => ({
  toasts: [],
  push: (input) => {
    const id = nextId++;
    set((s) => ({
      toasts: [...s.toasts, { ...input, id }].slice(-MAX_TOASTS),
    }));
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
