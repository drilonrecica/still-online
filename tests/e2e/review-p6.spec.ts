import { expect, test } from '@playwright/test';
import { LEVELS, createBoard, reveal } from '../../src/apps/mines/board';
import { logIn, openFromStart } from './helpers';

const DIR = 'docs/review/P6';

test('P6 gate: Mines, Hen Hunt, Pinball, Wrecker, Fluff, Stapley @review', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);

  // Stapley's first-boot tip.
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toContainText("I'm Stapley", { timeout: 10_000 });
  await page.mouse.move(1200, 120);
  await page.screenshot({ path: `${DIR}/stapley-tip.png` });
  await balloon.getByRole('button', { name: 'No thanks' }).click();

  // Mines, won on a known board.
  await page.evaluate(`Math.random = () => 0.5`);
  await openFromStart(page, 'Mines');
  const mines = page.getByRole('region', { name: /Mines$/ });
  const field = mines.getByRole('group', { name: 'Mine field' });
  const { width, height } = LEVELS.beginner;
  const first = 4 * width + 4;
  const board = reveal(
    createBoard(LEVELS.beginner, (0.5 * 0x100000000) >>> 0),
    first,
  );
  await field.locator(`[data-index="${first}"]`).click();
  for (let i = 0; i < width * height; i++) {
    if (!board.cells[i]!.mine && !board.cells[i]!.revealed) {
      await field.locator(`[data-index="${i}"]`).click();
    }
  }
  await expect(
    mines.getByRole('button', { name: /New game \(you won\)/ }),
  ).toBeVisible();
  // Accept the best-time name prompt so the board and the sunglasses face are visible.
  await mines.getByRole('button', { name: 'OK' }).click();
  // The Best Times table opens next, as in the original.
  await mines.getByRole('button', { name: 'OK' }).click();
  await page.mouse.move(1200, 780);
  await page.screenshot({ path: `${DIR}/mines-won.png` });
  await mines.getByRole('button', { name: 'Close' }).click();

  // Hen Hunt mid-round.
  await openFromStart(page, 'Hen Hunt');
  const hen = page.getByRole('region', { name: /Hen Hunt$/ });
  await hen.getByRole('button', { name: 'Play' }).click();
  const hfield = hen.getByRole('img', { name: /Hen Hunt field/ });
  await expect(hfield).toBeVisible();
  const hbox = (await hfield.boundingBox())!;
  for (const [fx = 0, fy = 0] of [
    [0.3, 0.3],
    [0.6, 0.4],
    [0.5, 0.2],
  ]) {
    await page.mouse.click(hbox.x + hbox.width * fx, hbox.y + hbox.height * fy);
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/henhunt.png` });
  await page.keyboard.press('Escape');
  await hen.getByRole('button', { name: 'Close' }).click();

  // Pinball.
  await openFromStart(page, 'Star Pinball');
  const pin = page.getByRole('region', { name: /Star Pinball$/ });
  await pin.getByRole('button', { name: 'Play' }).click();
  await expect(
    pin.getByRole('img', { name: /Star Pinball table/ }),
  ).toBeVisible();
  await page.keyboard.down('Space');
  await page.waitForTimeout(800);
  await page.keyboard.up('Space');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${DIR}/pinball.png` });
  await page.keyboard.press('Escape');
  await pin.getByRole('button', { name: 'Close' }).click();

  // Wrecker damage over an open Notepad.
  await openFromStart(page, 'Notepad');
  const notepad = page.getByRole('region', { name: /Notepad$/ });
  const nbox = (await notepad.boundingBox())!;
  const cx = nbox.x + nbox.width / 2;
  const cy = nbox.y + nbox.height / 2;
  await openFromStart(page, 'Desktop Wrecker');
  const tools = page.getByRole('toolbar', { name: 'Wrecking tools' });
  await expect(tools).toBeVisible();
  await page.mouse.click(cx - 150, cy - 60);
  await tools.getByRole('button', { name: 'Chainsaw' }).click();
  await page.mouse.move(cx - 100, cy - 100);
  await page.mouse.down();
  await page.mouse.move(cx + 120, cy + 60, { steps: 10 });
  await page.mouse.up();
  await tools.getByRole('button', { name: 'Machine Gun' }).click();
  await page.mouse.move(cx + 40, cy + 90);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await page.mouse.up();
  await tools.getByRole('button', { name: 'Flamethrower' }).click();
  await page.mouse.move(cx - 120, cy + 80);
  await page.mouse.down();
  await page.waitForTimeout(600);
  await page.mouse.up();
  await tools.getByRole('button', { name: 'Stamp' }).click();
  await page.mouse.click(cx + 150, cy - 110);
  await page.screenshot({ path: `${DIR}/wrecker.png` });
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-wrecker]')).toHaveCount(0);

  // Fluff on a window.
  const tray = page.getByRole('button', { name: 'Desktop sheep' });
  await tray.click();
  const fluff = page.locator('[data-pet]');
  // Notepad starts at the top edge, which Fluff cannot be dropped above: move it down first.
  await page.mouse.move(250, 35);
  await page.mouse.down();
  await page.mouse.move(450, 335, { steps: 8 });
  await page.mouse.up();
  await expect(fluff).toBeVisible();
  // Pick Fluff up and drop it on Notepad's title bar, then let it settle there.
  const fbox = (await fluff.boundingBox())!;
  await page.mouse.move(fbox.x + fbox.width / 2, fbox.y + fbox.height / 2);
  await page.mouse.down();
  await page.mouse.move(480, 200, { steps: 12 });
  await page.mouse.move(480, 295, { steps: 4 });
  await page.waitForTimeout(150);
  await page.mouse.up();
  await page.mouse.move(1200, 120);
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${DIR}/fluff.png` });

  expect(problems).toEqual([]);
});
