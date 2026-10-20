// Where the player put the desktop icons. Empty until the first drag: the default is the
// unarranged column order (`layoutIcons`).
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isRecord, persistOptions } from '@/os/persist';
import type { Cell } from './grid';

/** Far beyond any screen; anything larger is a corrupt save. */
const MAX_CELL = 200;

export interface DesktopData {
  /** Icon key (`ResolvedShortcut.key`) → its grid cell. */
  positions: Record<string, Cell>;
}

export interface DesktopStore extends DesktopData {
  /** Saves the whole layout, so the other icons stay where they are now. */
  place: (positions: Record<string, Cell>) => void;
  /** "Arrange Icons By ▸ Name": back to the default order. */
  arrange: () => void;
}

const isIndex = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= MAX_CELL;

export function sanitizePositions(value: unknown): Record<string, Cell> {
  const out: Record<string, Cell> = {};
  if (!isRecord(value)) return out;
  for (const [id, cell] of Object.entries(value)) {
    if (isRecord(cell) && isIndex(cell.col) && isIndex(cell.row)) {
      out[id] = { col: cell.col, row: cell.row };
    }
  }
  return out;
}

export const useDesktopStore = create<DesktopStore>()(
  persist(
    (set) => ({
      positions: {},
      place: (positions) => set({ positions: sanitizePositions(positions) }),
      arrange: () => set({ positions: {} }),
    }),
    persistOptions<DesktopStore, DesktopData>({
      name: 'desktop',
      partialize: ({ positions }) => ({ positions }),
      sanitize: (persisted, current) => ({
        ...current,
        positions: sanitizePositions(
          isRecord(persisted) ? persisted.positions : undefined,
        ),
      }),
    }),
  ),
);
