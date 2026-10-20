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
  it('has mail on every story day (3+ in week one, 4–6 in week two), none after the last', () => {
    expect(contentDays('mail')).toEqual(
      Array.from({ length: STORY_DAYS.last }, (_, i) => i + STORY_DAYS.first),
    );
    for (const day of contentDays('mail')) {
      const count = MAIL_CONTENT.filter((m) => m.day === day).length;
      if (day <= 5) expect(count, `day ${day}`).toBeGreaterThanOrEqual(3);
      else {
        expect(count, `day ${day}`).toBeGreaterThanOrEqual(4);
        expect(count, `day ${day}`).toBeLessThanOrEqual(6);
      }
    }
    expect(MAIL_CONTENT.every((m) => m.day <= STORY_DAYS.last)).toBe(true);
  });

  it('ids follow d<day>-<sender>-<topic>', () => {
    for (const m of MAIL_CONTENT)
      expect(m.id).toMatch(new RegExp(`^d${m.day}-[a-z0-9]+-[a-z0-9-]+$`));
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

  it("Mom's day-10 mail: Dex for a girl, his missing helmet for a boy, no romance for either", () => {
    const girl = mail('girl', 'd10-mom-dex');
    const boy = mail('boy', 'd10-mom-dex');
    expect(girl.body).toContain(
      "So THAT is Dex. He was very polite. He called me ma'am. Twice.",
    );
    expect(girl.body).toContain('to the show at 6');
    expect(boy.body).toMatch(/^Hi buddy,/);
    expect(boy.body).toContain('He was not wearing a helmet.');
    expect(boy.body).toContain('to the load-in at 4');
    expect(boy.body).not.toContain('So THAT');
    for (const m of [girl, boy]) {
      expect(m.body).toContain('next year');
      expect(m.body).not.toMatch(/\b(?:cute|crush|boyfriend|date)\b|<3|\(L\)/i);
    }
  });

  it('week two: a boy gets the CheatCave issues, the guy campaign mail and a brother', () => {
    for (const id of [
      'd6-fanclub-newsletter',
      'd7-fanclub-contest',
      'd9-fanclub-winners',
      'd10-fanclub-lakeview',
    ]) {
      expect(mail('boy', id).from.address, id).toBe('news@cheatcave.example');
      expect(mail('girl', id).from.address, id).toBe(
        'cometgirl@tinfoilcomets.example',
      );
    }
    expect(mail('boy', 'd9-fanclub-winners').body).toContain(
      'GALAXY RAIDERS 4 is NOT coming',
    );
    expect(mail('girl', 'd9-fanclub-winners').body).toContain(
      '2ND PLACE: jess',
    );
    expect(mail('boy', 'd6-spam-hair').subject).toContain('CHEATMASTER CD');
    expect(mail('boy', 'd7-kayla-vote').subject).toBe(
      'vote kayla. tell the guys',
    );
    expect(mail('boy', 'd6-pia-hamster').body).toContain('ur my brother');
    expect(mail('girl', 'd6-pia-hamster').body).toContain('ur my sister');
    expect(mail('boy', 'd8-mom-parent-teacher').body).toContain(
      '"He always knows what to do.',
    );
    expect(mail('girl', 'd8-jess-soldout').body).toContain('<3 <3 jess');
    expect(mail('boy', 'd8-jess-soldout').body).toContain('\\m/ jess');
  });

  it("week two: Marco credits the player's song per gender, without „!“", () => {
    expect(mail('girl', 'd10-marco-thanks').body).toContain('"lantern heart"');
    expect(mail('boy', 'd10-marco-thanks').body).toContain('"56k"');
    for (const g of ['girl', 'boy'] as const) {
      const m = mail(g, 'd10-marco-thanks');
      expect(`${m.subject} ${m.body}`).not.toContain('!');
    }
  });
});
