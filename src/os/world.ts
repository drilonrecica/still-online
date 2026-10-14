// World/day store. Persisted under `still-online:v1:world`.
// See docs/architecture-v0.2.md → "World, network, idle".
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { events } from '@/os/events';
import { isRecord, persistOptions } from '@/os/persist';
import type { WorldState, WorldStore } from '@/os/serviceTypes';

export const WORLD_DEFAULTS: WorldState = {
  day: 1,
  lastRealDate: '',
  shutdownPending: false,
  unlocks: [],
  dayStartedAt: 0,
};

/** Local calendar date as `YYYY-MM-DD`. */
export function localDateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

/** A corrupt day means a corrupt world: start over at day 1. Other bad fields fall back alone. */
export function sanitizeWorld(
  persisted: unknown,
  current: WorldState,
): WorldState {
  if (!isRecord(persisted)) return current;
  const { day, lastRealDate, shutdownPending, unlocks, dayStartedAt } =
    persisted;
  if (day === undefined) return current;
  if (typeof day !== 'number' || !Number.isInteger(day) || day < 1) {
    return { ...WORLD_DEFAULTS };
  }
  return {
    day,
    lastRealDate:
      typeof lastRealDate === 'string' && DATE_KEY.test(lastRealDate)
        ? lastRealDate
        : current.lastRealDate,
    shutdownPending:
      typeof shutdownPending === 'boolean'
        ? shutdownPending
        : current.shutdownPending,
    unlocks: Array.isArray(unlocks)
      ? [
          ...new Set(
            unlocks.filter(
              (u): u is string => typeof u === 'string' && u !== '',
            ),
          ),
        ]
      : current.unlocks,
    dayStartedAt:
      typeof dayStartedAt === 'number' && Number.isFinite(dayStartedAt)
        ? dayStartedAt
        : current.dayStartedAt,
  };
}

export const useWorldStore = create<WorldStore>()(
  persist(
    (set, get) => ({
      ...WORLD_DEFAULTS,

      onBoot: (realNow = new Date()) => {
        const today = localDateKey(realNow);
        const { day, lastRealDate, shutdownPending } = get();

        // First boot (day is still 1). A lost date alone never costs the player their day.
        if (!lastRealDate) {
          set({
            lastRealDate: today,
            shutdownPending: false,
            dayStartedAt: realNow.getTime(),
          });
          return;
        }
        // A reload without a shutdown on the same date keeps the day.
        if (!shutdownPending && today === lastRealDate) return;
        const next = day + 1;
        set({
          day: next,
          lastRealDate: today,
          shutdownPending: false,
          dayStartedAt: realNow.getTime(),
        });
        events.emit('world:dayChanged', { day: next });
      },

      markShutdown: () => {
        if (!get().shutdownPending) set({ shutdownPending: true });
      },

      unlock: (id) => {
        if (!id || get().unlocks.includes(id)) return;
        set({ unlocks: [...get().unlocks, id] });
        events.emit('world:unlock', { id });
      },

      hasUnlock: (id) => get().unlocks.includes(id),
    }),
    persistOptions<WorldStore, WorldState>({
      name: 'world',
      partialize: ({
        day,
        lastRealDate,
        shutdownPending,
        unlocks,
        dayStartedAt,
      }) => ({
        day,
        lastRealDate,
        shutdownPending,
        unlocks,
        dayStartedAt,
      }),
      sanitize: (persisted, current) => ({
        ...current,
        ...sanitizeWorld(persisted, current),
      }),
    }),
  ),
);

/** The current day, read outside React. */
export function currentDay(): number {
  return useWorldStore.getState().day;
}
