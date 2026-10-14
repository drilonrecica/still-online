import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';
import { putBlob, getBlob } from '@/os/blobStore';
import { clearStillOnlineStorage } from './mycomputer/reset';
import { getApp, listApps } from './registry';
import { useNotepadStore } from './notepad/store';

beforeEach(() => {
  localStorage.clear();
  act(() => useWindowsStore.getState().closeAll());
});

describe('registry', () => {
  it('lists the starter apps with 16/32px icons', () => {
    expect(listApps().map((a) => a.id)).toEqual([
      'mycomputer',
      'messenger',
      'messenger-chat',
      'amplifier',
      'notepad',
      'recyclebin',
    ]);
    for (const app of listApps()) {
      expect(app.icon16).toBeTruthy();
      expect(app.icon32).toBeTruthy();
    }
  });

  it('assigns menu categories and pins', () => {
    const meta = Object.fromEntries(
      listApps().map((a) => [a.id, [a.category, a.pinned ?? false]]),
    );
    expect(meta).toEqual({
      mycomputer: ['system', false],
      messenger: ['internet', true],
      'messenger-chat': [undefined, false],
      amplifier: ['entertainment', true],
      notepad: ['accessories', true],
      recyclebin: ['system', false],
    });
  });

  it('opens one chat window per contact, kept off the desktop and Start menu', () => {
    const chat = getApp('messenger-chat');
    expect(chat).toMatchObject({
      showOnDesktop: false,
      showInStartMenu: false,
    });
    const { openApp } = useWindowsStore.getState();
    const a = openApp('messenger-chat', { contactId: 'ann' });
    const b = openApp('messenger-chat', { contactId: 'bob' });
    expect(openApp('messenger-chat', { contactId: 'ann' })).toBe(a);
    expect(b).not.toBe(a);
  });

  it.each([
    ['mycomputer', /still-online/i],
    ['notepad', null],
    ['recyclebin', /The Recycle Bin is empty\./],
  ] as const)('opens %s via openApp', async (appId, text) => {
    render(<WindowLayer getApp={getApp} />);
    act(() => {
      useWindowsStore.getState().openApp(appId);
    });
    if (text) {
      expect((await screen.findAllByText(text)).length).toBeGreaterThan(0);
    } else {
      expect(await screen.findByLabelText('Notepad document')).toBeTruthy();
      expect(useWindowsStore.getState().windows[0]?.title).toBe(
        'Untitled - Notepad',
      );
    }
  });
});

describe('notepad persistence', () => {
  it('writes text to still-online:v1:notepad and rehydrates it', async () => {
    render(<WindowLayer getApp={getApp} />);
    act(() => {
      useWindowsStore.getState().openApp('notepad');
    });
    const area = await screen.findByLabelText('Notepad document');
    await userEvent.type(area, 'hello 2007');

    const saved = JSON.parse(
      localStorage.getItem('still-online:v1:notepad') ?? '{}',
    );
    expect(saved.version).toBe(1);
    expect(saved.state.text).toBe('hello 2007');

    // Simulate a reload: in-memory state is lost, storage survives.
    const raw = localStorage.getItem('still-online:v1:notepad') ?? '';
    act(() => useNotepadStore.setState({ text: '' }));
    localStorage.setItem('still-online:v1:notepad', raw);
    await act(() => useNotepadStore.persist.rehydrate());
    expect(useNotepadStore.getState().text).toBe('hello 2007');
  });
});

describe('reset', () => {
  it('clears only still-online:v1:* keys', () => {
    localStorage.clear();
    localStorage.setItem('still-online:v1:notepad', '{}');
    localStorage.setItem('still-online:v1:settings', '{}');
    localStorage.setItem('other', 'keep');
    expect(clearStillOnlineStorage(localStorage)).toBe(2);
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem('other')).toBe('keep');
  });

  it('My Computer reset confirms, clears storage and reloads', async () => {
    const reload = vi.fn();
    vi.stubGlobal('location', { ...window.location, reload });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    localStorage.setItem('still-online:v1:notepad', '{}');
    const blobKey = await putBlob(new Blob(['x']));

    render(<WindowLayer getApp={getApp} />);
    act(() => {
      useWindowsStore.getState().openApp('mycomputer');
    });
    await userEvent.click(
      await screen.findByRole('button', { name: /Reset still-online/ }),
    );

    expect(window.confirm).toHaveBeenCalled();
    await waitFor(() => expect(reload).toHaveBeenCalled());
    expect(localStorage.getItem('still-online:v1:notepad')).toBeNull();
    expect(await getBlob(blobKey)).toBeNull();
    vi.unstubAllGlobals();
  });
});
