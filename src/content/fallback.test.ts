// No English fallback is reachable with `language: 'de'`: every accessor returns German modules.
import { describe, expect, it } from 'vitest';
import { CONTACT_OVERLAYS } from './de/bundle';
import { contacts } from './contacts';
import { contentFor, getContacts, overlayFallbacks } from './locale';
import { TIPS, IDLE_JOKES } from './assistant';
import { SCHEDULED_BALLOONS, WELCOME_BALLOON } from './balloons';
import { SEED_FILES } from './files';
import { MAIL_CONTENT } from './mail';
import { PROFILES } from './profiles';
import { TUNEMOLE_RESULTS } from './tunemole';

const de = contentFor('de');
const en = contentFor('en');

describe('German content has no English fallback', () => {
  it('every contact text is overlaid', () => {
    for (const c of contacts) {
      expect(overlayFallbacks(c, CONTACT_OVERLAYS[c.contact.id])).toEqual([]);
    }
    expect(getContacts('de')).toHaveLength(contacts.length);
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
