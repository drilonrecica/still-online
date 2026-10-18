import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { Login } from '@/os/login/Login';
import { useSessionStore } from '@/os/store/session';
import { getPlayerName } from '@/i18n/settingsText';
import { useSettingsStore } from '@/os/store/settings';

beforeEach(() => {
  useSessionStore.setState({ state: 'login' });
  useSettingsStore.setState({
    playerName: null,
    firstBootDone: false,
    gender: null,
    userPicture: null,
  });
});

const pickGender = (name: 'Girl' | 'Boy') =>
  fireEvent.click(screen.getByRole('radio', { name }));

describe('Login', () => {
  it('first visit: asks for a name, saves it and logs on', () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: 'Alex' },
    });
    pickGender('Boy');
    fireEvent.click(screen.getByRole('button', { name: /log on as alex/i }));
    expect(useSettingsStore.getState().playerName).toBe('Alex');
    expect(useSettingsStore.getState().gender).toBe('boy');
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
    useSettingsStore.setState({
      playerName: null,
      firstBootDone: true,
      gender: 'girl',
    });
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: ' Mo ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /log on as mo/i }));
    expect(useSettingsStore.getState().playerName).toBe('Mo');
    expect(useSessionStore.getState().state).toBe('desktop');
  });

  it('return visit: shows the saved name without a name or gender field', () => {
    useSettingsStore.setState({
      playerName: 'Sam',
      firstBootDone: true,
      gender: 'boy',
    });
    render(<Login />);
    expect(screen.queryByLabelText('Your name')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('radiogroup', { name: 'I am a:' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /log on as sam/i }));
    expect(useSettingsStore.getState().playerName).toBe('Sam');
    expect(useSessionStore.getState().state).toBe('desktop');
  });
});

describe('Login gender', () => {
  it('a name alone cannot log on; the gender is required too', () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText('Your name'), {
      target: { value: 'Alex' },
    });
    const tile = screen.getByRole('button', {
      name: 'Choose Girl or Boy to log on',
    });
    expect(tile).toBeDisabled();
    fireEvent.submit(tile.closest('form')!);
    expect(useSessionStore.getState().state).toBe('login');
    expect(useSettingsStore.getState().gender).toBeNull();
    pickGender('Girl');
    expect(
      screen.getByRole('button', { name: 'Log on as Alex' }),
    ).toBeEnabled();
  });

  it('a gender alone cannot log on either', () => {
    render(<Login />);
    pickGender('Boy');
    expect(
      screen.getByRole('button', { name: 'Enter a name to log on' }),
    ).toBeDisabled();
  });

  it('an old save without a gender is asked once, keeping its name', () => {
    useSettingsStore.setState({ playerName: 'Sam', firstBootDone: true });
    const { unmount } = render(<Login />);
    expect(screen.queryByLabelText('Your name')).not.toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: 'I am a:' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Choose Girl or Boy to log on' }),
    ).toBeDisabled();
    pickGender('Boy');
    fireEvent.click(screen.getByRole('button', { name: 'Log on as Sam' }));
    expect(useSettingsStore.getState()).toMatchObject({
      playerName: 'Sam',
      gender: 'boy',
    });
    expect(useSessionStore.getState().state).toBe('desktop');
    unmount();

    useSessionStore.setState({ state: 'login' });
    render(<Login />);
    expect(screen.queryByRole('radiogroup', { name: 'I am a:' })).toBeNull();
  });

  it("the tile shows the picked gender's default picture", () => {
    const { container } = render(<Login />);
    const picture = () => container.querySelector('button[type="submit"] img')!;
    expect(picture()).toHaveAttribute('data-picture', 'none');
    pickGender('Boy');
    expect(picture()).toHaveAttribute('data-picture', 'skateboard');
    pickGender('Girl');
    expect(picture()).toHaveAttribute('data-picture', 'butterfly');
  });

  it('German: „Ich bin:" Mädchen / Junge', () => {
    useSettingsStore.setState({ language: 'de' });
    render(<Login />);
    expect(screen.getByRole('radiogroup', { name: 'Ich bin:' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Mädchen' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Junge' })).toBeVisible();
  });
});

describe('Login language picker', () => {
  it('switches and persists the language before logon, on every visit', () => {
    useSettingsStore.setState({ firstBootDone: true, language: 'en' });
    render(<Login />);
    const group = screen.getByRole('radiogroup', {
      name: 'Language / Sprache',
    });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'English' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Deutsch' }));
    expect(useSettingsStore.getState().language).toBe('de');
    expect(screen.getByRole('radio', { name: 'Deutsch' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'English' })).not.toBeChecked();
    expect(useSessionStore.getState().state).toBe('login');
  });

  it('shows a flag next to each language', () => {
    useSettingsStore.setState({ firstBootDone: true, language: 'de' });
    render(<Login />);
    const group = screen.getByRole('radiogroup', {
      name: 'Language / Sprache',
    });
    expect(
      [...group.querySelectorAll('[role="radio"] img')].map((img) =>
        img.getAttribute('data-flag'),
      ),
    ).toEqual(['en', 'de']);
  });

  it('arrow keys move the choice', () => {
    useSettingsStore.setState({ firstBootDone: true, language: 'en' });
    render(<Login />);
    fireEvent.keyDown(screen.getByRole('radio', { name: 'English' }), {
      key: 'ArrowRight',
    });
    expect(useSettingsStore.getState().language).toBe('de');
  });
});
