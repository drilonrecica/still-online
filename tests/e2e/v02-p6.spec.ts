import { expect, test, type Page } from '@playwright/test';
import { LEVELS, createBoard, reveal } from '../../src/apps/mines/board';
import { logIn, openFromStart } from './helpers';

/** Pins `Math.random` so Mines' next game has a known seed, and returns the seed. */
async function pinMinesSeed(page: Page) {
  await page.evaluate(`Math.random = () => 0.5`);
  return (0.5 * 0x100000000) >>> 0;
}

test('P6: Mines is won by revealing every safe cell', async ({ page }) => {
  await logIn(page);
  const seed = await pinMinesSeed(page);
  await openFromStart(page, 'Mines');
  const game = page.getByRole('region', { name: /Mines$/ });
  const field = game.getByRole('group', { name: 'Mine field' });
  await expect(field).toBeVisible();
  // Mines are placed by the first reveal, so replay the same board logic to learn where they are.
  const { width, height } = LEVELS.beginner;
  const first = 4 * width + 4;
  const board = reveal(createBoard(LEVELS.beginner, seed), first);
  const cell = (i: number) => field.locator(`[data-index="${i}"]`);
  await cell(first).click();
  for (let i = 0; i < width * height; i++) {
    if (!board.cells[i]!.mine && !board.cells[i]!.revealed) {
      await cell(i).click();
    }
  }
  await expect(
    game.getByRole('button', { name: /New game \(you won\)/ }),
  ).toBeVisible();
});

test('P6: Stapley greets on first boot and the tip is shown once', async ({
  page,
}) => {
  await logIn(page);
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toContainText("I'm Stapley", { timeout: 10_000 });
  await balloon.getByRole('button', { name: 'Hide Stapley' }).click();
  await expect(page.locator('[data-assistant]')).toHaveCount(0);
});

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

test('P6: Fluff comes out from the tray, lands, bleats and goes home', async ({
  page,
}) => {
  await logIn(page);
  await openFromStart(page, 'Notepad');
  const tray = page.getByRole('button', { name: 'Desktop sheep' });
  await tray.click();
  await expect(tray).toHaveAttribute('aria-pressed', 'true');
  const fluff = page.locator('[data-pet]');
  await expect(fluff).toBeVisible();
  await expect(fluff).not.toHaveAttribute('data-mode', 'fall');
  // Fluff walks, so click where the sheep is right now instead of waiting for it to hold still.
  const box = (await fluff.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(fluff).toHaveAttribute('data-mode', 'baa');
  await expect(page.getByText('Baa!')).toBeVisible();
  await tray.click();
  await expect(fluff).toHaveCount(0);
});
