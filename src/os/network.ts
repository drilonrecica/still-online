// Simulated dial-up network. Not persisted: every boot starts offline.
// See docs/architecture-v0.2.md → "World, network, idle".
import { create } from 'zustand';
import { getApp } from '@/apps/registry';
import { events } from '@/os/events';
import { MODEM_KBPS, NET_PHASE_MS } from '@/os/serviceTypes';
import type { NetworkStore } from '@/os/serviceTypes';
import { scaleMs } from '@/os/speed';
import { useWindowsStore } from '@/os/store/windows';

export type { NetPhase, NetStatus, NetworkStore } from '@/os/serviceTypes';

const OFFLINE = {
  status: 'offline',
  kbps: 0,
  phase: 'idle',
  connectedAt: null,
} as const;

const SEQUENCE = ['dialing', 'verifying', 'registering'] as const;

let timer: ReturnType<typeof setTimeout> | null = null;

function clearTimer() {
  if (timer !== null) clearTimeout(timer);
  timer = null;
}

export const useNetworkStore = create<NetworkStore>()((set, get) => {
  function enter(index: number) {
    if (index >= SEQUENCE.length) {
      timer = null;
      set({
        status: 'online',
        kbps: MODEM_KBPS,
        phase: 'connected',
        connectedAt: Date.now(),
      });
      events.emit('network:connected', { kbps: MODEM_KBPS });
      return;
    }
    const phase = SEQUENCE[index];
    if (!phase) return;
    set({ phase });
    timer = setTimeout(() => enter(index + 1), scaleMs(NET_PHASE_MS[phase]));
  }

  function goOffline() {
    clearTimer();
    set({ ...OFFLINE });
    events.emit('network:disconnected', {});
  }

  return {
    ...OFFLINE,

    connect: () => {
      if (get().status !== 'offline') return;
      set({ status: 'dialing' });
      enter(0);
    },

    cancel: () => {
      if (get().status === 'dialing') goOffline();
    },

    disconnect: () => {
      if (get().status === 'online') goOffline();
    },
  };
});

/**
 * Resolves `true` once online, `false` if the dial attempt is cancelled.
 * Opens the dial-up dialog when the app exists; until then it dials directly.
 */
export function requireOnline(): Promise<boolean> {
  const net = useNetworkStore.getState();
  if (net.status === 'online') return Promise.resolve(true);

  return new Promise<boolean>((resolve) => {
    const offs: (() => void)[] = [];
    const finish = (ok: boolean) => {
      offs.forEach((off) => off());
      resolve(ok);
    };
    offs.push(
      events.on('network:connected', () => finish(true)),
      events.on('network:disconnected', () => finish(false)),
    );

    if (net.status === 'offline') {
      if (getApp('dialup')) {
        const { windows, openApp } = useWindowsStore.getState();
        if (!windows.some((w) => w.appId === 'dialup')) openApp('dialup');
      } else {
        net.connect();
      }
    }
  });
}
