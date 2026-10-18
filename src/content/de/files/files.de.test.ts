// The German seeded files mirror English: same ids, order, folders, dates and photo specs; only
// names, text and captions are German.
import { describe, expect, it } from 'vitest';
import { lintContentStrings } from '@/content/lint';
import { resolveGender } from '@/content/gender';
import { getSeedFiles, rawContentFor } from '@/content/locale';
import { parseNode } from '@/os/fs/nodes';
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
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

  it('has valid nodes with names unique per folder', () => {
    for (const n of SEED_FILES) expect(parseNode(n)).toEqual(n);
    const keys = SEED_FILES.map((n) => `${n.parentId}/${n.name.toLowerCase()}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('keeps the 4 embarrassing files in the Recycle Bin', () => {
    expect(
      SEED_FILES.filter((n) => n.parentId === FS_FOLDERS.recycle)
        .map((n) => n.name)
        .sort(),
    ).toEqual(
      [
        'brief_an_theo_NIE_ABSCHICKEN.txt',
        'meine_rap_texte.txt',
        'pony_geschichte_von_pia.txt',
        'tagebuch_mit_11.txt',
      ].sort(),
    );
  });

  it('passes the German content lint', () => {
    expect(lintContentStrings(SEED_FILES, 'files', 'de')).toEqual([]);
  });
});
