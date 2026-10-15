// P1-04: Disk Cleanup in German.
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import DiskCleanup, { SCAN_MS } from './DiskCleanup';

beforeEach(() => {
  vi.useFakeTimers();
  useSettingsStore.setState({ language: 'de' });
});

afterEach(() => {
  vi.useRealTimers();
  useSettingsStore.setState({ language: 'en' });
});

describe('Disk Cleanup in German', () => {
  it('scans, lists funny categories and confirms in German', async () => {
    const windowId = useWindowsStore.getState().openApp('diskcleanup');
    render(<DiskCleanup windowId={windowId} props={{}} />);
    expect(screen.getByRole('status')).toHaveTextContent(
      'Suche: Temporäre Internetdateien',
    );
    await act(() => vi.advanceTimersByTimeAsync(SCAN_MS * 3));
    expect(screen.getByLabelText('Alte Schwärme')).toBeInTheDocument();
    expect(screen.getByText('Zu löschende Dateien:')).toBeInTheDocument();
    expect(screen.getByLabelText('Papierkorb')).toBeInTheDocument();
  });
});
