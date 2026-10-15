// Simulated dial-up network. Not persisted: every boot starts offline.
// See docs/architecture-v0.2.md → "World, network, idle".
import { create } from 'zustand';
import { getApp } from '@/apps/registry';
import { events } from '@/os/events';
import { MODEM_KBPS, NET_PHASE_MS } from '@/os/serviceTypes';
import type { NetworkStore } from '@/os/serviceTypes';
import { playSound } from '@/os/sound';
import { scaleMs } from '@/os/speed';
import { useSettingsStore } from '@/os/store/settings';
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
/** Silences the modem handshake of the current attempt. */
let stopModem: (() => void) | null = null;

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
      if (get().status !== 'dialing') return;
      stopModem?.();
      stopModem = null;
      goOffline();
    },

    disconnect: () => {
      if (get().status === 'online') goOffline();
    },
  };
});

/** Starts a dial attempt with the modem handshake. No-op unless offline. */
export function dial(): void {
  const net = useNetworkStore.getState();
  if (net.status !== 'offline') return;
  net.connect();
  stopModem = playSound('dialup');
}

const hasDialog = () =>
  useWindowsStore.getState().windows.some((w) => w.appId === 'dialup');

// The dial-up dialog closes itself once connected (the "Connected at" balloon takes over).
// Done here rather than in the lazy dialog: with `?speed=fast` the connection can finish
// before the dialog has even mounted.
events.on('network:connected', () => {
  const { windows, closeWindow } = useWindowsStore.getState();
  for (const w of windows) if (w.appId === 'dialup') closeWindow(w.id);
});

/**
 * Resolves `true` once online, `false` if the dial attempt is cancelled or the dial-up
 * dialog is closed without dialling. Opens (or focuses) the dialog and, with
 * `settings.connectAutomatically`, dials right away; without the dialup app it dials directly.
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

    if (net.status !== 'offline') return;
    if (!getApp('dialup')) {
      net.connect();
      return;
    }
    useWindowsStore.getState().openApp('dialup');
    if (useSettingsStore.getState().connectAutomatically) dial();
    offs.push(
      useWindowsStore.subscribe(() => {
        if (!hasDialog() && useNetworkStore.getState().status === 'offline')
          finish(false);
      }),
    );
  });
}
