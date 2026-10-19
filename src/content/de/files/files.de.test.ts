// The German seeded files mirror English: same ids, order, folders, dates and photo specs; only
// names, text and captions are German.
import { describe, expect, it } from 'vitest';
import { lintContentStrings } from '@/content/lint';
import { GENDERS, resolveGender } from '@/content/gender';
import { getSeedFiles, rawContentFor } from '@/content/locale';
import { parseNode } from '@/os/fs/nodes';
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import type { Gender } from '@/os/types';
import { SEED_FILES as EN } from '../../files';
import { SEED_FILES, SEED_TEXT } from '.';

/** A node without its localized fields. */
const structure = (node: FsNode) => ({
  ...node,
  name: undefined,
  text: undefined,
  ...(node.photo ? { photo: { ...node.photo, caption: undefined } } : {}),
});

describe('German seeded files', () => {
  it('is what getSeedFiles returns for de', () => {
    expect(rawContentFor('de').seedFiles).toBe(SEED_FILES);
    expect(getSeedFiles('de', 'girl')).toEqual(
      resolveGender(SEED_FILES, 'girl'),
    );
    expect(getSeedFiles('de', 'boy')).toEqual(resolveGender(SEED_FILES, 'boy'));
  });

  it('has German text for every English seed and no strays', () => {
    expect(
      Object.keys(SEED_TEXT)
        .map((slug) => `seed:${slug}`)
        .sort(),
    ).toEqual(EN.map((n) => n.id).sort());
  });

  it('keeps ids, order, folders, dates and photo specs from English', () => {
    expect(SEED_FILES.map(structure)).toEqual(EN.map(structure));
  });

  it('localizes every document, picture and caption', () => {
    // Names the player gave in English on purpose; track files are shipped titles.
    const sameName = new Set(['seed:top-8-drama']);
    for (const [i, de] of SEED_FILES.entries()) {
      const en = EN[i]!;
      if (en.type === 'audio') {
        expect(de.name, de.id).toBe(en.name);
        continue;
      }
      if (!sameName.has(de.id)) expect(de.name, de.id).not.toBe(en.name);
      if (en.text !== undefined) {
        expect(de.text, de.id).toBeTruthy();
        expect(de.text, de.id).not.toBe(en.text);
      }
      if (en.photo?.caption !== undefined) {
        expect(de.photo?.caption, de.id).toBeTruthy();
        expect(de.photo?.caption, de.id).not.toBe(en.photo.caption);
      }
    }
  });

  it.each(GENDERS)(
    'has valid nodes with names unique per folder (%s)',
    (gender) => {
      const seeds = getSeedFiles('de', gender);
      for (const n of seeds) expect(parseNode(n)).toEqual(n);
      const keys = seeds.map((n) => `${n.parentId}/${n.name.toLowerCase()}`);
      expect(new Set(keys).size).toBe(keys.length);
    },
  );

  it('keeps the 4 embarrassing files in the Recycle Bin, per gender', () => {
    const bin = (gender: Gender) =>
      getSeedFiles('de', gender)
        .filter((n) => n.parentId === FS_FOLDERS.recycle)
        .map((n) => n.name)
        .sort();
    expect(bin('girl')).toEqual(
      [
        'brief_an_theo_NIE_ABSCHICKEN.txt',
        'meine_songs_fuer_tinfoil_comets.txt',
        'pony_geschichte_von_pia.txt',
        'tagebuch_mit_11.txt',
      ].sort(),
    );
    expect(bin('boy')).toEqual(
      [
        'cheatcodes.txt',
        'meine_rap_texte.txt',
        'pony_geschichte_von_pia.txt',
        'tagebuch_mit_11.txt',
      ].sort(),
    );
  });

  it('writes the girl and the boy files in German', () => {
    const text = (gender: Gender, id: string) =>
      getSeedFiles('de', gender).find((n) => n.id === id)?.text ?? '';
    const name = (gender: Gender, id: string) =>
      getSeedFiles('de', gender).find((n) => n.id === id)?.name;
    expect(name('girl', 'seed:poem-do-not-read')).toBe('geheimes gedicht.txt');
    expect(text('girl', 'seed:poem-do-not-read')).toContain(
      'deine haare machen so nen schwung',
    );
    expect(text('girl', 'seed:diary-age-11')).toContain(
      'tierärztin UND popstar',
    );
    expect(name('boy', 'seed:poem-do-not-read')).toBe(
      'meine_wrestling_einlaufrede.txt',
    );
    expect(text('boy', 'seed:poem-do-not-read')).toContain(
      'DER MODEM-MÄHDRESCHER',
    );
    expect(text('boy', 'seed:concert-packing-list')).toContain(
      '„ZIGGY WIRF NEN DRUMSTICK“',
    );
    expect(text('boy', 'seed:letter-to-theo-never-send')).toContain(
      'NICHT PIA SAGEN',
    );
    expect(text('boy', 'seed:diary-age-11')).toContain(
      'stuntman UND profi-skater',
    );
    const boy = getSeedFiles('de', 'boy')
      .map((n) => `${n.name}\n${n.text ?? ''}`)
      .join('\n');
    expect(boy).not.toMatch(/lieber theo|schwung|denkt theo|<3/i);
  });

  it('passes the German content lint', () => {
    expect(lintContentStrings(SEED_FILES, 'files', 'de')).toEqual([]);
  });
});
