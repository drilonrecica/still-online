// Undo/redo of whole-image snapshots, at most `limit` steps back.

export const UNDO_LIMIT = 20;

export interface History<T> {
  /** Records the state before a change; clears the redo stack. */
  push: (before: T) => void;
  /** Returns the state to restore and remembers `current` for redo; null when empty. */
  undo: (current: T) => T | null;
  redo: (current: T) => T | null;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
}

export function createHistory<T>(limit = UNDO_LIMIT): History<T> {
  let past: T[] = [];
  let future: T[] = [];
  return {
    push(before) {
      past.push(before);
      if (past.length > limit) past = past.slice(past.length - limit);
      future = [];
    },
    undo(current) {
      const prev = past.pop();
      if (prev === undefined) return null;
      future.push(current);
      return prev;
    },
    redo(current) {
      const next = future.pop();
      if (next === undefined) return null;
      past.push(current);
      return next;
    },
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
    clear() {
      past = [];
      future = [];
    },
  };
}
