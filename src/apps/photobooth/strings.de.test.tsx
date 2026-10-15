// P1-04: Snapshot Booth in German.
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import Photobooth from './Photobooth';

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  Object.defineProperty(navigator, 'mediaDevices', {
    configurable: true,
    value: undefined,
  });
  useSettingsStore.setState({ language: 'de' });
});

afterEach(() => {
  vi.restoreAllMocks();
  useSettingsStore.setState({ language: 'en' });
});

describe('Snapshot Booth in German', () => {
  it('shows the German consent screen, notice, filters and cartoon controls', async () => {
    const user = userEvent.setup();
    render(<Photobooth />);
    expect(screen.getByText(/nichts wird hochgeladen/)).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Meine Webcam verwenden' }),
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Dieser Browser kann keine Kamera erreichen',
    );
    expect(
      screen.getByRole('button', { name: 'Wärmebild' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Foto aufnehmen' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Haare: Stachelig' }),
    ).toBeInTheDocument();
  });
});
