// The German mail mirrors English: same ids, days, addresses and attachment data; German text.
import { describe, expect, it } from 'vitest';
import { resolve } from '@/apps/browser/sites';
import { lintContentStrings } from '@/content/lint';
import { resolveGender } from '@/content/gender';
import {
  getAutoReplies,
  getMailContent,
  rawContentFor,
} from '@/content/locale';
import { splitLinks } from '@/os/linkify';
import { MAIL_CONTENT as EN } from '../../mail';
import { autoReplies as EN_REPLIES } from '../../mail/autoReplies';
import type { MailContent } from '../../mail/types';
import { MAIL_CONTENT, autoReplies } from '.';

const texts = (m: MailContent) => [
  m.subject,
  m.body,
  ...(m.attachments ?? []).flatMap((a) => (a.text ? [a.text] : [])),
];
const links = (m: MailContent) =>
  texts(m).flatMap((t) =>
    splitLinks(t).flatMap((s) => (s.kind === 'link' ? [s.url] : [])),
  );

describe('German mail', () => {
  it('is what the accessors return for de', () => {
    expect(rawContentFor('de').mail).toBe(MAIL_CONTENT);
    expect(getMailContent('de', 'boy')).toEqual(
      resolveGender(MAIL_CONTENT, 'boy'),
    );
    expect(rawContentFor('de').autoReplies).toBe(autoReplies);
    expect(getAutoReplies('de', 'girl')).toEqual(
      resolveGender(autoReplies, 'girl'),
    );
  });

  it('has the English ids, days and sender addresses, in order', () => {
    expect(MAIL_CONTENT.map((m) => [m.id, m.day, m.from.address])).toEqual(
      EN.map((m) => [m.id, m.day, m.from.address]),
    );
  });

  it('keeps attachments: same count, type and photo scene/seed', () => {
    MAIL_CONTENT.forEach((m, i) => {
      const en = EN[i]!.attachments ?? [];
      const de = m.attachments ?? [];
      expect(de.length, m.id).toBe(en.length);
      de.forEach((a, j) => {
        expect(a.type, m.id).toBe(en[j]!.type);
        expect(a.type === 'txt' ? a.text : a.photo, a.name).toBeTruthy();
        expect(a.photo?.scene).toBe(en[j]!.photo?.scene);
        expect(a.photo?.seed).toBe(en[j]!.photo?.seed);
      });
    });
  });

  it('translates every subject and body', () => {
    MAIL_CONTENT.forEach((m, i) => {
      expect(m.body, m.id).not.toBe(EN[i]!.body);
      // Marco's subject is two words that are the same in German.
      if (m.id !== 'd2-marco-flyer')
        expect(m.subject, m.id).not.toBe(EN[i]!.subject);
    });
  });

  it('links to the same site pages as English', () => {
    MAIL_CONTENT.forEach((m, i) => {
      expect(links(m), m.id).toEqual(links(EN[i]!));
      for (const url of links(m)) expect(resolve(url), url).not.toBeNull();
    });
  });

  it('forwards with „WG:“ and has no placeholders', () => {
    for (const m of MAIL_CONTENT) {
      expect(m.subject, m.id).not.toMatch(/\b(?:FWD|RE):/i);
      expect(texts(m).join(' '), m.id).not.toMatch(/\{\w+\}/);
    }
  });

  it('passes the German content lint', () => {
    expect(lintContentStrings(MAIL_CONTENT, 'mail', 'de')).toEqual([]);
    expect(lintContentStrings(autoReplies, 'autoReplies', 'de')).toEqual([]);
  });
});

describe('German auto-replies', () => {
  it('has one per friend, in the English order', () => {
    expect(autoReplies.map((r) => r.contactId)).toEqual(
      EN_REPLIES.map((r) => r.contactId),
    );
  });

  it('answers with „AW:“ and German text', () => {
    autoReplies.forEach((r, i) => {
      expect(r.subject).toMatch(/^AW: /);
      expect(r.body).not.toBe(EN_REPLIES[i]!.body);
      expect(r.again).not.toBe(EN_REPLIES[i]!.again);
    });
  });

  it('Marco never uses „!“', () => {
    const marco = autoReplies.find((r) => r.contactId === 'marco')!;
    expect(`${marco.subject} ${marco.body} ${marco.again}`).not.toContain('!');
  });
});

describe('G-04: German mail per gender', () => {
  const mail = (gender: 'girl' | 'boy', id: string) => {
    const m = resolveGender(MAIL_CONTENT, gender).find((x) => x.id === id);
    if (!m) throw new Error(`${id} missing`);
    return m;
  };

  it('uses natural gendered forms for the player', () => {
    expect(mail('girl', 'd2-spaceport-views').body).toMatch(
      /^Hey, Weltraumkadettin!/,
    );
    expect(mail('boy', 'd4-spaceport-comment').body).toMatch(
      /^Hey, Weltraumkadett!/,
    );
    expect(mail('boy', 'd3-theo-labels').attachments?.[0]?.text).toContain(
      'von Theo + Partner\n',
    );
    expect(mail('boy', 'd5-mom-dex').body).toMatch(/^Hallo mein Großer,/);
  });

  it('gives a boy the console chain letter and the CheatCave newsletter', () => {
    const chain = mail('boy', 'd2-chain-love');
    expect(chain.subject).toContain('konsole KAPUTT');
    expect(`${chain.subject} ${chain.body}`).not.toMatch(/schwarm|liebe!/i);
    const d3 = mail('boy', 'd3-fanclub-newsletter');
    expect(d3.from.address).toBe('news@cheatcave.example');
    expect(d3.body).toContain('riverside arena. AUSVERKAUFT');
    expect(mail('boy', 'd5-mom-dex').body).toContain('Helme');
  });
});
