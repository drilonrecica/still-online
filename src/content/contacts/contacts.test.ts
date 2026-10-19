import { describe, expect, it } from 'vitest';
import { exampleContact } from '../example.fixture';
import { TOP8_REACTIONS } from '../friendspace/top8Reactions';
import { lintContact, lintContactText, lintScriptGraph } from '../lint';
import { getContacts } from '../locale';
import { PLAYLIST } from '../playlist';
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

  // Friends whose days 2–5 are written (§P2-02).
  const storyFriends = ['jess', 'kayla', 'dex', 'theo', 'marco', 'pia'];
  it.each(
    contacts
      .filter((c) => storyFriends.includes(c.contact.id))
      .map((c) => [c.contact.id, c] as const),
  )(
    '%s has a day script (≥ 4 nodes, a real branch) and a new personal message on days 2–5',
    (_id, { contact, scripts }) => {
      const messages = [contact.personalMessage];
      for (const day of [2, 3, 4, 5]) {
        const script = scripts.find(
          (s) => s.trigger.type === 'onDay' && s.trigger.day === day,
        );
        expect(script, `day ${day} script`).toBeDefined();
        const nodes = Object.values(script?.nodes ?? {});
        expect(nodes.length).toBeGreaterThanOrEqual(4);
        expect(
          nodes.some(
            (n) =>
              'choices' in n && new Set(n.choices.map((c) => c.next)).size > 1,
          ),
        ).toBe(true);
        const pm = contact.days?.[day]?.personalMessage;
        expect(pm, `day ${day} personal message`).toBeTruthy();
        messages.push(pm ?? '');
      }
      expect(new Set(messages).size).toBe(messages.length);
    },
  );

  // Top 8 drama (P3-01): a short pair per friend (≤ 1 choice node) plus both wall lines.
  it.each(storyFriends)('%s reacts to a Top 8 drop and re-add', (id) => {
    const { scripts } = contacts.find((c) => c.contact.id === id)!;
    for (const type of ['onTop8Dropped', 'onTop8Readded'] as const) {
      const pair = scripts.filter((s) => s.trigger.type === type);
      expect(pair, type).toHaveLength(1);
      const nodes = Object.values(pair[0]!.nodes);
      expect(nodes.filter((n) => 'choices' in n).length).toBeLessThanOrEqual(1);
      const texts = nodes[0]!.lines.filter((l) => l.text !== undefined);
      expect(texts.length).toBeGreaterThanOrEqual(2);
    }
    const wall = TOP8_REACTIONS.find((r) => r.contactId === id);
    expect(wall?.dropped).toBeTruthy();
    expect(wall?.readded).toBeTruthy();
  });

  // Checked on resolved content, so both sides of every gender variant count.
  it.each([
    ['en', 'girl'],
    ['en', 'boy'],
    ['de', 'girl'],
    ['de', 'boy'],
  ] as const)('marco never uses "!" (%s, %s)', (locale, gender) => {
    const marco = getContacts(locale, gender).find(
      (c) => c.contact.id === 'marco',
    );
    const texts = [
      marco?.contact.personalMessage,
      ...Object.values(marco?.contact.days ?? {}).map(
        (d) => d?.personalMessage,
      ),
      ...(marco?.scripts ?? []).flatMap((s) =>
        Object.values(s.nodes).flatMap((n) =>
          n.lines.flatMap((l) => [l.text, l.personalMessageChange]),
        ),
      ),
    ];
    expect(texts.filter((t) => t?.includes('!'))).toEqual([]);
  });

  // §P5-06: a second now-playing reaction per friend.
  it.each(contacts.map((c) => [c.contact.id, c] as const))(
    '%s has a nowPlaying2 script (≥ 3 nodes, a branch, a real trackId)',
    (_id, { scripts }) => {
      const script = scripts.find((s) => s.id === 'nowPlaying2');
      expect(script?.trigger.type).toBe('onNowPlaying');
      expect(script?.repeat ?? false).toBe(false);
      const nodes = Object.values(script?.nodes ?? {});
      expect(nodes.length).toBeGreaterThanOrEqual(3);
      expect(
        nodes.some(
          (n) =>
            'choices' in n && new Set(n.choices.map((c) => c.next)).size > 1,
        ),
      ).toBe(true);
      const trigger = script?.trigger;
      if (trigger?.type === 'onNowPlaying' && trigger.trackId !== undefined)
        expect(PLAYLIST.map((t) => t.id)).toContain(trigger.trackId);
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

  it('{score}/{game} only in onGameScore scripts, which need a known game and minScore >= 0', () => {
    const node = {
      a: { lines: [{ text: '{score} in {game}', delayMs: 0 }], end: true },
    } as const;
    const game = (trigger: Script['trigger']): Script => ({
      ...script(node),
      trigger,
    });
    expect(
      lintContact({
        ...exampleContact,
        scripts: [game({ type: 'onGameScore', game: 'mines', minScore: 5 })],
      }),
    ).toEqual([]);
    expect(lintContact({ ...exampleContact, scripts: [script(node)] })).toEqual(
      [
        'mika.s.a.lines[0].text: {score} only resolves in onGameScore scripts',
        'mika.s.a.lines[0].text: {game} only resolves in onGameScore scripts',
      ],
    );
    const bad = game({
      type: 'onGameScore',
      game: 'chess' as 'mines',
      minScore: -1,
    });
    expect(lintContact({ ...exampleContact, scripts: [bad] })).toEqual([
      'mika: script "s" reacts to unknown game "chess"',
      'mika: script "s" needs minScore >= 0',
    ]);
    const music = game({ type: 'onNowPlaying' });
    expect(lintContactText({ ...exampleContact, scripts: [music] })).toEqual([
      'mika.s.a.lines[0].text: {score} only resolves in onGameScore scripts',
      'mika.s.a.lines[0].text: {game} only resolves in onGameScore scripts',
    ]);
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

describe('winks', () => {
  const winksOf = (c: ContactContent) =>
    c.scripts.flatMap((s) =>
      Object.values(s.nodes).flatMap((n) =>
        n.lines.flatMap((l) => (l.wink ? [l.wink] : [])),
      ),
    );

  it('jess, kayla and pia send their winks', () => {
    const byId = (id: string) => contacts.find((c) => c.contact.id === id)!;
    expect(winksOf(byId('jess'))).toContain('hamster');
    expect(winksOf(byId('kayla'))).toContain('hearts');
    expect(winksOf(byId('pia'))).toContain('pickle');
  });

  it('the lint rejects unknown wink ids', () => {
    expect(
      lintContact({
        ...exampleContact,
        scripts: [
          script({
            a: {
              lines: [{ delayMs: 0, wink: 'disco' as 'kiss' }],
              end: true,
            },
          }),
        ],
      }),
    ).toEqual(['mika: script "s" node "a" sends unknown wink "disco"']);
  });
});
