// Structural parity: German content mirrors English (docs/i18n.md → "Structural parity").
import { describe, expect, it } from 'vitest';
import { contacts } from './contacts';
import { exampleContact } from './example.fixture';
import { CONTACT_OVERLAYS, contentFor } from './locale';
import { contactParityProblems, moduleParityProblems } from './parity';
import type { ContactOverlay } from './types';

describe('contact overlays', () => {
  it('has one overlay per shipped friend and no stray ones', () => {
    expect(Object.keys(CONTACT_OVERLAYS).sort()).toEqual(
      contacts.map((c) => c.contact.id).sort(),
    );
  });

  it.each(contacts.map((c) => [c.contact.id, c] as const))(
    '%s overlay matches the English structure',
    (id, content) => {
      expect(contactParityProblems(content, CONTACT_OVERLAYS[id]!)).toEqual([]);
    },
  );
});

describe('full German modules', () => {
  const en = contentFor('en');
  const de = contentFor('de');
  const lists = [
    'seedFiles',
    'mail',
    'autoReplies',
    'profiles',
    'tuneMole',
  ] as const;

  it.each(lists)('%s has the same ids/length as English', (key) => {
    expect(
      moduleParityProblems({ [key]: en[key] }, { [key]: de[key] }, 'de'),
    ).toEqual([]);
  });

  it.each(Object.keys(en.sites) as (keyof typeof en.sites)[])(
    'site %s has the same exports as English',
    (host) => {
      expect(
        moduleParityProblems(en.sites[host], de.sites[host], host),
      ).toEqual([]);
    },
  );

  it('balloons and tips have the same exports as English', () => {
    expect(moduleParityProblems(en.balloons, de.balloons, 'balloons')).toEqual(
      [],
    );
    expect(moduleParityProblems(en.tips, de.tips, 'tips')).toEqual([]);
  });
});

describe('parity checks catch drift', () => {
  const opening = (
    nodes: ContactOverlay['scripts'][string],
  ): ContactOverlay => ({
    scripts: { opening: nodes },
  });
  const hi = {
    lines: ['heyyy {name}!!', 'kommst du am samstag mit an den see? :D'],
    choices: [
      { text: 'ja klar!! wann?', label: 'Ja!' },
      { text: 'geht nicht, hausarrest :(', label: 'Hausarrest' },
    ],
  };
  const check = (overlay: ContactOverlay) =>
    contactParityProblems(exampleContact, overlay);

  it('passes a faithful overlay', () => {
    expect(check(opening({ hi }))).toEqual([]);
    expect(
      check(
        opening({
          no: {
            lines: ['neee :(', ''],
            personalMessages: { 1: 'see ohne {name} :(' },
          },
        }),
      ),
    ).toEqual([]);
  });

  it('flags an added or removed line', () => {
    expect(
      check(opening({ hi: { ...hi, lines: [...hi.lines, 'extra'] } })),
    ).toEqual(['mika: opening.hi has 3 lines, English has 2']);
    expect(check(opening({ hi: { ...hi, lines: ['nur {name}'] } }))).toEqual([
      'mika: opening.hi has 1 lines, English has 2',
    ]);
  });

  it('flags a choice count mismatch', () => {
    expect(
      check(opening({ hi: { ...hi, choices: hi.choices.slice(0, 1) } })),
    ).toEqual(['mika: opening.hi has 1 choices, English has 2']);
  });

  it('flags unknown scripts and nodes', () => {
    expect(check({ scripts: { nope: {} } })).toEqual([
      'mika: script "nope" doesn\'t exist in English',
    ]);
    expect(check(opening({ gone: { lines: [] } }))).toEqual([
      'mika: node "opening.gone" doesn\'t exist in English',
    ]);
  });

  it('flags placeholder drift per line and choice', () => {
    const lines = ['heyyy!!', hi.lines[1]!];
    expect(check(opening({ hi: { ...hi, lines } }))).toEqual([
      'mika: opening.hi.lines[0] placeholders "" differ from English "{name}"',
    ]);
    const choices = [{ text: '{name}?', label: 'Ja!' }, hi.choices[1]!];
    expect(check(opening({ hi: { ...hi, choices } }))).toHaveLength(1);
  });

  it('flags text on an action-only line and stray personal messages', () => {
    expect(check(opening({ no: { lines: ['neee :(', 'text'] } }))).toEqual([
      'mika: opening.no.lines[1] has text but the English line has none',
    ]);
    expect(
      check(
        opening({
          no: { lines: ['neee :(', ''], personalMessages: { 0: 'x' } },
        }),
      ),
    ).toEqual([
      'mika: opening.no.personalMessages[0] has no English personalMessageChange',
    ]);
  });

  it("flags presence text English doesn't have", () => {
    expect(check({ scripts: {}, awayReply: 'bin weg' })).toEqual([
      'mika: awayReply has no English awayReply',
    ]);
    expect(
      check({ scripts: {}, days: { 2: { personalMessage: 'tag 2' } } }),
    ).toEqual(['mika: days.2 has no English personal message']);
  });

  it('flags module drift: length, id order, keys and hosts', () => {
    const en = {
      A_HOST: 'a.example',
      LIST: [{ id: 'x' }, { id: 'y' }],
      TEXT: { a: '1' },
    };
    expect(moduleParityProblems(en, en, 'm')).toEqual([]);
    expect(
      moduleParityProblems(
        en,
        {
          A_HOST: 'b.example',
          LIST: [{ id: 'y' }, { id: 'x' }],
          TEXT: { b: '1' },
        },
        'm',
      ),
    ).toEqual([
      'm.A_HOST host changed',
      'm.LIST[0] id "y" ≠ "x"',
      'm.LIST[1] id "x" ≠ "y"',
      'm.TEXT keys differ from English',
    ]);
    expect(
      moduleParityProblems(en, { ...en, LIST: [{ id: 'x' }] }, 'm'),
    ).toEqual(['m.LIST has 1 items, English has 2']);
    const missing = { A_HOST: en.A_HOST, LIST: en.LIST };
    expect(moduleParityProblems(en, missing, 'm')).toEqual([
      'm.TEXT is missing',
    ]);
  });
});
