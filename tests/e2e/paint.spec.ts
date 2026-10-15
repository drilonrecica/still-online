import { expect, test, type Locator, type Page } from '@playwright/test';
import { logIn } from './helpers';

/** RGBA of one pixel of Paint's canvas (a string script: e2e types have no DOM lib). */
function pixel(page: Page, x: number, y: number) {
  return page.evaluate<number[]>(`(() => {
    const canvas = document.querySelector('canvas[aria-label="Picture"]');
    return Array.from(canvas.getContext('2d').getImageData(${x}, ${y}, 1, 1).data);
  })()`);
}

async function menu(paint: Locator, bar: string, item: RegExp) {
  await paint.getByRole('menuitem', { name: bar, exact: true }).click();
  await paint.getByRole('menuitem', { name: item }).click();
}

test('Paint: draw, save to My Pictures, reopen, set as background and DP', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logIn(page);
  await page.getByRole('button', { name: 'start' }).click();
  await page
    .getByRole('menuitem', { name: 'Paint', exact: true })
    .first()
    .click();
  const paint = page.getByRole('region', { name: /Paint$/ });
  await expect(paint).toBeVisible();
  const canvas = paint.getByRole('img', { name: 'Picture' });
  const box = (await canvas.boundingBox())!;

  // A red filled rectangle.
  await paint.getByRole('button', { name: 'Color #ff0000' }).click();
  await paint.getByRole('button', { name: 'Rectangle', exact: true }).click();
  await paint.getByRole('button', { name: 'Fill only' }).click();
  await page.mouse.move(box.x + 10, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 60, box.y + 40, { steps: 4 });
  await page.mouse.up();
  await expect.poll(() => pixel(page, 30, 20)).toEqual([255, 0, 0, 255]);

  // Save As untitled.png, start over, open it again.
  await menu(paint, 'File', /^Save As/);
  const save = page.getByRole('dialog', { name: 'Save As' });
  await expect(save.getByLabel('File name')).toHaveValue('untitled.png');
  await save.getByRole('button', { name: 'Save' }).click();
  await expect(paint).toHaveAccessibleName('untitled.png - Paint');
  await menu(paint, 'File', /^New/);
  await expect.poll(() => pixel(page, 30, 20)).toEqual([255, 255, 255, 255]);
  await menu(paint, 'File', /^Open/);
  const open = page.getByRole('dialog', { name: 'Open' });
  await open.getByRole('option', { name: /untitled\.png/ }).dblclick();
  await expect.poll(() => pixel(page, 30, 20)).toEqual([255, 0, 0, 255]);

  // Desktop background, tiled.
  await menu(paint, 'File', /Tiled/);
  const desktop = page.locator('.desktop-root');
  await expect(desktop).toHaveCSS('background-image', /blob:/);
  await expect(desktop).toHaveCSS('background-repeat', 'repeat');

  // Display picture.
  await menu(paint, 'File', /display picture/);
  await expect(page.getByRole('dialog', { name: 'Paint' })).toContainText(
    'display picture has been changed',
  );
  const dp = await page.evaluate<string | null>(
    `localStorage.getItem('still-online:v1:messenger')`,
  );
  expect(dp).toContain('displayPicture');
});
