// No English fallback is reachable with `language: 'de'`: every accessor returns German modules.
import { describe, expect, it } from 'vitest';
import { CONTACT_OVERLAYS } from './de/bundle';
import { contacts } from './contacts';
import { contentFor, getContacts, overlayFallbacks } from './locale';
import { TIPS, IDLE_JOKES } from './assistant';
import { SCHEDULED_BALLOONS, WELCOME_BALLOON } from './balloons';
import { SEED_FILES } from './files';
import { MAIL_CONTENT } from './mail';
import { PROFILES } from './friendspace/profiles';
import { TUNEMOLE_RESULTS } from './tunemole';
import type { ContactLine } from './types';
import type { Gender } from '../os/types';

const de = contentFor('de', 'girl');
const en = contentFor('en', 'girl');

describe('German content has no English fallback', () => {
  it('every contact text is overlaid', () => {
    for (const c of contacts) {
      expect(overlayFallbacks(c, CONTACT_OVERLAYS[c.contact.id])).toEqual([]);
    }
    expect(getContacts('de', 'girl')).toHaveLength(contacts.length);
  });

  it('serves German modules, not the English ones', () => {
    expect(de.seedFiles).not.toBe(SEED_FILES);
    expect(de.mail).not.toBe(MAIL_CONTENT);
    expect(de.profiles).not.toBe(PROFILES);
    expect(de.tuneMole).not.toBe(TUNEMOLE_RESULTS);
    expect(de.tips.TIPS).not.toBe(TIPS);
    expect(de.tips.IDLE_JOKES).not.toBe(IDLE_JOKES);
    expect(de.balloons.SCHEDULED_BALLOONS).not.toBe(SCHEDULED_BALLOONS);
    for (const host of Object.keys(en.sites) as (keyof typeof en.sites)[]) {
      expect(de.sites[host]).not.toBe(en.sites[host]);
    }
  });

  it('balloons, tips and TuneMole texts differ from English', () => {
    de.balloons.SCHEDULED_BALLOONS.forEach((b, i) => {
      const e = SCHEDULED_BALLOONS[i]!;
      expect(b.id(1)).toBe(e.id(1));
      expect(b.title).not.toBe(e.title);
      expect(b.text).not.toBe(e.text);
    });
    expect(de.balloons.WELCOME_BALLOON.title).not.toBe(WELCOME_BALLOON.title);
    expect(de.tips.TIPS.map((t) => t.id)).toEqual(TIPS.map((t) => t.id));
    de.tips.TIPS.forEach((t, i) => expect(t.text).not.toBe(TIPS[i]!.text));
    de.tips.IDLE_JOKES.forEach((t, i) =>
      expect(t.text).not.toBe(IDLE_JOKES[i]!.text),
    );
    expect(de.tuneMole.map((r) => r.trackId)).toEqual(
      TUNEMOLE_RESULTS.map((r) => r.trackId),
    );
    de.tuneMole.forEach((r, i) =>
      expect(r.fileName).not.toBe(TUNEMOLE_RESULTS[i]!.fileName),
    );
  });
});

const GENDERS: readonly Gender[] = ['girl', 'boy'];
const TOP8_SCRIPTS = ['top8-dropped', 'top8-readded'];

describe.each(GENDERS)(
  'v0.4 Friendspace + GlitterCodez German (%s)',
  (gender) => {
    const deG = contentFor('de', gender);
    const enG = contentFor('en', gender);

    it('bulletins differ from English', () => {
      expect(deG.bulletins.map((b) => [b.id, b.day, b.link])).toEqual(
        enG.bulletins.map((b) => [b.id, b.day, b.link]),
      );
      deG.bulletins.forEach((b, i) => {
        const e = enG.bulletins[i]!;
        expect(b.subject, b.id).not.toBe(e.subject);
        expect(b.body, b.id).not.toBe(e.body);
      });
    });

    it('band pages differ from English', () => {
      expect(deG.bands.map((b) => [b.id, b.name, b.trackIds])).toEqual(
        enG.bands.map((b) => [b.id, b.name, b.trackIds]),
      );
      deG.bands.forEach((b, i) => {
        const e = enG.bands[i]!;
        expect(b.bio, b.id).not.toBe(e.bio);
        expect(b.hometown, b.id).not.toBe(e.hometown);
        b.shows.forEach((s, j) => expect(s.text).not.toBe(e.shows[j]!.text));
        b.blog.forEach((p, j) => expect(p.body).not.toBe(e.blog[j]!.body));
      });
    });

    it('Top 8 wall lines differ from English', () => {
      deG.top8Reactions.forEach((r, i) => {
        const e = enG.top8Reactions[i]!;
        expect(r.contactId).toBe(e.contactId);
        expect(r.dropped, r.contactId).not.toBe(e.dropped);
        expect(r.readded, r.contactId).not.toBe(e.readded);
      });
    });

    it('Top 8 drama chats differ from English', () => {
      const enContacts = getContacts('en', gender);
      for (const c of getContacts('de', gender)) {
        const e = enContacts.find((x) => x.contact.id === c.contact.id)!;
        for (const id of TOP8_SCRIPTS) {
          const de = c.scripts.find((s) => s.id === id)!;
          const en = e.scripts.find((s) => s.id === id)!;
          for (const [nodeId, node] of Object.entries(de.nodes)) {
            const enNode = en.nodes[nodeId]!;
            const texts = (lines: readonly ContactLine[]) =>
              lines.map((l) => l.text ?? '').join('\n');
            const where = `${c.contact.id}/${id}/${nodeId}`;
            expect(texts(node.lines), where).not.toBe(texts(enNode.lines));
            node.lines.forEach((l, j) => {
              const pm = enNode.lines[j]!.personalMessageChange;
              if (pm !== undefined) {
                expect(l.personalMessageChange, where).not.toBe(pm);
              }
            });
            if ('choices' in node && 'choices' in enNode) {
              node.choices.forEach((ch, j) => {
                expect(ch.text, where).not.toBe(enNode.choices[j]!.text);
                expect(ch.label, where).not.toBe(enNode.choices[j]!.label);
              });
            }
          }
        }
      }
    });

    it('GlitterCodez layouts keep their codes and have German blurbs', () => {
      expect(deG.layouts.map((l) => [l.id, l.side, l.extras])).toEqual(
        enG.layouts.map((l) => [l.id, l.side, l.extras]),
      );
      deG.layouts.forEach((l, i) =>
        expect(l.blurb, l.id).not.toBe(enG.layouts[i]!.blurb),
      );
    });
  },
);
