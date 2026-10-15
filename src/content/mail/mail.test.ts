import { describe, expect, it } from 'vitest';
import { resolve } from '@/apps/browser/sites';
import { splitLinks } from '@/os/linkify';
import { contacts } from '../contacts';
import { lintContentStrings } from '../lint';
import { MAIL_CONTENT } from '.';

const texts = (m: (typeof MAIL_CONTENT)[number]) => [
  m.body,
  ...(m.attachments ?? []).flatMap((a) => (a.text ? [a.text] : [])),
];

describe('mail content', () => {
  it('has at least 3 mails on each of days 1-5', () => {
    for (let day = 1; day <= 5; day++)
      expect(
        MAIL_CONTENT.filter((m) => m.day === day).length,
        `day ${day}`,
      ).toBeGreaterThanOrEqual(3);
  });

  it('has unique ids', () => {
    const ids = MAIL_CONTENT.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every link opens a registered site page', () => {
    const links = MAIL_CONTENT.flatMap(texts).flatMap((t) =>
      splitLinks(t).flatMap((s) => (s.kind === 'link' ? [s.url] : [])),
    );
    expect(links.length).toBeGreaterThan(0);
    for (const url of links) expect(resolve(url), url).not.toBeNull();
  });

  it('friends mail from their Messenger handle', () => {
    const handles = new Set<string>(contacts.map((c) => c.contact.handle));
    for (const m of MAIL_CONTENT) {
      expect(m.from.address, m.id).toMatch(/@[\w.-]+\.example$/);
      if (m.from.address.endsWith('@livemail.example') && m.from.name !== 'Mom')
        expect(handles.has(m.from.address), m.id).toBe(true);
    }
  });

  it('attachments carry their data', () => {
    for (const a of MAIL_CONTENT.flatMap((m) => m.attachments ?? []))
      expect(a.type === 'txt' ? a.text : a.photo, a.name).toBeTruthy();
  });

  it('passes the content lint and uses no placeholders', () => {
    expect(lintContentStrings(MAIL_CONTENT, 'mail')).toEqual([]);
    for (const m of MAIL_CONTENT)
      expect(texts(m).join(' '), m.id).not.toMatch(/\{\w+\}/);
  });
});
