import { expect, test } from '@playwright/test';
import { seedFs } from './fsSeed';
import { logIn } from './helpers';

const DIR = 'docs/review/P0';

test('P0 gate: All Programs, My Documents, Recycle Bin @review', async ({
  page,
}) => {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  await seedFs(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);

  await page.getByRole('button', { name: 'start' }).click();
  await page.getByRole('menuitem', { name: /All Programs/ }).click();
  await expect(page.getByRole('menu', { name: 'All Programs' })).toBeVisible();
  await page.getByRole('menuitem', { name: /Accessories/ }).hover();
  await page.screenshot({ path: `${DIR}/all-programs.png` });
  await page.keyboard.press('Escape');
  await page.keyboard.press('Escape');

  await page.getByRole('option', { name: 'My Documents' }).first().dblclick();
  const docs = page.getByRole('region', { name: 'My Documents' });
  await expect(docs).toBeVisible();
  await docs.getByRole('option', { name: /bio_project/ }).click();
  await page.mouse.move(900, 650);
  await page.screenshot({ path: `${DIR}/my-documents.png` });

  await page.getByRole('button', { name: 'start' }).click();
  await page
    .getByRole('menu', { name: 'Start menu' })
    .getByRole('menuitem', { name: 'Recycle Bin' })
    .click();
  const bin = page.getByRole('region', { name: 'Recycle Bin' });
  await expect(bin).toBeVisible();
  await bin.getByRole('option', { name: /embarrassing/ }).click();
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/recycle-bin.png` });

  expect(problems).toEqual([]);
});
