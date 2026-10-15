// TuneMole's download state machine. Not persisted: finished files live in My Music (fs), so the
// Library survives a reload while half-finished downloads do not. Progress is tick-driven so tests
// can run it with fake timers; `scaleMs` shortens both the tick and the real duration together.
import { create } from 'zustand';
import type { TuneMoleResult } from '@/content/types';
import type { MessageKey } from '@/i18n/types';
import { events } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useNetworkStore } from '@/os/network';
import { mulberry32, randInt, seedFrom, type Rand } from '@/os/random';
import { scaleMs } from '@/os/speed';

export type DownloadStatus =
  'queued' | 'connecting' | 'busy' | 'downloading' | 'stalled' | 'done';

export interface Download {
  id: string;
  result: TuneMoleResult;
  status: DownloadStatus;
  /** 0..1 */
  progress: number;
  /** Shown speed in KB/s; 0 unless downloading. */
  kbps: number;
  /** Seconds, derived from the shown speed. */
  etaSec: number;
}

export const TICK_MS = 500;
export const MAX_ACTIVE = 3;
export const SPEED_MIN = 2.1;
export const SPEED_MAX = 7.8;
/** Real time a file takes once connected, before `scaleMs`. */
export const DURATION_MIN_MS = 20_000;
export const DURATION_MAX_MS = 40_000;

interface Hidden {
  rand: Rand;
  /** Ticks to wait in the current connecting/busy phase. */
  wait: number;
  /** Ticks of downloading a file needs. */
  totalTicks: number;
  hadBusy: boolean;
}

export interface TuneMoleStore {
  downloads: Download[];
  /** Adds the result to the queue; ignores a file already in progress. Returns the id or null. */
  start: (result: TuneMoleResult) => string | null;
  /** Cancels or clears a download (also the way out of a stall). */
  remove: (id: string) => void;
  /** Advances every download by one tick. Driven by the interval; exported for tests. */
  tick: () => void;
  reset: () => void;
}

const hidden = new Map<string, Hidden>();
let timer: ReturnType<typeof setInterval> | null = null;
let counter = 0;

const isActive = (s: DownloadStatus) =>
  s === 'connecting' || s === 'busy' || s === 'downloading';

function stopTimer() {
  if (timer !== null) clearInterval(timer);
  timer = null;
}

function finish(d: Download) {
  const fs = useFsStore.getState();
  const r = d.result;
  if (r.kind === 'prank') {
    fs.createFile(FS_FOLDERS.music, {
      name: r.fileName,
      type: 'txt',
      text: r.prankText ?? 'lol gotcha.',
    });
  } else if (r.kind === 'track' && r.trackId) {
    fs.createFile(FS_FOLDERS.music, {
      name: r.fileName,
      type: 'audio',
      trackId: r.trackId,
    });
    events.emit('amplifier:enqueue', { trackId: r.trackId });
  }
}

export const useTuneMoleStore = create<TuneMoleStore>()((set, get) => {
  const syncTimer = () => {
    const needed = get().downloads.some(
      (d) => d.status !== 'done' && d.status !== 'stalled',
    );
    if (needed && timer === null) {
      timer = setInterval(() => get().tick(), scaleMs(TICK_MS));
    } else if (!needed) {
      stopTimer();
    }
  };

  return {
    downloads: [],

    start: (result) => {
      const dupe = get().downloads.some(
        (d) =>
          d.result.fileName === result.fileName &&
          d.result.peer === result.peer &&
          d.status !== 'done',
      );
      if (dupe) return null;
      const id = `dl:${++counter}`;
      const rand = mulberry32(
        seedFrom(`${result.fileName}|${result.peer}|${counter}`),
      );
      const durationMs = randInt(rand, DURATION_MIN_MS, DURATION_MAX_MS);
      hidden.set(id, {
        rand,
        wait: randInt(rand, 2, 5),
        totalTicks: Math.ceil(durationMs / TICK_MS),
        hadBusy: false,
      });
      const active = get().downloads.filter((d) => isActive(d.status)).length;
      set({
        downloads: [
          ...get().downloads,
          {
            id,
            result,
            status: active >= MAX_ACTIVE ? 'queued' : 'connecting',
            progress: 0,
            kbps: 0,
            etaSec: 0,
          },
        ],
      });
      syncTimer();
      return id;
    },

    remove: (id) => {
      hidden.delete(id);
      set({ downloads: get().downloads.filter((d) => d.id !== id) });
      syncTimer();
    },

    tick: () => {
      const online = useNetworkStore.getState().status === 'online';
      const finished: Download[] = [];
      let active = get().downloads.filter((d) => isActive(d.status)).length;

      const next = get().downloads.map((d): Download => {
        const h = hidden.get(d.id);
        if (!h || d.status === 'done' || d.status === 'stalled') return d;
        if (!online) {
          // No line: everything that was running falls back to "Connecting…".
          return d.status === 'queued'
            ? d
            : { ...d, status: 'connecting', kbps: 0 };
        }
        let cur = d;
        if (cur.status === 'queued') {
          if (active >= MAX_ACTIVE) return cur;
          active += 1;
          h.wait = randInt(h.rand, 2, 4);
          return { ...cur, status: 'connecting' };
        }
        if (cur.status === 'connecting' || cur.status === 'busy') {
          h.wait -= 1;
          if (h.wait > 0) return cur;
          if (cur.result.kind === 'stall') {
            active -= 1;
            return { ...cur, status: 'stalled', kbps: 0, etaSec: 0 };
          }
          if (cur.status === 'connecting' && !h.hadBusy && h.rand() < 0.35) {
            h.hadBusy = true;
            h.wait = randInt(h.rand, 3, 5);
            return { ...cur, status: 'busy' };
          }
          cur = { ...cur, status: 'downloading' };
        }
        // downloading
        const progress = Math.min(1, cur.progress + 1 / h.totalTicks);
        if (progress >= 1) {
          active -= 1;
          const done: Download = {
            ...cur,
            status: 'done',
            progress: 1,
            kbps: 0,
            etaSec: 0,
          };
          finished.push(done);
          return done;
        }
        const kbps =
          Math.round((SPEED_MIN + h.rand() * (SPEED_MAX - SPEED_MIN)) * 10) /
          10;
        const etaSec = Math.round((cur.result.sizeKb * (1 - progress)) / kbps);
        return { ...cur, progress, kbps, etaSec };
      });

      set({ downloads: next });
      for (const d of finished) {
        hidden.delete(d.id);
        finish(d);
      }
      syncTimer();
    },

    reset: () => {
      stopTimer();
      hidden.clear();
      set({ downloads: [] });
    },
  };
});

/** `hh:mm:ss` */
export function formatEta(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
}

export const STATUS_KEY: Record<DownloadStatus, MessageKey> = {
  queued: 'tunemole.status.queued',
  connecting: 'tunemole.status.connecting',
  busy: 'tunemole.status.busy',
  downloading: 'tunemole.status.downloading',
  stalled: 'tunemole.status.stalled',
  done: 'tunemole.status.done',
};
