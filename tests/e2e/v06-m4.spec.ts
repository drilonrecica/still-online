// v0.6 M4-01 release flows, one per device. A phone (portrait and landscape: both projects run
// every @phone test) logs on, chats, browses, plays a game, reads Mail and draws in Paint, all
// by touch. A tablet drags and resizes windows and opens the Start menu. The 1280×800 desktop
// keeps the v0.5 smoke path with a mouse.
import { expect, test, type Page } from '@playwright/test';
import {
  logIn,
  logInTouch,
  openAppTouch,
  openFromStart,
  swipe,
  tap,
} from './helpers';

async function expectNoSideScroll(page: Page) {
  const [scrollWidth, width] = await page.evaluate<[number, number]>(
    '[document.scrollingElement.scrollWidth, innerWidth]',
  );
  expect(scrollWidth, 'no sideways page scroll').toBeLessThanOrEqual(width);
}

/** Sends Stapley's first-login greeting away; it sits over the bottom of a phone screen. */
async function hideStapley(page: Page) {
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toBeVisible({ timeout: 10_000 });
  await tap(balloon.getByRole('button', { name: 'Hide Stapley' }));
  await expect(page.locator('[data-assistant]')).toHaveCount(0);
}

/** Lets day 1's tray balloons come and go; they cover the bottom of a phone screen. */
async function waitOutBalloons(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate<string[]>(
          `JSON.parse(localStorage.getItem('still-online:v1:settings') ?? '{}').state?.seenTips ?? []`,
        ),
      { timeout: 20_000 },
    )
    .toEqual(expect.arrayContaining(['unused-icons', 'updates-1']));
  await expect(page.getByTestId('balloon')).toBeHidden();
}

/** Dials in from Web Explorer's offline page, unless something already did; waits for Done. */
async function connect(page: Page) {
  const web = page.getByRole('region', { name: /Web Explorer$/ });
  const offline = web.getByTestId('page-cannot-be-displayed');
  const status = web.getByRole('status').last();
  // `.first()`: once the offline page has loaded, it and the "Done" status bar both show.
  await expect(offline.or(status).first()).toBeVisible();
  await expect(async () => {
    if (await offline.isVisible())
      await tap(offline.getByRole('button', { name: 'Connect' }));
    await expect(offline).toHaveCount(0, { timeout: 4_000 });
  }).toPass({ timeout: 20_000 });
  await expect(status).toHaveText('Done', { timeout: 10_000 });
  return web;
}

test('phone: log on, a chat, a site and a game @phone', async ({ page }) => {
  test.setTimeout(90_000);
  await logInTouch(page);
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'phone',
  );
  await hideStapley(page);

  // A chat: Messenger signs in, Jess's chat opens full screen and a reply goes out.
  await openAppTouch(page, 'Messenger');
  await tap(page.getByRole('button', { name: 'Sign in' }));
  const chat = page.getByRole('region', { name: /JeSs.* - Conversation$/ });
  await expect(chat).toBeVisible({ timeout: 15_000 });
  await expect(chat).not.toHaveAttribute('data-shaking', 'true');
  const replies = chat
    .getByRole('group', { name: 'Replies' })
    .getByRole('button');
  await expect(replies.first()).toBeVisible({ timeout: 15_000 });
  const text = (await replies.first().getAttribute('title')) ?? '';
  await tap(replies.first());
  await tap(chat.getByRole('button', { name: 'Send', exact: true }));
  await expect(chat.getByRole('log')).toContainText(text.slice(0, 20));
  await expectNoSideScroll(page);
  await tap(chat.getByRole('button', { name: 'Close', exact: true }));
  await expect(chat).toBeHidden();
  const messenger = page.getByRole('region', { name: 'Messenger' });
  await tap(messenger.getByRole('button', { name: 'Close', exact: true }));
  await expect(messenger).toBeHidden();

  // A site: Searchly, fitted to the screen.
  await openAppTouch(page, 'Web Explorer');
  const web = await connect(page);
  const address = web.getByLabel('Address');
  await tap(address);
  await address.fill('http://searchly.example/');
  await address.press('Enter');
  await expect(web.getByRole('status').last()).toHaveText('Done', {
    timeout: 10_000,
  });
  await expect(web.getByTestId('browser-page')).toBeVisible();
  await expectNoSideScroll(page);
  await tap(web.getByRole('button', { name: 'Close', exact: true }));

  // A game: a tap reveals a Mines cell.
  await openAppTouch(page, 'Mines');
  const mines = page.getByRole('region', { name: /Mines$/ });
  await expect(mines).toBeVisible();
  const field = mines.getByRole('group', { name: 'Mine field' });
  await tap(field.locator('[data-index="40"]'));
  await expect(field.locator('[data-index="40"]')).not.toHaveAccessibleName(
    /: hidden$/,
  );
  await expectNoSideScroll(page);
});

test('phone: Mail and Paint, in either orientation @phone', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await logInTouch(page);
  await waitOutBalloons(page);

  await openAppTouch(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  await tap(mail.getByRole('button', { name: 'Send/Recv' }));
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 15_000 });
  await tap(rows.nth(1));
  await expect(mail.getByRole('region', { name: 'Preview' })).not.toBeEmpty();
  const back = mail.getByRole('button', { name: 'Back' });
  await expect(back).toBeInViewport();
  await expectNoSideScroll(page);
  await tap(back);
  await expect(rows.nth(1)).toBeVisible();
  await tap(mail.getByRole('button', { name: 'Close', exact: true }));
  await expect(mail).toBeHidden();

  await openAppTouch(page, 'Paint');
  const paint = page.getByRole('region', { name: /Paint$/ });
  const canvas = paint.getByRole('img', { name: 'Picture' });
  await expect(canvas).toBeVisible();
  await tap(paint.getByRole('button', { name: 'Line' }));
  const box = (await canvas.boundingBox())!;
  await swipe(
    page,
    { x: box.x + 20, y: box.y + 60 },
    { x: box.x + 160, y: box.y + 60 },
  );
  await expect
    .poll(() =>
      page.evaluate<number[]>(`(() => {
        const c = document.querySelector('canvas[aria-label="Picture"]');
        return Array.from(c.getContext('2d').getImageData(90, 60, 1, 1).data);
      })()`),
    )
    .toEqual([0, 0, 0, 255]);
  await expectNoSideScroll(page);
});

test('tablet: windows drag and resize, and the Start menu opens @tablet', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'tablet',
  );
  await hideStapley(page);

  await openAppTouch(page, 'Notepad');
  const notepad = page.getByRole('region', { name: 'Untitled - Notepad' });
  await expect(notepad.getByRole('button', { name: 'Maximize' })).toBeVisible();
  const before = (await notepad.boundingBox())!;
  const grab = { x: before.x + 80, y: before.y + 18 };
  await swipe(page, grab, { x: grab.x + 150, y: grab.y + 100 });
  await expect
    .poll(async () => (await notepad.boundingBox())?.x)
    .toBeCloseTo(before.x + 150, 0);
  const moved = (await notepad.boundingBox())!;
  const start = { x: moved.x + moved.width + 4, y: moved.y + moved.height + 4 };
  await swipe(page, start, { x: start.x + 100, y: start.y + 60 });
  await expect
    .poll(async () => (await notepad.boundingBox())?.width)
    .toBeCloseTo(moved.width + 100, 0);

  const menu = page.getByRole('menu', { name: 'Start menu' });
  // The first tap after a resize swipe can land while the finger's last pointer is settling.
  await expect(async () => {
    if (!(await menu.isVisible()))
      await tap(page.locator('[data-start-button]'));
    await expect(menu).toBeVisible({ timeout: 1_500 });
  }).toPass({ timeout: 10_000 });
  await tap(menu.getByRole('menuitem', { name: 'My Computer', exact: true }));
  await expect(page.getByRole('region', { name: 'My Computer' })).toBeVisible();
  await expect(menu).toBeHidden();
  await expectNoSideScroll(page);
});

test('desktop: 1280×800 smoke is unchanged', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'desktop',
  );
  await page.getByRole('option', { name: 'My Computer' }).dblclick();
  const computer = page.getByRole('region', { name: 'My Computer' });
  await expect(computer).toBeVisible();
  await expect(
    computer.getByRole('button', { name: 'Maximize' }),
  ).toBeVisible();
  await computer.getByRole('button', { name: 'Close', exact: true }).click();
  await openFromStart(page, 'Notepad');
  await expect(
    page.getByRole('region', { name: 'Untitled - Notepad' }),
  ).toBeVisible();
  await expectNoSideScroll(page);
});

test('phone: the login tile is finger-sized, and a chat keeps its newest line through a rotation @phone', async ({
  page,
}) => {
  test.setTimeout(90_000);
  // M4-G: a landscape phone squeezed the account tile to 23 px (its picture is 48).
  await page.goto('./?speed=fast');
  await tap(page.getByTestId('boot-screen'));
  await page.getByLabel('Your name').fill('Ada');
  const tile = page.getByRole('button', {
    name: 'Choose Girl or Boy to log on',
  });
  expect((await tile.boundingBox())!.height).toBeGreaterThanOrEqual(36);
  await page.goto('about:blank');

  await logInTouch(page);
  await hideStapley(page);
  await openAppTouch(page, 'Messenger');
  await tap(page.getByRole('button', { name: 'Sign in' }));
  const chat = page.getByRole('region', { name: /JeSs.* - Conversation$/ });
  await expect(chat).toBeVisible({ timeout: 15_000 });
  const replies = chat
    .getByRole('group', { name: 'Replies' })
    .getByRole('button');
  await expect(replies.first()).toBeVisible({ timeout: 15_000 });
  // Played to the end, so no new line re-pins the scroll during the rotation.
  for (let i = 0; i < 20; i++) {
    const ready = await replies
      .first()
      .waitFor({ timeout: 4000 })
      .then(
        () => true,
        () => false,
      );
    if (!ready) break;
    await replies.first().dispatchEvent('click');
    await chat
      .getByRole('button', { name: 'Send', exact: true })
      .dispatchEvent('click');
  }
  await expect(chat.getByText(/is typing/)).toHaveCount(0, { timeout: 10_000 });
  const log = chat.getByRole('log');
  const newest = log.locator(':scope > *').last();
  await expect(newest).toBeInViewport();

  // M4-G: rotating kept the old scroll offset, hiding the newest lines below the fold.
  const size = page.viewportSize()!;
  await page.setViewportSize({ width: size.height, height: size.width });
  await expect(newest).toBeInViewport();
  await expect
    .poll(() =>
      log.evaluate((el) => el.scrollHeight - el.scrollTop - el.clientHeight),
    )
    .toBeLessThan(4);
  await page.setViewportSize(size);
  await expect(newest).toBeInViewport();
});

test('tablet: the tray leaves room for window buttons, in portrait too @tablet', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  // M4-G: xp.css's 75 px button minimum made the tray 443 px wide.
  const tray = page
    .getByRole('toolbar', { name: 'Taskbar' })
    .locator(':scope > :last-child');
  expect((await tray.boundingBox())!.width).toBeLessThan(320);
  for (const name of ['Mute sound', /^Input language/]) {
    const b = (await tray.getByRole('button', { name }).boundingBox())!;
    expect(b.width).toBeGreaterThanOrEqual(39.5);
    expect(b.height).toBeGreaterThanOrEqual(39.5);
  }
  // Four windows in landscape, then a rotation: a portrait tablet shows three labelled window
  // buttons beside the tray, and the row scrolls so the front window's button stays in view.
  await hideStapley(page);
  // From the Start menu: an open window covers the desktop icons.
  for (const app of ['Notepad', 'My Computer', 'Recycle Bin', 'My Documents']) {
    await tap(page.locator('[data-start-button]'));
    await tap(
      page
        .getByRole('menu', { name: 'Start menu' })
        .getByRole('menuitem', { name: app, exact: true }),
    );
    await expect(
      page.getByRole('region', { name: new RegExp(app) }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('.desktop-root')).toHaveAttribute(
    'data-device',
    'tablet',
  );
  const buttons = page
    .getByRole('toolbar', { name: 'Taskbar' })
    .locator('button[data-active]');
  await expect(buttons).toHaveCount(4);
  await expect(
    page.locator('button[data-active="true"]', { hasText: 'My Documents' }),
  ).toBeInViewport({ ratio: 0.95 }); // fractional button widths; the bug left it 24 % visible
  let inView = 0;
  for (const b of await buttons.all())
    if (
      await b.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const row = el.parentElement!.getBoundingClientRect();
        return r.left >= row.left - 0.5 && r.right <= row.right + 0.5;
      })
    )
      inView++;
  expect(inView).toBe(3);
});
