import { describe, expect, it } from 'vitest';
import {
  canGoBack,
  canGoForward,
  createHistory,
  currentUrl,
  goBack,
  goForward,
  pushUrl,
} from './history';

describe('history', () => {
  it('walks back and forward, and a new visit drops the forward entries', () => {
    let h = createHistory('a');
    expect(canGoBack(h)).toBe(false);
    h = pushUrl(pushUrl(h, 'b'), 'c');
    expect(currentUrl(h)).toBe('c');
    h = goBack(goBack(h));
    expect(currentUrl(h)).toBe('a');
    expect(goBack(h)).toBe(h);
    h = goForward(h);
    expect(currentUrl(h)).toBe('b');
    expect(canGoForward(h)).toBe(true);
    h = pushUrl(h, 'd');
    expect(h.entries).toEqual(['a', 'b', 'd']);
    expect(canGoForward(h)).toBe(false);
    expect(goForward(h)).toBe(h);
  });

  it('revisiting the current page adds no entry', () => {
    const h = pushUrl(createHistory('a'), 'b');
    expect(pushUrl(h, 'b')).toBe(h);
  });
});
