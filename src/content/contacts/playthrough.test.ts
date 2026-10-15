// M2 gate: plays every path of every shipped script through the real engine with fake timers.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setup } from '@/apps/messenger/engine/test-helpers';
import { translate } from '@/i18n/t';
import { WALLPAPERS } from '@/os/wallpapers/registry';
import { PLAYLIST } from '../playlist';
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

function playPath(
  content: ContactContent,
  script: Script,
  picks: number[],
  onUnlock?: (id: string) => void,
) {
  const id = content.contact.id;
  localStorage.clear(); // each path is a fresh player: scripts run once per save
  const { trigger } = script;
  // A follow-up needs its target to have run: a stand-in that ends at once on sign-in.
  const target: Script[] =
    trigger.type === 'afterScript'
      ? [
          {
            id: trigger.scriptId,
            trigger: { type: 'onSignIn' },
            start: 'x',
            nodes: { x: { lines: [], end: true } },
          },
        ]
      : [];
  const solo: ContactContent = { ...content, scripts: [...target, script] };
  // A day script needs the world on its day before sign-in.
  const day = trigger.type === 'onDay' ? trigger.day : 1;
  const t = setup([solo], { getDay: () => day, onUnlock });
  t.engine.signIn();
  vi.advanceTimersByTime(content.contact.signInAfterMs + 1);

  if (trigger.type === 'afterMinutes' || trigger.type === 'afterScript') {
    vi.advanceTimersByTime(trigger.minutes * 60_000);
  } else if (trigger.type === 'onNowPlaying') {
    // A track-specific script only fires for its own track. `{artist}`/`{title}` render from
    // the playlist, so the track is a real one.
    const track =
      PLAYLIST.find((p) => p.id === trigger.trackId) ?? PLAYLIST[0]!;
    t.engine.nowPlaying({
      trackId: track.id,
      artist: track.artist,
      title: track.title,
    });
  } else if (trigger.type === 'onGameScore') {
    t.engine.gameScore(trigger.game, Math.max(trigger.minScore ?? 0, 420));
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

describe("P2-04: Pia's day-5 present", () => {
  it('unlocks Pony Paradise and points at the backgrounds on every path', () => {
    const pia = contacts.find((c) => c.contact.id === 'pia');
    const script = pia?.scripts.find((s) => s.id === 'day5');
    if (!pia || !script) throw new Error('pia/day5 missing');
    for (const picks of paths(script)) {
      const unlocks: string[] = [];
      const { t, id } = playPath(pia, script, picks, (u) => unlocks.push(u));
      expect(unlocks, picks.join(',')).toEqual(['ponies']);
      expect(t.said(id).join('\n')).toContain('look at the backrounds');
    }
    const ponies = WALLPAPERS.find((w) => w.unlock === 'ponies');
    expect(ponies && translate('en', ponies.nameKey)).toBe('Pony Paradise');
  });
});

describe('P6-07: game reactions', () => {
  it('every friend reacts to at least one game', () => {
    for (const { contact, scripts } of contacts) {
      expect(
        scripts.some((s) => s.trigger.type === 'onGameScore'),
        contact.id,
      ).toBe(true);
    }
  });
});
