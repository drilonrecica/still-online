// M2 gate: plays every path of every shipped script through the real engine with fake timers.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setup } from '@/apps/messenger/engine/test-helpers';
import type { ContactContent, Script } from '../types';
import { contacts } from './index';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

/** Every choice-index sequence from `start` to an `end` node (cycles cut). */
function paths(script: Script): number[][] {
  const out: number[][] = [];
  const walk = (id: string, taken: number[], seen: string[]) => {
    const node = script.nodes[id];
    if (!node || seen.includes(id)) return;
    if ('choices' in node) {
      node.choices.forEach((c, i) =>
        walk(c.next, [...taken, i], [...seen, id]),
      );
    } else out.push(taken);
  };
  walk(script.start, [], []);
  return out;
}

function playPath(content: ContactContent, script: Script, picks: number[]) {
  const id = content.contact.id;
  localStorage.clear(); // each path is a fresh player: scripts run once per save
  const solo: ContactContent = { ...content, scripts: [script] };
  const t = setup([solo]);
  t.engine.signIn();
  vi.advanceTimersByTime(content.contact.signInAfterMs + 1);

  const { trigger } = script;
  if (trigger.type === 'afterMinutes') {
    vi.advanceTimersByTime(trigger.minutes * 60_000);
  } else if (trigger.type === 'onNowPlaying') {
    t.engine.nowPlaying({
      trackId: 'demo',
      artist: 'The Dial-Up Kids',
      title: 'Away Message',
    });
  } else if (trigger.type === 'onPlayerNudge') {
    t.engine.playerNudge(id);
  }

  const visited: string[] = [];
  const settle = () => {
    for (let i = 0; i < 40 && !t.engine.getChoices(id)?.length; i++) {
      if (t.log.includes(`end ${id}/${script.id}`)) break;
      vi.advanceTimersByTime(5_000);
    }
  };
  settle();
  for (const pick of picks) {
    const node = t.progress(id).active?.nodeId;
    if (node) visited.push(node);
    expect(
      t.engine.getChoices(id)?.length,
      `choices at ${node}`,
    ).toBeGreaterThan(pick);
    t.engine.choose(id, pick);
    settle();
  }
  return { t, id, visited };
}

describe('M2 gate: every script, every path, plays to its end', () => {
  for (const content of contacts) {
    for (const script of content.scripts) {
      const all = paths(script);
      it(`${content.contact.id}/${script.id}: ${all.length} path(s) end cleanly`, () => {
        expect(all.length).toBeGreaterThan(0);
        for (const picks of all) {
          const { t, id } = playPath(content, script, picks);
          expect(t.log, picks.join(',')).toContain(`end ${id}/${script.id}`);
          expect(t.progress(id).active).toBeNull();
          const said = t.said(id).join('\n');
          expect(said).not.toMatch(/\{[^}]*\}/);
          expect(said).toContain('<');
        }
      });
    }
  }
});
