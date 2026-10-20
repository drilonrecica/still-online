import { beforeEach, describe, expect, it } from 'vitest';
import { useWindowsStore } from '@/os/store/windows';
import { useToastStore } from '@/os/toast/store';
import { useWorldStore, WORLD_DEFAULTS } from '@/os/world';
import '@/apps/registry';
import {
  classifySwipe,
  createKonamiMatcher,
  createKonamiSwipeMatcher,
  installKonami,
  type Gesture,
} from './konami';

const CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

describe('createKonamiMatcher', () => {
  it('fires on the full sequence only', () => {
    const feed = createKonamiMatcher();
    const results = CODE.map((k) => feed(k));
    expect(results.slice(0, -1).every((r) => !r)).toBe(true);
    expect(results.at(-1)).toBe(true);
  });

  it('resets on a wrong key and accepts upper-case B/A', () => {
    const feed = createKonamiMatcher();
    ['ArrowUp', 'ArrowUp', 'x'].forEach((k) => feed(k));
    expect(CODE.map((k) => feed(k.toUpperCase())).at(-1)).toBe(true);
  });

  it('a repeated first key keeps the sequence alive', () => {
    const feed = createKonamiMatcher();
    feed('ArrowUp');
    expect(['ArrowUp', ...CODE].map((k) => feed(k)).at(-1)).toBe(true);
  });
});

const SWIPES: Gesture[] = [
  'up',
  'up',
  'down',
  'down',
  'left',
  'right',
  'left',
  'right',
  'tap',
  'tap',
];

describe('classifySwipe', () => {
  it('reads the main axis of a swipe longer than 40 px', () => {
    expect(classifySwipe(0, -41)).toBe('up');
    expect(classifySwipe(5, 120)).toBe('down');
    expect(classifySwipe(-60, 20)).toBe('left');
    expect(classifySwipe(80, -79)).toBe('right');
  });

  it('a short travel is a tap, anything in between is neither', () => {
    expect(classifySwipe(0, 0)).toBe('tap');
    expect(classifySwipe(6, -7)).toBe('tap');
    expect(classifySwipe(0, 40)).toBeNull();
    expect(classifySwipe(20, 20)).toBeNull();
  });
});

describe('createKonamiSwipeMatcher', () => {
  it('fires on U U D D L R L R tap tap only', () => {
    const feed = createKonamiSwipeMatcher();
    const results = SWIPES.map((g) => feed(g));
    expect(results.slice(0, -1).every((r) => !r)).toBe(true);
    expect(results.at(-1)).toBe(true);
  });

  it('a gesture that is neither starts over', () => {
    const feed = createKonamiSwipeMatcher();
    [...SWIPES.slice(0, 5), null, ...SWIPES.slice(5)].forEach((g) => {
      expect(feed(g)).toBe(false);
    });
    expect(SWIPES.map((g) => feed(g)).at(-1)).toBe(true);
  });
});

describe('installKonami', () => {
  beforeEach(() => {
    useWorldStore.setState({ ...WORLD_DEFAULTS });
    useWindowsStore.setState({ windows: [], topZ: 0 });
    useToastStore.getState().clear();
  });

  const press = (keys: string[]) =>
    keys.forEach((key) =>
      window.dispatchEvent(new KeyboardEvent('keydown', { key })),
    );

  it('unlocks konami and announces it once', () => {
    const off = installKonami();
    press(CODE);
    expect(useWorldStore.getState().unlocks).toContain('konami');
    expect(useToastStore.getState().toasts.map((t) => t.title)).toEqual([
      'Cheat activated!',
    ]);
    press(CODE);
    expect(useToastStore.getState().toasts).toHaveLength(1);
    off();
  });

  it('ignores the code while a window is focused', () => {
    useWindowsStore.getState().openApp('notepad');
    const off = installKonami();
    press(CODE);
    expect(useWorldStore.getState().unlocks).toEqual([]);
    off();
  });

  /** One finger from (x, y) by (dx, dy), as pointer events on `target`. */
  function swipe(target: Element, dx: number, dy: number, pointerId = 1) {
    const at = (x: number, y: number) => ({
      bubbles: true,
      pointerId,
      pointerType: 'touch',
      clientX: x,
      clientY: y,
    });
    target.dispatchEvent(new PointerEvent('pointerdown', at(200, 300)));
    target.dispatchEvent(new PointerEvent('pointerup', at(200 + dx, 300 + dy)));
  }

  const MOVES: Record<Gesture, [number, number]> = {
    up: [0, -80],
    down: [0, 80],
    left: [-80, 0],
    right: [80, 0],
    tap: [2, 1],
  };

  function desktop() {
    const el = document.createElement('div');
    el.setAttribute('data-desktop-background', '');
    const icon = document.createElement('div');
    icon.setAttribute('role', 'option');
    el.append(icon);
    document.body.append(el);
    return { el, icon };
  }

  it('unlocks konami by swipes on the desktop background', () => {
    const { el } = desktop();
    const off = installKonami();
    SWIPES.forEach((g) => swipe(el, ...MOVES[g]));
    expect(useWorldStore.getState().unlocks).toContain('konami');
    expect(useToastStore.getState().toasts.map((t) => t.title)).toEqual([
      'Cheat activated!',
    ]);
    off();
    el.remove();
  });

  it('ignores swipes on an icon, by a mouse, or cancelled by the browser', () => {
    const { el, icon } = desktop();
    const off = installKonami();
    SWIPES.forEach((g) => swipe(icon, ...MOVES[g]));
    SWIPES.forEach((g, i) => {
      if (i === 4) {
        el.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            pointerId: 9,
            pointerType: 'touch',
          }),
        );
        el.dispatchEvent(
          new PointerEvent('pointercancel', { bubbles: true, pointerId: 9 }),
        );
      }
      swipe(el, ...MOVES[g]);
    });
    const mouse = { bubbles: true, pointerType: 'mouse' };
    SWIPES.forEach((g) => {
      el.dispatchEvent(new PointerEvent('pointerdown', mouse));
      el.dispatchEvent(
        new PointerEvent('pointerup', {
          ...mouse,
          clientX: MOVES[g][0],
          clientY: MOVES[g][1],
        }),
      );
    });
    expect(useWorldStore.getState().unlocks).toEqual([]);
    off();
    el.remove();
  });
});
