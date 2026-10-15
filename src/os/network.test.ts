import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { events } from '@/os/events';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import { dial, requireOnline, useNetworkStore } from './network';

const dialogs = () =>
  useWindowsStore.getState().windows.filter((w) => w.appId === 'dialup');

const net = () => useNetworkStore.getState();

let connected: number[] = [];
let disconnected = 0;
let offs: (() => void)[] = [];

beforeEach(() => {
  vi.useFakeTimers();
  net().cancel();
  net().disconnect();
  vi.clearAllTimers();
  useNetworkStore.setState({
    status: 'offline',
    kbps: 0,
    phase: 'idle',
    connectedAt: null,
  });
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({ connectAutomatically: true });
  connected = [];
  disconnected = 0;
  offs = [
    events.on('network:connected', ({ kbps }) => connected.push(kbps)),
    events.on('network:disconnected', () => (disconnected += 1)),
  ];
});

afterEach(() => {
  offs.forEach((off) => off());
  vi.useRealTimers();
});

describe('network state machine', () => {
  it('starts offline', () => {
    expect(net()).toMatchObject({ status: 'offline', kbps: 0, phase: 'idle' });
  });

  it('walks dialing → verifying → registering → online', () => {
    net().connect();
    expect(net()).toMatchObject({ status: 'dialing', phase: 'dialing' });
    vi.advanceTimersByTime(3000);
    expect(net().phase).toBe('verifying');
    vi.advanceTimersByTime(1500);
    expect(net().phase).toBe('registering');
    expect(net().status).toBe('dialing');
    vi.advanceTimersByTime(1200);
    expect(net()).toMatchObject({
      status: 'online',
      phase: 'connected',
      kbps: 56,
    });
    expect(net().connectedAt).not.toBeNull();
    expect(connected).toEqual([56]);
  });

  it('cancel while dialing goes offline and stops the sequence', () => {
    net().connect();
    vi.advanceTimersByTime(1000);
    net().cancel();
    expect(net().status).toBe('offline');
    expect(disconnected).toBe(1);
    vi.advanceTimersByTime(10_000);
    expect(net().status).toBe('offline');
    expect(connected).toEqual([]);
  });

  it('disconnect goes offline from online only', () => {
    net().disconnect();
    expect(disconnected).toBe(0);
    net().connect();
    vi.advanceTimersByTime(5700);
    net().disconnect();
    expect(net()).toMatchObject({
      status: 'offline',
      kbps: 0,
      connectedAt: null,
    });
    expect(disconnected).toBe(1);
  });

  it('connect is a no-op unless offline', () => {
    net().connect();
    vi.advanceTimersByTime(1000);
    net().connect();
    vi.advanceTimersByTime(4700);
    expect(connected).toEqual([56]);
  });
});

describe('requireOnline', () => {
  it('resolves true immediately when online', async () => {
    useNetworkStore.setState({
      status: 'online',
      kbps: 56,
      phase: 'connected',
    });
    await expect(requireOnline()).resolves.toBe(true);
  });

  it('dials and resolves true when the connection completes', async () => {
    const p = requireOnline();
    vi.advanceTimersByTime(5700);
    await expect(p).resolves.toBe(true);
    expect(net().status).toBe('online');
  });

  it('resolves false when cancelled', async () => {
    const p = requireOnline();
    vi.advanceTimersByTime(1000);
    net().cancel();
    await expect(p).resolves.toBe(false);
  });

  it('opens the dial-up dialog and dials automatically', () => {
    void requireOnline();
    expect(dialogs()).toHaveLength(1);
    expect(net().status).toBe('dialing');
  });

  it('only opens the dialog when "Connect automatically" is off', async () => {
    useSettingsStore.setState({ connectAutomatically: false });
    const p = requireOnline();
    expect(dialogs()).toHaveLength(1);
    expect(net().status).toBe('offline');
    dial();
    vi.advanceTimersByTime(5700);
    await expect(p).resolves.toBe(true);
  });

  it('closes the dialog once connected', () => {
    void requireOnline();
    vi.advanceTimersByTime(5700);
    expect(net().status).toBe('online');
    expect(dialogs()).toHaveLength(0);
  });

  it('focuses an open dialog instead of opening another', () => {
    useSettingsStore.setState({ connectAutomatically: false });
    void requireOnline();
    void requireOnline();
    expect(dialogs()).toHaveLength(1);
  });

  it('resolves false when the dialog is closed without dialling', async () => {
    useSettingsStore.setState({ connectAutomatically: false });
    const p = requireOnline();
    const [dialog] = dialogs();
    useWindowsStore.getState().closeWindow(dialog?.id ?? '');
    await expect(p).resolves.toBe(false);
  });

  it('keeps waiting when the dialog is closed while dialling', async () => {
    const p = requireOnline();
    const [dialog] = dialogs();
    useWindowsStore.getState().closeWindow(dialog?.id ?? '');
    vi.advanceTimersByTime(5700);
    await expect(p).resolves.toBe(true);
  });

  it('is not persisted', () => {
    expect(
      Object.keys(localStorage).filter((k) => k.includes('network')),
    ).toEqual([]);
  });
});
