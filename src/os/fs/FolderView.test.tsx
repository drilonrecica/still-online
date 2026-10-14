import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/apps/registry';
import { events } from '@/os/events';
import { useWindowsStore } from '@/os/store/windows';
import { FolderView } from './FolderView';
import { openFsNode } from './openNode';
import { useFsStore } from './store';
import { FS_FOLDERS, type FsNode } from './types';
import { systemFolders } from './nodes';

function reset() {
  useFsStore.setState({ nodes: systemFolders(0), purgedSeeds: [] });
  useWindowsStore.setState({ windows: [], topZ: 0 });
}

function Harness({ start = FS_FOLDERS.docs }: { start?: string }) {
  return <FolderView folderId={start} onNavigate={() => undefined} />;
}

function addFile(name: string, type: FsNode['type'] = 'txt', parent = 'docs') {
  return useFsStore.getState().createFile(parent, { name, type });
}

describe('FolderView', () => {
  beforeEach(reset);
  afterEach(() => vi.restoreAllMocks());

  it('lists children, folders first, with the path in the address bar', () => {
    act(() => {
      addFile('b.txt');
      addFile('Zed', 'folder');
    });
    render(<Harness />);
    const names = screen.getAllByRole('option').map((o) => o.textContent);
    expect(names.slice(0, 3)).toEqual(['My Music', 'My Pictures', 'Zed']);
    expect(screen.getByLabelText('Address')).toHaveValue('My Documents');
  });

  it('moves selection with arrows and deletes with the Delete key', () => {
    act(() => {
      addFile('a.txt');
      addFile('b.txt');
    });
    render(<Harness start={FS_FOLDERS.docs} />);
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'End' });
    expect(screen.getByRole('option', { name: /b\.txt/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(list, { key: 'Delete' });
    const { nodes } = useFsStore.getState();
    const b = Object.values(nodes).find((n) => n.name === 'b.txt');
    expect(b?.parentId).toBe(FS_FOLDERS.recycle);
    expect(screen.queryByText('b.txt')).toBeNull();
  });

  it('renames inline with F2 and Enter', () => {
    act(() => void addFile('old.txt'));
    render(<Harness />);
    fireEvent.click(screen.getByText('old.txt'));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'F2' });
    const input = screen.getByLabelText('Rename');
    fireEvent.change(input, { target: { value: 'new.txt' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.getByText('new.txt')).toBeInTheDocument();
    expect(screen.queryByLabelText('Rename')).toBeNull();
  });

  it('Escape cancels a rename', () => {
    act(() => void addFile('keep.txt'));
    render(<Harness />);
    fireEvent.click(screen.getByText('keep.txt'));
    fireEvent.click(screen.getByRole('button', { name: 'Rename' }));
    const input = screen.getByLabelText('Rename');
    fireEvent.change(input, { target: { value: 'nope.txt' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.getByText('keep.txt')).toBeInTheDocument();
  });

  it("doesn't allow renaming or deleting system folders", () => {
    render(<Harness />);
    fireEvent.click(screen.getByText('My Music'));
    expect(screen.getByRole('button', { name: 'Rename' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled();
  });

  it('toggles the details view', () => {
    act(() => void addFile('a.txt'));
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Details' }));
    expect(screen.getByText('Text Document')).toBeInTheDocument();
  });

  it('opens folders on Enter and via Up', () => {
    const onNavigate = vi.fn();
    render(<FolderView folderId="docs" onNavigate={onNavigate} />);
    fireEvent.click(screen.getByText('My Pictures'));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledWith('pics');
    fireEvent.click(screen.getByRole('button', { name: 'Up' }));
    expect(onNavigate).toHaveBeenCalledWith('root');
  });

  describe('Recycle Bin', () => {
    it('restores and empties', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      let id = '';
      act(() => {
        id = addFile('gone.txt');
        addFile('also.txt');
        useFsStore.getState().remove(id);
        useFsStore
          .getState()
          .remove(
            Object.values(useFsStore.getState().nodes).find(
              (n) => n.name === 'also.txt',
            )!.id,
          );
      });
      render(<Harness start={FS_FOLDERS.recycle} />);
      expect(screen.getByRole('button', { name: 'Restore' })).toBeDisabled();
      fireEvent.click(screen.getByText('gone.txt'));
      fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
      expect(useFsStore.getState().nodes[id]?.parentId).toBe('docs');

      fireEvent.click(
        screen.getByRole('button', { name: 'Empty Recycle Bin' }),
      );
      expect(window.confirm).toHaveBeenCalled();
      expect(screen.getByText('The Recycle Bin is empty.')).toBeInTheDocument();
      expect(
        Object.values(useFsStore.getState().nodes).some(
          (n) => n.name === 'also.txt',
        ),
      ).toBe(false);
    });

    it('keeps everything when the empty confirmation is declined', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      act(() => {
        const id = addFile('keep.txt');
        useFsStore.getState().remove(id);
      });
      render(<Harness start={FS_FOLDERS.recycle} />);
      fireEvent.click(
        screen.getByRole('button', { name: 'Empty Recycle Bin' }),
      );
      expect(screen.getByText('keep.txt')).toBeInTheDocument();
    });
  });
});

describe('openFsNode', () => {
  beforeEach(reset);
  const base = { parentId: 'docs', createdAt: 0, modifiedAt: 0 };
  const handlers = () => ({ navigate: vi.fn(), viewImage: vi.fn() });

  it('navigates folders and views images', () => {
    const h = handlers();
    openFsNode({ ...base, id: 'a', name: 'A', type: 'folder' }, h);
    openFsNode({ ...base, id: 'b', name: 'b.jpg', type: 'image' }, h);
    expect(h.navigate).toHaveBeenCalledWith('a');
    expect(h.viewImage).toHaveBeenCalledWith('b');
  });

  it('opens txt in Notepad with its file id', () => {
    openFsNode({ ...base, id: 'f:1', name: 'n.txt', type: 'txt' }, handlers());
    const win = useWindowsStore.getState().windows[0];
    expect(win?.appId).toBe('notepad');
    expect(win?.props).toEqual({ fileId: 'f:1' });
  });

  it('enqueues audio for play and forwards links to the browser', () => {
    const enqueue = vi.fn();
    const browse = vi.fn();
    const off = [
      events.on('amplifier:enqueue', enqueue),
      events.on('browser:open', browse),
    ];
    openFsNode(
      { ...base, id: 'm', name: 'm.mp3', type: 'audio', trackId: 'cool-rock' },
      handlers(),
    );
    openFsNode(
      { ...base, id: 'l', name: 'l', type: 'link', url: 'http://a.example/' },
      handlers(),
    );
    off.forEach((f) => f());
    expect(enqueue).toHaveBeenCalledWith({ trackId: 'cool-rock', play: true });
    expect(browse).toHaveBeenCalledWith({ url: 'http://a.example/' });
  });
});
