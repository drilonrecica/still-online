import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import '@/apps/registry';
import type { Script } from '@/content/types';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { sanitizeCustomEmoticons } from '../customEmoticons';
import { sanitizeProgress } from '../engine/progress';
import { contactContent, line } from '../engine/test-helpers';
import { getMessengerEngine, setMessengerContentsForTests } from '../runtime';
import { useMessengerStore } from '../store';
import Chat from './Chat';
import { shownTexts } from '../testing';

const opening: Script = {
  id: 'opening',
  trigger: { type: 'onSignIn' },
  start: 'hi',
  nodes: {
    hi: {
      lines: [line('hi!', 0)],
      choices: [
        { text: 'hey lena', label: 'Hey', next: 'end' },
        { text: 'brb', label: 'Busy', next: 'end' },
      ],
    },
    end: { lines: [line('ok', 100)], end: true },
  },
};

beforeEach(() => {
  localStorage.clear();
  useSettingsStore.setState({ playerName: 'Drilon', muted: true });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useMessengerStore.setState({ signedIn: true });
  useWindowsStore.setState({ windows: [], topZ: 0 });
  setMessengerContentsForTests([
    contactContent('lena', [opening], { displayName: 'Lena' }),
  ]);
});

function renderChat() {
  const windowId = useWindowsStore
    .getState()
    .openApp('messenger-chat', { contactId: 'lena' });
  render(<Chat windowId={windowId} props={{ contactId: 'lena' }} />);
}

const addPicture = () =>
  useFsStore.getState().createFile(FS_FOLDERS.pics, {
    name: 'pony.jpg',
    type: 'image',
    photo: { scene: 'pet', seed: 1 },
  });

describe('custom emoticons', () => {
  it('sanitizes: valid codes only, unique, string file ids', () => {
    expect(
      sanitizeCustomEmoticons([
        { code: '[ponies]', fileId: 'a' },
        { code: '[PONIES]', fileId: 'b' },
        { code: '[x]', fileId: 'a' },
        { code: '[toolongcode]', fileId: 'a' },
        { code: 'ponies', fileId: 'a' },
        { code: '[ok]', fileId: 5 },
        null,
      ]),
    ).toEqual([{ code: '[ponies]', fileId: 'a' }]);
    expect(
      sanitizeProgress({ player: { customEmoticons: 'x' } }).player
        .customEmoticons,
    ).toBeUndefined();
  });

  it('store adds, rejects duplicates and invalid codes, and removes', () => {
    const s = useMessengerStore.getState();
    expect(s.addCustomEmoticon('[ponies]', 'f1')).toBe(true);
    expect(
      useMessengerStore.getState().addCustomEmoticon('[Ponies]', 'f2'),
    ).toBe(false);
    expect(useMessengerStore.getState().addCustomEmoticon('[a]', 'f2')).toBe(
      false,
    );
    expect(
      useMessengerStore.getState().progress.player.customEmoticons,
    ).toEqual([{ code: '[ponies]', fileId: 'f1' }]);
    useMessengerStore.getState().removeCustomEmoticon('[ponies]');
    expect(
      useMessengerStore.getState().progress.player.customEmoticons,
    ).toEqual([]);
  });

  it('creates and deletes from the picker, persisting the change', async () => {
    const id = addPicture();
    const user = userEvent.setup();
    renderChat();
    await user.click(screen.getByRole('button', { name: 'Emoticons' }));
    await user.click(
      screen.getByRole('menuitem', { name: 'Create emoticon…' }),
    );
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('option', { name: /pony\.jpg/ }));
    await user.type(within(dialog).getByRole('textbox'), 'ponies');
    await user.click(within(dialog).getByRole('button', { name: 'OK' }));
    expect(
      useMessengerStore.getState().progress.player.customEmoticons,
    ).toEqual([{ code: '[ponies]', fileId: id }]);
    expect(localStorage.getItem('still-online:v1:messenger')).toContain(
      '[ponies]',
    );

    await user.click(screen.getByRole('button', { name: 'Emoticons' }));
    await user.click(screen.getByRole('button', { name: 'Delete [ponies]' }));
    expect(
      useMessengerStore.getState().progress.player.customEmoticons,
    ).toEqual([]);
  });

  it('shows an error for a taken or invalid shortcut', async () => {
    addPicture();
    useMessengerStore.getState().addCustomEmoticon('[ponies]', 'x');
    const user = userEvent.setup();
    renderChat();
    await user.click(screen.getByRole('button', { name: 'Emoticons' }));
    await user.click(
      screen.getByRole('menuitem', { name: 'Create emoticon…' }),
    );
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('option', { name: /pony\.jpg/ }));
    await user.type(within(dialog).getByRole('textbox'), 'ponies');
    await user.click(within(dialog).getByRole('button', { name: 'OK' }));
    expect(within(dialog).getByRole('alert').textContent).toMatch(/in use/);
  });

  it('appends picked codes to the reply and renders custom codes in the transcript', async () => {
    const id = addPicture();
    useMessengerStore.getState().addCustomEmoticon('[ponies]', id);
    const user = userEvent.setup();
    useMessengerStore.setState({ signedIn: false });
    getMessengerEngine().signIn();
    renderChat();
    await user.click(await screen.findByRole('button', { name: 'Hey' }));
    await user.click(screen.getByRole('button', { name: 'Emoticons' }));
    await user.click(screen.getByRole('menuitem', { name: '[ponies]' }));
    const input = screen.getByLabelText('Message') as HTMLInputElement;
    expect(input.value).toBe('hey lena [ponies]');
    await user.click(screen.getByRole('button', { name: 'Send' }));
    const entries =
      useMessengerStore.getState().progress.contacts.lena?.transcript ?? [];
    expect(entries.at(-1)).toMatchObject({
      kind: 'choice',
      flavor: '[ponies]',
    });
    expect(shownTexts('lena').at(-1)).toBe('hey lena [ponies]');
    expect(screen.getByRole('img', { name: '[ponies]' })).toBeTruthy();
  });
});
