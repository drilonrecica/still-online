// v0.6 M2 gate: the apps across devices. On a phone a rotation mid-use keeps Mail and Web
// Explorer usable, and the on-screen keyboard never hides Mail's body or the address bar. A
// tablet keeps the desktop layouts (Actual size, Mail's panes), and so does 1280×800.
/// <reference lib="dom" />
import { expect, test, type Locator, type Page } from '@playwright/test';
import { logIn, logInTouch, longPress, openAppTouch, tap } from './helpers';

async function expectNoSideScroll(page: Page) {
  const [scrollWidth, width] = await page.evaluate<[number, number]>(
    '[document.scrollingElement.scrollWidth, innerWidth]',
  );
  expect(scrollWidth, 'no sideways page scroll').toBeLessThanOrEqual(width);
}

/** Turns the phone: swaps the viewport's width and height. */
async function rotate(page: Page) {
  const { width, height } = page.viewportSize()!;
  await page.setViewportSize({ width: height, height: width });
}

/** The on-screen keyboard: a shorter viewport while a field has focus. */
async function openKeyboard(page: Page) {
  const { width, height } = page.viewportSize()!;
  await page.setViewportSize({ width, height: Math.min(height, 500) - 120 });
}

async function openMail(page: Page): Promise<Locator> {
  await openAppTouch(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  await tap(mail.getByRole('button', { name: 'Send/Recv' }));
  await expect(
    mail.getByRole('table', { name: 'Messages' }).getByRole('row'),
  ).not.toHaveCount(1, { timeout: 15_000 });
  return mail;
}

async function openWebTouch(page: Page): Promise<Locator> {
  await openAppTouch(page, 'Web Explorer');
  return connect(page, tap);
}

/** Dials in from the offline page, unless Mail's Send/Recv already did; waits for Done. */
async function connect(
  page: Page,
  press: (l: Locator) => Promise<void>,
): Promise<Locator> {
  const web = page.getByRole('region', { name: /Web Explorer$/ });
  const offline = web.getByTestId('page-cannot-be-displayed');
  const status = web.getByRole('status').last();
  await expect(offline.or(status)).toBeVisible();
  if (await offline.isVisible())
    await press(offline.getByRole('button', { name: 'Connect' }));
  await expect(offline).toHaveCount(0, { timeout: 15_000 });
  await expect(status).toHaveText('Done', { timeout: 10_000 });
  return web;
}

const pageZoom = (web: Locator) =>
  web
    .getByTestId('browser-page')
    .evaluate((el) => Number(getComputedStyle(el).zoom));

test('a rotation mid-use keeps Mail and Web Explorer usable @phone', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await logInTouch(page);

  // Mail: a message open full screen stays open, with Back in reach, after a turn.
  const mail = await openMail(page);
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await tap(rows.nth(1));
  const preview = mail.getByRole('region', { name: 'Preview' });
  await expect(preview).not.toBeEmpty();
  await rotate(page);
  await expect(preview).toBeInViewport();
  const back = mail.getByRole('button', { name: 'Back' });
  await expect(back).toBeInViewport();
  await expectNoSideScroll(page);
  await tap(back);
  await expect(rows.nth(1)).toBeVisible();
  await rotate(page);
  await tap(mail.getByRole('button', { name: 'Close', exact: true }));

  // Web Explorer: Fit to screen follows the new width.
  const web = await openWebTouch(page);
  const before = await pageZoom(web);
  await rotate(page);
  await expect.poll(() => pageZoom(web)).not.toBeCloseTo(before, 2);
  await expectNoSideScroll(page);
  const area = web.getByTestId('browser-viewport');
  const [scroll, client] = await area.evaluate((el) => [
    el.scrollWidth,
    el.clientWidth,
  ]);
  expect(scroll).toBeLessThanOrEqual(client);
  await tap(web.getByRole('link').first());
  await expect(web.getByRole('status').last()).toHaveText('Done', {
    timeout: 10_000,
  });
});

test('the keyboard never hides Mail’s body or the address bar @phone', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await logInTouch(page);
  const { width, height } = page.viewportSize()!;

  const mail = await openMail(page);
  await tap(mail.getByRole('button', { name: 'Create Mail' }));
  const compose = mail.getByRole('form', { name: 'Create Mail' });
  const body = compose.getByLabel('Message body');
  await tap(body);
  await openKeyboard(page);
  await expect(body).toBeInViewport();
  await body.pressSequentially('hi');
  await expectNoSideScroll(page);
  await page.setViewportSize({ width, height });
  await tap(mail.getByRole('button', { name: 'Close', exact: true }));
  const discard = page.getByRole('dialog');
  if (await discard.isVisible())
    await tap(discard.getByRole('button', { name: 'No' }));

  const web = await openWebTouch(page);
  const address = web.getByLabel('Address');
  await tap(address);
  await openKeyboard(page);
  await expect(address).toBeInViewport();
  await address.fill('http://searchly.example/');
  await address.press('Enter');
  await expect(web.getByRole('status').last()).toHaveText('Done', {
    timeout: 10_000,
  });
  await expectNoSideScroll(page);
});

test('tablet: Web Explorer opens at Actual size and Mail keeps its panes @tablet', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  const web = await openWebTouch(page);
  // Fit to screen is phone-only: a tablet lays pages out at their real size.
  await expect(web.getByTestId('browser-viewport')).not.toHaveAttribute(
    'data-view',
    'fit',
  );
  // Favorites opens the side pane, not the phone's sheet.
  await tap(
    web
      .getByRole('toolbar', { name: 'Standard Buttons' })
      .getByRole('button', { name: 'Favorites' }),
  );
  await expect(
    web.getByRole('complementary', { name: 'Favorites' }),
  ).toBeVisible();
  await expect(web.getByTestId('favorites-sheet')).toHaveCount(0);
  await tap(web.getByRole('button', { name: 'Close', exact: true }));

  const mail = await openMail(page);
  await expect(mail.getByRole('list', { name: 'Folders' })).toBeVisible();
  await expect(mail.getByRole('combobox', { name: 'Folders' })).toHaveCount(0);
  await tap(
    mail.getByRole('table', { name: 'Messages' }).getByRole('row').nth(1),
  );
  // The list and the reading pane side by side, as on the desktop.
  await expect(
    mail.getByRole('table', { name: 'Messages' }).getByRole('row').nth(1),
  ).toBeVisible();
  await expect(mail.getByRole('region', { name: 'Preview' })).not.toBeEmpty();
  await expect(mail.getByRole('button', { name: 'Back' })).toHaveCount(0);
  await expectNoSideScroll(page);
});

test('desktop: Mail and Web Explorer keep their v0.5 layout at 1280×800', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await page.getByRole('option', { name: 'Mail' }).dblclick();
  const mail = page.getByRole('region', { name: /Mail$/ });
  await mail.getByRole('button', { name: 'Send/Recv' }).click();
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 15_000 });
  await expect(mail.getByRole('list', { name: 'Folders' })).toBeVisible();
  await expect(mail.getByRole('combobox', { name: 'Folders' })).toHaveCount(0);
  await rows.nth(1).click();
  await expect(rows.nth(1)).toBeVisible();
  await expect(mail.getByRole('region', { name: 'Preview' })).not.toBeEmpty();
  await expect(mail.getByRole('button', { name: 'Back' })).toHaveCount(0);
  // The 30 px desktop title bar and a floating (not maximized) window.
  const titleBar = mail.locator('.title-bar');
  expect((await titleBar.boundingBox())!.height).toBeLessThan(36);
  const box = (await mail.boundingBox())!;
  expect(box.width).toBeLessThan(1280);
  await mail.getByRole('button', { name: 'Close', exact: true }).click();

  await page.getByRole('option', { name: 'Web Explorer' }).dblclick();
  const web = await connect(page, (l) => l.click());
  // No Fit to screen: the page is not zoomed and keeps the v0.5 markup.
  await expect(web.getByTestId('browser-viewport')).not.toHaveAttribute(
    'data-view',
    /.*/,
  );
  await web
    .getByRole('toolbar', { name: 'Standard Buttons' })
    .getByRole('button', { name: 'Favorites' })
    .click();
  await expect(
    web.getByRole('complementary', { name: 'Favorites' }),
  ).toBeVisible();
  await expect(web.getByTestId('favorites-sheet')).toHaveCount(0);
});

test('a short phone scrolls Display, User Accounts and Dial-up to their last controls @phone', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  const { width, height } = page.viewportSize()!;
  // Landscape on both projects: the dialogs are taller than 412 px.
  if (width < height) await rotate(page);

  await longPress(page, page.getByTestId('desktop'));
  await tap(page.getByRole('menuitem', { name: 'Properties' }));
  const display = page.getByRole('region', { name: 'Display Properties' });
  const theme = display.getByRole('tabpanel').getByRole('listbox');
  await theme.scrollIntoViewIfNeeded();
  await expect(theme).toBeInViewport();
  await tap(display.getByRole('button', { name: 'Close', exact: true }));

  await openAppTouch(page, 'User Accounts');
  const accounts = page.getByRole('region', { name: 'User Accounts' });
  const last = accounts.getByRole('button').last();
  await last.scrollIntoViewIfNeeded();
  await expect(last).toBeInViewport();
  await tap(accounts.getByRole('button', { name: 'Close', exact: true }));

  await openAppTouch(page, 'Connect to the Internet');
  const dialup = page.getByRole('region', { name: 'Connect to the Internet' });
  const dial = dialup.getByRole('button', { name: 'Dial', exact: true });
  await dial.scrollIntoViewIfNeeded();
  await expect(dial).toBeInViewport({ ratio: 1 });
  await expectNoSideScroll(page);
});
