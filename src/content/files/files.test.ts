import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GENDERS } from '@/content/gender';
import { lintContentStrings } from '@/content/lint';
import { getSeedFiles } from '@/content/locale';
import { PLAYLIST } from '@/content/playlist';
import { isSystemId, parseNode, systemFolders } from '@/os/fs/nodes';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS, type PhotoScene } from '@/os/fs/types';
import { useSettingsStore } from '@/os/store/settings';
import { SEED_FILES } from './index';

const names = (
  seeds: readonly { parentId: string | null; name: string }[],
  parentId: string,
) =>
  seeds
    .filter((n) => n.parentId === parentId)
    .map((n) => n.name)
    .sort();

describe('seeded files (raw)', () => {
  it('every seed has a unique seed: id', () => {
    const ids = SEED_FILES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^seed:[a-z0-9-]+$/);
  });

  it('passes the content lint', () => {
    expect(lintContentStrings(SEED_FILES, 'files')).toEqual([]);
  });
});

describe.each(GENDERS)('seeded files for a %s', (gender) => {
  const seeds = getSeedFiles('en', gender);
  const inFolder = (parentId: string) =>
    seeds.filter((n) => n.parentId === parentId);

  it('every seed has a valid parent (a system folder or a seeded folder)', () => {
    for (const n of seeds) {
      const parent = n.parentId ?? '';
      const seededFolder = seeds.some(
        (p) => p.id === parent && p.type === 'folder',
      );
      expect(isSystemId(parent) || seededFolder, n.id).toBe(true);
      expect(parent, n.id).not.toBe(FS_FOLDERS.root);
    }
  });

  it('every seed survives node validation unchanged', () => {
    for (const n of seeds) expect(parseNode(n)).toEqual(n);
  });

  it('names are unique per folder', () => {
    const keys = seeds.map((n) => `${n.parentId}/${n.name.toLowerCase()}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('ships at least 8 docs, all 6 photo scenes and 2 tracks', () => {
    const docs = inFolder(FS_FOLDERS.docs);
    expect(docs.length).toBeGreaterThanOrEqual(8);
    for (const d of docs) expect(d.text?.length, d.id).toBeGreaterThan(0);

    const pics = inFolder(FS_FOLDERS.pics);
    const scenes: PhotoScene[] = [
      'camp',
      'pet',
      'trip',
      'party',
      'beach',
      'selfportrait',
    ];
    expect(pics.map((p) => p.photo?.scene).sort()).toEqual([...scenes].sort());

    const music = inFolder(FS_FOLDERS.music);
    expect(music).toHaveLength(2);
    const trackIds = PLAYLIST.map((t) => t.id);
    for (const m of music) expect(trackIds).toContain(m.trackId);
  });

  it('puts 4 embarrassing files in the Recycle Bin, deleted from My Documents', () => {
    const bin = inFolder(FS_FOLDERS.recycle);
    expect(bin).toHaveLength(4);
    for (const n of bin) expect(n.deletedFrom).toBe(FS_FOLDERS.docs);
  });

  it('shares the school and system files, Pia’s fanfic and the band notebook', () => {
    const girl = getSeedFiles('en', 'girl');
    const shared = [
      'seed:song-lyrics-notebook',
      'seed:pony-fanfic-by-pia',
      'seed:bio-project-draft',
      'seed:homework-maths',
    ];
    for (const id of shared)
      expect(
        seeds.find((n) => n.id === id),
        id,
      ).toEqual(girl.find((n) => n.id === id));
  });
});

describe('the girl and the boy have their own files', () => {
  const girl = getSeedFiles('en', 'girl');
  const boy = getSeedFiles('en', 'boy');
  const text = (seeds: typeof girl, id: string) =>
    seeds.find((n) => n.id === id)?.text ?? '';

  it('names the personal files per gender', () => {
    const shared = names(girl, FS_FOLDERS.docs).filter((n) =>
      names(boy, FS_FOLDERS.docs).includes(n),
    );
    expect(names(girl, FS_FOLDERS.docs)).toEqual(
      [...shared, 'poem_DO_NOT_READ.txt', 'top 8 drama.txt'].sort(),
    );
    expect(names(boy, FS_FOLDERS.docs)).toEqual(
      [
        ...shared,
        'my_wrestling_entrance_speech.txt',
        'top 8 (FINAL final).txt',
      ].sort(),
    );
    expect(shared).toContain('concert_packing_list.txt');
    expect(names(girl, FS_FOLDERS.recycle)).toEqual(
      [
        'diary_age_11.txt',
        'letter_to_theo_NEVER_SEND.txt',
        'pony_fanfic_by_pia.txt',
        'songs_i_wrote_4_tinfoil_comets.txt',
      ].sort(),
    );
    expect(names(boy, FS_FOLDERS.recycle)).toEqual(
      [
        'cheat_codes.txt',
        'diary_age_11.txt',
        'my_rap_lyrics.txt',
        'pony_fanfic_by_pia.txt',
      ].sort(),
    );
  });

  it('gives the girl the crush on Theo and girly 2007', () => {
    expect(text(girl, 'seed:poem-do-not-read')).toContain(
      'your hair does a little swoosh thing',
    );
    expect(text(girl, 'seed:top-8-drama')).toContain(
      'will theo think something??',
    );
    expect(text(girl, 'seed:concert-packing-list')).toContain('hair clips');
    expect(text(girl, 'seed:letter-to-theo-never-send')).toMatch(/^dear theo/);
    expect(text(girl, 'seed:diary-age-11')).toMatch(
      /horses[\s\S]*veterinarian AND a pop star[\s\S]*jess and i/,
    );
  });

  it('gives the boy boyish 2007 and no crush anywhere', () => {
    expect(text(boy, 'seed:poem-do-not-read')).toContain('THE MODEM MAULER');
    expect(text(boy, 'seed:top-8-drama')).toContain('DEX VS MARCO');
    expect(text(boy, 'seed:concert-packing-list')).toMatch(
      /hair gel \(jess says spikes[\s\S]*earplugs \(marco said|earplugs \(marco said[\s\S]*hair gel \(jess says spikes/,
    );
    expect(text(boy, 'seed:concert-packing-list')).toContain(
      '"ZIGGY THROW A DRUMSTICK"',
    );
    expect(text(boy, 'seed:letter-to-theo-never-send')).toContain(
      'DONT TELL PIA',
    );
    expect(text(boy, 'seed:my-rap-lyrics')).toContain('MC MEGABYTE');
    expect(text(boy, 'seed:diary-age-11')).toMatch(
      /stunt man AND a pro skater[\s\S]*dex and i made a secret club/,
    );
    const all = boy.map((n) => `${n.name}\n${n.text ?? ''}`).join('\n');
    expect(all).not.toMatch(/dear theo|swoosh|will theo|crush|<3/i);
  });

  it('keeps the concert facts the same for both', () => {
    for (const fact of [
      'with JESS!!! (she has 2 tickets!!!)',
      'disposable camera (27 pics',
      '$20 for a t-shirt',
    ]) {
      expect(text(girl, 'seed:concert-packing-list')).toContain(fact);
      expect(text(boy, 'seed:concert-packing-list')).toContain(fact);
    }
  });

  it('gives the self-portrait long hair for a girl and short hair for a boy', () => {
    const photo = (seeds: typeof girl) =>
      seeds.find((n) => n.id === 'seed:me-webcam-test')?.photo;
    expect(photo(girl)).toMatchObject({ scene: 'selfportrait', look: 'long' });
    expect(photo(boy)).toMatchObject({ scene: 'selfportrait', look: 'short' });
  });
});

describe('seeding the fs store', () => {
  beforeEach(() => {
    localStorage.clear();
    useFsStore.setState({ nodes: systemFolders(0), purgedSeeds: [] });
  });
  afterEach(() => {
    useSettingsStore.setState({ language: 'en', gender: 'girl' });
  });

  const fs = () => useFsStore.getState();
  const setGender = (gender: 'girl' | 'boy') =>
    act(() => useSettingsStore.getState().setGender(gender));

  it('adds every seed with its own name', () => {
    const seeds = getSeedFiles('en', 'girl');
    fs().seed(seeds);
    for (const n of seeds) expect(fs().get(n.id)).toEqual(n);
  });

  it('keeps a purged seed purged on the next start', () => {
    const seeds = getSeedFiles('en', 'girl');
    fs().seed(seeds);
    fs().purge('seed:diary-age-11');
    fs().seed(seeds);
    expect(fs().get('seed:diary-age-11')).toBeUndefined();
    expect(fs().list(FS_FOLDERS.recycle)).toHaveLength(3);
  });

  it('a gender switch swaps untouched files only', () => {
    fs().seed(getSeedFiles('en', 'girl'));
    fs().writeText('seed:top-8-drama', 'my own top 8');
    setGender('boy');
    expect(fs().get('seed:poem-do-not-read')?.name).toBe(
      'my_wrestling_entrance_speech.txt',
    );
    expect(fs().get('seed:me-webcam-test')?.photo?.look).toBe('short');
    expect(fs().get('seed:top-8-drama')).toMatchObject({
      name: 'top 8 drama.txt',
      text: 'my own top 8',
      dirty: true,
    });
    // Saves keep references only: no gendered name, text or look of an untouched seed.
    const saved = localStorage.getItem('still-online:v1:fs') ?? '';
    expect(saved).not.toMatch(/wrestling|"look"/);
    setGender('girl');
    expect(fs().get('seed:poem-do-not-read')?.name).toBe(
      'poem_DO_NOT_READ.txt',
    );
    expect(fs().get('seed:me-webcam-test')?.photo?.look).toBe('long');
  });

  it('restores a boy’s file from the Recycle Bin to My Documents', () => {
    setGender('boy');
    fs().seed(getSeedFiles('en', 'boy'));
    fs().restore('seed:letter-to-theo-never-send');
    expect(fs().get('seed:letter-to-theo-never-send')).toMatchObject({
      parentId: FS_FOLDERS.docs,
      name: 'cheat_codes.txt',
    });
    expect(fs().get('seed:letter-to-theo-never-send')?.dirty).toBeFalsy();
    // Restored but untouched, it still follows the gender.
    setGender('girl');
    expect(fs().get('seed:letter-to-theo-never-send')).toMatchObject({
      parentId: FS_FOLDERS.docs,
      name: 'letter_to_theo_NEVER_SEND.txt',
    });
  });
});
