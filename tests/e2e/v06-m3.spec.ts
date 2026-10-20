// v0.6 M3 gate: the games across devices. On a phone a rotation mid-game keeps the zoomed stage
// on screen and the game going; Mines' Expert board fits a phone. A tablet plays Mines and
// Pinball by touch in floating windows, and the 1280×800 desktop keeps the v0.5 games (no zoomed
// stage, no flag-mode button, a right-click flags).
import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  logIn,
  logInTouch,
  longPress,
  openAppTouch,
  openFromStart,
  tap,
} from './helpers';

async function expectNoSideScroll(page: Page) {
  const [scrollWidth, width] = await page.evaluate<[number, number]>(
    '[document.scrollingElement.scrollWidth, innerWidth]',
  );
  expect(scrollWidth, 'no sideways page scroll').toBeLessThanOrEqual(width);
}

/** The zoomed stage sits inside the screen. */
async function expectStageFits(page: Page, game: Locator) {
  const b = (await game.getByTestId('scale-stage').boundingBox())!;
  const vw = page.viewportSize()!;
  expect(b.x).toBeGreaterThanOrEqual(-0.5);
  expect(b.y).toBeGreaterThanOrEqual(-0.5);
  expect(b.x + b.width).toBeLessThanOrEqual(vw.width + 0.5);
  expect(b.y + b.height).toBeLessThanOrEqual(vw.height + 0.5);
}

/** Turns the phone: swaps the viewport's width and height. */
async function rotate(page: Page) {
  const { width, height } = page.viewportSize()!;
  await page.setViewportSize({ width: height, height: width });
}

async function hideStapley(page: Page) {
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toBeVisible({ timeout: 10_000 });
  await tap(balloon.getByRole('button', { name: 'Hide Stapley' }));
  await expect(page.locator('[data-assistant]')).toHaveCount(0);
}

async function openGame(page: Page, title: string) {
  await openAppTouch(page, title);
  const game = page.getByRole('region', { name: new RegExp(`${title}$`) });
  await expect(game).toBeVisible();
  return game;
}

const stageScale = (game: Locator) =>
  game
    .getByTestId('scale-stage')
    .evaluate((el) => Number((el as HTMLElement).dataset.scale));

test('a rotation mid-game keeps Mines and Hen Hunt on screen and going @phone', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  await hideStapley(page);

  const mines = await openGame(page, 'Mines');
  const field = mines.getByRole('group', { name: 'Mine field' });
  await tap(field.locator('[data-index="40"]'));
  await expect(field.locator('[data-index="40"]')).not.toHaveAccessibleName(
    /: hidden$/,
  );
  const before = await stageScale(mines);
  await rotate(page);
  await expect.poll(() => stageScale(mines)).not.toBe(before);
  await expectStageFits(page, mines);
  await expectNoSideScroll(page);
  // The same game: the opened cell stays open, and a tap still lands on its cell.
  await expect(field.locator('[data-index="40"]')).not.toHaveAccessibleName(
    /: hidden$/,
  );
  const hidden = field.locator('[aria-label$=": hidden"]').first();
  const name = (await hidden.getAttribute('aria-label'))!;
  await longPress(page, hidden);
  await expect(
    field.getByLabel(name.replace(/hidden$/, 'flag'), { exact: true }),
  ).toBeVisible();
  await mines.getByRole('button', { name: 'Close', exact: true }).tap();

  const hunt = await openGame(page, 'Hen Hunt');
  await tap(hunt.getByRole('button', { name: 'Play' }));
  const status = page.locator('#henhunt-status');
  await expect(status).toContainText('8 shells');
  await rotate(page);
  await expectStageFits(page, hunt);
  await expectNoSideScroll(page);
  // Still in the round: a tap on the field spends a shell.
  const r = (await hunt
    .getByRole('img', { name: /Hen Hunt field/ })
    .boundingBox())!;
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 4);
  await expect(status).toContainText(/[0-7] shells?/, { timeout: 3_000 });
});

test('Mines Expert fits a phone screen @phone', async ({ page }) => {
  await logInTouch(page);
  await hideStapley(page);
  const mines = await openGame(page, 'Mines');
  await tap(mines.getByRole('menuitem', { name: 'Game' }));
  await tap(mines.getByRole('menuitem', { name: 'Expert' }));
  const last = mines.locator('[data-index="479"]');
  await expect(last).toBeAttached();
  await expectStageFits(page, mines);
  await expectNoSideScroll(page);
  await expect(last).toBeInViewport();
  // The menu bar stays a finger-sized target.
  const game = (await mines
    .getByRole('menuitem', { name: 'Game' })
    .boundingBox())!;
  expect(game.height).toBeGreaterThanOrEqual(35.5);
});

/** Touch rubric: at least 36×36 px on screen. */
async function expectFinger(locator: Locator) {
  const b = (await locator.boundingBox())!;
  expect(b.width, 'tap target width').toBeGreaterThanOrEqual(35.5);
  expect(b.height, 'tap target height').toBeGreaterThanOrEqual(35.5);
}

// The M3 gate's fixes: buttons inside a zoomed stage (often below 0.6) and Wrecker's palette.
test("the games' own buttons are finger-sized on a phone @phone", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  await hideStapley(page);

  const mines = await openGame(page, 'Mines');
  await expectFinger(mines.getByRole('menuitem', { name: 'Game' }));
  await expectFinger(mines.getByRole('button', { name: 'New game (F2)' }));
  await expectFinger(mines.getByRole('button', { name: 'Flag mode' }));
  await mines.getByRole('button', { name: 'Close', exact: true }).tap();

  for (const title of ['Hen Hunt', 'Star Pinball']) {
    const game = await openGame(page, title);
    const menu = game.getByRole('navigation', { name: `${title} menu` });
    for (const b of await menu.getByRole('button').all()) await expectFinger(b);
    await tap(menu.getByRole('button', { name: 'Help' }));
    await expectFinger(game.getByRole('button', { name: 'Back' }));
    await game.getByRole('button', { name: 'Close', exact: true }).tap();
  }

  await openAppTouch(page, 'Desktop Wrecker');
  const tools = page.getByRole('toolbar', { name: 'Wrecking tools' });
  const vw = page.viewportSize()!;
  await page.touchscreen.tap(vw.width * 0.3, vw.height * 0.5);
  await expect(tools.getByRole('button', { name: 'Reset (R)' })).toBeVisible();
  for (const b of await tools.getByRole('button').all()) await expectFinger(b);
  await tap(tools.getByRole('button', { name: /Exit/ }));
});

test('a tablet plays Mines and Star Pinball by touch @tablet', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  await hideStapley(page);

  // Mines: a floating window (not maximized); a tap reveals and a long-press flags.
  const mines = await openGame(page, 'Mines');
  // Floating, not maximized: narrower than the screen.
  expect((await mines.boundingBox())!.width).toBeLessThan(1000);
  const field = mines.getByRole('group', { name: 'Mine field' });
  await tap(field.locator('[data-index="40"]'));
  await expect(field.locator('[data-index="40"]')).not.toHaveAccessibleName(
    /: hidden$/,
  );
  const hidden = field.locator('[aria-label$=": hidden"]').first();
  const name = (await hidden.getAttribute('aria-label'))!;
  await longPress(page, hidden);
  await expect(
    field.getByLabel(name.replace(/hidden$/, 'flag'), { exact: true }),
  ).toBeVisible();
  await expect(mines.getByRole('button', { name: 'Flag mode' })).toBeVisible();
  // Expert fits the tablet at its own size (shrink only, never grown).
  await tap(mines.getByRole('menuitem', { name: 'Game' }));
  await tap(mines.getByRole('menuitem', { name: 'Expert' }));
  await expect(mines.locator('[data-index="479"]')).toBeInViewport();
  expect(await stageScale(mines)).toBeLessThanOrEqual(1);
  await expectNoSideScroll(page);
  await mines.getByRole('button', { name: 'Close', exact: true }).tap();

  // Pinball: no zoomed stage on a tablet; the launch lane works by touch.
  const pinball = await openGame(page, 'Star Pinball');
  await expect(pinball.getByTestId('scale-stage')).toHaveCount(0);
  await tap(pinball.getByRole('button', { name: 'Play' }));
  const table = pinball.getByRole('img', { name: /^Star Pinball table/ });
  await expect(table).toBeVisible();
  const r = (await table.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: r.x + r.width * 0.92, y: r.y + r.height * 0.9 }],
  });
  await page.waitForTimeout(700);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await cdp.detach();
  await expect(page.locator('#pinball-status')).toContainText('ball 1 of 3');
  await expectNoSideScroll(page);
});

test('the desktop keeps the v0.5 games', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await openFromStart(page, 'Mines');
  const mines = page.getByRole('region', { name: /Mines$/ });
  await expect(mines).toBeVisible();
  await expect(mines.getByTestId('scale-stage')).toHaveCount(0);
  await expect(mines.getByRole('button', { name: 'Flag mode' })).toHaveCount(0);
  // Left reveals, right flags, as in v0.5.
  const field = mines.getByRole('group', { name: 'Mine field' });
  await field.locator('[data-index="40"]').click();
  await expect(field.locator('[data-index="40"]')).not.toHaveAccessibleName(
    /: hidden$/,
  );
  const hidden = field.locator('[aria-label$=": hidden"]').first();
  const name = (await hidden.getAttribute('aria-label'))!;
  await hidden.click({ button: 'right' });
  await expect(
    field.getByLabel(name.replace(/hidden$/, 'flag'), { exact: true }),
  ).toBeVisible();
  // Desktop cells keep their 16 px.
  const box = (await field.locator('[data-index="0"]').boundingBox())!;
  expect(Math.round(box.width)).toBe(16);
  await mines.getByRole('button', { name: 'Close', exact: true }).click();

  for (const title of ['Hen Hunt', 'Star Pinball']) {
    await openFromStart(page, title);
    const game = page.getByRole('region', { name: new RegExp(`${title}$`) });
    await expect(game).toBeVisible();
    await expect(game.getByTestId('scale-stage')).toHaveCount(0);
    await game.getByRole('button', { name: 'Close', exact: true }).click();
  }
});
