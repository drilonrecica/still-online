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
import type { ContactLine, Script } from './types';
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
        // W3 tightens this: days 6–10 show the English bulletins until W3 writes the German.
        if (b.day > 5) return;
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
        // W3 tightens this: days 6–10 show the English shows and posts until W3.
        b.shows.forEach((s, j) => {
          if (s.day <= 5) expect(s.text).not.toBe(e.shows[j]!.text);
        });
        b.blog.forEach((p, j) => {
          if (p.day <= 5) expect(p.body).not.toBe(e.blog[j]!.body);
        });
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

/** Week two (W3-01): the day 6–10 scripts and the threads that follow them. */
const isWeekTwo = (s: Script, all: readonly Script[]): boolean =>
  s.trigger.type === 'onDay'
    ? s.trigger.day > 5
    : s.trigger.type === 'afterScript' &&
      all.some(
        (t) =>
          t.id === (s.trigger as { scriptId: string }).scriptId &&
          isWeekTwo(t, all),
      );

describe.each(GENDERS)('v0.5 week-two chats German (%s)', (gender) => {
  const enContacts = getContacts('en', gender);

  it.each(getContacts('de', gender).map((c) => [c.contact.id, c] as const))(
    '%s: days 6–10 differ from English at every node, choice and PM',
    (id, c) => {
      const e = enContacts.find((x) => x.contact.id === id)!;
      for (const [day, presence] of Object.entries(e.contact.days ?? {})) {
        if (Number(day) <= 5 || presence?.personalMessage === undefined) {
          continue;
        }
        const de = c.contact.days?.[Number(day)]?.personalMessage;
        expect(de, `${id}/days/${day}`).not.toBe(presence.personalMessage);
      }
      const weekTwo = e.scripts.filter((s) => isWeekTwo(s, e.scripts));
      expect(weekTwo.length, id).toBeGreaterThanOrEqual(5);
      for (const en of weekTwo) {
        const de = c.scripts.find((s) => s.id === en.id)!;
        for (const [nodeId, enNode] of Object.entries(en.nodes)) {
          const node = de.nodes[nodeId]!;
          const where = `${id}/${en.id}/${nodeId}`;
          const texts = (lines: readonly ContactLine[]) =>
            lines.map((l) => l.text ?? '').join('\n');
          expect(texts(node.lines), where).not.toBe(texts(enNode.lines));
          enNode.lines.forEach((l, j) => {
            if (l.personalMessageChange !== undefined) {
              expect(node.lines[j]!.personalMessageChange, where).not.toBe(
                l.personalMessageChange,
              );
            }
          });
          if ('choices' in enNode && 'choices' in node) {
            enNode.choices.forEach((ch, j) => {
              expect(node.choices[j]!.text, where).not.toBe(ch.text);
              if (ch.label !== undefined) {
                expect(node.choices[j]!.label, where).not.toBe(ch.label);
              }
            });
          }
        }
      }
    },
  );

  it('the gender-only week-two threads are German', () => {
    const script = (contact: string, scriptId: string) =>
      getContacts('de', gender)
        .find((c) => c.contact.id === contact)!
        .scripts.find((s) => s.id === scriptId)!;
    expect(script('jess', 'lateNight').forGender).toBe('girl');
    expect(JSON.stringify(script('jess', 'signWorkshop'))).toContain(
      'PFOTENABDRUCK',
    );
    expect(script('marco', 'loadInCrew').forGender).toBe('boy');
    expect(JSON.stringify(script('dex', 'jamCourse'))).toContain('drachenhelm');
  });
});

const PIXLOG_DE = ['jess', 'kayla', 'pia', 'marco', 'theo', 'dex'];
/** Pixlog lines that are the same in German: a name, „pizza", „COMETS LIVE!!!", Pia shouting „DEX". */
const SAME_IN_GERMAN = new Set(['kayla', 'pizza', 'COMETS LIVE!!!', 'DEX']);
const differs = (de: string, en: string, where: string) => {
  if (!SAME_IN_GERMAN.has(en)) expect(de, where).not.toBe(en);
};

describe.each(GENDERS)('v0.4 Pixlog German (%s)', (gender) => {
  const deG = contentFor('de', gender);
  const enG = contentFor('en', gender);

  it.each(PIXLOG_DE)('%s differs from English at every text', (id) => {
    const d = deG.pixlog.find((p) => p.contactId === id)!;
    const e = enG.pixlog.find((p) => p.contactId === id)!;
    expect(d.about).not.toBe(e.about);
    // W3 tightens this: days 6–10 show the English Pixlog until W3 writes the German.
    const week1 = <T extends { day: number }>(items: readonly T[]) =>
      items.filter((x) => x.day <= 5);
    d.albums.forEach((a, i) => {
      const ea = e.albums[i]!;
      expect([a.id, a.day]).toEqual([ea.id, ea.day]);
      if (a.day > 5) return;
      differs(a.title, ea.title, a.id);
      a.photos.forEach((ph, j) => {
        const ep = ea.photos[j]!;
        differs(ph.photo.caption ?? '', ep.photo.caption ?? '', a.id);
        ph.comments.forEach((c, k) =>
          differs(c.text, ep.comments[k]!.text, a.id),
        );
      });
    });
    week1(d.blog).forEach((b, i) => {
      differs(b.title, e.blog[i]!.title, b.id);
      differs(b.body, e.blog[i]!.body, b.id);
    });
    d.survey.answers.forEach((a, i) => differs(a, e.survey.answers[i]!, id));
    week1(d.shouts).forEach((s, i) => differs(s.text, e.shouts[i]!.text, id));
    week1(d.guestbook).forEach((gb, i) =>
      differs(gb.text, e.guestbook[i]!.text, id),
    );
  });

  it('surveys and strangers differ from English', () => {
    deG.surveys.forEach((s, i) => {
      const es = enG.surveys[i]!;
      expect(s.id).toBe(es.id);
      expect(s.title, s.id).not.toBe(es.title);
      // "name:" is the same word in German.
      const differ = s.questions.filter((q, j) => q !== es.questions[j]);
      expect(differ.length, s.id).toBeGreaterThanOrEqual(
        s.questions.length - 1,
      );
    });
    expect(deG.pixlogStrangers).toHaveLength(enG.pixlogStrangers.length);
    expect(deG.pixlogStrangers).not.toEqual(enG.pixlogStrangers);
  });

  it('Pia writes about the player in the right German gender', () => {
    const pia = JSON.stringify(deG.pixlog.find((p) => p.contactId === 'pia'));
    if (gender === 'girl') {
      expect(pia).toContain('meine große schwester');
      expect(pia).not.toContain('bruder');
    } else {
      expect(pia).toContain('mein großer bruder');
      expect(pia).toContain('verdächtiger nr. 2');
      expect(pia).not.toContain('schwester');
    }
  });

  it('Theo writes about his bio partner in the right German gender', () => {
    const theo = JSON.stringify(deG.pixlog.find((p) => p.contactId === 'theo'));
    if (gender === 'girl') {
      expect(theo).toContain('meine bio-partnerin');
      expect(theo).not.toContain('mein partner');
    } else {
      expect(theo).toContain('mein bio-partner');
      expect(theo).not.toContain('partnerin');
    }
  });
});
