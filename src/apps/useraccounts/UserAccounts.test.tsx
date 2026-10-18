import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import '@/apps/registry';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import UserAccounts from './UserAccounts';

function setup() {
  const windowId = useWindowsStore.getState().openApp('useraccounts');
  render(<UserAccounts windowId={windowId} props={{}} />);
  return { windowId, user: userEvent.setup() };
}

const s = () => useSettingsStore.getState();
const current = () => screen.getByTestId('useraccounts-current');
const isOpen = () =>
  useWindowsStore.getState().windows.some((w) => w.appId === 'useraccounts');

beforeEach(() => {
  act(() => useWindowsStore.getState().closeAll());
  useSettingsStore.setState({ playerName: 'Ada', userPicture: null });
});

describe('User Accounts', () => {
  it('shows the current picture and name', () => {
    setup();
    expect(current()).toHaveAttribute('data-picture', 'butterfly');
    expect(screen.getByText('Ada')).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Girl' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Use default' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('changes name, gender and picture on Apply, live', async () => {
    const { user } = setup();
    const field = screen.getByLabelText('Name:');
    expect(field).toHaveAttribute('maxLength', '20');
    await user.clear(field);
    await user.type(field, ' Max ');
    await user.click(screen.getByRole('radio', { name: 'Boy' }));
    // Nothing is saved before Apply.
    expect(s()).toMatchObject({ playerName: 'Ada', gender: 'girl' });
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(s()).toMatchObject({
      playerName: 'Max',
      gender: 'boy',
      userPicture: null,
    });
    expect(current()).toHaveAttribute('data-picture', 'skateboard');
    expect(screen.getByText('Max')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Rocket' }));
    expect(screen.getByRole('button', { name: 'Rocket' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(s().userPicture).toBe('rocket');
    expect(current()).toHaveAttribute('data-picture', 'rocket');

    await user.click(screen.getByRole('button', { name: 'Use default' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    expect(s().userPicture).toBeNull();
    expect(current()).toHaveAttribute('data-picture', 'skateboard');
  });

  it('a blank name is not saved', async () => {
    const { user } = setup();
    await user.clear(screen.getByLabelText('Name:'));
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(s().playerName).toBe('Ada');
  });

  it('Cancel discards and closes', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('radio', { name: 'Boy' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(s().gender).toBe('girl');
    expect(isOpen()).toBe(false);
  });

  it('OK applies and closes', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: 'Kitten' }));
    await user.click(screen.getByRole('button', { name: 'OK' }));
    expect(s().userPicture).toBe('kitten');
    expect(isOpen()).toBe(false);
  });

  it('the gender group is keyboard-operable', async () => {
    const { user } = setup();
    const group = screen.getByRole('radiogroup', { name: 'I am a' });
    within(group).getByRole('radio', { name: 'Girl' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(within(group).getByRole('radio', { name: 'Boy' })).toHaveFocus();
    expect(within(group).getByRole('radio', { name: 'Boy' })).toBeChecked();
  });

  it('German: Benutzerkonten wording', () => {
    useSettingsStore.setState({ language: 'de' });
    setup();
    expect(screen.getByText('Eigenen Namen ändern')).toBeVisible();
    expect(screen.getByText('Eigenes Bild ändern')).toBeVisible();
    expect(screen.getByRole('radio', { name: 'Mädchen' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Übernehmen' })).toBeDisabled();
  });
});
