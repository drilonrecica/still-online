import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Login } from '@/os/login/Login';
import { useSessionStore } from '@/os/store/session';
import { getPlayerName } from '@/i18n/settingsText';
import { useSettingsStore } from '@/os/store/settings';

beforeEach(() => {
  useSessionStore.setState({ state: 'login' });
  useSettingsStore.setState({ playerName: null, firstBootDone: false });
});

describe('Login', () => {
  it('first visit: asks for a name, saves it and logs on', () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: 'Alex' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log on as alex/i }));
    expect(useSettingsStore.getState().playerName).toBe('Alex');
    expect(useSettingsStore.getState().firstBootDone).toBe(true);
    expect(useSessionStore.getState().state).toBe('desktop');
  });

  it('has no default name: a blank name cannot log on', () => {
    render(<Login />);
    const field = screen.getByLabelText('Your name');
    expect(field).toHaveValue('');
    const tile = screen.getByRole('button', { name: 'Enter a name to log on' });
    expect(tile).toBeDisabled();
    fireEvent.change(field, { target: { value: '   ' } });
    expect(tile).toBeDisabled();
    fireEvent.submit(tile.closest('form')!);
    expect(useSettingsStore.getState().playerName).toBeNull();
    expect(getPlayerName()).toBe('');
    expect(useSessionStore.getState().state).toBe('login');
  });

  it('asks again on a return visit that has no name (old default migrated away)', () => {
    useSettingsStore.setState({ playerName: null, firstBootDone: true });
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: ' Mo ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log on as mo/i }));
    expect(useSettingsStore.getState().playerName).toBe('Mo');
    expect(useSessionStore.getState().state).toBe('desktop');
  });

  it('return visit: shows the saved name without a name field', () => {
    useSettingsStore.setState({ playerName: 'Sam', firstBootDone: true });
    render(<Login />);
    expect(screen.queryByLabelText('Your name')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /log on as sam/i }));
    expect(useSettingsStore.getState().playerName).toBe('Sam');
    expect(useSessionStore.getState().state).toBe('desktop');
  });
});

describe('Login language picker', () => {
  it('switches and persists the language before logon, on every visit', () => {
    useSettingsStore.setState({ firstBootDone: true, language: 'en' });
    render(<Login />);
    const picker = screen.getByLabelText('Language / Sprache');
    expect(picker).toHaveValue('en');
    fireEvent.change(picker, { target: { value: 'de' } });
    expect(useSettingsStore.getState().language).toBe('de');
    expect(screen.getByLabelText('Language / Sprache')).toHaveValue('de');
    expect(useSessionStore.getState().state).toBe('login');
  });

  it('shows the German picker label when the language is German', () => {
    useSettingsStore.setState({ firstBootDone: true, language: 'de' });
    render(<Login />);
    expect(screen.getByRole('option', { name: 'Deutsch' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'English' })).toBeInTheDocument();
  });
});
