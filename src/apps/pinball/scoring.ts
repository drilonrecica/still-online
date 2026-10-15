// Star Pinball scoring: points, ranks, the S-T-A-R bank, rollovers, the ramp and messages.
import { MAX_HIGH_SCORES, type HighScore } from '@/os/store/games';
import type { Ball, Hit } from './physics';
import type { Game } from './sim';
import { TARGETS } from './table';

/** Dropped targets stand up again this long after the bank is complete. */
export const TARGET_RESET = 1.5;

export const RANKS = ['Cadet', 'Ensign', 'Lieutenant', 'Captain', 'Admiral'];

export const POINTS = {
  bumper: 100,
  sling: 10,
  rollover: 500,
  rolloverLit: 100,
  lanesComplete: 1000,
  target: 250,
  /** Per rank reached: rank index × this (Ensign 5 000 … Admiral 20 000). */
  rankUp: 5000,
  /** Completing S-T-A-R again as Admiral. */
  admiralBank: 25000,
  ramp: 1000,
};

export function say(g: Game, text: string, ttl = 1.6) {
  g.message = { text, ttl };
}

export function award(g: Game, points: number) {
  if (!g.tilted) g.score += points * g.multiplier;
}

function light(g: Game, id: string, seconds = 0.25) {
  g.flash[id] = seconds;
}

export function onHit(g: Game, hit: Hit) {
  const [kind, num] = hit.id.split(':');
  const index = Number(num);
  if (g.tilted) return;
  if (kind === 'bumper') {
    award(g, POINTS.bumper);
    light(g, hit.id);
    g.events.push({ type: 'bumper', index });
  } else if (kind === 'sling' && hit.speed >= 60) {
    award(g, POINTS.sling);
    light(g, hit.id, 0.15);
    g.events.push({ type: 'sling', index });
  } else if (kind === 'target' && !g.targets[index]) {
    dropTarget(g, index);
  }
}

function dropTarget(g: Game, index: number) {
  g.targets[index] = true;
  const col = g.colliders.find((c) => c.id === `target:${index}`);
  if (col) col.enabled = false;
  award(g, POINTS.target);
  light(g, `target:${index}`, 0.4);
  g.events.push({ type: 'target', index });
  if (g.targets.every(Boolean)) {
    g.targetResetIn = TARGET_RESET;
    rankUp(g);
  }
}

/** S-T-A-R complete: promote (Cadet → … → Admiral), or a big bonus once at the top. */
export function rankUp(g: Game): void {
  if (g.rank < RANKS.length - 1) {
    g.rank++;
    award(g, POINTS.rankUp * g.rank);
    say(g, `RANK UP: ${RANKS[g.rank]!.toUpperCase()}`, 2.2);
    g.events.push({ type: 'rankUp', rank: g.rank });
  } else {
    award(g, POINTS.admiralBank);
    say(g, 'ADMIRAL BONUS', 2.2);
  }
}

export function resetTargets(g: Game) {
  g.targets = TARGETS.map(() => false);
  for (const c of g.colliders) if (c.id.startsWith('target:')) c.enabled = true;
}

export function onSensor(g: Game, id: string, ball: Ball) {
  const [kind, num] = id.split(':');
  if (g.tilted) return;
  if (kind === 'rollover') {
    const i = Number(num);
    award(g, g.lanes[i] ? POINTS.rolloverLit : POINTS.rollover);
    g.lanes[i] = true;
    light(g, id, 0.4);
    g.events.push({ type: 'rollover', index: i });
    if (g.lanes.every(Boolean)) {
      award(g, POINTS.lanesComplete);
      g.lanes = g.lanes.map(() => false);
      if (g.multiplier < 2) {
        g.multiplier = 2;
        g.events.push({ type: 'multiplier', value: 2 });
      }
      say(g, `${g.multiplier}X MULTIPLIER`);
    }
  } else if (kind === 'ramp' && ball.vy < 0) {
    award(g, POINTS.ramp);
    light(g, 'ramp', 0.6);
    say(g, 'HYPERSPACE RAMP', 1.2);
    g.events.push({ type: 'ramp' });
  }
}

/** Would this score make the top 10? */
export function qualifies(high: readonly HighScore[], score: number): boolean {
  if (score <= 0) return false;
  if (high.length < MAX_HIGH_SCORES) return true;
  return score > (high[high.length - 1]?.score ?? 0);
}
