// v0.6 M1-01: the window manager on touch. A phone renders every window maximized without
// storing it; a tablet keeps floating windows with touch-sized title bars and grips.
import { expect, test, type Locator, type Page } from '@playwright/test';

type Box = NonNullable<Awaited<ReturnType<Locator['boundingBox']>>>;
import {
  closeNudgeChats,
  logIn,
  logInTouch,
  longPress,
  openAppTouch,
  swipe,
  tap,
} from './helpers';

/** The touch taskbar (`TOUCH_TASKBAR_HEIGHT` in src/os/device.ts). */
const TOUCH_TASKBAR = 40;

async function workArea(page: Page) {
  const [w, h] = await page.evaluate<[number, number]>(
    '[innerWidth, Math.floor(visualViewport.height)]',
  );
  return { w, h: h - TOUCH_TASKBAR };
}

function expectFills(box: Box, work: { w: number; h: number }) {
  expect(box.x).toBeCloseTo(0, 0);
  expect(box.y).toBeCloseTo(0, 0);
  expect(box.width).toBeCloseTo(work.w, 0);
  expect(box.height).toBeCloseTo(work.h, 0);
}

async function expectFullScreen(page: Page, frame: Locator) {
  await expect(frame).toBeVisible();
  // A chat that opens with a nudge shakes first, and passes x = 0 mid-shake: retry the whole
  // check on one measurement until the window has settled.
  const work = await workArea(page);
  await expect(async () => {
    expectFills((await frame.boundingBox())!, work);
  }).toPass({ timeout: 5000 });
}

/**
 * Checks that every shown window fills the work area, then minimizes it by touch. A window
 * that closes itself meanwhile (the dial-up dialog once connected) is skipped.
 */
async function checkAndClear(page: Page, label: string) {
  const frames = page.locator('[data-window-id]:not([hidden])');
  await expect(frames.first(), label).toBeVisible();
  const work = await workArea(page);
  while ((await frames.count()) > 0) {
    const id = await frames.first().getAttribute('data-window-id');
    const frame = page.locator(`[data-window-id="${id}"]`);
    const box = await frame.boundingBox({ timeout: 1000 }).catch(() => null);
    if (!box) continue;
    expectFills(box, work);
    if (await page.locator('[data-wrecker]').count()) {
      // Desktop Wrecker's overlay covers everything; its touch exit is M3-01. It is lazy, and
      // under load an Escape can land before its key listener exists: press until it is gone.
      await expect(async () => {
        await page.keyboard.press('Escape');
        await expect(page.locator('[data-wrecker]')).toHaveCount(0, {
          timeout: 500,
        });
      }).toPass({ timeout: 10_000 });
    } else {
      // The XP frame's Minimize, or Amplifier's own (unless the window closed itself).
      await frame
        .getByRole('button', { name: 'Minimize' })
        .first()
        .tap({ timeout: 2000 })
        .catch(() => undefined);
    }
    await expect(frame, label).toBeHidden();
  }
}

/**
 * Start → All Programs → System Tools → `name`. On a portrait phone the flyout still opens
 * off-screen (M1-02 reworks the Start menu), so the last step dispatches the click.
 */
async function openSystemTool(page: Page, name: string) {
  await tap(page.locator('[data-start-button]'));
  await tap(page.getByRole('menuitem', { name: /All Programs/ }));
  await tap(page.getByRole('menuitem', { name: /System Tools/ }));
  await page
    .getByRole('menuitem', { name, exact: true })
    .last()
    .dispatchEvent('click');
}

test('phone: every app opens full-screen and the window controls are touch-sized @phone', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await logInTouch(page);
  await closeNudgeChats(page, { wait: false });

  // Desktop icons and the Start menu: every app in the registry but Stapley, which has no window.
  for (const name of [
    'My Computer',
    'My Documents',
    'Recycle Bin',
    'Disk Cleanup',
    'Message History',
    'Connect to the Internet',
    'Web Explorer',
    'Mail',
    'TuneMole',
    'Notepad',
    'Paint',
    'Snapshot Booth',
    'Mines',
    'Hen Hunt',
    'Star Pinball',
    'Amplifier',
    'Desktop Wrecker',
  ]) {
    await openAppTouch(page, name);
    await checkAndClear(page, name);
  }

  for (const name of ['Regional and Language Options', 'User Accounts']) {
    await openSystemTool(page, name);
    await checkAndClear(page, name);
  }

  // Display Properties from the desktop menu.
  const desktop = page.getByTestId('desktop');
  await longPress(page, desktop);
  await tap(desktop.getByRole('menuitem', { name: 'Properties' }));
  await checkAndClear(page, 'Display Properties');

  // Messenger, then a chat.
  await openAppTouch(page, 'Messenger');
  await expectFullScreen(page, page.getByRole('region', { name: 'Messenger' }));
  await tap(page.getByRole('button', { name: 'Sign in' }));
  const contacts = page.getByRole('group', { name: 'Contacts' });
  await expect(contacts).toBeVisible();
  await closeNudgeChats(page);
  await tap(contacts.locator('[data-contact-id]').first());
  const chat = page.getByRole('region', { name: /Conversation$/ });
  await expectFullScreen(page, chat);

  // No Maximize/Restore; Minimize and Close are 36×36 in a 36 px title bar.
  await expect(
    chat.getByRole('button', { name: /Maximize|Restore/ }),
  ).toHaveCount(0);
  const bar = (await chat.locator('.title-bar').boundingBox())!;
  expect(bar.height).toBeCloseTo(36, 0);
  for (const name of ['Minimize', 'Close']) {
    const button = (await chat.getByRole('button', { name }).boundingBox())!;
    expect(button.width).toBeCloseTo(36, 0);
    expect(button.height).toBeCloseTo(36, 0);
  }

  // A drag on the title bar doesn't move it.
  await swipe(
    page,
    { x: bar.x + 60, y: bar.y + bar.height / 2 },
    { x: bar.x + 160, y: bar.y + 200 },
  );
  await expectFullScreen(page, chat);
});

test('tablet: windows drag and resize by touch @tablet', async ({ page }) => {
  await logInTouch(page);
  await openAppTouch(page, 'Notepad');
  const notepad = page.getByRole('region', { name: 'Untitled - Notepad' });
  await expect(notepad).toBeVisible();
  await expect(notepad.getByRole('button', { name: 'Maximize' })).toBeVisible();

  const bar = notepad.locator('.title-bar');
  expect((await bar.boundingBox())!.height).toBeCloseTo(36, 0);
  for (const name of ['Minimize', 'Maximize', 'Close']) {
    const button = (await notepad.getByRole('button', { name }).boundingBox())!;
    expect(button.width).toBeCloseTo(32, 0);
    expect(button.height).toBeCloseTo(32, 0);
  }

  // Drag by the title bar with one finger.
  const before = (await notepad.boundingBox())!;
  const grab = { x: before.x + 80, y: before.y + 18 };
  await swipe(page, grab, { x: grab.x + 150, y: grab.y + 100 });
  await expect
    .poll(async () => (await notepad.boundingBox())?.x)
    .toBeCloseTo(before.x + 150, 0);
  const moved = (await notepad.boundingBox())!;
  expect(moved.y).toBeCloseTo(before.y + 100, 0);

  // The south-east grip's touch zone reaches 8 px outside the frame.
  const corner = (await notepad.locator('[data-resize="se"]').boundingBox())!;
  expect(corner.width).toBeGreaterThanOrEqual(16);
  const start = { x: moved.x + moved.width + 4, y: moved.y + moved.height + 4 };
  await swipe(page, start, { x: start.x + 120, y: start.y + 80 });
  await expect
    .poll(async () => (await notepad.boundingBox())?.width)
    .toBeCloseTo(moved.width + 120, 0);
  expect((await notepad.boundingBox())!.height).toBeCloseTo(
    moved.height + 80,
    0,
  );
});

test('tablet: an oversize window opens maximized and can restore @tablet', async ({
  page,
}) => {
  // Portrait: Hen Hunt's 800 px default is wider than the 768 px tablet.
  await page.setViewportSize({ width: 768, height: 1024 });
  await logInTouch(page, 'Ben', { gender: 'boy' });
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'tablet',
  );
  await openAppTouch(page, 'Hen Hunt');
  const henhunt = page.getByRole('region', { name: 'Hen Hunt' });
  await expectFullScreen(page, henhunt);
  await tap(henhunt.getByRole('button', { name: 'Restore' }));
  await expect
    .poll(async () => (await henhunt.boundingBox())?.width)
    .toBeLessThanOrEqual(768);
  await expect
    .poll(async () => (await henhunt.boundingBox())?.height)
    .toBeLessThan((await workArea(page)).h - 100);
  await expect(
    henhunt.getByRole('button', { name: 'Maximize' }),
  ).toBeDisabled();
});

test('desktop: the stored geometry comes back after a trip to phone width', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await page.getByRole('option', { name: 'Notepad' }).dblclick();
  const notepad = page.getByRole('region', { name: 'Untitled - Notepad' });
  const bar = (await notepad.locator('.title-bar').boundingBox())!;
  await page.mouse.move(bar.x + 60, bar.y + bar.height / 2);
  await page.mouse.down();
  await page.mouse.move(bar.x + 460, bar.y + 260, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => (await notepad.boundingBox())?.x)
    .toBeGreaterThan(400);
  const stored = (await notepad.boundingBox())!;

  await page.setViewportSize({ width: 412, height: 800 });
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'phone',
  );
  await expect
    .poll(async () => (await notepad.boundingBox())?.width)
    .toBeCloseTo(412, 0);
  await expect(notepad.getByRole('button', { name: 'Maximize' })).toHaveCount(
    0,
  );

  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'desktop',
  );
  await expect.poll(async () => await notepad.boundingBox()).toEqual(stored);
  await expect(notepad.getByRole('button', { name: 'Maximize' })).toBeVisible();
});
