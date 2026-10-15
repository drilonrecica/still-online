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

test('P6: Desktop Wrecker wrecks over open windows, repairs and exits', async ({
  page,
}) => {
  await logIn(page);
  await openFromStart(page, 'Notepad');
  await openFromStart(page, 'Desktop Wrecker');
  const surface = page.getByRole('application', { name: /Desktop Wrecker/ });
  await expect(surface).toBeFocused();
  const notepad = page.getByRole('region', { name: /Notepad$/ });
  const box = (await notepad.boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  // Painted pixels on the damage canvas (the first canvas in the overlay).
  const inked = () =>
    page.evaluate<number>(`(() => {
      const c = document.querySelector('[data-wrecker] canvas');
      const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n++;
      return n;
    })()`);
  const tools = page.getByRole('toolbar', { name: 'Wrecking tools' });

  await page.mouse.click(cx - 120, cy);
  await tools.getByRole('button', { name: 'Chainsaw' }).click();
  await page.mouse.move(cx - 60, cy - 60);
  await page.mouse.down();
  await page.mouse.move(cx + 60, cy + 40, { steps: 8 });
  await page.mouse.up();
  for (const [tool, dx] of [
    ['Flamethrower', 0],
    ['Machine Gun', 120],
  ] as const) {
    await tools.getByRole('button', { name: tool }).click();
    await page.mouse.move(cx + dx, cy + 80);
    await page.mouse.down();
    await page.waitForTimeout(300);
    await page.mouse.up();
  }
  await tools.getByRole('button', { name: 'Stamp' }).click();
  await page.mouse.click(cx - 150, cy - 120);
  await page.mouse.click(cx + 150, cy - 120);
  await expect.poll(inked).toBeGreaterThan(5000);
  // Nothing underneath changed: Notepad is still there and untouched.
  await expect(notepad).toBeVisible();

  await tools.getByRole('button', { name: 'Repair' }).click();
  await expect.poll(inked).toBe(0);
  await page.keyboard.press('Escape');
  await expect(surface).toHaveCount(0);
  await expect(notepad).toBeVisible();
});
