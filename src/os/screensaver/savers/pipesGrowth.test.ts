import { describe, expect, it } from 'vitest';
import { mulberry32 } from '@/os/random';
import {
  GRID,
  initialPipes,
  MAX_PIPES,
  stepPipes,
  type PipeOp,
  type PipesState,
} from './pipesGrowth';

function run(seed: number, steps: number) {
  const rand = mulberry32(seed);
  let state = initialPipes();
  const ops: PipeOp[] = [];
  for (let i = 0; i < steps; i++) {
    const next = stepPipes(state, rand);
    state = next.state;
    ops.push(...next.ops);
  }
  return { state, ops };
}

describe('stepPipes', () => {
  it('is deterministic for a seed', () => {
    expect(run(42, 400)).toEqual(run(42, 400));
    expect(run(42, 400).ops).not.toEqual(run(43, 400).ops);
  });

  it('never mutates the state it is given', () => {
    const rand = mulberry32(1);
    let state: PipesState = initialPipes();
    for (let i = 0; i < 50; i++) {
      const before = { ...state, taken: state.taken.slice() };
      const next = stepPipes(state, rand);
      expect(state).toEqual(before);
      state = next.state;
    }
  });

  it('starts a pipe with a joint, then grows by one neighbouring free cell per step', () => {
    const { ops } = run(7, 300);
    expect(ops[0]).toMatchObject({ kind: 'joint' });
    const seen = new Set<string>();
    for (const op of ops) {
      if (op.kind !== 'segment') continue;
      const d = op.to.map((v, i) => Math.abs(v - (op.from[i] ?? 0)));
      expect(d.reduce((a, b) => a + b, 0)).toBe(1);
      op.to.forEach((v, i) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(GRID[i] ?? 0);
      });
      const key = op.to.join(',');
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  it('resets after MAX_PIPES pipes', () => {
    const rand = mulberry32(9);
    let state = initialPipes();
    let resets = 0;
    let maxPipes = 0;
    for (let i = 0; i < 20_000 && resets === 0; i++) {
      const next = stepPipes(state, rand);
      if (next.ops.some((op) => op.kind === 'reset')) resets++;
      state = next.state;
      maxPipes = Math.max(maxPipes, state.pipes);
    }
    expect(resets).toBe(1);
    expect(maxPipes).toBe(MAX_PIPES);
    expect(state).toEqual(initialPipes());
  });
});
