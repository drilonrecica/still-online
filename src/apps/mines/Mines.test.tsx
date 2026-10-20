import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { events } from '@/os/events';
import { useDeviceStore } from '@/os/device';
import { LONG_PRESS_MS } from '@/os/touch/useLongPress';
import { useGamesStore } from '@/os/store/games';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import '@/apps/registry';
import { LEVELS, createBoard, reveal } from './board';
import Mines, { windowSizeFor } from './Mines';

// Math.random() = 0.5 gives a fixed seed, so the layout can be predicted with the pure board.
const SEED = Math.floor(0.5 * 2 ** 32) >>> 0;

function setup() {
  const windowId = useWindowsStore.getState().openApp('mines');
  const view = render(<Mines windowId={windowId} props={{}} />);
  const cell = (i: number) =>
    view.container.querySelector<HTMLElement>(`[data-index="${i}"]`)!;
  const mouse = { pointerType: 'mouse', pointerId: 1 };
  const click = (i: number) => {
    fireEvent.pointerDown(cell(i), { ...mouse, button: 0, buttons: 1 });
    fireEvent.pointerUp(cell(i), { ...mouse, button: 0, buttons: 0 });
  };
  const rightClick = (i: number) => {
    fireEvent.pointerDown(cell(i), { ...mouse, button: 2, buttons: 2 });
    fireEvent.pointerUp(cell(i), { ...mouse, button: 2, buttons: 0 });
  };
  const finger = { pointerType: 'touch', pointerId: 7, isPrimary: true };
  const tap = (i: number) => {
    fireEvent.pointerDown(cell(i), { ...finger, button: 0, buttons: 1 });
    fireEvent.pointerUp(cell(i), { ...finger, button: 0, buttons: 0 });
  };
  return { windowId, cell, click, rightClick, tap, finger, mouse, view };
}

/** First click at 0, then every other safe cell: wins a Beginner game. */
function playToWin(click: (i: number) => void) {
  const solved = reveal(createBoard(LEVELS.beginner, SEED), 0);
  click(0);
  solved.cells.forEach((c, i) => {
    if (!c.mine) click(i);
  });
  return solved;
}

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useGamesStore.getState().resetScores('mines');
  useSettingsStore.setState({ playerName: 'Tester' });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  useDeviceStore.setState({ device: 'desktop' });
});

describe('Mines', () => {
  it('starts a Beginner field with 10 mines and the clock at 0', () => {
    const { view } = setup();
    expect(view.container.querySelectorAll('[data-index]')).toHaveLength(81);
    expect(screen.getByRole('img', { name: 'Mines left: 10' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Time: 0' })).toBeTruthy();
  });

  it('flags with the right button, cycling flag → ? → none', () => {
    const { cell, rightClick } = setup();
    rightClick(5);
    expect(cell(5).getAttribute('aria-label')).toMatch(/: flag$/);
    expect(screen.getByRole('img', { name: 'Mines left: 9' })).toBeTruthy();
    rightClick(5);
    expect(cell(5).getAttribute('aria-label')).toMatch(/: question$/);
    expect(screen.getByRole('img', { name: 'Mines left: 10' })).toBeTruthy();
    rightClick(5);
    expect(cell(5).getAttribute('aria-label')).toMatch(/: hidden$/);
  });

  it('starts the clock on the first click', () => {
    vi.useFakeTimers();
    const { click } = setup();
    click(0);
    expect(screen.getByRole('img', { name: 'Time: 1' })).toBeTruthy();
    act(() => void vi.advanceTimersByTime(3000));
    expect(screen.getByRole('img', { name: 'Time: 4' })).toBeTruthy();
  });

  it('loses on a mine: the face dies and the mines show', () => {
    const { click, cell } = setup();
    const solved = reveal(createBoard(LEVELS.beginner, SEED), 0);
    click(0);
    const mine = solved.cells.findIndex((c) => c.mine);
    click(mine);
    expect(screen.getByRole('button', { name: /you lost/ })).toBeTruthy();
    expect(cell(mine).getAttribute('aria-label')).toMatch(/exploded mine/);
  });

  it('wins, emits game:score, asks for a name and saves the best time', () => {
    const scores: unknown[] = [];
    const off = events.on('game:score', (p) => scores.push(p));
    const { click } = setup();
    playToWin(click);

    expect(scores).toEqual([{ game: 'mines', score: 1, detail: 'beginner' }]);
    expect(screen.getByRole('button', { name: /you won/ })).toBeTruthy();
    const input = screen.getByLabelText('Your name') as HTMLInputElement;
    expect(input.value).toBe('Tester');

    fireEvent.change(input, { target: { value: 'Mina' } });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(useGamesStore.getState().mines.best.beginner).toEqual({
      seconds: 1,
      name: 'Mina',
    });
    expect(
      JSON.parse(localStorage.getItem('still-online:v1:games')!).state.mines
        .best.beginner.name,
    ).toBe('Mina');
    // The Best Times table opens next.
    expect(screen.getByText('1 seconds')).toBeTruthy();
    off();
  });

  it('does not ask for a name when the time is not a best', () => {
    useGamesStore
      .getState()
      .recordScore('mines', { name: 'Fast', score: 1, level: 'beginner' });
    const scores: unknown[] = [];
    const off = events.on('game:score', (p) => scores.push(p));
    const { click } = setup();
    playToWin(click);
    expect(scores).toHaveLength(1);
    expect(screen.queryByLabelText('Your name')).toBeNull();
    off();
  });

  it('F2 and the smiley start a new game', () => {
    const { click, cell, view } = setup();
    click(0);
    expect(cell(0).getAttribute('aria-label')).not.toMatch(/hidden/);
    fireEvent.keyDown(view.container.firstElementChild!, { key: 'F2' });
    expect(cell(0).getAttribute('aria-label')).toMatch(/hidden/);
    click(0);
    fireEvent.click(screen.getByRole('button', { name: /New game/ }));
    expect(cell(0).getAttribute('aria-label')).toMatch(/hidden/);
  });

  it('chords with both buttons on a satisfied number', () => {
    const { click, rightClick, cell } = setup();
    const solved = reveal(createBoard(LEVELS.beginner, SEED), 0);
    click(0);
    // Find a revealed number whose mine neighbours are all still hidden.
    const w = solved.width;
    const target = solved.cells.findIndex(
      (c, i) => c.revealed && c.adjacent > 0 && i % w > 0 && i % w < w - 1,
    );
    expect(target).toBeGreaterThanOrEqual(0);
    const x = target % w;
    const y = Math.floor(target / w);
    const ring: number[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if ((dx || dy) && nx >= 0 && ny >= 0 && nx < w && ny < solved.height) {
          ring.push(ny * w + nx);
        }
      }
    }
    for (const n of ring) if (solved.cells[n]!.mine) rightClick(n);
    // Pointer events: the second button is a move with `button` set; only the last lift is an up.
    const mouse = { pointerType: 'mouse', pointerId: 1 };
    fireEvent.pointerDown(cell(target), { ...mouse, button: 0, buttons: 1 });
    fireEvent.pointerMove(cell(target), { ...mouse, button: 2, buttons: 3 });
    fireEvent.pointerMove(cell(target), { ...mouse, button: 0, buttons: 2 });
    fireEvent.pointerUp(cell(target), { ...mouse, button: 2, buttons: 0 });
    for (const n of ring) {
      if (!solved.cells[n]!.mine) {
        expect(cell(n).getAttribute('aria-label')).not.toMatch(/hidden/);
      }
    }
  });

  it('switches level from the Game menu and resizes the window', () => {
    const { view, windowId } = setup();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Game' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Intermediate/ }));
    expect(view.container.querySelectorAll('[data-index]')).toHaveLength(256);
    expect(screen.getByRole('img', { name: 'Mines left: 40' })).toBeTruthy();
    const win = useWindowsStore
      .getState()
      .windows.find((w) => w.id === windowId)!;
    expect(win).toMatchObject(windowSizeFor(LEVELS.intermediate));
  });

  it('builds a custom field from the dialog, clamped', () => {
    const { view } = setup();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Game' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Custom/ }));
    const dialog = within(screen.getByRole('dialog'));
    fireEvent.change(dialog.getByLabelText('Width'), {
      target: { value: '12' },
    });
    fireEvent.change(dialog.getByLabelText('Height'), {
      target: { value: '10' },
    });
    fireEvent.change(dialog.getByLabelText('Mines'), {
      target: { value: '5' },
    });
    fireEvent.click(dialog.getByRole('button', { name: 'OK' }));
    expect(view.container.querySelectorAll('[data-index]')).toHaveLength(120);
    expect(screen.getByRole('img', { name: 'Mines left: 10' })).toBeTruthy();
  });

  it('shows Best Times and can reset them', () => {
    useGamesStore
      .getState()
      .recordScore('mines', { name: 'Zed', score: 77, level: 'expert' });
    setup();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Game' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /Best Times/ }));
    expect(screen.getByText('77 seconds')).toBeTruthy();
    expect(screen.getByText('Zed')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Reset Scores' }));
    expect(screen.queryByText('77 seconds')).toBeNull();
  });

  it('Exit closes the window', () => {
    const { windowId } = setup();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Game' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Exit' }));
    expect(
      useWindowsStore.getState().windows.some((w) => w.id === windowId),
    ).toBe(false);
  });

  describe('on touch (v0.6)', () => {
    const flagged = (el: HTMLElement) =>
      expect(el.getAttribute('aria-label')).toMatch(/: flag$/);

    it('shows no flag-mode button on a desktop', () => {
      setup();
      expect(screen.queryByRole('button', { name: 'Flag mode' })).toBeNull();
    });

    it('a tap reveals, and a tap on an opened number chords', () => {
      const { tap, cell, rightClick } = setup();
      const solved = reveal(createBoard(LEVELS.beginner, SEED), 0);
      tap(0);
      expect(cell(0).getAttribute('aria-label')).not.toMatch(/hidden/);
      const w = solved.width;
      const inner = (i: number) =>
        i % w > 0 && i % w < w - 1 && i >= w && i < solved.cells.length - w;
      const target = solved.cells.findIndex(
        (c, i) => c.revealed && c.adjacent > 0 && inner(i),
      );
      expect(target).toBeGreaterThanOrEqual(0);
      const ring = [-w - 1, -w, -w + 1, -1, 1, w - 1, w, w + 1].map(
        (d) => target + d,
      );
      for (const n of ring) if (solved.cells[n]!.mine) rightClick(n);
      tap(target);
      for (const n of ring)
        if (!solved.cells[n]!.mine)
          expect(cell(n).getAttribute('aria-label')).not.toMatch(/hidden/);
    });

    it('flag mode makes a tap flag and unflag; the toggle is pressed', () => {
      useDeviceStore.setState({ device: 'phone' });
      const { tap, cell } = setup();
      const toggle = screen.getByRole('button', { name: 'Flag mode' });
      expect(toggle.getAttribute('aria-pressed')).toBe('false');
      fireEvent.click(toggle);
      expect(toggle.getAttribute('aria-pressed')).toBe('true');
      tap(40);
      flagged(cell(40));
      tap(40);
      expect(cell(40).getAttribute('aria-label')).toMatch(/hidden/);
      fireEvent.click(toggle);
      tap(40);
      expect(cell(40).getAttribute('aria-label')).not.toMatch(/hidden/);
    });

    it('a long-press flags without revealing, both ways', () => {
      vi.useFakeTimers();
      const { cell, finger } = setup();
      const hold = (i: number) => {
        fireEvent.pointerDown(cell(i), { ...finger, button: 0, buttons: 1 });
        act(() => vi.advanceTimersByTime(LONG_PRESS_MS + 10));
        fireEvent.pointerUp(cell(i), { ...finger, button: 0, buttons: 0 });
      };
      hold(40);
      flagged(cell(40));
      hold(40);
      expect(cell(40).getAttribute('aria-label')).toMatch(/hidden/);
    });

    it('zooms the framed game to fit on a phone', () => {
      useDeviceStore.setState({ device: 'phone' });
      setup();
      const stage = screen.getByTestId('scale-stage');
      expect(stage.style.width).toBe(`${LEVELS.beginner.width * 16 + 30}px`);
      expect(stage.querySelector('[role="group"]')).toBeTruthy();
    });
  });
});
