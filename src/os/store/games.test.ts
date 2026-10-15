import { beforeEach, describe, expect, it } from 'vitest';
import {
  MAX_HIGH_SCORES,
  MAX_SCORE_NAME,
  sanitizeGames,
  useGamesStore,
} from './games';

const initial = useGamesStore.getState();

beforeEach(() => {
  localStorage.clear();
  useGamesStore.setState({
    mines: initial.mines,
    henhunt: initial.henhunt,
    pinball: initial.pinball,
  });
  useGamesStore.getState().resetScores('mines');
  useGamesStore.getState().resetScores('henhunt');
  useGamesStore.getState().resetScores('pinball');
});

describe('mines best times', () => {
  it('records a first time and only improvements after that', () => {
    const { recordScore } = useGamesStore.getState();
    expect(
      recordScore('mines', { name: 'Ann', score: 80, level: 'beginner' }),
    ).toBe(true);
    expect(
      recordScore('mines', { name: 'Bob', score: 95, level: 'beginner' }),
    ).toBe(false);
    expect(
      recordScore('mines', { name: 'Bob', score: 80, level: 'beginner' }),
    ).toBe(false);
    expect(
      recordScore('mines', { name: 'Cy', score: 40, level: 'beginner' }),
    ).toBe(true);
    expect(useGamesStore.getState().mines.best.beginner).toEqual({
      seconds: 40,
      name: 'Cy',
    });
    expect(useGamesStore.getState().mines.best.expert).toBeNull();
  });

  it('rejects entries without a level or with an impossible time', () => {
    const { recordScore } = useGamesStore.getState();
    expect(recordScore('mines', { name: 'A', score: 10 })).toBe(false);
    expect(recordScore('mines', { name: 'A', score: 0, level: 'expert' })).toBe(
      false,
    );
    expect(
      recordScore('mines', { name: 'A', score: 5000, level: 'expert' }),
    ).toBe(false);
    expect(
      recordScore('mines', { name: 'A', score: NaN, level: 'expert' }),
    ).toBe(false);
  });

  it('sanitizes names', () => {
    useGamesStore.getState().recordScore('mines', {
      name: `   ${'x'.repeat(50)}  `,
      score: 20,
      level: 'expert',
    });
    expect(useGamesStore.getState().mines.best.expert?.name).toHaveLength(
      MAX_SCORE_NAME,
    );
    useGamesStore
      .getState()
      .recordScore('mines', { name: '   ', score: 10, level: 'expert' });
    expect(useGamesStore.getState().mines.best.expert?.name).toBe('Anonymous');
  });

  it('persists and comes back after a reload', async () => {
    useGamesStore
      .getState()
      .recordScore('mines', { name: 'Ann', score: 33, level: 'intermediate' });
    const saved = JSON.parse(
      localStorage.getItem('still-online:v1:games') ?? '{}',
    );
    expect(saved.state.mines.best.intermediate).toEqual({
      seconds: 33,
      name: 'Ann',
    });
    // A reload loses memory but keeps storage (setState itself would overwrite storage).
    const raw = localStorage.getItem('still-online:v1:games')!;
    useGamesStore.setState({ mines: initial.mines });
    localStorage.setItem('still-online:v1:games', raw);
    await useGamesStore.persist.rehydrate();
    expect(useGamesStore.getState().mines.best.intermediate?.seconds).toBe(33);
  });
});

describe('high score tables', () => {
  it('keeps the top ten, best first', () => {
    const { recordScore } = useGamesStore.getState();
    for (let i = 1; i <= 12; i++) {
      recordScore('henhunt', { name: `P${i}`, score: i * 10 });
    }
    const high = useGamesStore.getState().henhunt.high;
    expect(high).toHaveLength(MAX_HIGH_SCORES);
    expect(high[0]).toMatchObject({ name: 'P12', score: 120 });
    expect(high.at(-1)?.score).toBe(30);
  });

  it('says whether a score made the table', () => {
    const { recordScore } = useGamesStore.getState();
    for (let i = 1; i <= 10; i++) {
      recordScore('pinball', { name: 'X', score: i * 100 });
    }
    expect(recordScore('pinball', { name: 'Low', score: 5 })).toBe(false);
    expect(recordScore('pinball', { name: 'Hi', score: 5000 })).toBe(true);
  });

  it('keeps each game separate', () => {
    useGamesStore.getState().recordScore('pinball', { name: 'A', score: 9 });
    expect(useGamesStore.getState().henhunt.high).toEqual([]);
  });
});

describe('sanitizeGames', () => {
  it('survives garbage', () => {
    expect(sanitizeGames(null).mines.best.beginner).toBeNull();
    expect(sanitizeGames('nope').henhunt.high).toEqual([]);
    const out = sanitizeGames({
      mines: { best: { beginner: { seconds: 'x' }, expert: { seconds: 12 } } },
      henhunt: { high: [{ score: 'a' }, { name: 5, score: 7, date: 'bad' }] },
      pinball: { high: 'no' },
    });
    expect(out.mines.best.beginner).toBeNull();
    expect(out.mines.best.expert).toEqual({ seconds: 12, name: 'Anonymous' });
    expect(out.henhunt.high).toHaveLength(1);
    expect(out.henhunt.high[0]).toMatchObject({ name: 'Anonymous', score: 7 });
    expect(out.henhunt.high[0]?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(out.pinball.high).toEqual([]);
  });
});
