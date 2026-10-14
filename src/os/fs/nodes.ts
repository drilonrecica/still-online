// Pure helpers for the virtual file system: validation, naming, tree walks and sanitize.
// The store (`store.ts`) stays a thin layer of actions over these.
import { isRecord } from '@/os/persist';
import {
  FS_FOLDERS,
  type FsNode,
  type FsState,
  type FsType,
  type PhotoScene,
  type PhotoSpec,
} from './types';

type Nodes = Record<string, FsNode>;

const FS_TYPES: readonly FsType[] = ['folder', 'txt', 'image', 'audio', 'link'];
const SCENES: readonly PhotoScene[] = [
  'camp',
  'pet',
  'trip',
  'party',
  'beach',
  'snow',
  'concert',
  'selfportrait',
];

/** The always-present folders, in creation order (parents first). */
const SYSTEM_FOLDERS: readonly {
  id: string;
  parentId: string | null;
  name: string;
}[] = [
  { id: FS_FOLDERS.root, parentId: null, name: 'My Computer' },
  { id: FS_FOLDERS.docs, parentId: FS_FOLDERS.root, name: 'My Documents' },
  { id: FS_FOLDERS.pics, parentId: FS_FOLDERS.docs, name: 'My Pictures' },
  { id: FS_FOLDERS.music, parentId: FS_FOLDERS.docs, name: 'My Music' },
  { id: FS_FOLDERS.recycle, parentId: FS_FOLDERS.root, name: 'Recycle Bin' },
];

export const isSystemId = (id: string): boolean =>
  SYSTEM_FOLDERS.some((f) => f.id === id);

export const isSeedId = (id: string): boolean => id.startsWith('seed:');

/** Fresh system folders stamped with `time`. */
export function systemFolders(time: number): Nodes {
  const nodes: Nodes = {};
  for (const f of SYSTEM_FOLDERS) {
    nodes[f.id] = {
      ...f,
      type: 'folder',
      createdAt: time,
      modifiedAt: time,
      system: true,
    };
  }
  return nodes;
}

/** Folders first, then by name (case-insensitive). */
export function compareNodes(a: FsNode, b: FsNode): number {
  if ((a.type === 'folder') !== (b.type === 'folder')) {
    return a.type === 'folder' ? -1 : 1;
  }
  const byName = a.name.localeCompare(b.name, undefined, {
    sensitivity: 'base',
    numeric: true,
  });
  return byName !== 0 ? byName : a.id.localeCompare(b.id);
}

/**
 * A usable file name: trimmed, without the characters Windows refuses (`\ / : * ? " < > |`).
 * Null when nothing is left.
 */
export function cleanName(name: string): string | null {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '').trim();
  return cleaned ? cleaned.slice(0, 120) : null;
}

/** `photo.jpg` → `['photo', '.jpg']`; folders and dot-files have no extension. */
function splitExt(name: string, type: FsType): [string, string] {
  const dot = name.lastIndexOf('.');
  if (type === 'folder' || dot <= 0) return [name, ''];
  return [name.slice(0, dot), name.slice(dot)];
}

/** `name`, or `name (2).ext`, `name (3).ext`, … — unique among `parentId`'s other children. */
export function uniqueName(
  nodes: Nodes,
  parentId: string,
  name: string,
  type: FsType,
  exceptId?: string,
): string {
  const taken = new Set(
    Object.values(nodes)
      .filter((n) => n.parentId === parentId && n.id !== exceptId)
      .map((n) => n.name.toLowerCase()),
  );
  if (!taken.has(name.toLowerCase())) return name;
  const [base, ext] = splitExt(name, type);
  for (let i = 2; ; i++) {
    const candidate = `${base} (${i})${ext}`;
    if (!taken.has(candidate.toLowerCase())) return candidate;
  }
}

/** `id` and everything below it. */
export function subtreeIds(nodes: Nodes, id: string): string[] {
  const out: string[] = [];
  const stack = [id];
  while (stack.length) {
    const current = stack.pop() as string;
    if (!nodes[current]) continue;
    out.push(current);
    for (const n of Object.values(nodes)) {
      if (n.parentId === current) stack.push(n.id);
    }
  }
  return out;
}

/** True when `id` is the Recycle Bin or somewhere inside it. */
export function isInRecycle(nodes: Nodes, id: string): boolean {
  const seen = new Set<string>();
  let current: string | null | undefined = id;
  while (current && !seen.has(current)) {
    if (current === FS_FOLDERS.recycle) return true;
    seen.add(current);
    current = nodes[current]?.parentId;
  }
  return false;
}

/** `My Documents\My Pictures\camp.jpg`; the root is left out except for the root itself. */
export function pathOf(nodes: Nodes, id: string): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  let node = nodes[id];
  while (node && !seen.has(node.id)) {
    if (node.id === FS_FOLDERS.root) {
      if (parts.length === 0) parts.push(node.name);
      break;
    }
    seen.add(node.id);
    parts.unshift(node.name);
    node = node.parentId === null ? undefined : nodes[node.parentId];
  }
  return parts.join('\\');
}

const finite = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);
const optString = (v: unknown): string | undefined =>
  typeof v === 'string' ? v : undefined;

function parsePhoto(v: unknown): PhotoSpec | undefined {
  if (
    !isRecord(v) ||
    !SCENES.includes(v.scene as PhotoScene) ||
    !finite(v.seed)
  ) {
    return undefined;
  }
  const photo: PhotoSpec = { scene: v.scene as PhotoScene, seed: v.seed };
  if (typeof v.caption === 'string') photo.caption = v.caption;
  return photo;
}

/** Validates one untrusted node; null when it's unusable. Unknown or mistyped extras are dropped. */
export function parseNode(v: unknown): FsNode | null {
  if (!isRecord(v)) return null;
  const { id, parentId, name, type, createdAt, modifiedAt } = v;
  if (typeof id !== 'string' || !id) return null;
  if (typeof parentId !== 'string' || !parentId) return null;
  if (typeof name !== 'string' || !cleanName(name)) return null;
  if (!FS_TYPES.includes(type as FsType)) return null;
  if (!finite(createdAt) || !finite(modifiedAt)) return null;
  const node: FsNode = {
    id,
    parentId,
    name,
    type: type as FsType,
    createdAt,
    modifiedAt,
  };
  const extras = {
    text: optString(v.text),
    photo: parsePhoto(v.photo),
    blobKey: optString(v.blobKey),
    trackId: optString(v.trackId),
    url: optString(v.url),
    deletedFrom: optString(v.deletedFrom),
  };
  for (const [key, value] of Object.entries(extras)) {
    if (value !== undefined) Object.assign(node, { [key]: value });
  }
  return node;
}

/**
 * Drops nodes that don't hang off `root` through folders (orphans, cycles, children of files)
 * and repairs Recycle Bin bookkeeping. Mutates and returns `nodes`.
 */
export function pruneTree(nodes: Nodes): Nodes {
  const reachable = new Set<string>([FS_FOLDERS.root]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const n of Object.values(nodes)) {
      if (reachable.has(n.id) || n.parentId === null) continue;
      const parent = nodes[n.parentId];
      if (parent?.type === 'folder' && reachable.has(parent.id)) {
        reachable.add(n.id);
        grew = true;
      }
    }
  }
  for (const id of Object.keys(nodes)) {
    const node = nodes[id];
    if (!node) continue;
    if (!reachable.has(id)) {
      delete nodes[id];
    } else if (node.parentId === FS_FOLDERS.recycle) {
      node.deletedFrom ??= FS_FOLDERS.docs;
    } else if (node.deletedFrom !== undefined) {
      delete node.deletedFrom;
    }
  }
  return nodes;
}

/** Builds the fs state from untrusted persisted data; system folders always come back. */
export function sanitizeFsState(persisted: unknown, time: number): FsState {
  const nodes = systemFolders(time);
  const p = isRecord(persisted) ? persisted : {};
  if (isRecord(p.nodes)) {
    for (const raw of Object.values(p.nodes)) {
      const node = parseNode(raw);
      if (!node) continue;
      const system = nodes[node.id];
      if (system?.system) {
        // Keep the timestamps, force the structure.
        system.createdAt = node.createdAt;
        system.modifiedAt = node.modifiedAt;
      } else if (!nodes[node.id]) {
        nodes[node.id] = node;
      }
    }
  }
  const purgedSeeds = Array.isArray(p.purgedSeeds)
    ? [
        ...new Set(
          p.purgedSeeds.filter((s): s is string => typeof s === 'string'),
        ),
      ]
    : [];
  return { nodes: pruneTree(nodes), purgedSeeds };
}
