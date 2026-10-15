import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { lazy } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSettingsStore } from '@/os/store/settings';
import { setAppResolver, useWindowsStore } from '@/os/store/windows';
import type {
  AppComponentProps,
  AppDefinition,
  AppId,
  WindowState,
} from '@/os/types';
import { useWindowDrag } from '@/os/wm/useWindowDrag';
import { WindowLayer } from '@/os/wm/WindowLayer';

function NotepadStub({ windowId }: AppComponentProps) {
  return <p>notepad content {windowId}</p>;
}

function BareStub({ windowId }: AppComponentProps) {
  const drag = useWindowDrag(windowId);
  return (
    <div>
      <div data-testid="bare-handle" {...drag}>
        custom titlebar
      </div>
    </div>
  );
}

const APPS: Partial<Record<AppId, AppDefinition>> = {
  notepad: {
    id: 'notepad',
    titleKey: 'apps.notepad.title',
    icon16: '/notepad-16.svg',
    icon32: '/notepad-32.svg',
    component: lazy(() => Promise.resolve({ default: NotepadStub })),
    defaultSize: { w: 400, h: 300 },
    singleInstance: false,
    chrome: 'xp',
    showOnDesktop: true,
    showInStartMenu: true,
  },
  amplifier: {
    id: 'amplifier',
    titleKey: 'apps.amplifier.title',
    icon16: '/amp-16.svg',
    icon32: '/amp-32.svg',
    component: lazy(() => Promise.resolve({ default: BareStub })),
    defaultSize: { w: 275, h: 116 },
    minSize: { w: 275, h: 116 },
    singleInstance: true,
    chrome: 'none',
    showOnDesktop: true,
    showInStartMenu: true,
  },
};
const getApp = (id: AppId) => APPS[id];

const store = () => useWindowsStore.getState();
const win = (id: string): WindowState => {
  const found = store().windows.find((w) => w.id === id);
  if (!found) throw new Error(`no window ${id}`);
  return found;
};
const frame = (id: string): HTMLElement => {
  const el = document.querySelector<HTMLElement>(`[data-window-id="${id}"]`);
  if (!el) throw new Error(`no frame ${id}`);
  return el;
};
const titleBar = (id: string): HTMLElement => {
  const el = frame(id).querySelector<HTMLElement>('.title-bar');
  if (!el) throw new Error(`no titlebar ${id}`);
  return el;
};

async function renderWith(...appIds: AppId[]): Promise<string[]> {
  const ids = appIds.map((appId) => store().openApp(appId));
  render(<WindowLayer getApp={getApp} />);
  // Lazy app components resolve in a microtask.
  await screen.findAllByText(/notepad content|custom titlebar/);
  return ids;
}

function drag(el: HTMLElement, from: [number, number], to: [number, number]) {
  const [x0, y0] = from;
  const [x1, y1] = to;
  fireEvent.pointerDown(el, {
    pointerId: 1,
    button: 0,
    clientX: x0,
    clientY: y0,
  });
  fireEvent.pointerMove(el, { pointerId: 1, clientX: x1, clientY: y1 });
  fireEvent.pointerUp(el, { pointerId: 1, clientX: x1, clientY: y1 });
}

// Restores real actions too (a test below swaps them for spies).
const initialState = useWindowsStore.getState();

beforeEach(() => {
  setAppResolver(getApp);
  useWindowsStore.setState(initialState, true);
});

describe('Window frame', () => {
  it('renders the titlebar icon, title and the lazy app content', async () => {
    const [id = ''] = await renderWith('notepad');
    const region = screen.getByRole('region', { name: 'Untitled - Notepad' });
    expect(within(region).getByText('Untitled - Notepad')).toBeInTheDocument();
    expect(region.querySelector('img')).toHaveAttribute(
      'src',
      '/notepad-16.svg',
    );
    expect(
      within(region).getByText(`notepad content ${id}`),
    ).toBeInTheDocument();
    expect(region).toHaveStyle({ left: '24px', top: '24px', width: '400px' });
  });

  it('re-renders the title when the language changes', async () => {
    const [id = ''] = await renderWith('notepad');
    act(() => useSettingsStore.setState({ language: 'de' }));
    expect(
      screen.getByRole('region', { name: 'Unbenannt - Editor' }),
    ).toBeInTheDocument();
    act(() =>
      store().setWindowTitle(id, 'notepad.titleModified', { file: 'a.txt' }),
    );
    expect(titleBar(id)).toHaveTextContent('*a.txt - Editor');
  });

  it('titlebar buttons are named in German and keep their xp.css icon hooks', async () => {
    useSettingsStore.setState({ language: 'de' });
    await renderWith('notepad');

    const minimize = screen.getByRole('button', { name: 'Minimieren' });
    const maximize = screen.getByRole('button', { name: 'Maximieren' });
    const close = screen.getByRole('button', { name: 'Schließen' });
    // xp.css selects the icon by the English aria-label, so it must not be localized.
    expect(minimize).toHaveAttribute('aria-label', 'Minimize');
    expect(maximize).toHaveAttribute('aria-label', 'Maximize');
    expect(close).toHaveAttribute('aria-label', 'Close');
  });

  it('titlebar buttons call the store actions', async () => {
    const [id = ''] = await renderWith('notepad');
    const minimizeWindow = vi.fn();
    const toggleMaximize = vi.fn();
    const closeWindow = vi.fn();
    useWindowsStore.setState({ minimizeWindow, toggleMaximize, closeWindow });

    fireEvent.click(screen.getByRole('button', { name: 'Minimize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Maximize' }));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(minimizeWindow).toHaveBeenCalledWith(id);
    expect(toggleMaximize).toHaveBeenCalledWith(id);
    expect(closeWindow).toHaveBeenCalledWith(id);
  });

  it('minimize hides, maximize toggles to Restore, close removes', async () => {
    const [id = ''] = await renderWith('notepad');

    fireEvent.click(screen.getByRole('button', { name: 'Maximize' }));
    expect(win(id).maximized).toBe(true);
    expect(frame(id)).toHaveAttribute(
      'style',
      expect.not.stringContaining('left'),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    expect(win(id).maximized).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'Minimize' }));
    expect(win(id).minimized).toBe(true);
    expect(frame(id)).not.toBeVisible();

    act(() => store().focusWindow(id));
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(store().windows).toHaveLength(0);
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('mousedown anywhere in a back window focuses it', async () => {
    const [first = '', second = ''] = await renderWith('notepad', 'notepad');
    expect(frame(second)).toHaveAttribute('data-active', 'true');
    expect(frame(first)).toHaveAttribute('data-active', 'false');

    fireEvent.mouseDown(screen.getByText(`notepad content ${first}`));

    expect(win(first).z).toBeGreaterThan(win(second).z);
    expect(frame(first)).toHaveAttribute('data-active', 'true');
    expect(frame(second)).toHaveAttribute('data-active', 'false');
  });

  it('only the inactive window gets the faded titlebar class', async () => {
    const [first = '', second = ''] = await renderWith('notepad', 'notepad');
    expect(frame(first).className).toMatch(/inactive/);
    expect(frame(second).className).not.toMatch(/inactive/);
  });

  it('double-clicking the titlebar toggles maximize', async () => {
    const [id = ''] = await renderWith('notepad');
    fireEvent.doubleClick(titleBar(id));
    expect(win(id).maximized).toBe(true);
    fireEvent.doubleClick(titleBar(id));
    expect(win(id).maximized).toBe(false);
  });

  it('double-clicking a titlebar button does not toggle maximize', async () => {
    const [id = ''] = await renderWith('notepad');
    fireEvent.doubleClick(screen.getByRole('button', { name: 'Minimize' }));
    expect(win(id).maximized).toBe(false);
  });

  it('skips windows whose app is unknown', async () => {
    await renderWith('notepad');
    act(() =>
      useWindowsStore.setState((s) => ({
        windows: [
          ...s.windows,
          { ...s.windows[0]!, id: 'win-99', appId: 'messenger' },
        ],
      })),
    );
    expect(screen.getAllByRole('region')).toHaveLength(1);
  });
});

describe('Window dragging', () => {
  it('dragging the titlebar moves the window and focuses it', async () => {
    const [first = '', second = ''] = await renderWith('notepad', 'notepad');
    const start = win(first);

    drag(titleBar(first), [100, 40], [150, 70]);

    expect(win(first)).toMatchObject({ x: start.x + 50, y: start.y + 30 });
    expect(win(first).z).toBeGreaterThan(win(second).z);
    expect(frame(first)).toHaveStyle({
      left: `${start.x + 50}px`,
      top: `${start.y + 30}px`,
    });
  });

  it('stops moving after pointerup', async () => {
    const [id = ''] = await renderWith('notepad');
    drag(titleBar(id), [100, 40], [110, 50]);
    const after = win(id);
    fireEvent.pointerMove(titleBar(id), {
      pointerId: 1,
      clientX: 400,
      clientY: 400,
    });
    expect(win(id)).toMatchObject({ x: after.x, y: after.y });
  });

  it('does not drag when the pointer starts on a titlebar button', async () => {
    const [id = ''] = await renderWith('notepad');
    const start = win(id);
    const button = screen.getByRole('button', { name: 'Close' });
    fireEvent.pointerDown(button, {
      pointerId: 1,
      button: 0,
      clientX: 100,
      clientY: 40,
    });
    fireEvent.pointerMove(titleBar(id), {
      pointerId: 1,
      clientX: 200,
      clientY: 140,
    });
    expect(win(id)).toMatchObject({ x: start.x, y: start.y });
  });

  it('does not drag a maximized window', async () => {
    const [id = ''] = await renderWith('notepad');
    act(() => store().toggleMaximize(id));
    const start = win(id);
    drag(titleBar(id), [100, 40], [200, 140]);
    expect(win(id)).toMatchObject({ x: start.x, y: start.y });
  });

  it('chrome "none" renders without a frame and drags via useWindowDrag', async () => {
    const [id = ''] = await renderWith('amplifier');
    expect(frame(id).querySelector('.title-bar')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();
    const start = win(id);

    drag(screen.getByTestId('bare-handle'), [10, 10], [60, 35]);

    expect(win(id)).toMatchObject({ x: start.x + 50, y: start.y + 25 });
  });
});

describe('Window resizing', () => {
  const handle = (id: string, edge: string): HTMLElement => {
    const el = frame(id).querySelector<HTMLElement>(`[data-resize="${edge}"]`);
    if (!el) throw new Error(`no ${edge} handle`);
    return el;
  };

  it('has 8 resize handles', async () => {
    const [id = ''] = await renderWith('notepad');
    expect(frame(id).querySelectorAll('[data-resize]')).toHaveLength(8);
  });

  it('the south-east corner grows width and height', async () => {
    const [id = ''] = await renderWith('notepad');
    drag(handle(id, 'se'), [424, 324], [524, 374]);
    expect(win(id)).toMatchObject({ x: 24, y: 24, w: 500, h: 350 });
  });

  it('the west edge keeps the right edge fixed, also at min size', async () => {
    const [id = ''] = await renderWith('notepad');
    drag(handle(id, 'w'), [24, 100], [400, 100]);
    expect(win(id)).toMatchObject({ x: 24 + 400 - 240, w: 240, h: 300 });
  });

  it('resizing focuses the window but does not drag it', async () => {
    const [first = '', second = ''] = await renderWith('notepad', 'notepad');
    fireEvent.mouseDown(handle(first, 'e'));
    drag(handle(first, 'e'), [424, 100], [454, 100]);
    expect(win(first)).toMatchObject({ x: 24, w: 430 });
    expect(win(first).z).toBeGreaterThan(win(second).z);
  });

  it('a maximized window has no resize handles', async () => {
    const [id = ''] = await renderWith('notepad');
    act(() => store().toggleMaximize(id));
    expect(frame(id).querySelectorAll('[data-resize]')).toHaveLength(0);
  });
});
