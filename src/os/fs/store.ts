// Virtual file system store. Persisted under `still-online:v1:fs`.
// See docs/architecture-v0.2.md → "File system".
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { deleteBlob } from '@/os/blobStore';
import { events } from '@/os/events';
import { persistOptions } from '@/os/persist';
import {
  cleanName,
  compareNodes,
  isInRecycle,
  isSeedId,
  isSystemId,
  parseNode,
  pathOf,
  pruneTree,
  sanitizeFsState,
  subtreeIds,
  systemFolders,
  uniqueName,
} from './nodes';
import { FS_FOLDERS, type FsNode, type FsState, type FsStore } from './types';

function newFileId(): string {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  return `f:${id}`;
}

function changed(ids: string[]): void {
  if (ids.length) events.emit('fs:changed', { ids });
}

/** Deletes blobs in the background; a failure only leaks bytes, never breaks the fs. */
function dropBlobs(nodes: FsNode[]): void {
  for (const n of nodes) {
    if (n.blobKey) {
      deleteBlob(n.blobKey).catch((e: unknown) =>
        console.warn('still-online: could not delete blob', n.blobKey, e),
      );
    }
  }
}

export const useFsStore = create<FsStore>()(
  persist(
    (set, get) => {
      /** Removes the subtrees of `ids` for good. Returns the removed ids. */
      function purgeAll(ids: string[]): string[] {
        const { nodes, purgedSeeds } = get();
        const doomed = [
          ...new Set(
            ids
              .filter((id) => !isSystemId(id))
              .flatMap((id) => subtreeIds(nodes, id)),
          ),
        ];
        if (!doomed.length) return [];
        const next = { ...nodes };
        doomed.forEach((id) => delete next[id]);
        const seeds = doomed.filter(
          (id) => isSeedId(id) && !purgedSeeds.includes(id),
        );
        set({ nodes: next, purgedSeeds: [...purgedSeeds, ...seeds] });
        dropBlobs(doomed.flatMap((id) => nodes[id] ?? []));
        return doomed;
      }

      /** Applies `patch` to an existing node and stamps `modifiedAt`. */
      function update(id: string, patch: Partial<FsNode>): void {
        const node = get().nodes[id];
        if (!node) return;
        set({
          nodes: {
            ...get().nodes,
            [id]: { ...node, ...patch, modifiedAt: Date.now() },
          },
        });
        changed([id]);
      }

      return {
        nodes: systemFolders(Date.now()),
        purgedSeeds: [],

        list: (parentId) =>
          Object.values(get().nodes)
            .filter((n) => n.parentId === parentId)
            .sort(compareNodes),

        get: (id) => get().nodes[id],

        path: (id) => pathOf(get().nodes, id),

        createFile: (parentId, file) => {
          const { nodes } = get();
          if (nodes[parentId]?.type !== 'folder') {
            throw new Error(`fs: no folder "${parentId}"`);
          }
          const fallback = file.type === 'folder' ? 'New Folder' : 'New File';
          const id = newFileId();
          const time = Date.now();
          const node: FsNode = {
            ...file,
            id,
            parentId,
            name: uniqueName(
              nodes,
              parentId,
              cleanName(file.name) ?? fallback,
              file.type,
            ),
            createdAt: time,
            modifiedAt: time,
          };
          set({ nodes: { ...nodes, [id]: node } });
          changed([id]);
          return id;
        },

        writeText: (id, text) => {
          if (get().nodes[id]?.type === 'txt') update(id, { text });
        },

        rename: (id, name) => {
          const node = get().nodes[id];
          const cleaned = cleanName(name);
          if (!node || node.system || !cleaned || cleaned === node.name) return;
          const parent = node.parentId ?? FS_FOLDERS.root;
          update(id, {
            name: uniqueName(get().nodes, parent, cleaned, node.type, id),
          });
        },

        remove: (id) => {
          const node = get().nodes[id];
          if (!node || node.system || node.parentId === FS_FOLDERS.recycle)
            return;
          // Only the top node moves; its children keep their parent and travel with it.
          set({
            nodes: {
              ...get().nodes,
              [id]: {
                ...node,
                parentId: FS_FOLDERS.recycle,
                deletedFrom: node.parentId ?? FS_FOLDERS.docs,
              },
            },
          });
          changed([id]);
        },

        restore: (id) => {
          const { nodes } = get();
          const node = nodes[id];
          if (!node || node.parentId !== FS_FOLDERS.recycle) return;
          const from = node.deletedFrom ? nodes[node.deletedFrom] : undefined;
          const target =
            from?.type === 'folder' && !isInRecycle(nodes, from.id)
              ? from.id
              : FS_FOLDERS.docs;
          const restored: FsNode = {
            ...node,
            parentId: target,
            name: uniqueName(nodes, target, node.name, node.type, id),
          };
          delete restored.deletedFrom;
          set({ nodes: { ...nodes, [id]: restored } });
          changed([id]);
        },

        purge: (id) => changed(purgeAll([id])),

        emptyRecycleBin: () =>
          changed(
            purgeAll(
              get()
                .list(FS_FOLDERS.recycle)
                .map((n) => n.id),
            ),
          ),

        seed: (seeds) => {
          const { nodes, purgedSeeds } = get();
          const next = { ...nodes };
          const candidates = seeds
            .map(parseNode)
            .filter(
              (n): n is FsNode =>
                !!n &&
                !next[n.id] &&
                !isSystemId(n.id) &&
                !purgedSeeds.includes(n.id),
            );
          for (const n of candidates) next[n.id] = n;
          // Seeds under a purged or missing parent are dropped with the rest of the orphans.
          pruneTree(next);
          const added = candidates.filter((n) => next[n.id]);
          for (const n of added) {
            if (n.parentId === null) continue;
            next[n.id] = {
              ...n,
              name: uniqueName(next, n.parentId, n.name, n.type, n.id),
            };
          }
          if (!added.length) return;
          set({ nodes: next });
          changed(added.map((n) => n.id));
        },
      };
    },
    persistOptions<FsStore, FsState>({
      name: 'fs',
      partialize: ({ nodes, purgedSeeds }) => ({ nodes, purgedSeeds }),
      sanitize: (persisted, current) => ({
        ...current,
        ...sanitizeFsState(persisted, Date.now()),
      }),
    }),
  ),
);
