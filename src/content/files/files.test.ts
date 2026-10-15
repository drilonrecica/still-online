import { beforeEach, describe, expect, it } from 'vitest';
import { lintContentStrings } from '@/content/lint';
import { PLAYLIST } from '@/content/playlist';
import { isSystemId, parseNode, systemFolders } from '@/os/fs/nodes';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS, type PhotoScene } from '@/os/fs/types';
import { SEED_FILES } from './index';

const ids = SEED_FILES.map((n) => n.id);
const inFolder = (parentId: string) =>
  SEED_FILES.filter((n) => n.parentId === parentId);

describe('seeded files', () => {
  it('every seed has a unique seed: id', () => {
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^seed:[a-z0-9-]+$/);
  });

  it('every seed has a valid parent (a system folder or a seeded folder)', () => {
    for (const n of SEED_FILES) {
      const parent = n.parentId ?? '';
      const seededFolder = SEED_FILES.some(
        (p) => p.id === parent && p.type === 'folder',
      );
      expect(isSystemId(parent) || seededFolder, n.id).toBe(true);
      expect(parent, n.id).not.toBe(FS_FOLDERS.root);
    }
  });

  it('every seed survives node validation unchanged', () => {
    for (const n of SEED_FILES) expect(parseNode(n)).toEqual(n);
  });

  it('names are unique per folder', () => {
    const keys = SEED_FILES.map((n) => `${n.parentId}/${n.name.toLowerCase()}`);
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
    expect(bin.map((n) => n.name).sort()).toEqual(
      [
        'diary_age_11.txt',
        'letter_to_theo_NEVER_SEND.txt',
        'my_rap_lyrics.txt',
        'pony_fanfic_by_pia.txt',
      ].sort(),
    );
    for (const n of bin) expect(n.deletedFrom).toBe(FS_FOLDERS.docs);
  });

  it('passes the content lint', () => {
    expect(lintContentStrings(SEED_FILES, 'files')).toEqual([]);
  });
});

describe('seeding the fs store', () => {
  beforeEach(() => {
    useFsStore.setState({ nodes: systemFolders(0), purgedSeeds: [] });
  });

  it('adds every seed with its own name', () => {
    useFsStore.getState().seed(SEED_FILES);
    const fs = useFsStore.getState();
    for (const n of SEED_FILES) expect(fs.get(n.id)).toEqual(n);
  });

  it('keeps a purged seed purged on the next start', () => {
    const fs = () => useFsStore.getState();
    fs().seed(SEED_FILES);
    fs().purge('seed:diary-age-11');
    fs().seed(SEED_FILES);
    expect(fs().get('seed:diary-age-11')).toBeUndefined();
    expect(fs().list(FS_FOLDERS.recycle)).toHaveLength(3);
  });
});
