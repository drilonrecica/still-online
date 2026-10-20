// Mines input: pointer events (mouse, touch, pen) → board moves. A pure reducer, so the window
// stays thin. The mouse keeps the classic rules: left reveals on release, right cycles the mark,
// both buttons or the middle one chord. A finger (or pen) taps: a tap reveals, or flags in flag
// mode, a tap on an opened number chords, and a long-press flags.

export type MoveKind = 'reveal' | 'mark' | 'flag' | 'chord';

export interface Move {
  kind: MoveKind;
  cell: number;
}

export interface InputState {
  /** A press is down on the field (the worried face). */
  pressed: boolean;
  /** A both-buttons chord is in progress; its button releases do nothing. */
  chorded: boolean;
  /** A long-press already flagged; the lift that ends it does nothing. */
  held: boolean;
}

export const INPUT_IDLE: InputState = {
  pressed: false,
  chorded: false,
  held: false,
};

export type InputEvent =
  | {
      type: 'down' | 'up';
      pointerType: string;
      /** The button that changed (`PointerEvent.button`). */
      button: number;
      /** The buttons held after the change (`PointerEvent.buttons`). */
      buttons: number;
      cell: number | null;
    }
  | { type: 'longPress'; cell: number | null }
  /** The pointer left the field or was cancelled. */
  | { type: 'cancel' };

export interface InputContext {
  /** The game is won or lost. */
  over: boolean;
  revealed: (cell: number) => boolean;
  flagMode: boolean;
}

export interface InputResult {
  state: InputState;
  move: Move | null;
}

const isMouse = (pointerType: string) => pointerType === 'mouse';

/** The primary press on a cell: chord on a number, else reveal (or flag in flag mode). */
function press(cell: number, ctx: InputContext): Move {
  if (ctx.revealed(cell)) return { kind: 'chord', cell };
  return { kind: ctx.flagMode ? 'flag' : 'reveal', cell };
}

export function minesInput(
  s: InputState,
  e: InputEvent,
  ctx: InputContext,
): InputResult {
  const none = (state: InputState): InputResult => ({ state, move: null });
  switch (e.type) {
    case 'cancel':
      return none({ ...s, pressed: false, held: false });
    case 'longPress':
      if (ctx.over || e.cell === null) return none(s);
      return {
        state: { ...s, pressed: false, held: true },
        move: ctx.revealed(e.cell) ? null : { kind: 'flag', cell: e.cell },
      };
    case 'down': {
      if (ctx.over || e.cell === null) return none(s);
      if (!isMouse(e.pointerType))
        return none({ ...s, pressed: true, held: false });
      // Both buttons held: chord straight away and swallow the releases.
      if (e.buttons === 3)
        return {
          state: { ...s, chorded: true },
          move: { kind: 'chord', cell: e.cell },
        };
      if (e.button === 2)
        return { state: s, move: { kind: 'mark', cell: e.cell } };
      if (e.button === 0) return none({ ...s, pressed: true });
      return none(s);
    }
    case 'up': {
      const released = { ...s, pressed: false };
      if (!isMouse(e.pointerType)) {
        if (s.held) return none({ ...released, held: false });
        if (e.cell === null) return none(released);
        return { state: released, move: press(e.cell, ctx) };
      }
      if (s.chorded) return none({ ...released, chorded: e.buttons !== 0 });
      if (e.cell === null) return none(released);
      if (e.button === 1)
        return { state: released, move: { kind: 'chord', cell: e.cell } };
      if (e.button === 0) return { state: released, move: press(e.cell, ctx) };
      return none(released);
    }
  }
}

/** `PointerEvent.button` → its bit in `PointerEvent.buttons`. */
const BUTTON_BITS: Record<number, number> = { 0: 1, 1: 4, 2: 2 };

/**
 * A mouse's second button arrives as a `pointermove` with `button` set, not as a `pointerdown`.
 * Returns whether that change pressed or released it, or null for a plain move.
 */
export function chordedChange(
  button: number,
  buttons: number,
): 'down' | 'up' | null {
  const bit = BUTTON_BITS[button];
  if (bit === undefined) return null;
  return buttons & bit ? 'down' : 'up';
}
