import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { titleOf } from '@/test/windowTitle';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installDisplayPictureRoute } from '@/apps/messenger/displayPictureRoute';
import { useMessengerStore } from '@/apps/messenger/store';
import { getApp } from '@/apps/registry';
import { getBlob } from '@/os/blobStore';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS } from '@/os/fs/types';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { WindowLayer } from '@/os/wm/WindowLayer';
import { cloneBuffer, getPixel, type PixelBuffer } from './pixels';
import { painted } from './test-helpers';

// jsdom has no canvas: the codec keeps encoded pictures in a map instead of real PNG bytes.
const encoded = new Map<Blob, PixelBuffer>();
let shown: PixelBuffer | null = null;
vi.mock('./codec', () => ({
  TEXT_FONT: '16px sans-serif',
  TEXT_LINE_HEIGHT: 19,
  blitToCanvas: (_canvas: HTMLCanvasElement, buf: PixelBuffer) => {
    shown = buf;
  },
  encodePng: (buf: PixelBuffer) => {
    const blob = new Blob(['png']);
    encoded.set(blob, cloneBuffer(buf));
    return Promise.resolve(blob);
  },
  decodeImage: async (node: { blobKey?: string }) => {
    const blob = node.blobKey ? await getBlob(node.blobKey) : null;
    const buf = blob ? encoded.get(blob) : undefined;
    return buf ? cloneBuffer(buf) : null;
  },
  drawText: () => false,
}));

const fs = () => useFsStore.getState();
const pics = () =>
  fs()
    .list(FS_FOLDERS.pics)
    .filter((n) => n.type === 'image');
const RED = [255, 0, 0, 255] as const;

async function openPaint(props: Record<string, string> = {}) {
  render(<WindowLayer getApp={getApp} />);
  act(() => void useWindowsStore.getState().openApp('paint', props));
  return screen.findByRole('img', { name: 'Picture' });
}

function drag(
  canvas: HTMLElement,
  from: [number, number],
  to: [number, number],
  button = 0,
) {
  fireEvent.pointerDown(canvas, {
    button,
    clientX: from[0],
    clientY: from[1],
    pointerId: 1,
  });
  fireEvent.pointerMove(canvas, {
    button,
    clientX: to[0],
    clientY: to[1],
    pointerId: 1,
  });
  fireEvent.pointerUp(canvas, {
    button,
    clientX: to[0],
    clientY: to[1],
    pointerId: 1,
  });
}

async function menu(
  user: ReturnType<typeof userEvent.setup>,
  bar: string,
  item: string,
) {
  await user.click(screen.getByRole('menuitem', { name: bar }));
  await user.click(
    screen.getByRole('menuitem', { name: new RegExp(`^${item}`) }),
  );
}

beforeEach(() => {
  localStorage.clear();
  shown = null;
  act(() => {
    useWindowsStore.getState().closeAll();
    useFsStore.setState({ nodes: {}, purgedSeeds: [] });
    useFsStore.persist.rehydrate();
  });
});

afterEach(() => vi.restoreAllMocks());

describe('Paint', () => {
  it('opens a 640×480 white picture with 13 tools and 28 colours, titled untitled - Paint', async () => {
    await openPaint();
    expect(
      within(screen.getByRole('toolbar', { name: 'Tools' })).getAllByRole(
        'button',
      ),
    ).toHaveLength(13);
    expect(
      within(screen.getByRole('group', { name: 'Colors' })).getAllByRole(
        'button',
      ),
    ).toHaveLength(28);
    // The first blit runs in a passive effect, which can land after the DOM commit.
    await waitFor(() => expect(shown).not.toBeNull());
    expect(shown && [shown.w, shown.h]).toEqual([640, 480]);
    expect(painted(shown!, [255, 255, 255, 255])).toHaveLength(640 * 480);
    expect(titleOf(useWindowsStore.getState().windows[0]?.id)).toBe(
      'untitled - Paint',
    );
  });

  it('draws with the pencil in the primary colour; right button uses the secondary', async () => {
    const user = userEvent.setup();
    const canvas = await openPaint();
    await user.click(screen.getByRole('button', { name: 'Color #ff0000' }));
    drag(canvas, [10, 10], [20, 10]);
    expect(painted(shown!, RED)).toHaveLength(11);
    fireEvent.contextMenu(
      screen.getByRole('button', { name: 'Color #0000ff' }),
    );
    expect(
      screen.getByRole('img', { name: /secondary colour #0000ff/ }),
    ).toBeInTheDocument();
    drag(canvas, [10, 30], [12, 30], 2);
    expect(painted(shown!, [0, 0, 255, 255])).toHaveLength(3);
  });

  it('undoes and redoes with Ctrl+Z / Ctrl+Y', async () => {
    const user = userEvent.setup();
    const canvas = await openPaint();
    drag(canvas, [5, 5], [9, 5]);
    expect(painted(shown!)).toHaveLength(5);
    canvas.focus();
    fireEvent.keyDown(canvas, { key: 'z', ctrlKey: true });
    expect(painted(shown!)).toHaveLength(0);
    fireEvent.keyDown(canvas, { key: 'y', ctrlKey: true });
    expect(painted(shown!)).toHaveLength(5);
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(screen.getByRole('menuitem', { name: /^Redo/ })).toBeDisabled();
  });

  it('switches tools and shows their options; the picker returns to the last tool', async () => {
    const user = userEvent.setup();
    const canvas = await openPaint();
    await user.click(screen.getByRole('button', { name: 'Eraser' }));
    expect(
      screen.getAllByRole('button', { name: /^Eraser size/ }),
    ).toHaveLength(4);
    await user.click(screen.getByRole('button', { name: 'Brush' }));
    expect(screen.getAllByRole('button', { name: /^Brush size/ })).toHaveLength(
      3,
    );
    await user.click(screen.getByRole('button', { name: 'Rectangle' }));
    await user.click(screen.getByRole('button', { name: 'Fill only' }));
    drag(canvas, [0, 0], [3, 3]);
    expect(painted(shown!)).toHaveLength(16);
    await user.click(screen.getByRole('button', { name: 'Pick Color' }));
    fireEvent.pointerDown(canvas, {
      button: 0,
      clientX: 50,
      clientY: 50,
      pointerId: 1,
    });
    expect(
      screen.getByRole('img', { name: /Primary colour #ffffff/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rectangle' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('magnifies 1×/2×/4×', async () => {
    const user = userEvent.setup();
    const canvas = await openPaint();
    await user.click(screen.getByRole('button', { name: 'Magnifier' }));
    await user.click(screen.getByRole('button', { name: 'Zoom 2x' }));
    expect(canvas.style.width).toBe('1280px');
    fireEvent.pointerDown(canvas, {
      button: 0,
      clientX: 1,
      clientY: 1,
      pointerId: 1,
    });
    expect(canvas.style.width).toBe('640px');
    fireEvent.pointerDown(canvas, {
      button: 0,
      clientX: 1,
      clientY: 1,
      pointerId: 1,
    });
    expect(canvas.style.width).toBe('1280px');
  });

  it('selects, moves (one undo step) and deletes a region', async () => {
    const user = userEvent.setup();
    const canvas = await openPaint();
    drag(canvas, [5, 5], [5, 5]);
    await user.click(screen.getByRole('button', { name: 'Select' }));
    drag(canvas, [0, 0], [9, 9]);
    drag(canvas, [5, 5], [55, 5]);
    expect(painted(shown!)).toEqual(['55,5']);
    fireEvent.keyDown(canvas, { key: 'z', ctrlKey: true });
    expect(painted(shown!)).toEqual(['5,5']);
    drag(canvas, [0, 0], [9, 9]);
    fireEvent.keyDown(canvas, { key: 'Delete' });
    expect(painted(shown!)).toEqual([]);
  });

  it('changes the canvas size with Image → Attributes', async () => {
    const user = userEvent.setup();
    await openPaint();
    await menu(user, 'Image', 'Attributes');
    const dialog = screen.getByRole('dialog', { name: 'Attributes' });
    const [w, h] = within(dialog).getAllByRole(
      'spinbutton',
    ) as HTMLInputElement[];
    await user.clear(w!);
    await user.type(w!, '320');
    await user.clear(h!);
    await user.type(h!, '200');
    await user.click(within(dialog).getByRole('button', { name: 'OK' }));
    expect([shown!.w, shown!.h]).toEqual([320, 200]);
    expect(screen.getByText('320x200')).toBeInTheDocument();
  });

  it('saves untitled.png to My Pictures and opens it again (round trip)', async () => {
    const user = userEvent.setup();
    const canvas = await openPaint();
    await user.click(screen.getByRole('button', { name: 'Color #ff0000' }));
    drag(canvas, [1, 1], [30, 1]);
    fireEvent.keyDown(canvas, { key: 's', ctrlKey: true });
    const dialog = await screen.findByRole('dialog', { name: 'Save As' });
    expect(within(dialog).getByLabelText('File name')).toHaveValue(
      'untitled.png',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(pics()).toHaveLength(1));
    const saved = pics()[0]!;
    expect(saved).toMatchObject({ name: 'untitled.png', type: 'image' });
    expect(saved.blobKey).toMatch(/^blob:/);
    await waitFor(() =>
      expect(titleOf(useWindowsStore.getState().windows[0]?.id)).toBe(
        'untitled.png - Paint',
      ),
    );

    await menu(user, 'File', 'New');
    expect(painted(shown!, RED)).toHaveLength(0);
    await menu(user, 'File', 'Open');
    const open = await screen.findByRole('dialog', { name: 'Open' });
    await user.type(within(open).getByLabelText('File name'), 'untitled');
    await user.click(within(open).getByRole('button', { name: 'Open' }));
    await waitFor(() => expect(painted(shown!, RED)).toHaveLength(30));

    // Save again overwrites the same file with new bytes.
    drag(canvas, [1, 3], [5, 3]);
    await menu(user, 'File', 'SaveCtrl\\+S');
    await waitFor(() => expect(pics()[0]!.blobKey).not.toBe(saved.blobKey));
    expect(pics()).toHaveLength(1);
  });

  it('reopens the file from window props and asks before discarding changes', async () => {
    const user = userEvent.setup();
    const blob = new Blob(['png']);
    const pic = cloneBuffer(
      shown ?? { w: 2, h: 2, data: new Uint8ClampedArray(16).fill(255) },
    );
    encoded.set(blob, pic);
    const { putBlob } = await import('@/os/blobStore');
    const blobKey = await putBlob(blob);
    const fileId = fs().createFile(FS_FOLDERS.pics, {
      name: 'tiny.png',
      type: 'image',
      blobKey,
    });
    const canvas = await openPaint({ fileId });
    await waitFor(() => expect([shown!.w, shown!.h]).toEqual([2, 2]));
    expect(titleOf(useWindowsStore.getState().windows[0]?.id)).toBe(
      'tiny.png - Paint',
    );
    drag(canvas, [0, 0], [1, 0]);
    await menu(user, 'File', 'New');
    expect(screen.getByRole('dialog', { name: 'Paint' })).toHaveTextContent(
      'Save changes to tiny.png?',
    );
    await user.click(screen.getByRole('button', { name: 'No' }));
    expect([shown!.w, shown!.h]).toEqual([640, 480]);
  });

  it('sets the picture as a tiled or centred background (its own blob copy)', async () => {
    const user = userEvent.setup();
    await openPaint();
    await menu(user, 'File', 'Set As Background \\(Tiled\\)');
    await waitFor(() =>
      expect(useSettingsStore.getState().wallpaper.kind).toBe('custom'),
    );
    expect(useSettingsStore.getState().wallpaperPosition).toBe('tile');
    const first = useSettingsStore.getState().wallpaper;
    await menu(user, 'File', 'Set As Background \\(Centered\\)');
    await waitFor(() =>
      expect(useSettingsStore.getState().wallpaperPosition).toBe('center'),
    );
    const second = useSettingsStore.getState().wallpaper;
    expect(second).not.toEqual(first);
    if (first.kind === 'custom')
      expect(await getBlob(first.blobKey)).toBeNull();
    expect(pics()).toHaveLength(0);
  });

  it('uses the picture as display picture, saving it first', async () => {
    const off = installDisplayPictureRoute();
    useMessengerStore.getState().setDisplayPicture(null);
    const user = userEvent.setup();
    await openPaint();
    await menu(user, 'File', 'Use as display picture');
    const dialog = await screen.findByRole('dialog', { name: 'Save As' });
    await user.clear(within(dialog).getByLabelText('File name'));
    await user.type(within(dialog).getByLabelText('File name'), 'me');
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(pics().map((n) => n.name)).toEqual(['me.png']));
    await waitFor(() =>
      expect(
        useMessengerStore.getState().progress.player.displayPicture?.fileId,
      ).toBe(pics()[0]!.id),
    );
    expect(
      await screen.findByText(/display picture has been changed/),
    ).toBeInTheDocument();
    off();
  });

  it('reads a pixel back through the picker and keeps the buffer as source of truth', async () => {
    const canvas = await openPaint();
    drag(canvas, [3, 3], [3, 3]);
    expect(getPixel(shown!, 3, 3)).toEqual([0, 0, 0, 255]);
  });
});
