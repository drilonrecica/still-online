import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installIdle } from '@/os/idle';
import { useSettingsStore } from '@/os/store/settings';
import { SETTINGS_V02_DEFAULTS } from '@/os/types';
import { installScreensaver } from './controller';
import { useScreensaverStore } from './store';

const MIN = 60_000;
let cleanups: (() => void)[] = [];
const running = () => useScreensaverStore.getState().running;
const input = () => window.dispatchEvent(new Event('pointermove'));
const setSaver = (patch: Partial<typeof SETTINGS_V02_DEFAULTS.screensaver>) =>
  useSettingsStore.getState().setScreensaver({
    ...useSettingsStore.getState().screensaver,
    ...patch,
  });

beforeEach(() => {
  vi.useFakeTimers();
  useSettingsStore.setState({
    screensaver: { id: 'pipes', minutes: 5, text: 'hi' },
  });
  cleanups = [installIdle(), installScreensaver()];
});

afterEach(() => {
  cleanups.reverse().forEach((c) => c());
  useScreensaverStore.getState().stop();
  useSettingsStore.setState({
    screensaver: SETTINGS_V02_DEFAULTS.screensaver,
  });
  vi.useRealTimers();
});

describe('installScreensaver', () => {
  it('starts the chosen saver after the idle minutes', () => {
    vi.advanceTimersByTime(5 * MIN - 1);
    expect(running()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(running()).toEqual({ id: 'pipes', text: 'hi', reason: 'idle' });
  });

  it('input resets the wait, and it starts again after the next idle period', () => {
    vi.advanceTimersByTime(4 * MIN);
    input();
    vi.advanceTimersByTime(4 * MIN);
    expect(running()).toBeNull();
    vi.advanceTimersByTime(MIN);
    expect(running()).not.toBeNull();
    useScreensaverStore.getState().stop();
    input();
    vi.advanceTimersByTime(5 * MIN);
    expect(running()?.id).toBe('pipes');
  });

  it('none and 0 minutes disable it', () => {
    setSaver({ id: 'none' });
    vi.advanceTimersByTime(60 * MIN);
    expect(running()).toBeNull();
    setSaver({ id: 'marquee', minutes: 0 });
    vi.advanceTimersByTime(60 * MIN);
    expect(running()).toBeNull();
  });

  it('re-arms when the setting changes and uses the current text', () => {
    setSaver({ id: 'marquee', minutes: 1 });
    setSaver({ text: 'brb' });
    vi.advanceTimersByTime(MIN);
    expect(running()).toEqual({ id: 'marquee', text: 'brb', reason: 'idle' });
  });

  it('does not replace a running preview', () => {
    useScreensaverStore.getState().startPreview('panes', '');
    vi.advanceTimersByTime(5 * MIN);
    expect(running()?.reason).toBe('preview');
  });

  it('cleanup (leaving the desktop) stops the saver and the timer', () => {
    vi.advanceTimersByTime(5 * MIN);
    cleanups.pop()?.();
    expect(running()).toBeNull();
    input();
    vi.advanceTimersByTime(10 * MIN);
    expect(running()).toBeNull();
  });
});
