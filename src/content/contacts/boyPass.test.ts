// The boyish pass (G2): what a boy reads and types in a friend's chats, against the girl's side.
// Each G2 task adds its friends here; the audit (`genderAudit.test.ts`) covers the cue words.
import { describe, expect, it } from 'vitest';
import type { Locale } from '@/i18n/types';
import type { Gender } from '@/os/types';
import {
  getAutoReplies,
  getContacts,
  getMailContent,
  getPixlogProfiles,
  getSurveys,
  getTop8Reactions,
} from '../locale';

function node(
  locale: Locale,
  gender: Gender,
  contactId: string,
  scriptId: string,
  nodeId: string,
) {
  const c = getContacts(locale, gender).find((x) => x.contact.id === contactId);
  const n = c?.scripts.find((s) => s.id === scriptId)?.nodes[nodeId];
  if (!n) throw new Error(`${contactId}/${scriptId}/${nodeId} not found`);
  return {
    lines: n.lines.map((l) => l.text ?? ''),
    choices: 'choices' in n ? n.choices.map((ch) => ch.text) : [],
    labels: 'choices' in n ? n.choices.map((ch) => ch.label ?? ch.text) : [],
  };
}

const said = (
  locale: Locale,
  gender: Gender,
  contactId: string,
  scriptId: string,
  nodeId: string,
) => {
  const n = node(locale, gender, contactId, scriptId, nodeId);
  return [...n.lines, ...n.choices, ...n.labels].join('\n');
};

describe('Jess for a boy', () => {
  it('he wanted the flames and teases the glitter; she keeps her glitter', () => {
    expect(said('en', 'boy', 'jess', 'followup1', 'sign')).toContain('FLAMES');
    expect(said('en', 'boy', 'jess', 'followup1', 'sign')).toContain(
      'my cat is sparkly now',
    );
    expect(said('en', 'boy', 'jess', 'followup1', 'marry')).toContain(
      'writing it in black like u said',
    );
    expect(said('en', 'boy', 'jess', 'day2', 'cat')).toContain(
      'the cd u lent me has glitter on it now',
    );
    expect(node('en', 'boy', 'jess', 'day2', 'over').choices[1]).toBe(
      'scrape some back off the cat lol',
    );
    expect(said('de', 'boy', 'jess', 'followup1', 'sign')).toContain('FLAMMEN');
    expect(said('de', 'boy', 'jess', 'day2', 'cat')).toContain(
      'die du mir geliehen hast',
    );
    // The girl's side is untouched.
    expect(said('en', 'girl', 'jess', 'followup1', 'marry')).toContain(
      'writing it in pink. BIG pink',
    );
    expect(node('en', 'girl', 'jess', 'day2', 'over').choices[1]).toBe(
      'borrow glitter from the cat',
    );
  });

  it('outfit talk aimed at him is the band shirt and the hoodie w the hole', () => {
    const en = node('en', 'boy', 'jess', 'day3', 'sparkly');
    expect(en.lines[1]).toBe(
      'what r U wearing?? and NOT the hoodie w the hole',
    );
    expect(en.labels).toEqual(['Band shirt', 'The lucky hoodie']);
    expect(node('de', 'boy', 'jess', 'day3', 'sparkly').labels).toEqual([
      'Bandshirt',
      'Glücks-Hoodie',
    ]);
    expect(node('en', 'boy', 'jess', 'day4', 'list').lines[2]).toContain(
      'HAIR GEL',
    );
    expect(node('en', 'girl', 'jess', 'day3', 'sparkly').labels).toEqual([
      'Star jeans',
      'And glitter',
    ]);
  });

  it('no (L) aimed at him, and he swears on his board, not a pinky', () => {
    for (const [script, n] of [
      ['opening', 'yes'],
      ['followup2', 'found'],
      ['day4', 'night'],
      ['day5', 'keep'],
      ['day5', 'bump'],
    ] as const) {
      expect(said('en', 'boy', 'jess', script, n)).not.toContain('(L)');
      expect(said('de', 'boy', 'jess', script, n)).not.toMatch(/\(L\)|hdgdl/i);
    }
    expect(node('en', 'boy', 'jess', 'followup1', 'notyet').labels[1]).toBe(
      'Swear on my board',
    );
    expect(node('en', 'girl', 'jess', 'day5', 'keep').lines[1]).toBe(
      'best. night. EVER. (L)',
    );
  });

  it('her mail and auto-reply sign off with \\m/, not hearts', () => {
    const itinerary = (locale: Locale, gender: Gender) =>
      getMailContent(locale, gender).find((m) => m.id === 'd4-jess-itinerary')!
        .body;
    expect(itinerary('en', 'boy')).toContain('\\m/ \\m/ ROCK ON. jess');
    expect(itinerary('de', 'boy')).not.toMatch(/<3|hdgdl/);
    expect(itinerary('en', 'girl')).toContain('<3 <3 <3 jess');
    const reply = getAutoReplies('en', 'boy').find(
      (r) => r.contactId === 'jess',
    );
    expect(reply?.body).toMatch(/\\m\/ jess$/);
  });
});

describe('Kayla for a boy', () => {
  it('he is asked about the party part, never invited to the sleepover', () => {
    expect(said('en', 'boy', 'kayla', 'day3', 'invite')).toContain(
      'u boys just to the party part',
    );
    expect(node('en', 'boy', 'kayla', 'day4', 'told').choices[1]).toBe(
      'so r u going? im going to the party part anyway',
    );
    expect(said('en', 'boy', 'kayla', 'day4', 'go')).toContain(
      'ur going to the party part right??',
    );
    expect(said('en', 'boy', 'kayla', 'day5', 'survived')).toContain(
      'u boys left after the cake',
    );
    expect(said('de', 'boy', 'kayla', 'day3', 'invite')).toContain(
      'ihr jungs nur zur party',
    );
    // His own options never mention the sleepover.
    for (const locale of ['en', 'de'] as const)
      for (const [script, n] of [
        ['day3', 'fine'],
        ['day3', 'lost'],
        ['day4', 'told'],
        ['day4', 'go'],
      ] as const) {
        const { choices, labels } = node(locale, 'boy', 'kayla', script, n);
        expect([...choices, ...labels].join(' ')).not.toMatch(
          /sleepover|übernachtung/i,
        );
      }
    expect(node('en', 'girl', 'kayla', 'day4', 'told').choices[1]).toBe(
      'so r u going to the sleepover?',
    );
  });

  it('Brianna says he is "kinda funny" instead of "cute pajamas"', () => {
    expect(node('en', 'boy', 'kayla', 'day5', 'laugh').lines[0]).toBe(
      'then she asked about u. she said ur "kinda funny"',
    );
    expect(node('de', 'boy', 'kayla', 'day5', 'laugh').lines[0]).toContain(
      '„irgendwie witzig“',
    );
    expect(node('en', 'girl', 'kayla', 'day5', 'laugh').lines[0]).toBe(
      'then she said "cute pajamas"',
    );
  });

  it('the cute-pm analysis gets the guy answer', () => {
    const literal = node('en', 'boy', 'kayla', 'followup2', 'literal');
    expect(literal.choices[0]).toBe('its 2 words kayla. its fine');
    expect(literal.lines[1]).toContain('ugh BOYS');
    expect(node('en', 'boy', 'kayla', 'followup2', 'omg').choices[0]).toBe(
      'maybe she means it nice?',
    );
    expect(node('de', 'boy', 'kayla', 'followup2', 'literal').labels[0]).toBe(
      'Passt schon',
    );
  });

  it('no hearts aimed at him; her own personal messages keep theirs', () => {
    expect(node('en', 'boy', 'kayla', 'top8-readded', 'back').lines[2]).toBe(
      '(Y)',
    );
    expect(said('en', 'boy', 'kayla', 'day5', 'proud')).toContain(
      'theyre for ME',
    );
    const wall = (locale: Locale) =>
      getTop8Reactions(locale, 'boy').find((r) => r.contactId === 'kayla')!
        .readded;
    expect(wall('en')).not.toContain('<3');
    expect(wall('de')).not.toContain('<3');
    const reply = getAutoReplies('en', 'boy').find(
      (r) => r.contactId === 'kayla',
    );
    expect(reply?.again).not.toContain('xoxo');
    const chain = getMailContent('en', 'boy').find(
      (m) => m.id === 'd2-chain-love',
    );
    expect(chain?.body).not.toContain('xoxo');
    expect(
      getContacts('en', 'boy').find((c) => c.contact.id === 'kayla')!.contact
        .displayName,
    ).toBe('~*Kayla*~ <3');
  });
});

describe('Pia for a boy', () => {
  it('he is the annoyed big brother who still helps; her lines stay pony-mad', () => {
    expect(node('en', 'boy', 'pia', 'opening', 'quiz').choices).toEqual([
      'a foal. obviously. can i go now',
      'a calf',
      'a mini donkey lol',
    ]);
    expect(node('en', 'boy', 'pia', 'opening', 'quiz').lines[0]).toBe(
      'what is a baby horse called',
    );
    expect(node('de', 'boy', 'pia', 'opening', 'quiz').choices[0]).toBe(
      'ein fohlen. logisch. kann ich jetzt gehen',
    );
    expect(node('en', 'boy', 'pia', 'followup2', 'sneak').labels[1]).toBe(
      'Moved one',
    );
    expect(said('en', 'boy', 'pia', 'followup2', 'herself')).toContain(
      'pony wedding',
    );
    expect(node('en', 'girl', 'pia', 'opening', 'quiz').choices[1]).toBe(
      'a pony',
    );
  });

  it('he guards pony jail and refuses the pinky swear', () => {
    expect(node('en', 'boy', 'pia', 'day3', 'solved').labels[2]).toBe(
      'Ill be the guard',
    );
    expect(said('en', 'boy', 'pia', 'day3', 'arrest')).toContain(
      'ur the GUARD now',
    );
    expect(said('en', 'boy', 'pia', 'day3', 'arrest')).toContain('pony jail');
    expect(node('de', 'boy', 'pia', 'day3', 'solved').labels[2]).toBe(
      'Ich bin der Wärter',
    );
    expect(node('en', 'boy', 'pia', 'day2', 'swear')).toEqual({
      lines: ['pinky swear?'],
      choices: ['no pinkies. spit shake?', 'im not 6 pia'],
      labels: ['Spit shake', 'Im not 6'],
    });
    expect(node('de', 'boy', 'pia', 'day2', 'swear').labels[0]).toBe(
      'Spucken + einschlagen',
    );
    expect(node('en', 'girl', 'pia', 'day2', 'swear').labels[0]).toBe(
      'Pinky swear',
    );
  });

  it('he teases instead of "cute", and gets (Y) for the present', () => {
    expect(node('en', 'boy', 'pia', 'followup1', 'helped').choices[1]).toBe(
      'boss of the dog bowl maybe',
    );
    expect(node('de', 'boy', 'pia', 'followup1', 'helped').choices[1]).toBe(
      'chefin vom hundenapf vielleicht',
    );
    expect(node('en', 'boy', 'pia', 'day5', 'present').labels[0]).toBe(
      'Thanks i guess',
    );
    for (const locale of ['en', 'de'] as const) {
      const pia = getContacts(locale, 'boy').find(
        (c) => c.contact.id === 'pia',
      )!;
      expect(pia.contact.days?.[5]?.personalMessage).toContain('(Y)');
      expect(pia.contact.displayName).toContain('(L)'); // her own name
      const pix = getPixlogProfiles(locale, 'boy').find(
        (p) => p.contactId === 'pia',
      )!;
      expect(pix.shouts.map((s) => s.text).join(' ')).not.toMatch(
        /PRESENT \(L\)|GESCHENK gemacht \(L\)/,
      );
    }
    expect(node('en', 'girl', 'pia', 'followup1', 'helped').choices[1]).toBe(
      'cute :)',
    );
  });
});

describe('Marco, Theo and the shared bits for a boy', () => {
  it('Marco: flames and a skull on the flyer, not glitter', () => {
    expect(node('en', 'boy', 'marco', 'followup1', 'flyer').labels[0]).toBe(
      'Flames + skull',
    );
    expect(said('en', 'boy', 'marco', 'followup1', 'glitter')).toContain(
      'if derek sees a skull',
    );
    expect(node('de', 'boy', 'marco', 'followup1', 'flyer').labels[0]).toBe(
      'Flammen + Totenkopf',
    );
    expect(node('en', 'girl', 'marco', 'followup1', 'flyer').labels[0]).toBe(
      'Glitter + flames',
    );
  });

  it('Theo offers him the Galaxy Raiders 3 cheat', () => {
    expect(said('en', 'boy', 'theo', 'gameScore', 'show')).toContain(
      'galaxy raiders 3 cheat',
    );
    expect(said('de', 'boy', 'theo', 'gameScore', 'show')).toContain(
      'galaxy-raiders-3-cheat',
    );
    expect(said('en', 'girl', 'theo', 'gameScore', 'show')).not.toContain(
      'galaxy',
    );
  });

  it('the "last time" survey asks him about a buddy, not a sleepover', () => {
    const q = (locale: 'en' | 'de', gender: Gender) =>
      getSurveys(locale, gender).find((s) => s.id === 'last-time')!
        .questions[8];
    expect(q('en', 'boy')).toBe('slept over at a buddys?');
    expect(q('de', 'boy')).toBe('bei nem kumpel gepennt?');
    expect(q('en', 'girl')).toBe('had a sleepover?');
  });
});
