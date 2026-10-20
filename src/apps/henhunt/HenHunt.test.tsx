import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { events } from '@/os/events';
import { useGamesStore } from '@/os/store/games';
import { useSettingsStore } from '@/os/store/settings';
import '@/apps/registry';
import {
  MAX_CAM,
  ROUND_SECONDS,
  VIEW_H,
  VIEW_W,
  WINDMILL,
  toScreenX,
} from './layout';
import { createGame } from './sim';
import HenHunt from './HenHunt';

// Math.random() = 0.5 gives a fixed seed, so a round can be predicted with the pure sim.
const SEED = Math.floor(0.5 * 2 ** 32) >>> 0;
const FRAME_MS = 100;

let pending: FrameRequestCallback | null = null;
let clock = 0;

/** Runs the game loop for `seconds` of frames. */
function advance(seconds: number) {
  const frames = Math.ceil((seconds * 1000) / FRAME_MS);
  for (let i = 0; i < frames; i++) {
    clock += FRAME_MS;
    const cb = pending;
    pending = null;
    act(() => cb?.(clock));
  }
}

function setup() {
  const view = render(<HenHunt />);
  const canvas = view.container.querySelector('canvas')!;
  canvas.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: VIEW_W, height: VIEW_H }) as DOMRect;
  return { view, canvas };
}

beforeEach(() => {
  localStorage.clear();
  clock = 0;
  pending = null;
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    pending = cb;
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', () => {
    pending = null;
  });
  useGamesStore.getState().resetScores('henhunt');
  useSettingsStore.setState({ playerName: 'Tester' });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  events.clear();
});

describe('Hen Hunt', () => {
  it('opens on the menu with the title and Play / High Scores / Help', () => {
    setup();
    expect(screen.getByRole('heading', { name: 'Hen Hunt' })).toBeTruthy();
    for (const name of ['Play', 'High Scores', 'Help'])
      expect(screen.getByRole('button', { name })).toBeTruthy();
  });

  it('explains the rules and lists (empty) high scores', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(screen.getByText(/costs you 25 points/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'High Scores' }));
    expect(screen.getByText(/No scores yet/)).toBeTruthy();
  });

  it('plays a 90 s round, emits game:score and offers to play again', () => {
    const scores: unknown[] = [];
    events.on('game:score', (p) => scores.push(p));
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.queryByRole('button', { name: 'Play' })).toBeNull();
    advance(ROUND_SECONDS - 1);
    expect(scores).toHaveLength(0);
    advance(1.5);
    expect(scores).toEqual([{ game: 'henhunt', score: 0 }]);
    expect(screen.getByRole('heading', { name: 'Time’s up!' })).toBeTruthy();
    // 0 points never makes the table.
    expect(screen.queryByLabelText(/new high score/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }));
    expect(screen.queryByRole('heading', { name: 'Time’s up!' })).toBeNull();
  });

  it('shoots with the mouse, reloads with Space and saves a top-10 score by name', () => {
    const scores: { score: number }[] = [];
    events.on('game:score', (p) => scores.push(p));
    const { canvas, view } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));

    // The pointer rests in the middle, so the camera doesn't pan; wait for the window hen.
    const peek = createGame(SEED).windowHen.nextIn;
    advance(peek + 0.5);
    const win = {
      clientX: toScreenX(WINDMILL.window.x, 'far', MAX_CAM / 2),
      clientY: WINDMILL.window.y,
    };
    fireEvent.pointerMove(canvas, win);
    fireEvent.pointerDown(canvas, { ...win, button: 0 });
    fireEvent.keyDown(view.container.firstChild!, { key: ' ' });
    advance(ROUND_SECONDS);

    expect(scores).toHaveLength(1);
    expect(scores[0]!.score).toBeGreaterThanOrEqual(50);
    const input = screen.getByLabelText(/new high score/);
    expect(input).toHaveValue('Tester');
    fireEvent.change(input, { target: { value: 'Ace' } });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    const high = useGamesStore.getState().henhunt.high;
    expect(high).toEqual([
      {
        name: 'Ace',
        score: scores[0]!.score,
        date: expect.stringMatching(/^2007-/),
      },
    ]);
    expect(screen.getByRole('heading', { name: 'High Scores' })).toBeTruthy();
    expect(screen.getByText('Ace')).toBeTruthy();
  });

  it('goes back to the menu on Esc mid-round without scoring', () => {
    const scores: unknown[] = [];
    events.on('game:score', (p) => scores.push(p));
    const { view } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    advance(2);
    fireEvent.keyDown(view.container.firstChild!, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
    advance(ROUND_SECONDS);
    expect(scores).toHaveLength(0);
  });

  describe('on touch (v0.6)', () => {
    const finger = { pointerType: 'touch', pointerId: 3, isPrimary: true };

    it('a tap aims and shoots; a drag pans the field instead of shooting', () => {
      const { canvas } = setup();
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
      const peek = createGame(SEED).windowHen.nextIn;
      advance(peek + 0.5);
      const x = toScreenX(WINDMILL.window.x, 'far', MAX_CAM / 2);
      const y = WINDMILL.window.y;
      // Drag 100 px right: the view looks left, so the far window moves 35 px right.
      fireEvent.pointerDown(canvas, { ...finger, clientX: 400, clientY: 300 });
      fireEvent.pointerMove(canvas, { ...finger, clientX: 450, clientY: 300 });
      fireEvent.pointerMove(canvas, { ...finger, clientX: 500, clientY: 300 });
      fireEvent.pointerUp(canvas, { ...finger, clientX: 500, clientY: 300 });
      const moved = toScreenX(WINDMILL.window.x, 'far', MAX_CAM / 2 - 100);
      expect(moved - x).toBeCloseTo(35);
      const tap = { ...finger, clientX: moved, clientY: y };
      fireEvent.pointerDown(canvas, tap);
      fireEvent.pointerUp(canvas, tap);
      advance(ROUND_SECONDS);
      expect(screen.getByText(/^1 hits from 1 shots/)).toBeTruthy();
      expect(screen.getByText('Score: 50')).toBeTruthy();
    });

    it('a tap with an empty gun reloads', () => {
      const scores: { score: number }[] = [];
      events.on('game:score', (p) => scores.push(p));
      const { canvas } = setup();
      fireEvent.click(screen.getByRole('button', { name: 'Play' }));
      const tap = { ...finger, clientX: 400, clientY: 500 };
      for (let i = 0; i < 9; i++) {
        fireEvent.pointerDown(canvas, tap);
        fireEvent.pointerUp(canvas, tap);
      }
      advance(1.2);
      fireEvent.pointerDown(canvas, tap);
      fireEvent.pointerUp(canvas, tap);
      advance(ROUND_SECONDS);
      // 8 shots, a reload tap, then one more shot.
      expect(screen.getByText(/from 9 shots/)).toBeTruthy();
      expect(scores).toHaveLength(1);
    });
  });
});
