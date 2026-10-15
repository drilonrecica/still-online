import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getApp } from '@/apps/registry';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';
import { migrateLegacyNotepad } from './migrate';
import { formatTimeDate } from './Notepad';
import { useNotepadStore } from './store';

const fs = () => useFsStore.getState();
const win = (id: string) =>
  useWindowsStore.getState().windows.find((w) => w.id === id);

function docs() {
  return fs()
    .list(FS_FOLDERS.docs)
    .filter((n) => n.type === 'txt');
}

function openNotepad(props: Record<string, string> = {}) {
  render(<WindowLayer getApp={getApp} />);
  let id = '';
  act(() => {
    id = useWindowsStore.getState().openApp('notepad', props);
  });
  return id;
}

async function menu(
  user: ReturnType<typeof userEvent.setup>,
  bar: string,
  item: string,
) {
  await user.click(screen.getByRole('menuitem', { name: bar }));
  await user.click(screen.getByRole('menuitem', { name: item }));
}

beforeEach(() => {
  localStorage.clear();
  act(() => {
    useWindowsStore.getState().closeAll();
    useFsStore.setState({ nodes: {}, purgedSeeds: [] });
    useFsStore.persist.rehydrate();
    useNotepadStore.setState({ text: '', migrated: false });
  });
});

afterEach(() => vi.restoreAllMocks());

describe('Notepad with files', () => {
  it('opens a file by id: loads its text and titles the window after it', async () => {
    const fileId = fs().createFile(FS_FOLDERS.docs, {
      name: 'poem.txt',
      type: 'txt',
      text: 'roses are red',
    });
    const id = openNotepad({ fileId });
    expect(await screen.findByLabelText('Notepad document')).toHaveValue(
      'roses are red',
    );
    expect(win(id)?.title).toBe('poem.txt - Notepad');
  });

  it('Untitled without a file; typing marks the title with *', async () => {
    const user = userEvent.setup();
    const id = openNotepad();
    expect(win(id)?.title).toBe('Untitled - Notepad');
    await user.type(await screen.findByLabelText('Notepad document'), 'hi');
    expect(win(id)?.title).toBe('*Untitled - Notepad');
  });

  it('Save writes back to the fs and clears the *', async () => {
    const user = userEvent.setup();
    const fileId = fs().createFile(FS_FOLDERS.docs, {
      name: 'poem.txt',
      type: 'txt',
      text: 'a',
    });
    const id = openNotepad({ fileId });
    await user.type(await screen.findByLabelText('Notepad document'), 'bc');
    expect(win(id)?.title).toBe('*poem.txt - Notepad');
    await menu(user, 'File', 'Save');
    expect(fs().get(fileId)?.text).toBe('abc');
    expect(win(id)?.title).toBe('poem.txt - Notepad');
  });

  it('Save As creates a file in the chosen name, retitles and keeps the fileId in props', async () => {
    const user = userEvent.setup();
    const id = openNotepad();
    await user.type(await screen.findByLabelText('Notepad document'), 'draft');
    await menu(user, 'File', 'Save As…');
    const dialog = screen.getByRole('dialog', { name: 'Save As' });
    await user.type(within(dialog).getByLabelText('File name'), 'plans');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    const created = docs().find((n) => n.name === 'plans.txt');
    expect(created?.text).toBe('draft');
    expect(win(id)?.title).toBe('plans.txt - Notepad');
    expect(win(id)?.props).toEqual({ fileId: created?.id });
  });

  it('Save on an untitled document goes through Save As', async () => {
    const user = userEvent.setup();
    openNotepad();
    await user.type(await screen.findByLabelText('Notepad document'), 'x');
    await menu(user, 'File', 'Save');
    expect(screen.getByRole('dialog', { name: 'Save As' })).toBeInTheDocument();
  });

  it('Open… lists txt files and loads the chosen one', async () => {
    const user = userEvent.setup();
    fs().createFile(FS_FOLDERS.docs, {
      name: 'chosen.txt',
      type: 'txt',
      text: 'picked',
    });
    const id = openNotepad();
    await screen.findByLabelText('Notepad document');
    await menu(user, 'File', 'Open…');
    const dialog = screen.getByRole('dialog', { name: 'Open' });
    await user.dblClick(within(dialog).getByText('chosen.txt'));
    expect(screen.getByLabelText('Notepad document')).toHaveValue('picked');
    expect(win(id)?.title).toBe('chosen.txt - Notepad');
  });

  it('asks before closing with unsaved changes: Cancel keeps, No closes, Yes saves then closes', async () => {
    const user = userEvent.setup();
    const fileId = fs().createFile(FS_FOLDERS.docs, {
      name: 'poem.txt',
      type: 'txt',
      text: '',
    });
    const id = openNotepad({ fileId });
    await user.type(await screen.findByLabelText('Notepad document'), 'zz');

    await user.click(screen.getByRole('button', { name: 'Close' }));
    const prompt = screen.getByRole('dialog', { name: 'Notepad' });
    expect(prompt).toHaveTextContent('Do you want to save the changes?');
    await user.click(within(prompt).getByRole('button', { name: 'Cancel' }));
    expect(win(id)).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(fs().get(fileId)?.text).toBe('zz');
    expect(win(id)).toBeUndefined();
  });

  it('No discards the changes and closes', async () => {
    const user = userEvent.setup();
    const fileId = fs().createFile(FS_FOLDERS.docs, {
      name: 'poem.txt',
      type: 'txt',
      text: 'keep',
    });
    const id = openNotepad({ fileId });
    await user.type(await screen.findByLabelText('Notepad document'), 'zz');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    await user.click(screen.getByRole('button', { name: 'No' }));
    expect(win(id)).toBeUndefined();
    expect(fs().get(fileId)?.text).toBe('keep');
  });

  it('closes without a prompt when nothing changed', async () => {
    const user = userEvent.setup();
    const id = openNotepad();
    await screen.findByLabelText('Notepad document');
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(win(id)).toBeUndefined();
  });

  it('Time/Date inserts the XP-style stamp', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 14, 15, 7));
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    openNotepad();
    await screen.findByLabelText('Notepad document');
    await menu(user, 'Edit', 'Time/Date');
    expect(screen.getByLabelText('Notepad document')).toHaveValue(
      '3:07 PM 10/14/2007',
    );
    vi.useRealTimers();
  });

  it('formats times like XP', () => {
    expect(formatTimeDate(new Date(2007, 9, 14, 0, 5))).toBe(
      '12:05 AM 10/14/2007',
    );
    expect(formatTimeDate(new Date(2007, 0, 2, 12, 0))).toBe(
      '12:00 PM 1/2/2007',
    );
  });
});

describe('legacy migration', () => {
  it('moves the old document to My Documents/notes.txt once and clears the store', () => {
    useNotepadStore.setState({ text: 'old thoughts' });
    expect(migrateLegacyNotepad()).toBe(true);

    const notes = docs().filter((n) => n.name === 'notes.txt');
    expect(notes).toHaveLength(1);
    expect(notes[0]?.text).toBe('old thoughts');
    expect(useNotepadStore.getState().text).toBe('');

    expect(migrateLegacyNotepad()).toBe(false);
    expect(docs().filter((n) => n.name.startsWith('notes'))).toHaveLength(1);
  });

  it('creates an empty notes.txt when there was no old text', () => {
    migrateLegacyNotepad();
    expect(docs().find((n) => n.name === 'notes.txt')?.text).toBe('');
  });

  it('never overwrites an existing notes.txt; old text lands in a numbered copy', () => {
    const existing = fs().createFile(FS_FOLDERS.docs, {
      name: 'notes.txt',
      type: 'txt',
      text: 'mine',
    });
    useNotepadStore.setState({ text: 'old' });
    migrateLegacyNotepad();
    expect(fs().get(existing)?.text).toBe('mine');
    expect(docs().find((n) => n.name === 'notes (2).txt')?.text).toBe('old');
  });
});
