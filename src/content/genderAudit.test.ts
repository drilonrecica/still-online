// Gender audit (G2-01, docs/gender.md → "Audit"): every girly cue word a boy reads must be on the
// allowlist with a reason, and what the boy himself types never is. `npm run gender-audit` runs
// this file and also prints the numbers per module.
import { describe, expect, it } from 'vitest';
import { LOCALES } from '@/i18n/types';
import { GENDER_AUDIT_ALLOW } from './genderAudit.allow';
import {
  ALLOW_REASONS,
  allows,
  auditHits,
  auditNumbers,
  contentStrings,
  isChoicePath,
} from './genderAudit';

/** Node's `process` (the app's tsconfig has no Node types). */
const node = (
  globalThis as unknown as {
    process: {
      env: Record<string, string | undefined>;
      stdout: { write(s: string): void };
    };
  }
).process;

const hits = LOCALES.flatMap((locale) => auditHits(locale));
const allowed = (h: (typeof hits)[number]) =>
  GENDER_AUDIT_ALLOW.some((e) => allows(e, h));

describe('gender audit', () => {
  it('scans every module in both languages', () => {
    for (const locale of LOCALES) {
      const paths = [...contentStrings(locale, 'boy').keys()];
      for (const area of [
        'contacts/',
        'mail/',
        'profiles/',
        'pixlog/',
        'sites/',
      ])
        expect(paths.some((p) => p.startsWith(area))).toBe(true);
    }
  });

  it('finds cue words (the scanner works)', () => {
    expect(hits.some((h) => h.match === 'glitter')).toBe(true);
    expect(hits.some((h) => h.match === 'Übernachtungsparty')).toBe(true);
  });

  it('every boy-side hit is on the allowlist', () => {
    const open = hits
      .filter((h) => !allowed(h))
      .map((h) => `${h.where} [${h.match}]: ${h.text.slice(0, 80)}`);
    expect(open).toEqual([]);
  });

  it('never allows what the boy types (choice text and labels)', () => {
    expect(
      hits
        .filter((h) => isChoicePath(h.where) && allowed(h))
        .filter(
          (h) =>
            !GENDER_AUDIT_ALLOW.some(
              (e) => allows(e, h) && e.reason === 'pending',
            ),
        ),
    ).toEqual([]);
    const reasoned = GENDER_AUDIT_ALLOW.filter((e) => e.reason !== 'pending');
    expect(reasoned.filter((e) => isChoicePath(e.where))).toEqual([]);
  });

  it('Jess and Kayla have no pending entries and pass on every choice', () => {
    const jk = /\/(contacts|profiles|pixlog)\/(jess|kayla)\//;
    expect(
      GENDER_AUDIT_ALLOW.filter(
        (e) => e.reason === 'pending' && jk.test(e.where),
      ),
    ).toEqual([]);
    expect(
      hits.filter((h) => jk.test(h.where) && isChoicePath(h.where)),
    ).toEqual([]);
  });

  it('has a known reason, a valid wildcard and no stale entry', () => {
    for (const e of GENDER_AUDIT_ALLOW) {
      expect(ALLOW_REASONS).toContain(e.reason);
      if (e.where.endsWith('/*') || e.match === '*') {
        expect(e.where.endsWith('/*') && e.match === '*').toBe(true);
        expect(e.reason).toBe('site-content');
      }
    }
    const stale = GENDER_AUDIT_ALLOW.filter(
      (e) => !hits.some((h) => allows(e, h)),
    );
    expect(stale).toEqual([]);
  });

  it.runIf(node.env.npm_lifecycle_event === 'gender-audit')(
    'prints the numbers',
    () => {
      for (const locale of LOCALES) {
        const rows = Object.entries(auditNumbers(locale)).sort(([a], [b]) =>
          a.localeCompare(b),
        );
        const sum = (
          pick: (r: (typeof rows)[number][1]) => number,
          chat = false,
        ) =>
          rows
            .filter(([m]) => !chat || m.startsWith('contacts/'))
            .reduce((n, [, r]) => n + pick(r), 0);
        const lines = rows
          .filter(([, r]) => r.hits || r.differ)
          .map(
            ([m, r]) =>
              `  ${m.padEnd(34)} hits ${String(r.hits).padStart(4)}   differ ${String(r.differ).padStart(4)} / ${r.strings}`,
          );
        const pending = GENDER_AUDIT_ALLOW.filter(
          (e) => e.reason === 'pending' && e.where.startsWith(`${locale}/`),
        ).length;
        node.stdout.write(
          [
            `gender audit (${locale}, as a boy)`,
            ...lines,
            `  total: ${sum((r) => r.hits)} hits, ${pending} pending; ${sum((r) => r.differ)} of ${sum((r) => r.strings)} strings differ by gender`,
            `  chat:  ${sum((r) => r.hits, true)} hits; ${sum((r) => r.differ, true)} of ${sum((r) => r.strings, true)} strings differ by gender`,
          ].join('\n') + '\n',
        );
      }
    },
  );
});
