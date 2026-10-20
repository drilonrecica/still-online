// v0.6 M1 gate: the touch shell's happy paths. A phone keeps every window full-screen through a
// rotation and above the on-screen keyboard; a tablet keeps its floating windows on screen when it
// turns; the 1280×800 desktop opens floating windows over a 30 px taskbar as in v0.5.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { logIn, logInTouch, tap } from './helpers';

/** `TOUCH_TASKBAR_HEIGHT` in src/os/device.ts. */
const TOUCH_TASKBAR = 40;

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('not visible');
  return b;
}

async function viewport(page: Page) {
  const [w, h, scrollWidth] = await page.evaluate<[number, number, number]>(
    '[innerWidth, Math.floor(visualViewport.height), document.scrollingElement.scrollWidth]',
  );
  expect(scrollWidth, 'no sideways scroll').toBeLessThanOrEqual(w);
  return { w, h };
}

/** The window fills the screen above the touch taskbar. */
async function expectFullScreen(page: Page, frame: Locator) {
  await expect(async () => {
    const { w, h } = await viewport(page);
    const b = await box(frame);
    expect(b.x).toBeCloseTo(0, 0);
    expect(b.y).toBeCloseTo(0, 0);
    expect(b.width).toBeCloseTo(w, 0);
    expect(b.height).toBeCloseTo(h - TOUCH_TASKBAR, 0);
  }).toPass({ timeout: 5000 });
}

/** Start → a pinned program or a place, by tap. */
async function openFromStartTouch(page: Page, name: string) {
  const menu = page.getByRole('menu', { name: 'Start menu' });
  await tap(page.locator('[data-start-button]'));
  await tap(menu.getByRole('menuitem', { name, exact: true }));
  await expect(menu).toBeHidden();
}

test('phone: windows stay full-screen through a rotation and above the keyboard @phone', async ({
  page,
}) => {
  await logInTouch(page);
  await openFromStartTouch(page, 'My Computer');
  await openFromStartTouch(page, 'Notepad');
  const computer = page.getByRole('region', { name: 'My Computer' });
  const notepad = page.getByRole('region', { name: 'Untitled - Notepad' });
  await expectFullScreen(page, notepad);

  // Turn the phone mid-use: both windows still fill the screen and switch from the taskbar.
  const { w, h } = await viewport(page);
  await page.setViewportSize({ width: h, height: w });
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'phone',
  );
  await expectFullScreen(page, notepad);
  const taskbar = page.getByRole('toolbar', { name: 'Taskbar' });
  await tap(taskbar.getByRole('button', { name: 'My Computer', exact: true }));
  await expectFullScreen(page, computer);
  await tap(taskbar.getByRole('button', { name: /Notepad$/ }));
  await expectFullScreen(page, notepad);

  // The on-screen keyboard (a shorter viewport) never hides the text being typed.
  await page.setViewportSize({ width: w, height: h });
  const doc = notepad.getByLabel('Notepad document');
  await tap(doc);
  await page.setViewportSize({ width: w, height: Math.round(h / 2) });
  await doc.pressSequentially('dear diary');
  await expect(doc).toBeInViewport();
  await expectFullScreen(page, notepad);

  // Closing with unsaved text asks in a dialog that fits the screen.
  await page.setViewportSize({ width: w, height: h });
  await tap(notepad.getByRole('button', { name: 'Close', exact: true }));
  const dialog = notepad.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const d = await box(dialog);
  expect(d.x).toBeGreaterThanOrEqual(0);
  expect(d.x + d.width).toBeLessThanOrEqual(w);
  await tap(dialog.getByRole('button', { name: 'No' }));
  await expect(notepad).toBeHidden();
  await expectFullScreen(page, computer);
});

test('tablet: windows float, and stay on screen when the tablet turns @tablet', async ({
  page,
}) => {
  await logInTouch(page);
  await openFromStartTouch(page, 'My Computer');
  const computer = page.getByRole('region', { name: 'My Computer' });
  const before = await box(computer);
  expect(before.width).toBeLessThan(1024);
  expect(
    (await box(computer.locator('.title-bar').first())).height,
  ).toBeCloseTo(36, 0);

  // Four labelled window buttons shrink to fit beside the full tray instead of scrolling away.
  for (const name of ['My Documents', 'My Pictures', 'Recycle Bin']) {
    await openFromStartTouch(page, name);
  }
  const buttons = page
    .getByRole('toolbar', { name: 'Taskbar' })
    .locator('button[data-active]');
  await expect(buttons).toHaveCount(4);
  for (const button of await buttons.all()) {
    await expect(button).toBeInViewport({ ratio: 0.95 });
    expect((await box(button)).width).toBeGreaterThanOrEqual(110 - 0.5);
  }

  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'tablet',
  );
  await expect(async () => {
    const { w, h } = await viewport(page);
    const b = await box(computer);
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(w + 0.5);
    expect(b.y + b.height).toBeLessThanOrEqual(h - TOUCH_TASKBAR + 0.5);
  }).toPass({ timeout: 5000 });

  // Portrait has no room for all four: the row scrolls, with the front window's button shown.
  await tap(buttons.first());
  await expect(buttons.first()).toHaveAttribute('data-active', 'true');
  await expect(buttons.first()).toBeInViewport({ ratio: 0.95 });
});

test("phone: the front window's taskbar button scrolls into view @phone", async ({
  page,
}) => {
  await logInTouch(page);
  const names = [
    'My Documents',
    'My Pictures',
    'My Music',
    'My Computer',
    'Control Panel',
    'Recycle Bin',
    'Notepad',
    'Paint',
    'Mail',
    'Amplifier',
  ];
  for (const name of names) await openFromStartTouch(page, name);
  const buttons = page
    .getByRole('toolbar', { name: 'Taskbar' })
    .locator('button[data-active]');
  await expect(buttons).toHaveCount(names.length);
  await expect(buttons.last()).toHaveAttribute('data-active', 'true');
  await expect(buttons.last()).toBeInViewport({ ratio: 0.95 });
  await viewport(page);
});

test('desktop: 1280×800 opens floating windows over a 30 px taskbar as in v0.5', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'desktop',
  );
  await page.getByRole('option', { name: 'My Computer' }).dblclick();
  const computer = page.getByRole('region', { name: 'My Computer' });
  const b = await box(computer);
  expect(b.width).toBeLessThan(1280);
  expect(b.y).toBeGreaterThan(0);
  await expect(
    computer.getByRole('button', { name: 'Maximize' }),
  ).toBeVisible();
  const taskbar = page.getByRole('toolbar', { name: 'Taskbar' });
  expect((await box(taskbar)).height).toBe(30);
  const button = taskbar.getByRole('button', { name: 'My Computer' });
  await expect(button).toHaveText('My Computer');
  await expect(page.getByTestId('tray-network')).toBeVisible();
  await expect(page.getByTestId('tray-chevron')).toHaveCount(0);
});
