// v0.6 M3-01: the four games on a phone, played by touch only (taps, holds and drags through
// real touch pointer events). Runs in `phone` (portrait) and `phone-landscape`.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { LEVELS, createBoard, reveal } from '../../src/apps/mines/board';
import { MAX_CAM, WINDMILL, toScreenX } from '../../src/apps/henhunt/layout';
import { createGame } from '../../src/apps/henhunt/sim';
import { logInTouch, longPress, openAppTouch, swipe, tap } from './helpers';

/** `Math.random` pinned: every game's next seed is this. */
const SEED = (0.5 * 0x100000000) >>> 0;

async function pinSeed(page: Page) {
  await page.evaluate(`Math.random = () => 0.5`);
}

/** Sends Stapley away (his first-login greeting sits over the bottom of a phone screen). */
async function hideStapley(page: Page) {
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toBeVisible({ timeout: 10_000 });
  await tap(balloon.getByRole('button', { name: 'Hide Stapley' }));
  await expect(page.locator('[data-assistant]')).toHaveCount(0);
}

async function start(page: Page, app: string) {
  await logInTouch(page);
  await hideStapley(page);
  await pinSeed(page);
  await openAppTouch(page, app);
  const game = page.getByRole('region', { name: new RegExp(`${app}$`) });
  await expect(game).toBeVisible();
  return game;
}

/** The page never scrolls sideways, and the zoomed stage sits inside the screen. */
async function expectFits(page: Page, game: Locator) {
  const [w, scrollWidth] = await page.evaluate<[number, number]>(
    '[innerWidth, document.scrollingElement.scrollWidth]',
  );
  expect(scrollWidth).toBeLessThanOrEqual(w);
  const stage = (await game.getByTestId('scale-stage').boundingBox())!;
  expect(stage.x).toBeGreaterThanOrEqual(-0.5);
  expect(stage.x + stage.width).toBeLessThanOrEqual(w + 0.5);
}

/** Maps a game's logical view point to the screen through its letterbox and the stage zoom. */
async function viewToScreen(
  canvas: Locator,
  view: { w: number; h: number },
  x: number,
  y: number,
) {
  const r = (await canvas.boundingBox())!;
  const s = Math.min(r.width / view.w, r.height / view.h);
  return {
    x: r.x + (r.width - view.w * s) / 2 + x * s,
    y: r.y + (r.height - view.h * s) / 2 + y * s,
  };
}

/** A fingerprint of part of a canvas (fractions of its size), to see whether it changed. */
function crop(
  page: Page,
  label: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
) {
  return page.evaluate<string>(`(() => {
    const c = document.querySelector('canvas[aria-label^="${label}"]');
    const x = Math.floor(c.width * ${x0}), y = Math.floor(c.height * ${y0});
    const d = c.getContext('2d').getImageData(x, y,
      Math.floor(c.width * ${x1}) - x, Math.floor(c.height * ${y1}) - y).data;
    let h = 0;
    for (let i = 0; i < d.length; i++) h = (h * 31 + d[i]) | 0;
    return String(h);
  })()`);
}

/** Holds one finger at a point while `during` runs, then lifts it. */
async function hold(
  page: Page,
  p: { x: number; y: number },
  during: () => Promise<void>,
) {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [p],
    });
    await during();
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchEnd',
      touchPoints: [],
    });
  } finally {
    await cdp.detach();
  }
}

test('Star Pinball: flips both flippers and launches by touch @phone', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const game = await start(page, 'Star Pinball');
  await expectFits(page, game);
  await tap(game.getByRole('button', { name: 'Play' }));
  const table = game.getByRole('img', { name: /Star Pinball table\. Space/ });
  await expect(table).toBeVisible();
  const VIEW = { w: 460, h: 620 };
  const label = 'Star Pinball table';
  await page.waitForTimeout(300);

  // Each half of the table works its flipper (the bottom band changes while a finger is down).
  for (const [x, x0, x1] of [
    [100, 0, 0.5],
    [330, 0.5, 0.88],
  ] as const) {
    const before = await crop(page, label, x0, 0.75, x1, 0.95);
    const p = await viewToScreen(table, VIEW, x, 560);
    await hold(page, p, async () => {
      await expect
        .poll(() => crop(page, label, x0, 0.75, x1, 0.95))
        .not.toBe(before);
    });
    await expect.poll(() => crop(page, label, x0, 0.75, x1, 0.95)).toBe(before);
  }

  // Holding on the launch lane pulls the plunger; letting go launches the ball out of the lane.
  const lane = () => crop(page, label, 0.9, 0.55, 1, 0.97);
  const resting = await lane();
  await hold(page, await viewToScreen(table, VIEW, 426, 560), () =>
    page.waitForTimeout(700),
  );
  await expect.poll(lane).not.toBe(resting);
  await expect(page.locator('#pinball-status')).toContainText('ball 1 of 3');
});

test('Hen Hunt: a drag pans, a tap hits the window hen @phone', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const game = await start(page, 'Hen Hunt');
  await expectFits(page, game);
  await tap(game.getByRole('button', { name: 'Play' }));
  const field = game.getByRole('img', { name: /Hen Hunt field/ });
  await expect(field).toBeVisible();
  const VIEW = { w: 800, h: 540 };

  // Drag 200 view px to the right: the view looks left, so the far windmill moves right.
  const a = await viewToScreen(field, VIEW, 300, 480);
  const b = await viewToScreen(field, VIEW, 500, 480);
  await swipe(page, a, b, 12);
  const camX = MAX_CAM / 2 - 200;
  const win = await viewToScreen(
    field,
    VIEW,
    toScreenX(WINDMILL.window.x, 'far', camX),
    WINDMILL.window.y,
  );

  // The window hen peeks `nextIn` seconds into the round, for 2.4 s. The status is sampled once
  // a second, so start just before and tap the window every 350 ms until something is hit.
  const peek = createGame(SEED).windowHen.nextIn;
  const status = page.locator('#henhunt-status');
  await expect(status).toContainText('8 shells');
  const secondsLeft = async () =>
    Number(/(\d+) seconds left/.exec((await status.textContent()) ?? '')?.[1]);
  await expect
    .poll(secondsLeft, { timeout: 30_000, intervals: [100] })
    .toBeLessThanOrEqual(Math.ceil(90 - peek) + 1);
  let taps = 0;
  const scored = async () =>
    !/Score 0,/.test((await status.textContent()) ?? '');
  while (taps < 7 && !(await scored())) {
    await page.touchscreen.tap(win.x, win.y);
    taps++;
    await page.waitForTimeout(350);
  }
  // The tap scored, and the drag spent no shell: one shell per tap.
  await expect(status).toContainText(
    new RegExp(`Score [1-9]\\d*, ${8 - taps} shells`),
  );
});

test('Mines: flags by flag mode and long-press, then wins a seeded board by taps @phone', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const game = await start(page, 'Mines');
  await expectFits(page, game);
  const field = game.getByRole('group', { name: 'Mine field' });
  const cell = (i: number) => field.locator(`[data-index="${i}"]`);
  const toggle = game.getByRole('button', { name: 'Flag mode' });
  const { width, height } = LEVELS.beginner;
  const first = 4 * width + 4;
  const board = reveal(createBoard(LEVELS.beginner, SEED), first);
  const mines = board.cells.flatMap((c, i) => (c.mine ? [i] : []));

  // A beginner field fills a phone: its cells are finger-sized.
  const box = (await cell(0).boundingBox())!;
  if ((page.viewportSize()?.width ?? 0) < 600)
    expect(box.width).toBeGreaterThanOrEqual(36);

  await tap(cell(first));
  await expect(cell(first)).not.toHaveAccessibleName(/hidden/);

  // Flag mode on: a tap flags, a second tap unflags, then flag for real.
  await tap(toggle);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await tap(cell(mines[0]!));
  await expect(cell(mines[0]!)).toHaveAccessibleName(/: flag$/);
  await tap(cell(mines[0]!));
  await expect(cell(mines[0]!)).toHaveAccessibleName(/: hidden$/);
  await tap(cell(mines[0]!));
  await tap(toggle);
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  // A long-press flags without revealing.
  await longPress(page, cell(mines[1]!));
  await expect(cell(mines[1]!)).toHaveAccessibleName(/: flag$/);
  await expect(game.getByRole('img', { name: 'Mines left: 8' })).toBeVisible();

  for (let i = 0; i < width * height; i++) {
    if (!board.cells[i]!.mine && !board.cells[i]!.revealed) {
      const name = await cell(i).getAttribute('aria-label');
      if (name?.endsWith('hidden')) await tap(cell(i));
    }
  }
  await expect(
    game.getByRole('button', { name: /New game \(you won\)/ }),
  ).toBeVisible();

  // The best time is saved, as on a desktop.
  const dialog = game.getByRole('dialog');
  await tap(dialog.getByRole('button', { name: 'OK' }));
  await expect(
    game.getByRole('dialog', { name: 'Fastest Mine Sweepers' }),
  ).toBeVisible();
  const best = await page.evaluate<unknown>(
    `JSON.parse(localStorage.getItem('still-online:v1:games')).state.mines.best.beginner`,
  );
  expect(best).toMatchObject({ name: 'Ada' });
});

test('Mines in German: the flag-mode toggle @phone', async ({ page }) => {
  await start(page, 'Mines');
  await tap(page.getByTestId('tray-language'));
  await tap(page.getByRole('menuitemradio', { name: 'Deutsch' }));
  await expect(page.getByTestId('tray-language')).toContainText('DE');
  const game = page.getByRole('region', { name: /Minen$/ });
  const toggle = game.getByRole('button', { name: 'Markiermodus' });
  await expect(toggle).toBeVisible();
  await tap(toggle);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
});

test('Desktop Wrecker: every tool, Reset and Use by touch @phone', async ({
  page,
}) => {
  await logInTouch(page);
  await hideStapley(page);
  await openAppTouch(page, 'Desktop Wrecker');
  const surface = page.getByRole('application', { name: /Desktop Wrecker/ });
  await expect(surface).toBeVisible();
  const tools = page.getByRole('toolbar', { name: 'Wrecking tools' });
  const inked = () =>
    page.evaluate<number>(`(() => {
      const c = document.querySelector('[data-wrecker] canvas');
      const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
      let n = 0;
      for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n++;
      return n;
    })()`);
  const vw = page.viewportSize()!;
  const spot = (fx: number, fy: number) => ({
    x: vw.width * fx,
    y: vw.height * fy,
  });

  // The touch buttons appear once a finger touched the screen.
  await expect(tools.getByRole('button', { name: 'Reset (R)' })).toHaveCount(0);
  let before = 0;
  // Each tool on its own patch of screen, clear of the palette (top right) and the taskbar.
  for (const [tool, fx, fy] of [
    ['Hammer', 0.2, 0.32],
    ['Chainsaw', 0.55, 0.36],
    ['Flamethrower', 0.25, 0.55],
    ['Machine Gun', 0.7, 0.62],
    ['Stamp', 0.3, 0.8],
  ] as const) {
    await tap(tools.getByRole('button', { name: tool }));
    if (tool === 'Chainsaw') {
      await swipe(page, spot(fx, fy), spot(fx + 0.2, fy + 0.06));
      // A quick swipe ends in a fling, and Chrome swallows the tap that stops one.
      await page.waitForTimeout(500);
    } else await hold(page, spot(fx, fy), () => page.waitForTimeout(300));
    await expect.poll(inked, { message: tool }).toBeGreaterThan(before);
    before = await inked();
  }
  const reset = tools.getByRole('button', { name: 'Reset (R)' });
  await expect(reset).toBeVisible();
  await tap(reset);
  await expect.poll(inked).toBe(0);
  // Use (Space) works the tool where the finger last was.
  await tap(tools.getByRole('button', { name: 'Hammer' }));
  await tap(tools.getByRole('button', { name: 'Use (Space)' }));
  await expect.poll(inked).toBeGreaterThan(0);
  await tap(tools.getByRole('button', { name: /Exit/ }));
  await expect(surface).toHaveCount(0);
});
