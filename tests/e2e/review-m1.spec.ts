import { expect, test } from '@playwright/test';
import { pickGender } from './helpers';

const DIR = 'docs/review/M1';

test('M1 gate screenshots @review', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await page.getByLabel('Your name').fill('Ada');
  await pickGender(page);
  await page.screenshot({ path: `${DIR}/login.png` });

  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();
  await page.mouse.move(640, 400);
  await page.screenshot({ path: `${DIR}/desktop.png` });

  await page.getByRole('button', { name: 'start' }).click();
  await expect(page.getByRole('menu', { name: 'Start menu' })).toBeVisible();
  await page.screenshot({ path: `${DIR}/start-menu.png` });
  await page.keyboard.press('Escape');

  // Two overlapping windows: My Computer (icon), then Notepad (Start menu, focused).
  await page.getByRole('option', { name: 'My Computer' }).dblclick();
  const mycomp = page.getByRole('region', { name: 'My Computer' });
  await expect(mycomp).toBeVisible();
  await page.getByRole('button', { name: 'start' }).click();
  await page
    .getByRole('menu', { name: 'Start menu' })
    .getByText('Notepad', { exact: true })
    .click();
  const notepad = page.getByRole('region', { name: 'Untitled - Notepad' });
  await expect(notepad).toBeVisible();
  await notepad
    .getByLabel('Notepad document')
    .fill('hello from still-online :)');
  const bar = await notepad.locator('.title-bar').boundingBox();
  expect(bar).toBeTruthy();
  const sx = bar!.x + bar!.width / 2;
  const sy = bar!.y + bar!.height / 2;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 90, sy + 70, { steps: 8 });
  await page.mouse.up();
  await page.screenshot({ path: `${DIR}/windows.png` });

  await page.getByRole('button', { name: 'start' }).click();
  await page.getByRole('menuitem', { name: 'Turn Off Computer' }).click();
  await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: `${DIR}/off.png` });

  expect(problems).toEqual([]);
});
