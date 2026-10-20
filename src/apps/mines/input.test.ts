import { describe, expect, it } from 'vitest';
import {
  INPUT_IDLE,
  chordedChange,
  minesInput,
  type InputContext,
  type InputEvent,
  type InputState,
} from './input';

const ctx = (over: Partial<InputContext> = {}): InputContext => ({
  over: false,
  revealed: (i) => i === 5,
  flagMode: false,
  ...over,
});

const ev = (
  type: 'down' | 'up',
  pointerType: string,
  button: number,
  buttons: number,
  cell: number | null = 1,
): InputEvent => ({ type, pointerType, button, buttons, cell });

/** Runs events through the reducer; returns the moves and the final state. */
function run(events: InputEvent[], c = ctx(), from: InputState = INPUT_IDLE) {
  let state = from;
  const moves = [];
  for (const e of events) {
    const r = minesInput(state, e, c);
    state = r.state;
    if (r.move) moves.push(r.move);
  }
  return { state, moves };
}

describe('Mines input: mouse (unchanged rules)', () => {
  it('left reveals on release and shows the press meanwhile', () => {
    const down = minesInput(INPUT_IDLE, ev('down', 'mouse', 0, 1), ctx());
    expect(down).toEqual({
      state: { ...INPUT_IDLE, pressed: true },
      move: null,
    });
    const up = minesInput(down.state, ev('up', 'mouse', 0, 0), ctx());
    expect(up).toEqual({
      state: INPUT_IDLE,
      move: { kind: 'reveal', cell: 1 },
    });
  });

  it('right cycles the mark on press; its release does nothing', () => {
    const { moves } = run([ev('down', 'mouse', 2, 2), ev('up', 'mouse', 2, 0)]);
    expect(moves).toEqual([{ kind: 'mark', cell: 1 }]);
  });

  it('left on an opened number chords', () => {
    const { moves } = run([
      ev('down', 'mouse', 0, 1, 5),
      ev('up', 'mouse', 0, 0, 5),
    ]);
    expect(moves).toEqual([{ kind: 'chord', cell: 5 }]);
  });

  it('both buttons chord once and swallow both releases', () => {
    const { moves, state } = run([
      ev('down', 'mouse', 0, 1),
      ev('down', 'mouse', 2, 3),
      ev('up', 'mouse', 0, 2),
      ev('up', 'mouse', 2, 0),
    ]);
    expect(moves).toEqual([{ kind: 'chord', cell: 1 }]);
    expect(state).toEqual(INPUT_IDLE);
  });

  it('the middle button chords on release', () => {
    const { moves } = run([ev('down', 'mouse', 1, 4), ev('up', 'mouse', 1, 0)]);
    expect(moves).toEqual([{ kind: 'chord', cell: 1 }]);
  });

  it('a finished game takes no presses; off-field events do nothing', () => {
    expect(run([ev('down', 'mouse', 2, 2)], ctx({ over: true })).moves).toEqual(
      [],
    );
    expect(
      run([ev('down', 'mouse', 0, 1, null), ev('up', 'mouse', 0, 0, null)])
        .moves,
    ).toEqual([]);
  });

  it('leaving the field drops the press', () => {
    const { state } = run([ev('down', 'mouse', 0, 1), { type: 'cancel' }]);
    expect(state.pressed).toBe(false);
  });
});

describe('Mines input: touch', () => {
  it('a tap reveals, or flags in flag mode', () => {
    const tap = [ev('down', 'touch', 0, 1), ev('up', 'touch', 0, 0)];
    expect(run(tap).moves).toEqual([{ kind: 'reveal', cell: 1 }]);
    expect(run(tap, ctx({ flagMode: true })).moves).toEqual([
      { kind: 'flag', cell: 1 },
    ]);
  });

  it('a tap on an opened number chords, even in flag mode', () => {
    const tap = [ev('down', 'touch', 0, 1, 5), ev('up', 'touch', 0, 0, 5)];
    expect(run(tap, ctx({ flagMode: true })).moves).toEqual([
      { kind: 'chord', cell: 5 },
    ]);
  });

  it('a long-press flags and its lift does nothing', () => {
    const { moves, state } = run([
      ev('down', 'touch', 0, 1),
      { type: 'longPress', cell: 1 },
      ev('up', 'touch', 0, 0),
    ]);
    expect(moves).toEqual([{ kind: 'flag', cell: 1 }]);
    expect(state).toEqual(INPUT_IDLE);
  });

  it('a long-press on an opened number does nothing', () => {
    const { moves } = run([
      ev('down', 'touch', 0, 1, 5),
      { type: 'longPress', cell: 5 },
      ev('up', 'touch', 0, 0, 5),
    ]);
    expect(moves).toEqual([]);
  });

  it('a pen taps like a finger; a cancelled touch does nothing', () => {
    expect(run([ev('down', 'pen', 0, 1), ev('up', 'pen', 0, 0)]).moves).toEqual(
      [{ kind: 'reveal', cell: 1 }],
    );
    const cancelled = run([ev('down', 'touch', 0, 1), { type: 'cancel' }]);
    expect(cancelled).toEqual({ state: INPUT_IDLE, moves: [] });
  });
});

describe('chordedChange', () => {
  it('reads a second button from a pointermove', () => {
    expect(chordedChange(2, 3)).toBe('down');
    expect(chordedChange(0, 2)).toBe('up');
    expect(chordedChange(1, 4)).toBe('down');
    expect(chordedChange(-1, 1)).toBeNull();
  });
});
