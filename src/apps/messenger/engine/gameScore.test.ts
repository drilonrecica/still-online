// P6-07: `onGameScore` scripts react to finished games with `{score}` and `{game}`.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultContactProgress, sanitizeProgress } from './progress';
import { contactContent, say, setup } from './test-helpers';
import { fillPlaceholders, renderEntry } from './render';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('onGameScore', () => {
  it('fires for its game only, with {score} and {game} resolved', () => {
    const t = setup([
      contactContent('a', [
        say('hens', { type: 'onGameScore', game: 'henhunt' }, [
          '{score} in {game}??',
        ]),
      ]),
    ]);
    t.engine.signIn();
    t.engine.gameScore('mines', 12);
    t.engine.gameScore('pinball', 5000);
    expect(t.log).not.toContain('start a/hens');
    t.engine.gameScore('henhunt', 1240);
    vi.advanceTimersByTime(5000);
    expect(t.said('a')).toEqual(['< 1,240 in Hen Hunt??']);
  });

  it('stores {game}/{score} as raw params and formats them per locale', () => {
    const content = contactContent('a', [
      say('hens', { type: 'onGameScore', game: 'henhunt' }, [
        '{score} in {game}??',
      ]),
    ]);
    const t = setup([content]);
    t.engine.signIn();
    t.engine.gameScore('henhunt', 1240);
    vi.advanceTimersByTime(5000);
    const [entry] = t.progress('a').transcript;
    expect(entry).toMatchObject({
      kind: 'line',
      params: { game: 'henhunt', score: 1240 },
    });
    expect(JSON.stringify(entry)).not.toContain('Hen Hunt');
    expect(renderEntry(entry!, content, 'de', 'Ann', 'girl')).toMatchObject({
      text: '1.240 in Hühnerjagd??',
    });
  });

  it('needs score >= minScore, and runs once ever unless repeat', () => {
    const t = setup([
      contactContent('a', [
        say('big', { type: 'onGameScore', game: 'pinball', minScore: 100 }, [
          'big {score}',
        ]),
        say(
          'any',
          { type: 'onGameScore', game: 'mines' },
          ['mines {score}'],
          true,
        ),
      ]),
    ]);
    t.engine.signIn();
    t.engine.gameScore('pinball', 99);
    expect(t.log).not.toContain('start a/big');
    t.engine.gameScore('pinball', 100);
    vi.advanceTimersByTime(5000);
    t.engine.gameScore('pinball', 500);
    t.engine.gameScore('mines', 30);
    vi.advanceTimersByTime(5000);
    t.engine.gameScore('mines', 25);
    vi.advanceTimersByTime(5000);
    expect(t.said('a')).toEqual(['< big 100', '< mines 30', '< mines 25']);
  });

  it('fires for every friend who reacts to that game', () => {
    const t = setup([
      contactContent('a', [
        say('m', { type: 'onGameScore', game: 'mines' }, ['a {score}']),
      ]),
      contactContent('b', [
        say('m', { type: 'onGameScore', game: 'mines' }, ['b {score}']),
      ]),
    ]);
    t.engine.signIn();
    t.engine.gameScore('mines', 42);
    vi.advanceTimersByTime(5000);
    expect(t.said('a')).toEqual(['< a 42']);
    expect(t.said('b')).toEqual(['< b 42']);
  });

  it('queues with its context while the friend is still signing in', () => {
    const t = setup([
      contactContent(
        'a',
        [say('m', { type: 'onGameScore', game: 'mines' }, ['{score}s'])],
        { signInAfterMs: 60_000 },
      ),
    ]);
    t.engine.signIn();
    t.engine.gameScore('mines', 77);
    expect(t.progress('a').queue).toEqual([
      { scriptId: 'm', context: { game: 'mines', score: 77 } },
    ]);
    vi.advanceTimersByTime(65_000);
    expect(t.said('a')).toEqual(['< 77s']);
  });

  it('is ignored while the player is signed out of Messenger', () => {
    const t = setup([
      contactContent('a', [
        say('m', { type: 'onGameScore', game: 'mines' }, ['x']),
      ]),
    ]);
    t.engine.gameScore('mines', 10);
    expect(t.store.getState().progress.contacts.a).toBeUndefined();
  });
});

describe('game placeholders', () => {
  it('leave {score}/{game} as written without a game context', () => {
    expect(fillPlaceholders('{score} {game}', undefined, 'en', 'Ann')).toBe(
      '{score} {game}',
    );
    const params = { game: 'pinball', score: 2_000_000 } as const;
    expect(
      fillPlaceholders('{name}: {score} in {game}', params, 'en', 'Ann'),
    ).toBe('Ann: 2,000,000 in Star Pinball');
    expect(
      fillPlaceholders('{name}: {score} in {game}', params, 'de', 'Ann'),
    ).toBe('Ann: 2.000.000 in Sternen-Flipper');
  });

  it('persisted contexts keep a valid game and score and drop junk', () => {
    const progress = sanitizeProgress({
      contacts: {
        a: {
          ...defaultContactProgress(contactContent('a', []).contact),
          queue: [
            { scriptId: 'ok', context: { game: 'mines', score: 9 } },
            { scriptId: 'bad', context: { game: 'chess', score: 'lots' } },
          ],
        },
      },
    });
    expect(progress.contacts.a?.queue).toEqual([
      { scriptId: 'ok', context: { game: 'mines', score: 9 } },
      { scriptId: 'bad', context: {} },
    ]);
  });
});
