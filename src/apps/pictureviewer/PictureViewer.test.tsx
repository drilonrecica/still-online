import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { titleOf } from '@/test/windowTitle';
import { getApp } from '@/apps/registry';
import { systemFolders } from '@/os/fs/nodes';
import { useFsStore } from '@/os/fs/store';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';

let a = '';
let b = '';

beforeEach(() => {
  useFsStore.setState({ nodes: systemFolders(0), purgedSeeds: [] });
  act(() => useWindowsStore.getState().closeAll());
  act(() => {
    const { createFile } = useFsStore.getState();
    a = createFile('pics', {
      name: 'a.jpg',
      type: 'image',
      photo: { scene: 'camp', seed: 1, caption: 'First' },
    });
    b = createFile('pics', {
      name: 'b.jpg',
      type: 'image',
      photo: { scene: 'pet', seed: 2, caption: 'Second' },
    });
    createFile('pics', { name: 'notes.txt', type: 'txt', text: '' });
  });
});

function open(fileId?: string) {
  let id = '';
  act(() => {
    id = useWindowsStore
      .getState()
      .openApp('pictureviewer', fileId ? { fileId } : {});
  });
  return id;
}

const viewers = () =>
  useWindowsStore.getState().windows.filter((w) => w.appId === 'pictureviewer');

describe('Picture Viewer', () => {
  it('shows a picture with its title and steps through the folder', async () => {
    render(<WindowLayer getApp={getApp} />);
    const win = open(a);
    expect(await screen.findByText('1 of 2')).toBeInTheDocument();
    expect(screen.getByText('First')).toBeInTheDocument();
    await waitFor(() => expect(titleOf(win)).toBe('a.jpg - Picture Viewer'));

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    await waitFor(() => expect(titleOf(win)).toBe('b.jpg - Picture Viewer'));
    // The window remembers the picture, so a restored session reopens it.
    expect(viewers()[0]?.props).toEqual({ fileId: b });

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('1 of 2')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByText('First').closest('[tabindex]')!, {
      key: 'ArrowLeft',
    });
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
  });

  it('steps by a sideways touch swipe', async () => {
    render(<WindowLayer getApp={getApp} />);
    open(a);
    const stage = await screen.findByTestId('picture-stage');
    fireEvent.pointerDown(stage, {
      pointerType: 'touch',
      clientX: 300,
      clientY: 200,
    });
    fireEvent.pointerUp(stage, {
      pointerType: 'touch',
      clientX: 180,
      clientY: 210,
    });
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
    // A mouse drag doesn't swipe.
    fireEvent.pointerDown(stage, {
      pointerType: 'mouse',
      clientX: 300,
      clientY: 200,
    });
    fireEvent.pointerUp(stage, {
      pointerType: 'mouse',
      clientX: 100,
      clientY: 200,
    });
    expect(screen.getByText('2 of 2')).toBeInTheDocument();
  });

  it('toggles best fit and actual size', async () => {
    render(<WindowLayer getApp={getApp} />);
    open(a);
    const toggle = await screen.findByRole('button', { name: 'Actual size' });
    expect(screen.getByTestId('picture-stage')).toHaveAttribute(
      'data-fit',
      'true',
    );
    fireEvent.click(toggle);
    expect(
      screen.getByRole('button', { name: 'Best fit' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('picture-stage')).toHaveAttribute(
      'data-fit',
      'false',
    );
  });

  it('is one window that switches to the picture opened next', async () => {
    render(<WindowLayer getApp={getApp} />);
    const first = open(a);
    expect(await screen.findByText('First')).toBeInTheDocument();
    expect(open(b)).toBe(first);
    expect(viewers()).toHaveLength(1);
    expect(await screen.findByText('Second')).toBeInTheDocument();
    // Opening it from the Start menu (no props) keeps the picture.
    open();
    expect(viewers()[0]?.props).toEqual({ fileId: b });
  });

  it('opens the picture in Paint and its folder in Explorer', async () => {
    render(<WindowLayer getApp={getApp} />);
    open(a);
    fireEvent.click(
      await screen.findByRole('button', { name: 'Edit in Paint' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open folder' }));
    const wins = useWindowsStore.getState().windows;
    expect(wins.find((w) => w.appId === 'paint')?.props).toEqual({ fileId: a });
    expect(wins.find((w) => w.appId === 'explorer')?.props).toEqual({
      folder: 'pics',
    });
  });

  it('explains a missing or deleted picture, and an empty viewer', async () => {
    render(<WindowLayer getApp={getApp} />);
    open('f:gone');
    expect(
      await screen.findByText("This picture can't be displayed."),
    ).toBeInTheDocument();
    act(() => useWindowsStore.getState().closeAll());
    open();
    expect(
      await screen.findByText('No picture is open. Open one from My Pictures.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Edit in Paint' }),
    ).toBeDisabled();
  });
});
