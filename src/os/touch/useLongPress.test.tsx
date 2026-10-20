import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  LONG_PRESS_MS,
  LONG_PRESS_SLOP,
  useLongPress,
  type LongPressPoint,
} from './useLongPress';

function Pressable({
  onPress,
  onClick = () => {},
}: {
  onPress: (point: LongPressPoint, arg: string) => void;
  onClick?: () => void;
}) {
  const press = useLongPress(onPress);
  return (
    <div data-testid="outer" onClick={onClick}>
      <button type="button" data-testid="target" {...press('row-1')}>
        <span data-testid="inner">hold me</span>
      </button>
    </div>
  );
}

function setup(onClick = vi.fn()) {
  const onPress = vi.fn();
  const view = render(<Pressable onPress={onPress} onClick={onClick} />);
  return { onPress, onClick, target: view.getByTestId('target'), view };
}

const touch = { pointerType: 'touch', pointerId: 1, isPrimary: true };

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useLongPress', () => {
  it('fires at the touch point after LONG_PRESS_MS, with the bound arg', () => {
    const { onPress, target } = setup();
    fireEvent.pointerDown(target, { ...touch, clientX: 40, clientY: 50 });
    vi.advanceTimersByTime(LONG_PRESS_MS - 1);
    expect(onPress).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledWith(
      { clientX: 40, clientY: 50, target },
      'row-1',
    );
  });

  it('works for a pen but not for a mouse button held down', () => {
    const { onPress, target } = setup();
    fireEvent.pointerDown(target, { ...touch, pointerType: 'pen' });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onPress).toHaveBeenCalledTimes(1);
    fireEvent.pointerUp(target, { ...touch, pointerType: 'pen' });

    fireEvent.pointerDown(target, { ...touch, pointerType: 'mouse' });
    vi.advanceTimersByTime(LONG_PRESS_MS * 2);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is cancelled by a lift, a cancel or a move past the slop', () => {
    const { onPress, target } = setup();
    fireEvent.pointerDown(target, touch);
    fireEvent.pointerUp(target, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);

    fireEvent.pointerDown(target, touch);
    fireEvent.pointerCancel(target, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);

    fireEvent.pointerDown(target, { ...touch, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(target, {
      ...touch,
      clientX: LONG_PRESS_SLOP + 1,
      clientY: 0,
    });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('tolerates a small wobble inside the slop', () => {
    const { onPress, target } = setup();
    fireEvent.pointerDown(target, { ...touch, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(target, { ...touch, clientX: 6, clientY: 6 });
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('vibrates briefly when it fires', () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      value: vibrate,
      configurable: true,
    });
    const { target } = setup();
    fireEvent.pointerDown(target, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(vibrate).toHaveBeenCalledWith(10);
    // @ts-expect-error restore jsdom default (no vibrate)
    delete navigator.vibrate;
  });

  it('swallows the click that ends a long-press, but not later clicks', () => {
    const { target, onClick, view } = setup();
    fireEvent.pointerDown(target, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    fireEvent.pointerUp(target, touch);
    fireEvent.click(view.getByTestId('inner'));
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.pointerDown(target, touch);
    fireEvent.pointerUp(target, touch);
    fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('stops swallowing shortly after a lift that brought no click', () => {
    const { target, onClick } = setup();
    fireEvent.pointerDown(target, touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    fireEvent.pointerUp(target, touch);
    vi.advanceTimersByTime(1000);
    fireEvent.click(target);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('opens from a mouse right-click and blocks the native menu', () => {
    const { onPress, target } = setup();
    fireEvent.pointerDown(target, { ...touch, pointerType: 'mouse' });
    const notCancelled = fireEvent.contextMenu(target, {
      clientX: 7,
      clientY: 8,
    });
    expect(notCancelled).toBe(false);
    expect(onPress).toHaveBeenCalledWith(
      { clientX: 7, clientY: 8, target },
      'row-1',
    );
  });

  it("blocks Android's own contextmenu during a touch press, so it fires once", () => {
    const { onPress, target } = setup();
    fireEvent.pointerDown(target, touch);
    const notCancelled = fireEvent.contextMenu(target);
    expect(notCancelled).toBe(false);
    expect(onPress).not.toHaveBeenCalled();
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('fires only the innermost of nested long-presses', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    function Nested() {
      const outerPress = useLongPress<void>(outer);
      const innerPress = useLongPress<void>(inner);
      return (
        <div {...outerPress()}>
          <span data-testid="inner" {...innerPress()} />
        </div>
      );
    }
    const view = render(<Nested />);
    fireEvent.pointerDown(view.getByTestId('inner'), touch);
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it('never fires after an unmount', () => {
    const { onPress, target, view } = setup();
    fireEvent.pointerDown(target, touch);
    view.unmount();
    vi.advanceTimersByTime(LONG_PRESS_MS);
    expect(onPress).not.toHaveBeenCalled();
  });
});
