import { expect, test } from '@playwright/test';
import { seedFs } from './fsSeed';
import { logIn } from './helpers';

test('P0: All Programs flyout, My Documents, delete → Recycle Bin → restore', async ({
  page,
}) => {
  await seedFs(page);
  await logIn(page);

  // Start → All Programs opens a flyout with category submenus.
  await page.getByRole('button', { name: 'start' }).click();
  await page.getByRole('menuitem', { name: /All Programs/ }).click();
  const flyout = page.getByRole('menu', { name: 'All Programs' });
  await expect(flyout).toBeVisible();
  await expect(
    flyout.getByRole('menuitem', { name: /Accessories/ }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

  // My Documents (desktop shortcut) lists the files.
  await page.getByRole('option', { name: 'My Documents' }).first().dblclick();
  const docs = page.getByRole('region', { name: 'My Documents' });
  await expect(docs).toBeVisible();
  const list = docs.getByRole('listbox', { name: 'My Documents' });
  await expect(list.getByRole('option', { name: /bio_project/ })).toBeVisible();

  // Delete a file: it leaves the folder and shows up in the Recycle Bin.
  await list.getByRole('option', { name: /todo/ }).click();
  await docs.getByRole('button', { name: 'Delete' }).click();
  await expect(list.getByRole('option', { name: /todo/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'start' }).click();
  await page
    .getByRole('menu', { name: 'Start menu' })
    .getByRole('menuitem', { name: 'Recycle Bin' })
    .click();
  const bin = page.getByRole('region', { name: 'Recycle Bin' });
  await expect(bin).toBeVisible();
  const binList = bin.getByRole('listbox', { name: 'Recycle Bin' });
  await expect(binList.getByRole('option', { name: /todo/ })).toBeVisible();

  // Restore it: back in My Documents.
  await binList.getByRole('option', { name: /todo/ }).click();
  await bin.getByRole('button', { name: 'Restore', exact: true }).click();
  await expect(binList.getByRole('option', { name: /todo/ })).toHaveCount(0);
  await expect(list.getByRole('option', { name: /todo/ })).toBeVisible();
});
