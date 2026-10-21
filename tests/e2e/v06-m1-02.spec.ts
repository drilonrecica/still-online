// v0.6 M1-02: the shell pieces on touch. A phone gets a 40 px taskbar with icon-only window
// buttons and a "Show hidden icons" chevron, an All Programs panel, and nothing wider than the
// screen. A tablet keeps labelled buttons and flyouts; the desktop taskbar stays pixel-identical.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { logIn, logInTouch, tap } from './helpers';

/** `TOUCH_TASKBAR_HEIGHT` in src/os/device.ts. */
const TOUCH_TASKBAR = 40;

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('not visible');
  return b;
}

/** The page never scrolls sideways, and `locator` lies inside the viewport. */
async function expectFits(page: Page, locator?: Locator) {
  const [scrollWidth, width] = await page.evaluate<[number, number]>(
    '[document.scrollingElement.scrollWidth, innerWidth]',
  );
  expect(scrollWidth).toBeLessThanOrEqual(width);
  if (!locator) return;
  const b = await box(locator);
  expect(b.x).toBeGreaterThanOrEqual(0);
  expect(b.x + b.width).toBeLessThanOrEqual(width + 0.5);
}

/** At least `min` px both ways (the touch rubric's tap targets). */
async function expectTarget(locator: Locator, w: number, h = w) {
  const b = await box(locator);
  expect(b.width).toBeGreaterThanOrEqual(w - 0.5);
  expect(b.height).toBeGreaterThanOrEqual(h - 0.5);
}

/** Start → All Programs → Games → Mines, all by tap. */
async function openMinesFromStart(page: Page) {
  const menu = page.getByRole('menu', { name: 'Start menu' });
  await tap(page.locator('[data-start-button]'));
  await expectFits(page, menu);
  await tap(menu.getByRole('menuitem', { name: /All Programs/ }));
  const programs = page.getByRole('menu', { name: 'All Programs' });
  await expect(programs.getByRole('menuitem', { name: 'Back' })).toBeVisible();
  await expectFits(page, programs);
  await tap(programs.getByRole('menuitem', { name: /Games/ }));
  await tap(programs.getByRole('menuitem', { name: 'Mines', exact: true }));
  await expect(menu).toBeHidden();
  await expect(page.getByRole('region', { name: 'Mines' })).toBeVisible();
}

async function phoneFlow(page: Page) {
  // Named in English, then in German after the switch.
  const taskbar = page.getByRole('toolbar', { name: /^(Taskbar|Taskleiste)$/ });
  await expect(taskbar).toBeVisible();
  expect((await box(taskbar)).height).toBeCloseTo(TOUCH_TASKBAR, 0);
  await expectFits(page, taskbar);
  await expectFits(page, page.getByTestId('tray-clock'));

  await openMinesFromStart(page);
  // Mines covers the desktop now; My Computer is in the Start menu's places.
  await tap(page.locator('[data-start-button]'));
  await tap(page.getByRole('menuitem', { name: 'My Computer' }));
  await expect(page.getByRole('region', { name: 'My Computer' })).toBeVisible();

  // Window buttons: icon-only, 40×40, named by the window; a tap brings Mines back to the front.
  const mines = taskbar.getByRole('button', { name: 'Mines', exact: true });
  await expectTarget(mines, TOUCH_TASKBAR);
  await expect(mines).toHaveText('');
  await expect(mines).toHaveAttribute('aria-pressed', 'false');
  await tap(mines);
  await expect(mines).toHaveAttribute('aria-pressed', 'true');
  await expect(
    taskbar.getByRole('button', { name: 'My Computer', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');

  // The tray: language, sound and clock; the rest behind the chevron.
  await expect(page.getByTestId('tray-network')).toHaveCount(0);
  const chevron = page.getByTestId('tray-chevron');
  for (const target of [
    chevron,
    page.getByTestId('tray-language'),
    taskbar.getByRole('button', { name: 'Mute sound' }),
  ]) {
    await expectTarget(target, 36, TOUCH_TASKBAR);
  }
  await tap(chevron);
  const hidden = page.getByTestId('tray-hidden');
  await expect(hidden.getByTestId('tray-network')).toBeVisible();
  await expect(hidden.getByRole('button', { name: 'Messenger' })).toBeVisible();
  await expect(
    hidden.getByRole('button', { name: 'Desktop sheep' }),
  ).toBeVisible();
  await expectFits(page, hidden);
  expect(
    (await box(hidden)).y + (await box(hidden)).height,
  ).toBeLessThanOrEqual((await box(taskbar)).y + 0.5);
  // An outside tap closes it.
  await page.touchscreen.tap(20, 20);
  await expect(hidden).toBeHidden();

  // The language switches live, by tap.
  await tap(page.getByTestId('tray-language'));
  await tap(page.getByRole('menuitemradio', { name: 'Deutsch' }));
  await expect(page.getByTestId('tray-language')).toContainText('DE');
  await expect(
    page.getByRole('button', { name: 'Ausgeblendete Symbole einblenden' }),
  ).toBeVisible();
  await expectFits(page, taskbar);

  // German Start menu: still fits, with „Zurück" in All Programs.
  await tap(page.locator('[data-start-button]'));
  await tap(page.getByRole('menuitem', { name: /Alle Programme/ }));
  await expect(page.getByRole('menuitem', { name: 'Zurück' })).toBeVisible();
  await expectFits(page, page.getByRole('menu', { name: 'Alle Programme' }));
  await tap(page.getByRole('menuitem', { name: 'Zurück' }));
  await expect(page.getByRole('menu', { name: 'Alle Programme' })).toBeHidden();
}

test('phone: log in, Start → All Programs → Mines, taskbar, tray, language @phone', async ({
  page,
}) => {
  await logInTouch(page);
  await phoneFlow(page);
});

test('phone: the shell fits at 412 and 360 px wide @phone', async ({
  page,
}) => {
  for (const width of [412, 360]) {
    // A fresh save for each width.
    if (width !== 412) await page.evaluate(() => localStorage.clear());
    await page.setViewportSize({ width, height: 800 });
    await logInTouch(page);
    await expectFits(page);
    await phoneFlow(page);
  }
});

test('phone: the login screen stacks and stays usable with the keyboard open @phone', async ({
  page,
}) => {
  await page.goto('./?speed=fast');
  await tap(page.getByTestId('boot-screen'));
  const login = page.getByTestId('login-screen');
  await expect(login).toBeVisible();
  await page.setViewportSize({ width: 360, height: 740 });
  await expectFits(page);
  for (const radio of await page.getByRole('radio').all()) {
    await expectTarget(radio, 36);
    await expectFits(page, radio);
  }
  // The on-screen keyboard: a shorter viewport keeps the focused field on screen.
  const field = page.getByLabel('Your name');
  await tap(field);
  await page.setViewportSize({ width: 360, height: 300 });
  await field.fill('Ada');
  await expect(field).toBeInViewport();
  await expectFits(page);
  const boy = page.locator('[role="radio"][data-gender="boy"]');
  await boy.scrollIntoViewIfNeeded();
  await tap(boy);
  const logOn = page.getByRole('button', { name: 'Log on as Ada' });
  await logOn.scrollIntoViewIfNeeded();
  await tap(logOn);
  await expect(page.getByTestId('desktop')).toBeVisible();
});

test('phone: toasts, balloons and Stapley stay on screen @phone', async ({
  page,
}) => {
  await logInTouch(page);
  // Stapley greets on the first log on; scaled to 0.8 above the 40 px taskbar.
  const stapley = page.locator('[data-assistant]');
  await expect(stapley).toBeVisible();
  await expectFits(page, stapley);
  const taskbar = await box(page.getByRole('toolbar', { name: 'Taskbar' }));
  const s = await box(
    stapley.getByRole('button', { name: 'Stapley the stapler' }),
  );
  expect(s.y + s.height).toBeLessThanOrEqual(taskbar.y);
  expect(s.width).toBeCloseTo(72 * 0.8, 0);

  // A balloon: the dial-up connection's status, from the hidden icons. Dialling opens (and
  // then closes) the dial-up window, which folds the hidden icons away each time.
  const chevron = page.getByTestId('tray-chevron');
  const network = page.getByTestId('tray-network');
  await tap(chevron);
  await tap(network);
  await expect(async () => {
    if (!(await page.getByTestId('tray-hidden').isVisible())) {
      await tap(chevron);
    }
    await expect(network).toHaveAttribute('data-status', 'online', {
      timeout: 1000,
    });
  }).toPass({ timeout: 20_000 });
  await tap(page.getByTestId('tray-network'));
  await tap(page.getByRole('menuitem', { name: 'Status' }));
  const balloon = page.getByRole('status').filter({ hasText: /Kbps/ });
  await expect(balloon.first()).toBeVisible();
  await expectFits(page, balloon.first());
});

test('tablet: 40 px taskbar with labelled buttons; All Programs flyouts open by tap @tablet', async ({
  page,
}) => {
  await logInTouch(page);
  const taskbar = page.getByRole('toolbar', { name: 'Taskbar' });
  expect((await box(taskbar)).height).toBeCloseTo(TOUCH_TASKBAR, 0);
  await expect(page.getByTestId('tray-network')).toBeVisible();
  await expect(page.getByTestId('tray-chevron')).toHaveCount(0);

  await tap(page.locator('[data-start-button]'));
  await tap(page.getByRole('menuitem', { name: /All Programs/ }));
  const programs = page.getByRole('menu', { name: 'All Programs' });
  await expect(programs.getByRole('menuitem', { name: 'Back' })).toHaveCount(0);
  await tap(programs.getByRole('menuitem', { name: /Games/ }));
  const games = page.getByRole('menu', { name: 'Games' });
  await expect(games).toBeVisible();
  // The tap's mouseenter starts no hover timer that would swap the flyout later.
  await page.waitForTimeout(500);
  await expect(games).toBeVisible();
  await tap(games.getByRole('menuitem', { name: 'Mines', exact: true }));

  const button = taskbar.getByRole('button', { name: 'Mines' });
  await expect(button).toHaveText('Mines');
  expect((await box(button)).width).toBeGreaterThanOrEqual(110);
});

test('desktop: the 1280×800 taskbar and Start menu look as in v0.5', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  // The masked clock's width still moves the tray: pin a two-digit hour, as in the baseline.
  await page.clock.setFixedTime(new Date(2026, 9, 20, 12, 49));
  await logIn(page);
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'desktop',
  );
  const taskbar = page.getByRole('toolbar', { name: 'Taskbar' });
  expect((await box(taskbar)).height).toBe(30);
  const mask = [page.getByTestId('tray-clock')];
  await expect(taskbar).toHaveScreenshot('taskbar-desktop.png', { mask });

  await page.locator('[data-start-button]').click();
  await page.getByRole('menuitem', { name: /All Programs/ }).click();
  await page.getByRole('menuitem', { name: /Games/ }).click();
  await expect(page.getByRole('menu', { name: 'Games' })).toBeVisible();
  // The menu and its flyouts (they hang outside the menu's own box). The baseline was made
  // on Fedora; CI's Ubuntu draws the ▶ arrows and some text a few pixels differently.
  await expect(page).toHaveScreenshot('startmenu-desktop.png', {
    clip: { x: 0, y: 250, width: 800, height: 520 },
    maxDiffPixels: 400,
  });
});
