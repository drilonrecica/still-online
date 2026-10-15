// P1-04: Paint in German.
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getApp } from '@/apps/registry';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';

vi.mock('./codec', () => ({
  TEXT_FONT: '16px sans-serif',
  TEXT_LINE_HEIGHT: 19,
  blitToCanvas: () => {},
  encodePng: () => Promise.resolve(new Blob(['png'])),
  decodeImage: () => Promise.resolve(null),
  drawText: () => false,
}));

beforeEach(() => {
  localStorage.clear();
  act(() => useWindowsStore.getState().closeAll());
  useSettingsStore.setState({ language: 'de' });
});

afterEach(() => useSettingsStore.setState({ language: 'en' }));

describe('Paint in German', () => {
  it('shows German tool names, menus and the attributes dialog', async () => {
    const user = userEvent.setup();
    render(<WindowLayer getApp={getApp} />);
    act(() => void useWindowsStore.getState().openApp('paint'));
    expect(
      await screen.findByRole('button', { name: 'Radierer' }),
    ).toBeInTheDocument();
    for (const name of ['Stift', 'Pinsel', 'Farbfüller', 'Farbauswahl']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    await user.click(screen.getByRole('menuitem', { name: 'Bild' }));
    await user.click(screen.getByRole('menuitem', { name: /^Attribute…/ }));
    expect(screen.getByText('Größe in Pixel (1–1600).')).toBeInTheDocument();
    expect(screen.getByLabelText('Breite:')).toBeInTheDocument();
  });
});
