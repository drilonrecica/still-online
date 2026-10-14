import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useAmplifierStore } from '@/apps/amplifier/store';
import { PLAYLIST } from '@/content/playlist';
import { events } from '@/os/events';
import { useWindowsStore } from '@/os/store/windows';
import { installAmplifierRouter } from './amplifierRouter';
import '@/apps/registry';

describe('amplifier:enqueue', () => {
  let off: () => void;
  beforeEach(() => {
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useAmplifierStore.setState({ playlist: PLAYLIST.slice(0, 1), index: -1 });
    off = installAmplifierRouter();
  });
  afterEach(() => off());

  it('adds a missing track once, plays it, and opens the Amplifier', () => {
    const track = PLAYLIST[1]!;
    events.emit('amplifier:enqueue', { trackId: track.id, play: true });
    events.emit('amplifier:enqueue', { trackId: track.id });
    const s = useAmplifierStore.getState();
    expect(s.playlist.filter((t) => t.id === track.id)).toHaveLength(1);
    expect(s.playlist[s.index]?.id).toBe(track.id);
    expect(useWindowsStore.getState().windows.map((w) => w.appId)).toEqual([
      'amplifier',
    ]);
  });

  it('ignores unknown tracks and does not open on enqueue without play', () => {
    events.emit('amplifier:enqueue', { trackId: 'nope', play: true });
    events.emit('amplifier:enqueue', { trackId: PLAYLIST[0]!.id });
    expect(useAmplifierStore.getState().playlist).toHaveLength(1);
    expect(useWindowsStore.getState().windows).toHaveLength(0);
  });
});
