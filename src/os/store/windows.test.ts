import { beforeEach, describe, expect, it } from 'vitest';
import {
  clampPosition,
  createWindowsStore,
  selectActiveWindowId,
  type WindowAppSpec,
} from '@/os/store/windows';
import {
  CASCADE_ORIGIN,
  CASCADE_STEP,
  type AppId,
  type Size,
} from '@/os/types';

const WORK: Size = { w: 1000, h: 700 };

const APPS: Partial<Record<AppId, WindowAppSpec>> = {
  notepad: {
    id: 'notepad',
    title: 'Untitled - Notepad',
    defaultSize: { w: 400, h: 300 },
    singleInstance: false,
  },
  mycomputer: {
    id: 'mycomputer',
    title: 'My Computer',
    defaultSize: { w: 400, h: 300 },
    minSize: { w: 300, h: 200 },
    singleInstance: true,
  },
  'messenger-chat': {
    id: 'messenger-chat',
    title: 'Conversation',
    defaultSize: { w: 400, h: 300 },
    singleInstance: true,
    instanceKey: (props) => String(props.contactId),
  },
  amplifier: {
    id: 'amplifier',
    title: 'Amplifier',
    defaultSize: { w: 5000, h: 5000 },
    singleInstance: true,
  },
};

let store: ReturnType<typeof createWindowsStore>;
const s = () => store.getState();
const win = (id: string) => {
  const found = s().windows.find((w) => w.id === id);
  if (!found) throw new Error(`no window ${id}`);
  return found;
};
const active = () => selectActiveWindowId(s());

beforeEach(() => {
  store = createWindowsStore({
    getApp: (id) => APPS[id],
    getWorkArea: () => WORK,
  });
});

describe('openApp', () => {
  it('opens a window with the app title, default size and props on top', () => {
    const id = s().openApp('notepad', { file: 'a.txt' });
    expect(win(id)).toMatchObject({
      appId: 'notepad',
      title: 'Untitled - Notepad',
      w: 400,
      h: 300,
      z: 1,
      minimized: false,
      maximized: false,
      props: { file: 'a.txt' },
    });
    expect(s().topZ).toBe(1);
    expect(active()).toBe(id);
  });

  it('hands out unique ids, also after windows were restored from storage', () => {
    store.setState({
      windows: [{ ...APPS_WINDOW, id: 'win-7' }],
      topZ: 3,
    });
    const id = s().openApp('notepad');
    expect(id).not.toBe('win-7');
    expect(win(id).z).toBe(4);
  });

  it('throws for an unknown app', () => {
    expect(() => s().openApp('recyclebin')).toThrow(/unknown app/);
  });

  it('opens multiple windows of a non-singleInstance app', () => {
    const a = s().openApp('notepad');
    const b = s().openApp('notepad');
    expect(a).not.toBe(b);
    expect(s().windows).toHaveLength(2);
  });

  it('singleInstance focuses and un-minimizes the existing window', () => {
    const id = s().openApp('mycomputer');
    s().openApp('notepad');
    s().minimizeWindow(id);
    const again = s().openApp('mycomputer');
    expect(again).toBe(id);
    expect(s().windows).toHaveLength(2);
    expect(win(id).minimized).toBe(false);
    expect(active()).toBe(id);
  });

  it('singleInstance with instanceKey is unique per key', () => {
    const anna = s().openApp('messenger-chat', { contactId: 'anna' });
    const ben = s().openApp('messenger-chat', { contactId: 'ben' });
    expect(ben).not.toBe(anna);
    expect(s().openApp('messenger-chat', { contactId: 'anna' })).toBe(anna);
    expect(s().windows).toHaveLength(2);
    expect(active()).toBe(anna);
  });

  it('clamps the default size to the work area', () => {
    const id = s().openApp('amplifier');
    expect(win(id)).toMatchObject({ w: WORK.w, h: WORK.h });
  });
});

describe('cascade', () => {
  it('starts at the origin and steps by CASCADE_STEP', () => {
    const a = s().openApp('notepad');
    const b = s().openApp('notepad');
    expect(win(a)).toMatchObject({ x: CASCADE_ORIGIN, y: CASCADE_ORIGIN });
    expect(win(b)).toMatchObject({
      x: CASCADE_ORIGIN + CASCADE_STEP,
      y: CASCADE_ORIGIN + CASCADE_STEP,
    });
  });

  it('wraps back to the origin before crossing the work area edge', () => {
    // 400×300 in 1000×700: y + 300 ≤ 700 allows y up to 400 → 24..384 fit (16 windows).
    const ids = Array.from({ length: 17 }, () => s().openApp('notepad'));
    expect(win(ids[15]!)).toMatchObject({ x: 384, y: 384 });
    expect(win(ids[16]!)).toMatchObject({
      x: CASCADE_ORIGIN,
      y: CASCADE_ORIGIN,
    });
  });

  it('cascades from the most recently opened window', () => {
    const a = s().openApp('notepad');
    s().moveWindow(a, 200, 100);
    const b = s().openApp('notepad');
    expect(win(b)).toMatchObject({ x: 224, y: 124 });
  });
});

describe('focusWindow', () => {
  it('brings a window to the top of the z-order', () => {
    const a = s().openApp('notepad');
    const b = s().openApp('notepad');
    expect(active()).toBe(b);
    s().focusWindow(a);
    expect(win(a).z).toBeGreaterThan(win(b).z);
    expect(s().topZ).toBe(win(a).z);
    expect(active()).toBe(a);
  });

  it('does not change z when the window is already in front', () => {
    const a = s().openApp('notepad');
    s().focusWindow(a);
    expect(win(a).z).toBe(1);
    expect(s().topZ).toBe(1);
  });

  it('restores a minimized window and makes it active', () => {
    const a = s().openApp('notepad');
    s().minimizeWindow(a);
    expect(active()).toBeNull();
    s().focusWindow(a);
    expect(win(a).minimized).toBe(false);
    expect(active()).toBe(a);
  });

  it('ignores unknown ids', () => {
    s().openApp('notepad');
    const before = s();
    s().focusWindow('nope');
    expect(s()).toBe(before);
  });
});

describe('minimizeWindow', () => {
  it('keeps z and passes activity to the next highest window', () => {
    const a = s().openApp('notepad');
    const b = s().openApp('notepad');
    s().minimizeWindow(b);
    expect(win(b)).toMatchObject({ minimized: true, z: 2 });
    expect(active()).toBe(a);
  });
});

describe('toggleMaximize', () => {
  it('toggles the flag, keeps restore geometry and focuses', () => {
    const a = s().openApp('notepad');
    s().openApp('notepad');
    const before = win(a);
    s().toggleMaximize(a);
    expect(win(a)).toMatchObject({
      maximized: true,
      x: before.x,
      y: before.y,
      w: before.w,
      h: before.h,
    });
    expect(active()).toBe(a);
    s().toggleMaximize(a);
    expect(win(a).maximized).toBe(false);
  });
});

describe('closeWindow / closeAll', () => {
  it('removes one window and activates the next', () => {
    const a = s().openApp('notepad');
    const b = s().openApp('notepad');
    s().closeWindow(b);
    expect(s().windows.map((w) => w.id)).toEqual([a]);
    expect(active()).toBe(a);
  });

  it('removes all windows', () => {
    s().openApp('notepad');
    s().openApp('mycomputer');
    s().closeAll();
    expect(s().windows).toEqual([]);
    expect(active()).toBeNull();
  });
});

describe('setWindowTitle', () => {
  it('renames one window', () => {
    const a = s().openApp('notepad');
    const b = s().openApp('notepad');
    s().setWindowTitle(a, 'Lena - Conversation');
    expect(win(a).title).toBe('Lena - Conversation');
    expect(win(b).title).toBe('Untitled - Notepad');
  });
});

describe('moveWindow', () => {
  it('moves within the work area', () => {
    const a = s().openApp('notepad');
    s().moveWindow(a, 300, 200);
    expect(win(a)).toMatchObject({ x: 300, y: 200 });
  });

  it('keeps 40px of the titlebar visible on every edge', () => {
    const a = s().openApp('notepad'); // w = 400
    s().moveWindow(a, -5000, -5000);
    expect(win(a)).toMatchObject({ x: 40 - 400, y: 0 });
    s().moveWindow(a, 5000, 5000);
    expect(win(a)).toMatchObject({ x: WORK.w - 40, y: WORK.h - 30 });
  });
});

describe('resizeWindow', () => {
  it('applies the new geometry', () => {
    const a = s().openApp('notepad');
    s().resizeWindow(a, { x: 10, y: 20, w: 500, h: 350 });
    expect(win(a)).toMatchObject({ x: 10, y: 20, w: 500, h: 350 });
  });

  it('enforces the default min size 240×140', () => {
    const a = s().openApp('notepad');
    s().resizeWindow(a, { x: 10, y: 20, w: 50, h: 50 });
    expect(win(a)).toMatchObject({ w: 240, h: 140 });
  });

  it("enforces the app's own minSize", () => {
    const a = s().openApp('mycomputer');
    s().resizeWindow(a, { x: 10, y: 20, w: 250, h: 150 });
    expect(win(a)).toMatchObject({ w: 300, h: 200 });
  });

  it('clamps the position using the new width', () => {
    const a = s().openApp('notepad');
    s().resizeWindow(a, { x: -1000, y: -10, w: 600, h: 300 });
    expect(win(a)).toMatchObject({ x: 40 - 600, y: 0, w: 600 });
  });
});

describe('clampPosition', () => {
  it('pins the top edge at 0 even in a tiny work area', () => {
    expect(clampPosition(0, 50, 300, { w: 20, h: 10 })).toEqual({
      x: -20,
      y: 0,
    });
  });
});

const APPS_WINDOW = {
  id: 'win-1',
  appId: 'notepad' as const,
  title: 'Untitled - Notepad',
  x: 24,
  y: 24,
  w: 400,
  h: 300,
  z: 3,
  minimized: false,
  maximized: false,
  props: {},
};
