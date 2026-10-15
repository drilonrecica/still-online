// Per-locale accessors and the contact overlay merge.
import { describe, expect, it } from 'vitest';
import { CONTACT_OVERLAYS } from './de/bundle';
import { contacts } from './contacts';
import { exampleContact } from './example.fixture';
import { SEED_FILES } from './files';
import { MAIL_CONTENT } from './mail';
import {
  getBalloons,
  getContacts,
  getMailContent,
  getProfiles,
  getSeedFiles,
  getSiteText,
  getTips,
  getTuneMoleResults,
  mergeOverlay,
  overlayFallbacks,
} from './locale';
import { PROFILES } from './profiles';
import { FRIENDSPACE_HOST, FRIENDSPACE_TEXT } from './sites/friendspace';
import type { ContactLine } from './types';

describe('accessors', () => {
  it('returns the English modules for en', () => {
    expect(getContacts('en')).toBe(contacts);
    expect(getSeedFiles('en')).toBe(SEED_FILES);
    expect(getMailContent('en')).toBe(MAIL_CONTENT);
    expect(getProfiles('en')).toBe(PROFILES);
    expect(getSiteText(FRIENDSPACE_HOST, 'en').FRIENDSPACE_TEXT).toBe(
      FRIENDSPACE_TEXT,
    );
  });

  it('works for de: same contacts in the same order, overlays merged over English', () => {
    const de = getContacts('de');
    expect(de.map((c) => c.contact.id)).toEqual(
      contacts.map((c) => c.contact.id),
    );
    de.forEach((c, i) =>
      expect(c).toEqual(
        mergeOverlay(contacts[i]!, CONTACT_OVERLAYS[c.contact.id]),
      ),
    );
    expect(getSeedFiles('de')).toHaveLength(SEED_FILES.length);
    expect(getMailContent('de').map((m) => m.id)).toEqual(
      MAIL_CONTENT.map((m) => m.id),
    );
    expect(getProfiles('de').map((p) => p.contactId)).toEqual(
      PROFILES.map((p) => p.contactId),
    );
    expect(
      getSiteText(FRIENDSPACE_HOST, 'de').FRIENDSPACE_TEXT.emptyWall,
    ).toMatch(/^Noch keine Kommentare/);
    expect(getBalloons('de').SCHEDULED_BALLOONS.length).toBeGreaterThan(0);
    expect(getTips('de').TIPS.length).toBeGreaterThan(0);
    expect(getTuneMoleResults('de').length).toBeGreaterThan(0);
  });

  it('reports every English text as a fallback without an overlay', () => {
    for (const c of contacts) {
      expect(overlayFallbacks(c, undefined)).toContain(
        `${c.contact.id}.personalMessage`,
      );
    }
  });
});

describe('mergeOverlay', () => {
  const merged = mergeOverlay(exampleContact, {
    personalMessage: 'sommer komm schon!!',
    scripts: {
      opening: {
        hi: {
          lines: ['', 'kommst du samstag an den see? :D'],
          choices: [{ text: 'ja klar!! wann?', label: 'Ja!' }, { text: '' }],
        },
        no: {
          lines: ['neee :(', ''],
          personalMessages: { 1: 'see ohne {name} :(' },
        },
      },
    },
  });
  const nodes = merged.scripts[0]!.nodes;

  it('replaces text and keeps English where the overlay is empty', () => {
    expect(merged.contact.personalMessage).toBe('sommer komm schon!!');
    expect(merged.contact.displayName).toBe(exampleContact.contact.displayName);
    expect(nodes.hi!.lines.map((l) => l.text)).toEqual([
      'heyyy {name}!!',
      'kommst du samstag an den see? :D',
    ]);
    const choices = 'choices' in nodes.hi! ? nodes.hi.choices : [];
    expect(choices.map((c) => [c.text, c.label])).toEqual([
      ['ja klar!! wann?', 'Ja!'],
      ['cant, grounded :(', 'Grounded'],
    ]);
    expect(nodes.no!.lines[1]!.personalMessageChange).toBe(
      'see ohne {name} :(',
    );
  });

  it('keeps delays, actions, triggers and the graph from English', () => {
    const strip = (l: ContactLine) => ({
      ...l,
      text: undefined,
      personalMessageChange: undefined,
    });
    for (const [i, script] of merged.scripts.entries()) {
      const en = exampleContact.scripts[i]!;
      expect(script.trigger).toEqual(en.trigger);
      expect(script.start).toBe(en.start);
      expect(Object.keys(script.nodes)).toEqual(Object.keys(en.nodes));
      for (const [id, node] of Object.entries(script.nodes)) {
        expect(node.lines.map(strip)).toEqual(en.nodes[id]!.lines.map(strip));
        if ('choices' in node)
          expect(node.choices.map((c) => c.next)).toEqual(
            'choices' in en.nodes[id]!
              ? en.nodes[id]!.choices.map((c) => c.next)
              : [],
          );
      }
    }
    expect(merged.scripts[0]!.nodes.hi!.lines[0]!.nudge).toBe(true);
  });

  it('reports what still falls back', () => {
    const fallbacks = overlayFallbacks(exampleContact, {
      personalMessage: 'x',
      scripts: {
        opening: {
          hi: {
            lines: ['a', 'b'],
            choices: [{ text: 'c', label: 'd' }, { text: 'e' }],
          },
        },
      },
    });
    expect(fallbacks).toContain('mika.opening.hi.choices[1].label');
    expect(fallbacks).toContain('mika.nudged.ow.lines[0]');
    expect(fallbacks).not.toContain('mika.opening.hi.lines[0]');
    expect(fallbacks).not.toContain('mika.personalMessage');
  });
});
