// Seeds the persisted fs store with a few user files before any app script runs.
import type { Page } from '@playwright/test';

const FS_KEY = 'still-online:v1:fs';

const NOW = Date.UTC(2007, 5, 12, 15, 30);

function file(
  id: string,
  parentId: string,
  name: string,
  extra: Record<string, unknown>,
) {
  return {
    id,
    parentId,
    name,
    createdAt: NOW,
    modifiedAt: NOW,
    ...extra,
  };
}

/** My Documents: notes + a link + a photo; Recycle Bin: one old file. */
export async function seedFs(page: Page) {
  const nodes = [
    file('f:bio', 'docs', 'bio_project.txt', {
      type: 'txt',
      text: 'bio project notes: cells are small. mr dalton likes diagrams.',
    }),
    file('f:todo', 'docs', 'todo.txt', {
      type: 'txt',
      text: '1. homework\n2. more homework',
    }),
    file('f:camp', 'docs', 'camp.jpg', {
      type: 'image',
      photo: { scene: 'camp', seed: 7, caption: 'camp, summer' },
    }),
    file('f:old', 'recycle', 'embarrassing_poem.txt', {
      type: 'txt',
      text: 'roses are red',
      deletedFrom: 'docs',
    }),
  ];
  await page.addInitScript(
    ({ key, list }) => {
      try {
        if (localStorage.getItem(key)) return;
        const map: Record<string, unknown> = {};
        for (const n of list as { id: string }[]) map[n.id] = n;
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            state: { nodes: map, purgedSeeds: [] },
          }),
        );
      } catch {
        // Storage blocked: the defaults apply.
      }
    },
    { key: FS_KEY, list: nodes },
  );
}
