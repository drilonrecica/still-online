// P1-04: Notepad in German.
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getApp } from '@/apps/registry';
import { useFsStore } from '@/os/fs/store';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';
import { useNotepadStore } from './store';

beforeEach(() => {
  localStorage.clear();
  act(() => {
    useWindowsStore.getState().closeAll();
    useFsStore.setState({ nodes: {}, purgedSeeds: [] });
    useFsStore.persist.rehydrate();
    useNotepadStore.setState({ text: '', migrated: false });
    useSettingsStore.setState({ language: 'de' });
  });
});

afterEach(() => useSettingsStore.setState({ language: 'en' }));

describe('Notepad in German', () => {
  it('shows German menus and the save-changes question', async () => {
    const user = userEvent.setup();
    render(<WindowLayer getApp={getApp} />);
    act(() => void useWindowsStore.getState().openApp('notepad'));
    await user.click(await screen.findByRole('menuitem', { name: 'Datei' }));
    expect(
      screen.getByRole('menuitem', { name: 'Speichern unter…' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('menuitem', { name: 'Datei' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Editor-Dokument' }),
      'Hallo',
    );
    await user.click(screen.getByRole('menuitem', { name: 'Datei' }));
    await user.click(screen.getByRole('menuitem', { name: 'Neu' }));
    expect(
      screen.getByText(/Möchten Sie die Änderungen speichern\?/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ja' })).toBeInTheDocument();
  });
});
