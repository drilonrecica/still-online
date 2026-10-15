import { describe, expect, it } from 'vitest';
import { exampleContact } from '../example.fixture';
import { lintContact, lintContactText, lintScriptGraph } from '../lint';
import type { ContactContent, Script } from '../types';
import { contacts } from './index';

describe('content lint: shipped contacts', () => {
  it.each(contacts.map((c) => [c.contact.id, c] as const))(
    '%s has no lint problems',
    (_id, content) => {
      expect(lintContact(content)).toEqual([]);
    },
  );

  it('the content-format example passes too', () => {
    expect(lintContact(exampleContact)).toEqual([]);
  });

  it('ships 6 contacts with unique ids and handles', () => {
    expect(contacts).toHaveLength(6);
    expect(new Set(contacts.map((c) => c.contact.id)).size).toBe(6);
    expect(new Set(contacts.map((c) => c.contact.handle)).size).toBe(6);
  });

  it('staggers sign-ins over the first 5 minutes', () => {
    const times = contacts.map((c) => c.contact.signInAfterMs);
    expect(new Set(times).size).toBe(times.length);
    for (const t of times) {
      expect(t).toBeGreaterThan(0);
      expect(t).toBeLessThanOrEqual(5 * 60_000);
    }
  });

  it.each(contacts.map((c) => [c.contact.id, c] as const))(
    '%s has an opening script (≥ 8 nodes, ≥ 2 branches) and a timed or now-playing script',
    (_id, { scripts }) => {
      const opening = scripts.find((s) => s.trigger.type === 'onSignIn');
      expect(opening).toBeDefined();
      const nodes = Object.values(opening?.nodes ?? {});
      expect(nodes.length).toBeGreaterThanOrEqual(8);
      expect(nodes.filter((n) => 'choices' in n).length).toBeGreaterThanOrEqual(
        2,
      );
      expect(
        scripts.some(
          (s) =>
            s.trigger.type === 'afterMinutes' ||
            s.trigger.type === 'onNowPlaying',
        ),
      ).toBe(true);
    },
  );

  it('at least one contact reacts to now playing', () => {
    const reacts = contacts.filter((c) =>
      c.scripts.some((s) => s.trigger.type === 'onNowPlaying'),
    );
    expect(reacts.length).toBeGreaterThan(0);
  });
});

const script = (nodes: Script['nodes'], start = 'a'): Script => ({
  id: 's',
  trigger: { type: 'onSignIn' },
  start,
  nodes,
});

describe('content lint: catches mistakes', () => {
  it('a missing start or next id', () => {
    expect(
      lintScriptGraph(script({ a: { lines: [], end: true } }, 'x')),
    ).toEqual([
      'script "s": start node "x" missing',
      'script "s": node "a" is unreachable',
    ]);
    const broken = script({
      a: {
        lines: [],
        choices: [
          { text: '1', next: 'b' },
          { text: '2', next: 'nope' },
        ],
      },
      b: { lines: [], end: true },
    });
    expect(lintScriptGraph(broken)).toEqual([
      'script "s": node "a" choice leads to missing "nope"',
    ]);
  });

  it('unreachable nodes', () => {
    const graph = script({
      a: { lines: [], end: true },
      orphan: { lines: [], end: true },
    });
    expect(lintScriptGraph(graph)).toEqual([
      'script "s": node "orphan" is unreachable',
    ]);
  });

  it('choices that loop forever without an end', () => {
    const graph = script({
      a: {
        lines: [],
        choices: [
          { text: '1', next: 'b' },
          { text: '2', next: 'c' },
        ],
      },
      b: {
        lines: [],
        choices: [
          { text: '1', next: 'a' },
          { text: '2', next: 'b' },
        ],
      },
      c: { lines: [], end: true },
    });
    expect(lintScriptGraph(graph)).toEqual([]);
    const loop = script({
      a: {
        lines: [],
        choices: [
          { text: '1', next: 'b' },
          { text: '2', next: 'b' },
        ],
      },
      b: {
        lines: [],
        choices: [
          { text: '1', next: 'a' },
          { text: '2', next: 'a' },
        ],
      },
    });
    expect(lintScriptGraph(loop)).toEqual([
      'script "s": node "a" can never reach an end',
      'script "s": node "b" can never reach an end',
    ]);
  });

  it('real-looking emails and URLs, forbidden names, misplaced placeholders', () => {
    const bad: ContactContent = {
      ...exampleContact,
      contact: {
        ...exampleContact.contact,
        personalMessage: 'add me: real@hotmail.com',
      },
      scripts: [
        script({
          a: {
            lines: [
              { text: 'check www.example.org', delayMs: 0 },
              { text: 'my msn is broken', delayMs: 0 },
              { text: 'love {artist} and {colour}', delayMs: 0 },
            ],
            end: true,
          },
        }),
      ],
    };
    const problems = lintContactText(bad).join('\n');
    expect(problems).toContain('real-looking email "real@hotmail.com"');
    expect(problems).toContain('real-looking URL');
    expect(problems).toContain('forbidden name');
    expect(problems).toContain(
      '{artist} only resolves in onNowPlaying scripts',
    );
    expect(problems).toContain('unknown placeholder {colour}');
  });

  it('duplicate script ids', () => {
    const one = script({ a: { lines: [], end: true } });
    expect(lintContact({ ...exampleContact, scripts: [one, one] })).toEqual([
      'mika: duplicate script id "s"',
    ]);
  });

  it('follow-ups that wait on a missing script, themselves, or no time', () => {
    const base = script({ a: { lines: [], end: true } });
    const follow = (id: string, scriptId: string, minutes: number): Script => ({
      ...base,
      id,
      trigger: { type: 'afterScript', scriptId, minutes },
    });
    expect(
      lintContact({
        ...exampleContact,
        scripts: [
          base,
          follow('ok', 's', 2),
          follow('ghost', 'nope', 2),
          follow('self', 'self', 2),
          follow('now', 's', 0),
        ],
      }),
    ).toEqual([
      'mika: script "ghost" follows unknown script "nope"',
      'mika: script "self" follows itself',
      'mika: script "now" needs minutes > 0',
    ]);
  });

  it('day triggers, day presence and unknown unlocks', () => {
    const base = script({
      a: { lines: [{ delayMs: 0, unlock: 'ponies' }], end: true },
    });
    const day = (id: string, d: number, repeat?: boolean): Script => ({
      ...base,
      id,
      trigger: { type: 'onDay', day: d },
      repeat,
    });
    const gift = script({
      a: { lines: [{ delayMs: 0, unlock: 'free-money' }], end: true },
    });
    expect(
      lintContact({
        ...exampleContact,
        contact: {
          ...exampleContact.contact,
          days: {
            1: { status: 'busy' },
            2: { personalMessage: 'day 2 :)' },
            3: { personalMessage: 'hi {name}' },
          },
        },
        scripts: [
          base,
          day('ok', 2),
          day('first', 1),
          day('half', 2.5),
          day('again', 3, true),
          { ...gift, id: 'gift' },
        ],
      }),
    ).toEqual([
      'mika: days key "1" must be a whole day >= 2',
      'mika.days.3.personalMessage: unknown placeholder {name}',
      'mika: script "first" day must be a whole day >= 2',
      'mika: script "half" day must be a whole day >= 2',
      'mika: script "again" onDay can\'t repeat',
      'mika: script "gift" node "a" unlocks unknown "free-money"',
    ]);
  });
});
