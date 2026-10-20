import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  DOUBLE_TAP_MS,
  useActivate,
  type ActivateOptions,
} from './useActivate';
import { composeHandlers } from './compose';

function Item({
  onActivate,
  onSelect = () => {},
  options,
}: {
  onActivate: (arg: string, via: string) => void;
  onSelect?: () => void;
  options?: ActivateOptions;
}) {
  const activate = useActivate(onActivate, options);
  return (
    <div
      data-testid="item"
      tabIndex={0}
      {...composeHandlers({ onClick: onSelect }, activate('doc-1'))}
    />
  );
}

function setup(options?: ActivateOptions) {
  const onActivate = vi.fn();
  const onSelect = vi.fn();
  const view = render(
    <Item onActivate={onActivate} onSelect={onSelect} options={options} />,
  );
  return { onActivate, onSelect, item: view.getByTestId('item') };
}

/** A pointerdown of `pointerType`, then a click, `at` ms into the test. */
function clickAs(el: HTMLElement, pointerType: string, at = 0) {
  vi.setSystemTime(at);
  fireEvent.pointerDown(el, { pointerType, pointerId: 1, isPrimary: true });
  fireEvent.click(el);
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useActivate', () => {
  it('a mouse single click only selects; a double-click opens', () => {
    const { onActivate, onSelect, item } = setup();
    clickAs(item, 'mouse');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onActivate).not.toHaveBeenCalled();

    fireEvent.doubleClick(item);
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate.mock.calls[0]?.slice(0, 2)).toEqual(['doc-1', 'mouse']);
  });

  it('a touch tap opens (and still runs the select click)', () => {
    const { onActivate, onSelect, item } = setup();
    clickAs(item, 'touch');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate.mock.calls[0]?.slice(0, 2)).toEqual(['doc-1', 'touch']);
  });

  it('a pen tap opens like a finger', () => {
    const { onActivate, item } = setup();
    clickAs(item, 'pen');
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it('a habitual double-tap opens once; a later tap opens again', () => {
    const { onActivate, item } = setup();
    clickAs(item, 'touch', 1000);
    clickAs(item, 'touch', 1000 + DOUBLE_TAP_MS - 50);
    // Some browsers also send a dblclick for a double-tap: it is ignored.
    fireEvent.doubleClick(item);
    expect(onActivate).toHaveBeenCalledTimes(1);

    clickAs(item, 'touch', 5000);
    expect(onActivate).toHaveBeenCalledTimes(2);
  });

  it('opens on Enter, not on other keys', () => {
    const { onActivate, item } = setup();
    fireEvent.keyDown(item, { key: ' ' });
    expect(onActivate).not.toHaveBeenCalled();
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate.mock.calls[0]?.slice(0, 2)).toEqual(['doc-1', 'key']);
  });

  it('ignores Enter with `enter: false`', () => {
    const { onActivate, item } = setup({ enter: false });
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(onActivate).not.toHaveBeenCalled();
  });

  describe('touchTaps: 2 (title bars)', () => {
    it('one tap does nothing; a double-tap activates', () => {
      const { onActivate, item } = setup({ touchTaps: 2 });
      clickAs(item, 'touch', 1000);
      expect(onActivate).not.toHaveBeenCalled();
      clickAs(item, 'touch', 1200);
      expect(onActivate).toHaveBeenCalledTimes(1);
      expect(onActivate.mock.calls[0]?.slice(0, 2)).toEqual(['doc-1', 'touch']);
    });

    it('two slow taps are not a double-tap', () => {
      const { onActivate, item } = setup({ touchTaps: 2 });
      clickAs(item, 'touch', 1000);
      clickAs(item, 'touch', 1000 + DOUBLE_TAP_MS + 1);
      expect(onActivate).not.toHaveBeenCalled();
    });

    it('a mouse double-click still activates', () => {
      const { onActivate, item } = setup({ touchTaps: 2 });
      clickAs(item, 'mouse');
      fireEvent.doubleClick(item);
      expect(onActivate).toHaveBeenCalledTimes(1);
    });
  });
});
