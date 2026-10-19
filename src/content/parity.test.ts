// Structural parity: German content mirrors English (docs/i18n.md → "Structural parity").
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/types';
import { CONTACT_OVERLAYS } from './de/bundle';
import { contacts } from './contacts';
import { exampleContact } from './example.fixture';
import { g } from './gender';
import { contentFor, rawContentFor } from './locale';
import {
  contactParityProblems,
  deepParityProblems,
  genderParityProblems,
  moduleParityProblems,
} from './parity';
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
  // Raw modules: gender variants are compared as authored, not resolved.
  const en = rawContentFor('en');
  const de = rawContentFor('de');
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

  it('gossip posts use the same tag ids in every language, with a German label for each', () => {
    const tags = (posts: readonly { tags: readonly string[] }[]) =>
      posts.map((p) => p.tags);
    const enSite = en.sites['celebgossip07.example'];
    const deSite = de.sites['celebgossip07.example'];
    expect(tags(deSite.GOSSIP_POSTS)).toEqual(tags(enSite.GOSSIP_POSTS));
    const ids = new Set(enSite.GOSSIP_POSTS.flatMap((p) => p.tags));
    for (const id of Object.keys(deSite.GOSSIP_TAG_LABELS))
      expect(ids).toContain(id);
  });

  // v0.4: same ids, counts, days, seeds and layout extras at every level; only wording differs.
  const social = [
    'bulletins',
    'bands',
    'top8Reactions',
    'pixlog',
    'surveys',
    'layouts',
  ] as const;

  it.each(social)('%s matches the English structure deeply', (key) => {
    expect(en[key].length).toBeGreaterThan(0);
    expect(deepParityProblems(en[key], de[key], `de.${key}`)).toEqual([]);
  });

  it('balloons and tips have the same exports as English', () => {
    expect(moduleParityProblems(en.balloons, de.balloons, 'balloons')).toEqual(
      [],
    );
    expect(moduleParityProblems(en.tips, de.tips, 'tips')).toEqual([]);
  });
});

describe.each(LOCALES)('both genders (%s)', (locale) => {
  it('resolve to the same structure: ids, counts, days and links', () => {
    expect(
      genderParityProblems(
        JSON.parse(JSON.stringify(contentFor(locale, 'girl'))),
        JSON.parse(JSON.stringify(contentFor(locale, 'boy'))),
        locale,
      ),
    ).toEqual([]);
  });

  it('leave no markers after resolving', () => {
    for (const gender of ['girl', 'boy'] as const)
      expect(JSON.stringify(contentFor(locale, gender))).not.toMatch(
        /[\uE000-\uE002]/,
      );
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

  it('compares placeholders per gender side, ignoring the variant markers', () => {
    const lines = [`${g('hey {name}!!', 'yo {name}')}`, hi.lines[1]!];
    expect(check(opening({ hi: { ...hi, lines } }))).toEqual([]);
    const half = [g('hey {name}!!', 'yo'), hi.lines[1]!];
    expect(check(opening({ hi: { ...hi, lines: half } }))).toEqual([
      'mika: opening.hi.lines[0] placeholders "{name} | " differ from English "{name}"',
    ]);
  });

  it('flags structure that differs between the genders', () => {
    expect(
      genderParityProblems(
        { id: 'a', day: 1, list: [1], t: 'girl' },
        { id: 'a', day: 1, list: [1], t: 'boy' },
        'x',
      ),
    ).toEqual([]);
    expect(
      genderParityProblems(
        { id: 'a', day: 1, list: [1, 2] },
        { id: 'b', day: 2, list: [1] },
        'x',
      ),
    ).toEqual([
      'x.id: girl has a, boy has b',
      'x.day: girl has 1, boy has 2',
      'x.list: girl has 2 items, boy has 1',
    ]);
  });

  it('flags deep drift: days, ids, nested counts, layout extras and placeholders', () => {
    const en = [
      {
        id: 'b1',
        day: 2,
        body: 'hi {name}',
        link: 'http://a.example/',
        extras: { background: 'starry', text: '#fff', stickers: [] },
        photos: [{ comments: [{ day: 3, text: 'x' }] }],
      },
    ];
    const ok = structuredClone(en);
    ok[0]!.body = 'hallo {name}';
    expect(deepParityProblems(en, ok, 'm')).toEqual([]);
    const bad = structuredClone(en);
    bad[0]!.day = 3;
    bad[0]!.body = 'hallo';
    bad[0]!.link = 'http://b.example/';
    bad[0]!.extras.text = '#000';
    bad[0]!.photos[0]!.comments = [];
    expect(deepParityProblems(en, bad, 'm')).toEqual([
      'm[0].day is 3, English has 2',
      'm[0].body placeholders differ from English',
      'm[0].link is http://b.example/, English has http://a.example/',
      'm[0].extras.text is #000, English has #fff',
      'm[0].photos[0].comments has 0 items, English has 1',
    ]);
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
