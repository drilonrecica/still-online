import { expect, test } from '@playwright/test';

const NOTEPAD_TITLE = 'Untitled - Notepad';

test('shell: boot, login, Notepad, window management, persistence, power cycle', async ({
  page,
}) => {
  await page.goto('./');

  // Boot (click skips) → welcome screen with the first-visit name field.
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();

  // Desktop → open Notepad from its icon.
  await expect(page.getByTestId('desktop')).toBeVisible();
  await page.getByRole('option', { name: 'Notepad' }).dblclick();
  const notepad = page.getByRole('region', { name: NOTEPAD_TITLE });
  await expect(notepad).toBeVisible();

  // Type into the document.
  const text = 'hello from the shell e2e';
  await notepad.getByLabel('Notepad document').fill(text);
  await expect(notepad.getByLabel('Notepad document')).toHaveValue(text);

  // Drag by the title bar.
  const titleBar = notepad.locator('.title-bar');
  const before = await notepad.boundingBox();
  const bar = await titleBar.boundingBox();
  expect(before && bar).toBeTruthy();
  const startX = bar!.x + bar!.width / 2;
  const startY = bar!.y + bar!.height / 2;
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX + 80, startY + 60, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => (await notepad.boundingBox())?.x)
    .toBeGreaterThan(before!.x + 40);

  // Minimize via the taskbar button, then restore it.
  const taskbarButton = page
    .getByRole('toolbar', { name: 'Taskbar' })
    .getByRole('button', { name: NOTEPAD_TITLE });
  await taskbarButton.click();
  await expect(notepad).toBeHidden();
  await taskbarButton.click();
  await expect(notepad).toBeVisible();

  // Reload: log back in; name and Notepad text persist.
  await page.reload();
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // The saved window is restored with its text; the Start menu shows the saved name.
  await expect(
    page
      .getByRole('region', { name: NOTEPAD_TITLE })
      .getByLabel('Notepad document'),
  ).toHaveValue(text);
  await page.getByRole('button', { name: 'start' }).click();
  await expect(
    page.getByRole('menu', { name: 'Start menu' }).getByText('Ada'),
  ).toBeVisible();

  // Turn Off Computer → off screen → power on.
  await page.getByRole('menuitem', { name: 'Turn Off Computer' }).click();
  await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('off-screen').click();
  await expect(page.getByTestId('boot-screen')).toBeVisible();
  await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
});
