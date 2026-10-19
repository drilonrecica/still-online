import { describe, expect, it } from 'vitest';
import { resolve } from '@/apps/browser/sites';
import { splitLinks } from '@/os/linkify';
import { contacts } from '../contacts';
import { GENDERS, resolveGender } from '../gender';
import { lintContentStrings } from '../lint';
import { contentDays, STORY_DAYS } from '../storyDays';
import { MAIL_CONTENT } from '.';

const texts = (m: (typeof MAIL_CONTENT)[number]) => [
  m.body,
  ...(m.attachments ?? []).flatMap((a) => (a.text ? [a.text] : [])),
];

describe('mail content', () => {
  it('has at least 3 mails on each written story day, none after the last', () => {
    const written = contentDays();
    for (let day = STORY_DAYS.first; day <= STORY_DAYS.last; day++)
      expect(
        MAIL_CONTENT.filter((m) => m.day === day).length,
        `day ${day}`,
        // W2-01 tightens this: days 6–10 stay empty until their mail is written.
      ).toBeGreaterThanOrEqual(written.includes(day) ? 3 : 0);
    expect(MAIL_CONTENT.every((m) => m.day <= STORY_DAYS.last)).toBe(true);
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
    for (const m of GENDERS.flatMap((g) => resolveGender(MAIL_CONTENT, g))) {
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

describe('G-04: mail per gender', () => {
  const mail = (gender: 'girl' | 'boy', id: string) => {
    const m = resolveGender(MAIL_CONTENT, gender).find((x) => x.id === id);
    if (!m) throw new Error(`${id} missing`);
    return m;
  };

  it("a boy's chain letter threatens his console, not his love life", () => {
    const boy = mail('boy', 'd2-chain-love');
    expect(boy.subject).toContain('ur console will BREAK');
    expect(boy.from.address).toBe('kayla.xoxo@livemail.example');
    expect(`${boy.subject} ${boy.body}`).not.toMatch(/crush|love!/i);
    expect(mail('girl', 'd2-chain-love').body).toContain('ur crush');
  });

  it('Mom asks a boy about helmets instead of whether Dex is cute', () => {
    const boy = mail('boy', 'd5-mom-dex');
    expect(boy.body).toMatch(/^Hi buddy,/);
    expect(boy.body).toContain('wear helmets');
    expect(boy.body).not.toContain('CUTE');
    expect(boy.body).toContain('the video is done');
    expect(mail('girl', 'd5-mom-dex').body).toContain('Is he CUTE?');
  });

  it('a boy gets the CheatCave newsletter and cheat-CD spam, with the concert news kept', () => {
    const d3 = mail('boy', 'd3-fanclub-newsletter');
    expect(d3.from.address).toBe('news@cheatcave.example');
    expect(d3.body).toContain('riverside arena this week. SOLD OUT');
    const d5 = mail('boy', 'd5-fanclub-special');
    expect(d5.from.address).toBe('news@cheatcave.example');
    expect(d5.body).toContain('threw a drumstick into the crowd');
    expect(d5.body).toContain('space girl LAST');
    expect(mail('boy', 'd3-spam-ringtones').subject).toContain(
      'FREE cheat codes CD',
    );
    expect(mail('girl', 'd3-fanclub-newsletter').from.address).toBe(
      'cometgirl@tinfoilcomets.example',
    );
  });

  it('a boy has no crush in any mail', () => {
    for (const m of resolveGender(MAIL_CONTENT, 'boy'))
      expect(`${m.subject} ${m.body}`, m.id).not.toMatch(/crush/i);
  });
});
