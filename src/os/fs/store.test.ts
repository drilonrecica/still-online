import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteBlob } from '@/os/blobStore';
import { events } from '@/os/events';
import { storageKey } from '@/os/persist';
import { systemFolders } from './nodes';
import { useFsStore } from './store';
import type { FsNode } from './types';

vi.mock('@/os/blobStore', () => ({
  deleteBlob: vi.fn(() => Promise.resolve()),
}));

const fs = () => useFsStore.getState();
const T = 1_000;

function seedNode(slug: string, patch: Partial<FsNode> = {}): FsNode {
  return {
    id: `seed:${slug}`,
    parentId: 'docs',
    name: `${slug}.txt`,
    type: 'txt',
    createdAt: T,
    modifiedAt: T,
    text: slug,
    ...patch,
  };
}

let changes: string[][] = [];
let off: () => void;

beforeEach(() => {
  localStorage.clear();
  useFsStore.setState({ nodes: systemFolders(T), purgedSeeds: [] });
  vi.mocked(deleteBlob).mockClear();
  changes = [];
  off = events.on('fs:changed', ({ ids }) => changes.push(ids));
});

afterEach(() => off());

describe('fs store: reading', () => {
  it('starts with the system folders', () => {
    expect(
      fs()
        .list('root')
        .map((n) => n.id),
    ).toEqual(['docs', 'recycle']);
    expect(
      fs()
        .list('docs')
        .map((n) => n.name),
    ).toEqual(['My Music', 'My Pictures']);
    expect(fs().get('pics')).toMatchObject({ system: true, type: 'folder' });
    expect(fs().get('nope')).toBeUndefined();
  });

  it('lists folders first, then by name case-insensitively', () => {
    fs().createFile('docs', { name: 'b.txt', type: 'txt' });
    fs().createFile('docs', { name: 'A.txt', type: 'txt' });
    fs().createFile('docs', { name: 'zz', type: 'folder' });
    expect(
      fs()
        .list('docs')
        .map((n) => n.name),
    ).toEqual(['My Music', 'My Pictures', 'zz', 'A.txt', 'b.txt']);
  });

  it('builds Windows-style paths below root', () => {
    const id = fs().createFile('pics', { name: 'camp.jpg', type: 'image' });
    expect(fs().path(id)).toBe('My Documents\\My Pictures\\camp.jpg');
    expect(fs().path('docs')).toBe('My Documents');
    expect(fs().path('root')).toBe('My Computer');
    expect(fs().path('missing')).toBe('');
  });
});

describe('fs store: writing', () => {
  it('creates files with f: ids, timestamps and an fs:changed event', () => {
    const id = fs().createFile('docs', {
      name: 'notes.txt',
      type: 'txt',
      text: 'hi',
    });
    expect(id).toMatch(/^f:/);
    expect(fs().get(id)).toMatchObject({
      parentId: 'docs',
      name: 'notes.txt',
      text: 'hi',
    });
    expect(fs().get(id)?.createdAt).toBeGreaterThan(0);
    expect(changes).toEqual([[id]]);
  });

  it('makes clashing names unique, keeping the extension', () => {
    const name = (id: string) => fs().get(id)?.name;
    const a = fs().createFile('docs', { name: 'bio.txt', type: 'txt' });
    const b = fs().createFile('docs', { name: 'BIO.txt', type: 'txt' });
    const c = fs().createFile('docs', { name: 'bio.txt', type: 'txt' });
    const d = fs().createFile('docs', { name: 'My Music', type: 'folder' });
    const e = fs().createFile('pics', { name: 'bio.txt', type: 'txt' });
    expect([a, b, c, d, e].map(name)).toEqual([
      'bio.txt',
      'BIO (2).txt',
      'bio (3).txt',
      'My Music (2)',
      'bio.txt',
    ]);
  });

  it('cleans names and refuses parents that are not folders', () => {
    const id = fs().createFile('docs', { name: ' a/b?.txt ', type: 'txt' });
    expect(fs().get(id)?.name).toBe('ab.txt');
    expect(
      fs().get(fs().createFile('docs', { name: '???', type: 'folder' }))?.name,
    ).toBe('New Folder');
    expect(() => fs().createFile(id, { name: 'x.txt', type: 'txt' })).toThrow();
    expect(() =>
      fs().createFile('missing', { name: 'x.txt', type: 'txt' }),
    ).toThrow();
  });

  it('writes text to txt files only and bumps modifiedAt', () => {
    const id = fs().createFile('docs', { name: 'a.txt', type: 'txt' });
    useFsStore.setState({
      nodes: { ...fs().nodes, [id]: { ...fs().nodes[id]!, modifiedAt: 1 } },
    });
    changes = [];
    fs().writeText(id, 'hello');
    expect(fs().get(id)).toMatchObject({ text: 'hello' });
    expect(fs().get(id)!.modifiedAt).toBeGreaterThan(1);
    fs().writeText('pics', 'nope');
    expect(fs().get('pics')?.text).toBeUndefined();
    expect(changes).toEqual([[id]]);
  });

  it('points images at new blob bytes, dropping the old blob or photo', () => {
    const id = fs().createFile('pics', {
      name: 'a.png',
      type: 'image',
      photo: { scene: 'pet', seed: 1 },
    });
    changes = [];
    fs().writeImage(id, 'blob:1');
    expect(fs().get(id)).toMatchObject({ blobKey: 'blob:1' });
    expect(fs().get(id)?.photo).toBeUndefined();
    fs().writeImage(id, 'blob:2');
    expect(fs().get(id)?.blobKey).toBe('blob:2');
    expect(deleteBlob).toHaveBeenCalledWith('blob:1');
    const txt = fs().createFile('docs', { name: 'b.txt', type: 'txt' });
    fs().writeImage(txt, 'blob:3');
    expect(fs().get(txt)?.blobKey).toBeUndefined();
    expect(changes).toEqual([[id], [id], [txt]]);
  });

  it('renames uniquely, allows case changes, refuses system folders and empty names', () => {
    const a = fs().createFile('docs', { name: 'a.txt', type: 'txt' });
    const b = fs().createFile('docs', { name: 'b.txt', type: 'txt' });
    fs().rename(b, 'A.txt');
    expect(fs().get(b)?.name).toBe('A (2).txt');
    fs().rename(a, 'A.txt');
    expect(fs().get(a)?.name).toBe('A.txt');
    fs().rename(a, '  ');
    expect(fs().get(a)?.name).toBe('A.txt');
    fs().rename('docs', 'Stuff');
    expect(fs().get('docs')?.name).toBe('My Documents');
  });
});

describe('fs store: Recycle Bin', () => {
  it('delete → restore → purge round-trip', () => {
    const folder = fs().createFile('docs', { name: 'school', type: 'folder' });
    const file = fs().createFile(folder, { name: 'bio.txt', type: 'txt' });

    fs().remove(folder);
    expect(fs().get(folder)).toMatchObject({
      parentId: 'recycle',
      deletedFrom: 'docs',
    });
    expect(fs().get(file)?.parentId).toBe(folder);
    expect(fs().path(file)).toBe('Recycle Bin\\school\\bio.txt');
    expect(
      fs()
        .list('docs')
        .map((n) => n.id),
    ).not.toContain(folder);

    fs().restore(folder);
    expect(fs().get(folder)?.parentId).toBe('docs');
    expect(fs().get(folder)?.deletedFrom).toBeUndefined();

    fs().remove(folder);
    changes = [];
    fs().purge(folder);
    expect(fs().get(folder)).toBeUndefined();
    expect(fs().get(file)).toBeUndefined();
    expect(changes[0]?.sort()).toEqual([file, folder].sort());
  });

  it('never removes system folders and ignores items already in the bin', () => {
    fs().remove('pics');
    fs().purge('docs');
    expect(fs().get('pics')?.parentId).toBe('docs');
    expect(fs().get('docs')).toBeDefined();
    const id = fs().createFile('docs', { name: 'a.txt', type: 'txt' });
    fs().remove(id);
    fs().remove(id);
    expect(fs().get(id)?.deletedFrom).toBe('docs');
  });

  it('restores to My Documents when the old folder is gone, with a unique name', () => {
    const folder = fs().createFile('docs', { name: 'old', type: 'folder' });
    const file = fs().createFile(folder, { name: 'a.txt', type: 'txt' });
    fs().remove(file);
    fs().remove(folder);
    fs().createFile('docs', { name: 'a.txt', type: 'txt' });
    fs().restore(file);
    expect(fs().get(file)).toMatchObject({
      parentId: 'docs',
      name: 'a (2).txt',
    });
    fs().restore('docs');
    expect(fs().get('docs')?.parentId).toBe('root');
  });

  it('purging deletes blobs and remembers purged seeds', () => {
    const id = fs().createFile('pics', {
      name: 'me.png',
      type: 'image',
      blobKey: 'blob:1',
    });
    fs().seed([seedNode('diary')]);
    fs().remove(id);
    fs().remove('seed:diary');
    fs().emptyRecycleBin();
    expect(deleteBlob).toHaveBeenCalledWith('blob:1');
    expect(fs().list('recycle')).toEqual([]);
    expect(fs().purgedSeeds).toEqual(['seed:diary']);
  });

  it('empties the bin in one fs:changed event and stays quiet when empty', () => {
    const a = fs().createFile('docs', { name: 'a.txt', type: 'txt' });
    const b = fs().createFile('docs', { name: 'b.txt', type: 'txt' });
    fs().remove(a);
    fs().remove(b);
    changes = [];
    fs().emptyRecycleBin();
    fs().emptyRecycleBin();
    expect(changes).toHaveLength(1);
    expect(changes[0]?.sort()).toEqual([a, b].sort());
    expect(fs().get('recycle')).toBeDefined();
  });
});

describe('fs store: seeding', () => {
  it('adds missing seeds and leaves the player edits alone', () => {
    fs().seed([seedNode('a'), seedNode('b')]);
    expect(changes).toEqual([['seed:a', 'seed:b']]);
    fs().writeText('seed:a', 'edited');
    fs().rename('seed:b', 'renamed.txt');
    changes = [];
    fs().seed([seedNode('a'), seedNode('b')]);
    expect(changes).toEqual([]);
    expect(fs().get('seed:a')?.text).toBe('edited');
    expect(fs().get('seed:b')?.name).toBe('renamed.txt');
  });

  it('does not resurrect purged seeds or their children', () => {
    const folder = seedNode('photos', {
      type: 'folder',
      name: 'photos',
      text: undefined,
    });
    const child = seedNode('pic', {
      parentId: 'seed:photos',
      name: 'p.jpg',
      type: 'image',
    });
    fs().seed([folder, child]);
    fs().remove('seed:photos');
    fs().purge('seed:photos');
    expect(fs().purgedSeeds.sort()).toEqual(['seed:photos', 'seed:pic']);
    fs().seed([folder, child]);
    expect(fs().get('seed:photos')).toBeUndefined();
    expect(fs().get('seed:pic')).toBeUndefined();
  });

  it('keeps a seed that is sitting in the Recycle Bin there', () => {
    fs().seed([seedNode('a')]);
    fs().remove('seed:a');
    fs().seed([seedNode('a')]);
    expect(fs().get('seed:a')?.parentId).toBe('recycle');
  });

  it('skips invalid, system and orphan seeds and makes names unique', () => {
    fs().createFile('docs', { name: 'clash.txt', type: 'txt' });
    fs().seed([
      seedNode('clash'),
      seedNode('orphan', { parentId: 'seed:nowhere' }),
      { ...seedNode('docs'), id: 'docs' },
      { id: 'seed:bad' } as FsNode,
    ]);
    expect(fs().get('seed:clash')?.name).toBe('clash (2).txt');
    expect(fs().get('seed:orphan')).toBeUndefined();
    expect(fs().get('seed:bad')).toBeUndefined();
    expect(fs().get('docs')?.name).toBe('My Documents');
  });
});

describe('fs store: persistence', () => {
  const rehydrate = async (raw: string) => {
    localStorage.setItem(storageKey('fs'), raw);
    await useFsStore.persist.rehydrate();
  };

  it('round-trips through localStorage', async () => {
    const id = fs().createFile('docs', {
      name: 'keep.txt',
      type: 'txt',
      text: 'x',
    });
    fs().seed([seedNode('gone')]);
    fs().purge('seed:gone');
    const raw = localStorage.getItem(storageKey('fs'))!;
    useFsStore.setState({ nodes: systemFolders(T), purgedSeeds: [] });
    await rehydrate(raw);
    expect(fs().get(id)?.text).toBe('x');
    expect(fs().purgedSeeds).toEqual(['seed:gone']);
  });

  it('survives garbage and recreates the system folders', async () => {
    await rehydrate('{not json');
    expect(
      fs()
        .list('root')
        .map((n) => n.id),
    ).toEqual(['docs', 'recycle']);
    await rehydrate(
      JSON.stringify({ state: { nodes: 5, purgedSeeds: 'x' }, version: 1 }),
    );
    expect(fs().get('pics')).toBeDefined();
    expect(fs().purgedSeeds).toEqual([]);
  });
});
