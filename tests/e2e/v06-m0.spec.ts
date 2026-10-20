// v0.6 M0-01: the device class, the touch projects and the window re-clamp. See docs/touch.md.
import { expect, test } from '@playwright/test';
import { logIn, logInTouch, longPress, openAppTouch, swipe } from './helpers';

test('phone: logs in by touch on the phone desktop, with no notice @phone', async ({
  page,
}) => {
  await logInTouch(page);
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'phone',
  );
  await expect(page.getByTestId('desktop')).toBeVisible();
  await expect(page.getByTestId('small-screen-notice')).toHaveCount(0);
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page.locator('[data-start-button]')).toBeVisible();

  // The gesture helpers send real touch pointers: a held press, then a moving swipe.
  // A string: the e2e tsconfig has no DOM types.
  await page.evaluate(`
    window.touchLog = [];
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel']) {
      window.addEventListener(type, (e) => {
        if (e.pointerType === 'touch' && window.touchLog.at(-1) !== type) {
          window.touchLog.push(type);
        }
      });
    }
  `);
  const desktop = page.getByTestId('desktop');
  await longPress(page, desktop, 600);
  const box = (await desktop.boundingBox())!;
  await swipe(page, { x: 100, y: 200 }, { x: 100 + box.width / 4, y: 200 });
  // Over the rest of the shell (here the taskbar), `touch-action: manipulation` lets the browser
  // take a swipe as a pan.
  const bar = box.y + box.height + 20;
  await swipe(
    page,
    { x: box.width / 2, y: bar },
    { x: box.width / 2 + box.width / 4, y: bar },
  );
  expect(await page.evaluate('window.touchLog')).toEqual([
    'pointerdown',
    'pointerup',
    'pointerdown',
    'pointermove',
    // The desktop background is `touch-action: none` (the Konami swipe, M3-02): the page gets it.
    'pointerup',
    'pointerdown',
    'pointermove',
    'pointercancel',
  ]);
});

test('tablet: the tablet class and a Start menu app by touch @tablet', async ({
  page,
}) => {
  await logInTouch(page, 'Ben', { gender: 'boy' });
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'tablet',
  );
  await openAppTouch(page, 'Notepad');
  await expect(
    page.getByRole('region', { name: 'Untitled - Notepad' }),
  ).toBeVisible();
});

test('desktop: the desktop class, and windows re-clamp after a resize', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'desktop',
  );
  await page.getByRole('option', { name: 'Notepad' }).dblclick();
  const notepad = page.getByRole('region', { name: 'Untitled - Notepad' });
  const bar = await notepad.locator('.title-bar').boundingBox();
  expect(bar).toBeTruthy();
  // Drag it far towards the bottom-right corner.
  await page.mouse.move(bar!.x + 60, bar!.y + bar!.height / 2);
  await page.mouse.down();
  await page.mouse.move(1260, 760, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => (await notepad.boundingBox())?.x)
    .toBeGreaterThan(800);

  await page.setViewportSize({ width: 800, height: 600 });
  // Back inside the smaller work area: 40 px of title bar visible, top above the taskbar.
  await expect
    .poll(async () => (await notepad.boundingBox())?.x)
    .toBeLessThanOrEqual(800 - 40);
  await expect
    .poll(async () => (await notepad.boundingBox())?.y)
    .toBeLessThanOrEqual(600 - 30);
});
