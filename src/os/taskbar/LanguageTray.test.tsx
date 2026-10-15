import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { LanguageTray } from './LanguageTray';

beforeEach(() => useSettingsStore.setState({ language: 'en' }));

describe('LanguageTray', () => {
  it('shows EN with an English label', () => {
    render(<LanguageTray />);
    const badge = screen.getByRole('button', {
      name: 'Input language: English',
    });
    expect(badge).toHaveTextContent('EN');
  });

  it('switches live through the menu, keyboard only', async () => {
    const user = userEvent.setup();
    render(<LanguageTray />);
    await user.click(screen.getByTestId('tray-language'));
    const en = screen.getByRole('menuitemradio', { name: 'English' });
    expect(en).toHaveAttribute('aria-checked', 'true');
    expect(en).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(
      screen.getByRole('menuitemradio', { name: 'Deutsch' }),
    ).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(useSettingsStore.getState().language).toBe('de');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    const badge = screen.getByTestId('tray-language');
    expect(badge).toHaveTextContent('DE');
    expect(badge).toHaveAccessibleName('Eingabesprache: Deutsch');
  });

  it('Escape and outside click close the menu', async () => {
    const user = userEvent.setup();
    render(<LanguageTray />);
    await user.click(screen.getByTestId('tray-language'));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('tray-language'));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(useSettingsStore.getState().language).toBe('en');
  });
});
