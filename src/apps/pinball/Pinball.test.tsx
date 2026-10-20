import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeviceStore } from '@/os/device';
import { events } from '@/os/events';
import { useGamesStore } from '@/os/store/games';
import { useSettingsStore } from '@/os/store/settings';
import '@/apps/registry';
import { VIEW_H, VIEW_W, displayLines } from './display';
import { formatScore, textDots } from './font';
import { createGame } from './sim';
import Pinball, { STAGE_H, STAGE_W, keyControl } from './Pinball';

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
  const view = render(<Pinball />);
  const canvas = view.container.querySelector('canvas')!;
  canvas.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: VIEW_W, height: VIEW_H }) as DOMRect;
  const root = view.container.firstChild as HTMLElement;
  return { view, canvas, root };
}

const key = (root: HTMLElement, k: string, code = '') => ({
  down: () => fireEvent.keyDown(root, { key: k, code }),
  up: () => fireEvent.keyUp(root, { key: k, code }),
});

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
  useGamesStore.getState().resetScores('pinball');
  useSettingsStore.setState({ playerName: 'Tester' });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  events.clear();
});

describe('Star Pinball', () => {
  it('maps the flipper and plunger keys', () => {
    expect(keyControl({ key: 'z', code: 'KeyZ' })).toBe('left');
    expect(keyControl({ key: 'Shift', code: 'ShiftLeft' })).toBe('left');
    expect(keyControl({ key: '/', code: 'Slash' })).toBe('right');
    expect(keyControl({ key: 'Shift', code: 'ShiftRight' })).toBe('right');
    expect(keyControl({ key: ' ', code: 'Space' })).toBe('plunger');
    expect(keyControl({ key: 'ArrowDown', code: 'ArrowDown' })).toBe('plunger');
    expect(keyControl({ key: 'x', code: 'KeyX' })).toBeNull();
  });

  it('opens on the menu, with help and an empty high-score table', () => {
    setup();
    expect(
      screen.getByRole('heading', { name: /Star\s*Pinball/ }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Help' }));
    expect(
      screen.getByText(/Cadet → Ensign → Lieutenant → Captain → Admiral/),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    fireEvent.click(screen.getByRole('button', { name: 'High Scores' }));
    expect(screen.getByText(/No scores yet/)).toBeTruthy();
  });

  it('plays 3 balls to game over, emits game:score and saves a high score', () => {
    const scores: { game: string; score: number }[] = [];
    events.on('game:score', (p) => scores.push(p));
    const { root, canvas } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(
      screen.getByRole('img', { name: /Star Pinball table\. Space/ }),
    ).toBeTruthy();

    // Flip once with the keys and once by clicking each half of the table.
    key(root, 'z').down();
    advance(0.2);
    key(root, 'z').up();
    fireEvent.pointerDown(canvas, {
      clientX: 300,
      clientY: 500,
      button: 0,
      pointerId: 1,
    });
    fireEvent.pointerUp(canvas, { pointerId: 1 });

    // Launch every ball the game serves with a full pull, until the game ends.
    for (let t = 0; t < 600 && scores.length === 0; t += 3) {
      key(root, ' ').down();
      advance(1.2);
      key(root, ' ').up();
      advance(1.8);
    }
    expect(scores).toHaveLength(1);
    expect(scores[0]!.game).toBe('pinball');
    expect(scores[0]!.score).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Game Over' })).toBeTruthy();

    const input = screen.getByLabelText(/new high score/);
    expect(input).toHaveValue('Tester');
    fireEvent.change(input, { target: { value: 'Ace' } });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(useGamesStore.getState().pinball.high).toEqual([
      {
        name: 'Ace',
        score: scores[0]!.score,
        date: expect.stringMatching(/^2007-/),
      },
    ]);
    expect(screen.getByText(formatScore(scores[0]!.score))).toBeTruthy();
  });

  it('goes back to the menu on Esc without scoring', () => {
    const scores: unknown[] = [];
    events.on('game:score', (p) => scores.push(p));
    const { root } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    advance(1);
    key(root, 'Escape').down();
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
    advance(30);
    expect(scores).toHaveLength(0);
  });
});

describe('Star Pinball in German', () => {
  beforeEach(() => useSettingsStore.setState({ language: 'de' }));

  it('shows the menu, help and game-over panels in German', () => {
    setup();
    expect(
      screen.getByRole('heading', { name: /Sternen-\s*Flipper/ }),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Hilfe' }));
    expect(
      screen.getByText(/Kadett → Fähnrich → Leutnant → Kapitän → Admiral/),
    ).toBeTruthy();
    expect(screen.getAllByText('Leertaste')[0]!.tagName).toBe('KBD');
    fireEvent.click(screen.getByRole('button', { name: 'Zurück' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bestenliste' }));
    expect(screen.getByText(/Die Galaxis wartet/)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Spielen' }));
    expect(
      screen.getByRole('img', { name: /Sternen-Flipper-Tisch\. Leertaste/ }),
    ).toBeTruthy();
  });

  it('switches the display language live', () => {
    const g = createGame(1);
    g.message = null;
    g.score = 1234567;
    g.rank = 1;
    expect(displayLines(g, false)).toEqual(['1.234.567', 'BALL 1  FÄHNRICH']);
    useSettingsStore.setState({ language: 'en' });
    expect(displayLines(g, false)).toEqual(['1,234,567', 'BALL 1  ENSIGN']);
  });
});

describe('score display', () => {
  it('shows the score and ball / rank, or a message over the score', () => {
    const g = createGame(1);
    g.message = null;
    g.score = 1234567;
    expect(displayLines(g, false)).toEqual(['1,234,567', 'BALL 1  CADET']);
    g.multiplier = 2;
    g.rank = 2;
    // Too long with double spaces for the 21-character line, so it closes up.
    expect(displayLines(g, false)[1]).toBe('BALL 1 LIEUTENANT 2X');
    g.message = { id: 'tilt', n: 0, ttl: 1 };
    expect(displayLines(g, false)).toEqual(['TILT', '1,234,567']);
    g.message = { id: 'rankUp', n: 3, ttl: 1 };
    expect(displayLines(g, false)[0]).toBe('RANK UP: CAPTAIN');
    expect(displayLines(createGame(1, { attract: true }), true)).toEqual([
      'STAR PINBALL',
      'PRESS PLAY',
    ]);
  });

  it('turns text into 5×7 dots', () => {
    const { dots, width } = textDots('1');
    expect(width).toBe(5);
    expect(dots).toHaveLength(10);
    expect(textDots('AB').width).toBe(11);
  });
});

describe('Star Pinball on a phone (v0.6)', () => {
  afterEach(() => useDeviceStore.setState({ device: 'desktop' }));

  it('zooms the whole 460×640 window to fit; a desktop has no wrapper', () => {
    const desktop = render(<Pinball />);
    expect(desktop.queryByTestId('scale-stage')).toBeNull();
    desktop.unmount();
    useDeviceStore.setState({ device: 'phone' });
    render(<Pinball />);
    const stage = screen.getByTestId('scale-stage');
    expect([STAGE_W, STAGE_H]).toEqual([460, 640]);
    expect(stage.style.width).toBe('460px');
    expect(stage.style.height).toBe('640px');
    expect(stage.querySelector('canvas')).toBeTruthy();
  });
});
