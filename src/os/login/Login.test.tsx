import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Login } from '@/os/login/Login';
import { useSessionStore } from '@/os/store/session';
import { useSettingsStore } from '@/os/store/settings';

beforeEach(() => {
  useSessionStore.setState({ state: 'login' });
  useSettingsStore.setState({ playerName: 'Player', firstBootDone: false });
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

  it('falls back to "Player" for an empty name', () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: '   ' },
    });
    fireEvent.submit(screen.getByRole('button').closest('form')!);
    expect(useSettingsStore.getState().playerName).toBe('Player');
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
