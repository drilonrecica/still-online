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
