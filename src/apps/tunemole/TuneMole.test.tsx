import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeviceStore } from '@/os/device';
import { searchTuneMole, TUNEMOLE_RESULTS } from '@/content/tunemole';
import type { TuneMoleResult } from '@/content/types';
import { events, type OsEventMap } from '@/os/events';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import TuneMole from './TuneMole';
import { formatEta, useTuneMoleStore } from './store';

const TRACK = TUNEMOLE_RESULTS.find(
  (r) => r.kind === 'track',
) as TuneMoleResult;
const PRANK = TUNEMOLE_RESULTS.find(
  (r) => r.kind === 'prank',
) as TuneMoleResult;
const STALL = TUNEMOLE_RESULTS.find(
  (r) => r.kind === 'stall',
) as TuneMoleResult;

function setStatus(status: 'online' | 'offline') {
  useNetworkStore.setState({
    status,
    kbps: status === 'online' ? 56 : 0,
    phase: status === 'online' ? 'connected' : 'idle',
    connectedAt: null,
  });
}

const musicFiles = () => useFsStore.getState().list(FS_FOLDERS.music);
const run = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const only = () => useTuneMoleStore.getState().downloads[0]!;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useSettingsStore.setState({ connectAutomatically: true, muted: true });
  useTuneMoleStore.getState().reset();
  setStatus('online');
});

afterEach(() => {
  useTuneMoleStore.getState().reset();
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('search', () => {
  it('matches file names and keywords, all words required', () => {
    expect(searchTuneMole('surf').length).toBeGreaterThan(0);
    expect(
      searchTuneMole('SHIMMY surf').every((r) => r.trackId === 'surf-shimmy'),
    ).toBe(true);
    expect(searchTuneMole('ringtone')[0]?.kind).toBe('prank');
    expect(searchTuneMole('zzzz-nothing')).toEqual([]);
    expect(searchTuneMole('   ')).toEqual([]);
  });

  it('ships tracks only from the playlist', async () => {
    const { PLAYLIST } = await import('@/content/playlist');
    const ids = new Set(PLAYLIST.map((t) => t.id));
    for (const r of TUNEMOLE_RESULTS.filter((x) => x.kind === 'track'))
      expect(ids.has(r.trackId ?? ''), r.fileName).toBe(true);
  });
});

describe('download state machine', () => {
  it('connects, downloads with jittery speeds, then lands in My Music and enqueues', () => {
    const enqueued: OsEventMap['amplifier:enqueue'][] = [];
    const off = events.on('amplifier:enqueue', (p) => enqueued.push(p));
    const before = musicFiles().length;
    useTuneMoleStore.getState().start(TRACK);
    expect(only().status).toBe('connecting');

    const speeds = new Set<number>();
    let sawDownloading = false;
    for (let i = 0; i < 200 && only().status !== 'done'; i++) {
      run(500);
      if (only().status === 'downloading') {
        sawDownloading = true;
        speeds.add(only().kbps);
        expect(only().kbps).toBeGreaterThanOrEqual(2.1);
        expect(only().kbps).toBeLessThanOrEqual(7.8);
        expect(only().etaSec).toBeGreaterThan(0);
      }
    }
    off();
    expect(sawDownloading).toBe(true);
    expect(speeds.size).toBeGreaterThan(3);
    expect(only().status).toBe('done');
    expect(only().progress).toBe(1);
    const added = musicFiles().filter((f) => f.name === TRACK.fileName);
    expect(musicFiles().length).toBe(before + 1);
    expect(added[0]).toMatchObject({ type: 'audio', trackId: TRACK.trackId });
    expect(enqueued).toEqual([{ trackId: TRACK.trackId }]);
  });

  it('takes roughly 20-40 s of real time, plus connecting', () => {
    useTuneMoleStore.getState().start(TRACK);
    run(18_000);
    expect(only().status).not.toBe('done');
    run(30_000);
    expect(only().status).toBe('done');
  });

  it('a stall file waits for sources forever and can be removed', () => {
    useTuneMoleStore.getState().start(STALL);
    run(120_000);
    expect(only().status).toBe('stalled');
    expect(only().progress).toBe(0);
    expect(musicFiles().some((f) => f.name === STALL.fileName)).toBe(false);
    useTuneMoleStore.getState().remove(only().id);
    expect(useTuneMoleStore.getState().downloads).toEqual([]);
  });

  it('a prank file becomes a txt note from the peer', () => {
    useTuneMoleStore.getState().start(PRANK);
    run(60_000);
    expect(only().status).toBe('done');
    const file = musicFiles().find((f) => f.name === PRANK.fileName);
    expect(file?.type).toBe('txt');
    expect(file?.text).toContain('lol gotcha');
    expect(file?.text).toContain(PRANK.peer);
  });

  it('queues beyond three active downloads and ignores duplicates', () => {
    const { start } = useTuneMoleStore.getState();
    const tracks = TUNEMOLE_RESULTS.filter((r) => r.kind === 'track');
    for (const r of tracks.slice(0, 4)) start(r);
    expect(useTuneMoleStore.getState().downloads.map((d) => d.status)).toEqual([
      'connecting',
      'connecting',
      'connecting',
      'queued',
    ]);
    expect(start(tracks[0]!)).toBeNull();
  });

  it('does not progress while offline', () => {
    useTuneMoleStore.getState().start(TRACK);
    run(10_000);
    const p = only().progress;
    setStatus('offline');
    run(20_000);
    expect(only().progress).toBe(p);
    expect(only().status).toBe('connecting');
    setStatus('online');
    run(60_000);
    expect(only().status).toBe('done');
  });

  it('formats ETAs as hh:mm:ss', () => {
    expect(formatEta(0)).toBe('00:00:00');
    expect(formatEta(3_725)).toBe('01:02:05');
  });
});

describe('TuneMole window', () => {
  function renderApp() {
    const windowId = useWindowsStore.getState().openApp('tunemole', {});
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<TuneMole windowId={windowId} props={{}} />);
    return user;
  }

  it('condenses the results on a phone: file name, a size · bitrate · peer line, Download', async () => {
    useDeviceStore.setState({ device: 'phone' });
    try {
      const user = renderApp();
      await user.type(screen.getByLabelText('Search for music'), 'surf');
      await user.click(screen.getByRole('button', { name: 'Search' }));
      const table = screen.getByRole('table', { name: 'Search results' });
      expect(within(table).getAllByRole('columnheader')).toHaveLength(2);
      const row = within(table).getAllByRole('row')[1]!;
      expect(within(row).getAllByRole('cell')).toHaveLength(2);
      expect(row).toHaveTextContent(/MB · \d+ kbps · /);
      expect(
        within(row).getByRole('button', { name: /^Download / }),
      ).toBeInTheDocument();
    } finally {
      useDeviceStore.setState({ device: 'desktop' });
    }
  });

  it('shows the peer count when online', () => {
    renderApp();
    expect(screen.getByRole('status').textContent).toBe(
      'Connected to 1,337 peers',
    );
  });

  it('needs a connection: offline it opens the dial-up dialog', () => {
    setStatus('offline');
    useSettingsStore.setState({ connectAutomatically: false });
    renderApp();
    expect(screen.getByRole('status').textContent).toBe('Not connected');
    expect(
      useWindowsStore.getState().windows.some((w) => w.appId === 'dialup'),
    ).toBe(true);
  });

  it('search → download → progress → Library → enqueue', async () => {
    const user = renderApp();
    await user.type(screen.getByLabelText('Search for music'), 'surf');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await user.click(
      screen.getByRole('button', { name: `Download ${TRACK.fileName}` }),
    );
    await user.click(screen.getByRole('tab', { name: 'Downloads' }));
    expect(screen.getByText(TRACK.fileName)).toBeTruthy();
    run(60_000);
    expect(screen.getByText('Complete')).toBeTruthy();

    await user.click(screen.getByRole('tab', { name: 'Library' }));
    const seen: OsEventMap['amplifier:enqueue'][] = [];
    const off = events.on('amplifier:enqueue', (p) => seen.push(p));
    await user.click(
      screen.getByRole('button', { name: `Play ${TRACK.fileName}` }),
    );
    off();
    expect(seen).toEqual([{ trackId: TRACK.trackId, play: true }]);
  });

  it('playing the prank opens Notepad with the peer message', async () => {
    const user = renderApp();
    useTuneMoleStore.getState().start(PRANK);
    run(60_000);
    await user.click(screen.getByRole('tab', { name: 'Library' }));
    await user.click(
      screen.getByRole('button', { name: `Play ${PRANK.fileName}` }),
    );
    const note = useWindowsStore
      .getState()
      .windows.find((w) => w.appId === 'notepad');
    expect(note).toBeTruthy();
    const fileId = note?.props.fileId as string;
    expect(useFsStore.getState().get(fileId)?.text).toContain(PRANK.peer);
  });
});
