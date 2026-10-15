import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { translate } from '@/i18n/t';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import DiskCleanup, {
  DONE_MESSAGE,
  SCAN_LABELS,
  SCAN_MS,
  buildCategories,
  formatKb,
} from './DiskCleanup';

function mockReducedMotion(reduce: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: reduce,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

function setup() {
  const windowId = useWindowsStore.getState().openApp('diskcleanup');
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<DiskCleanup windowId={windowId} props={{}} />);
  return { user, windowId };
}

const finishScan = () => act(() => vi.advanceTimersByTime(SCAN_MS * 3));

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  useWindowsStore.setState({ windows: [], topZ: 0 });
  mockReducedMotion(false);
});

afterEach(() => {
  vi.useRealTimers();
  // @ts-expect-error restore jsdom default (no matchMedia)
  delete window.matchMedia;
});

describe('Disk Cleanup', () => {
  it('scans slowly with a cycling joke label', () => {
    setup();
    expect(screen.getByText(/calculating how much space/)).toBeTruthy();
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.getByRole('status')).toHaveTextContent(
      `Scanning: ${translate('en', SCAN_LABELS[0])}`,
    );
    act(() => vi.advanceTimersByTime(SCAN_MS / 2));
    expect(screen.getByRole('progressbar')).toBeTruthy();
    expect(screen.getByRole('status').textContent).not.toBe(
      `Scanning: ${translate('en', SCAN_LABELS[0])}`,
    );
  });

  it('is never faster than the minimum scan time', () => {
    setup();
    act(() => vi.advanceTimersByTime(SCAN_MS - 500));
    expect(screen.queryByText('Files to delete:')).toBeNull();
  });

  it('lists the categories with sizes after the scan', () => {
    setup();
    finishScan();
    expect(screen.getByText('Files to delete:')).toBeTruthy();
    for (const name of [
      'Downloaded Program Files',
      'Temporary Internet Files',
      'Recycle Bin',
      'Old crushes',
      'Feelings',
      'Compress old files',
    ])
      expect(screen.getByLabelText(name)).toBeTruthy();
    expect(screen.getByText('14,382 KB')).toBeTruthy();
    expect(screen.getByText('9,999,999 KB')).toBeTruthy();
  });

  it('prices the Recycle Bin at 1.2 KB per item', () => {
    expect(buildCategories(10).find((c) => c.id === 'recycle')?.kb).toBe(12);
    expect(formatKb(1234567)).toBe('1,234,567 KB');
  });

  it('OK asks, then cleans and frees 0 KB', async () => {
    const { user } = setup();
    finishScan();
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(
      screen.getByText('Are you sure you want to perform these actions?'),
    ).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(screen.getByRole('status')).toHaveTextContent('Cleaning up…');
    act(() => vi.advanceTimersByTime(10000));
    expect(screen.getByText(translate('en', DONE_MESSAGE))).toBeTruthy();
  });

  it('closes the window from the final OK', async () => {
    const { user, windowId } = setup();
    finishScan();
    await user.click(screen.getByRole('button', { name: 'OK' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    act(() => vi.advanceTimersByTime(10000));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'OK' }),
    );
    expect(
      useWindowsStore.getState().windows.some((w) => w.id === windowId),
    ).toBe(false);
  });

  it('keeps the same steps with reduced motion, without random pauses', () => {
    mockReducedMotion(true);
    setup();
    expect(screen.getByRole('progressbar')).toBeTruthy();
    // Even ticks add up to exactly the scan time: no pauses to wait out.
    act(() => vi.advanceTimersByTime(SCAN_MS));
    expect(screen.getByText('Files to delete:')).toBeTruthy();
  });
});
