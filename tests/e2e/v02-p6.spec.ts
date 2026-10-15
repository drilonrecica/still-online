import { expect, test } from '@playwright/test';
import { logIn, openFromStart } from './helpers';

test('P6: Hen Hunt starts a round, shoots and reloads', async ({ page }) => {
  await logIn(page);
  await openFromStart(page, 'Hen Hunt');
  const game = page.getByRole('region', { name: /Hen Hunt$/ });
  await expect(game.getByRole('heading', { name: 'Hen Hunt' })).toBeVisible();
  await game.getByRole('button', { name: 'Play' }).click();
  const field = game.getByRole('img', { name: /Hen Hunt field/ });
  await expect(field).toBeVisible();
  const box = (await field.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 3);
  await page.mouse.down();
  await page.mouse.up();
  await page.mouse.down({ button: 'right' });
  await page.mouse.up({ button: 'right' });
  await page.keyboard.press('Escape');
  await expect(game.getByRole('button', { name: 'Play' })).toBeVisible();
});

test('P6: Star Pinball launches a ball and flips', async ({ page }) => {
  await logIn(page);
  await openFromStart(page, 'Star Pinball');
  const game = page.getByRole('region', { name: /Star Pinball$/ });
  await expect(
    game.getByRole('heading', { name: /Star\s*Pinball/ }),
  ).toBeVisible();
  await game.getByRole('button', { name: 'Play' }).click();
  const table = game.getByRole('img', { name: /Star Pinball table\. Space/ });
  await expect(table).toBeVisible();
  await page.keyboard.down('Space');
  await page.waitForTimeout(700);
  await page.keyboard.up('Space');
  await page.keyboard.down('z');
  await page.keyboard.up('z');
  const box = (await table.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.8);
  await page.mouse.down();
  await page.mouse.up();
  await page.keyboard.press('Escape');
  await expect(game.getByRole('button', { name: 'Play' })).toBeVisible();
});
