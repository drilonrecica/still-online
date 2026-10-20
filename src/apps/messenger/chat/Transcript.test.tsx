import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TranscriptEntry } from '@/content/types';
import { Transcript } from './Transcript';

/** jsdom has no ResizeObserver: a stub that lets the test fire the resize. */
function stubResizeObserver() {
  const callbacks: (() => void)[] = [];
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(cb: () => void) {
        callbacks.push(cb);
      }
      observe() {}
      disconnect() {}
    },
  );
  return () => callbacks.forEach((cb) => cb());
}

/** Gives the log a fixed scroll geometry (jsdom lays nothing out). */
function geometry(el: HTMLElement, scrollHeight: number, clientHeight: number) {
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  });
}

const entries: TranscriptEntry[] = ['hi', 'whats up', 'nm u?'].map(
  (text, i) => ({ kind: 'message', from: 'contact', text, at: i }),
);

describe('Transcript resize (v0.6 M4-G)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('stays on the newest line when the box resizes (a phone rotating)', () => {
    const resize = stubResizeObserver();
    render(
      <Transcript entries={entries} contactName="Jess" playerName="Ada" />,
    );
    const log = screen.getByRole('log');
    geometry(log, 900, 300);
    resize();
    expect(log.scrollTop).toBe(900);
  });

  it('keeps the place when the player had scrolled up to read', () => {
    const resize = stubResizeObserver();
    render(
      <Transcript entries={entries} contactName="Jess" playerName="Ada" />,
    );
    const log = screen.getByRole('log');
    geometry(log, 900, 300);
    log.scrollTop = 100;
    fireEvent.scroll(log);
    resize();
    expect(log.scrollTop).toBe(100);
  });
});
