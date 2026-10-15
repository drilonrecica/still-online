import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import {
  closeNudgeChats,
  go,
  logIn,
  openBrowserOnline,
  openFromStart,
  openMessenger,
} from './helpers';

// Chromium needs no user gesture to start audio (see amplifier.spec.ts).
test.use({
  launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
});

/** Fails on serious/critical axe violations, listing them readably. */
async function expectNoSeriousViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const bad = violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  );
  expect(
    bad.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => n.target.join(' ')),
    })),
  ).toEqual([]);
}

async function boot(page: Page) {
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
}

test('a11y: login screen', async ({ page }) => {
  await boot(page);
  await expectNoSeriousViolations(page);
});

test('a11y: desktop with Start menu open', async ({ page }) => {
  await logIn(page);
  await page.getByRole('button', { name: 'start' }).click();
  await expect(page.getByRole('menu', { name: 'Start menu' })).toBeVisible();
  await expectNoSeriousViolations(page);
});

test('a11y: Messenger chat and Amplifier', async ({ page }) => {
  await logIn(page);

  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();
  const chat = page.getByRole('region', { name: /Conversation$/ });
  await expect(chat).toBeVisible({ timeout: 10_000 });
  await expectNoSeriousViolations(page);

  // Clear the windows off the Amplifier icon, then open it.
  await closeNudgeChats(page, { wait: false });
  const messenger = page.getByRole('region', { name: 'Messenger' });
  await messenger.getByRole('button', { name: 'Minimize' }).click();
  await expect(messenger).toBeHidden();
  await page.getByRole('option', { name: 'Amplifier' }).dblclick();
  await expect(page.getByRole('group', { name: 'Amplifier' })).toBeVisible();
  await expectNoSeriousViolations(page);
});

test('a11y: keyboard path login → Start → Messenger → chat → close', async ({
  page,
}) => {
  await boot(page);
  // Login: name field is focusable; Enter submits the form.
  await page.getByLabel('Your name').focus();
  await page.keyboard.type('Ada');
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Start button via keyboard, then pick Messenger from the menu.
  await page.getByRole('button', { name: 'start' }).focus();
  await page.keyboard.press('Enter');
  const menu = page.getByRole('menu', { name: 'Start menu' });
  await expect(menu).toBeVisible();
  const item = menu.getByRole('menuitem', { name: /Messenger/ });
  await item.focus();
  await page.keyboard.press('Enter');

  // Messenger opens; sign in with the keyboard.
  const messenger = page.getByRole('region', { name: 'Messenger' });
  await expect(messenger).toBeVisible();
  const signIn = page.getByRole('button', { name: 'Sign in' });
  await signIn.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();

  // Chat opens from Jess's nudge; type and send with the keyboard, then close.
  const chat = page.getByRole('region', { name: /Conversation$/ });
  await expect(chat).toBeVisible({ timeout: 10_000 });
  await chat.getByRole('button', { name: 'Send' }).focus();
  await page.keyboard.press('Enter');
  const close = chat.getByRole('button', { name: 'Close' });
  await close.focus();
  await page.keyboard.press('Enter');
  await expect(chat).toBeHidden();
});

// ---- v0.2 apps -------------------------------------------------------------

test('a11y: Explorer, Display Properties and the dial-up dialog', async ({
  page,
}) => {
  await logIn(page);

  await page.getByRole('option', { name: 'My Computer' }).dblclick();
  await expect(page.getByRole('region', { name: /My Computer/ })).toBeVisible();
  await expectNoSeriousViolations(page);
  await page
    .getByRole('region', { name: /My Computer/ })
    .getByRole('button', { name: 'Close' })
    .click();

  await page.mouse.click(900, 300, { button: 'right' });
  await page.getByRole('menuitem', { name: 'Properties' }).click();
  const display = page.getByRole('region', { name: 'Display Properties' });
  await expect(display).toBeVisible();
  await expectNoSeriousViolations(page);
  await display.getByRole('tab', { name: 'Appearance' }).click();
  await expectNoSeriousViolations(page);
  await display.getByRole('button', { name: 'Cancel' }).click();

  await openFromStart(page, 'Connect to the Internet');
  const dialog = page.getByRole('region', { name: 'Connect to the Internet' });
  await expect(dialog).toBeVisible();
  await expectNoSeriousViolations(page);
});

test('a11y: Web Explorer pages (Searchly, fan page, profile)', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logIn(page);
  const browser = await openBrowserOnline(page);
  await expectNoSeriousViolations(page);

  await go(browser, 'searchly.example/search?q=tinfoil');
  await expectNoSeriousViolations(page);

  await go(browser, 'tinfoilcomets.example/');
  await expectNoSeriousViolations(page);

  await go(browser, 'spaceport.example/');
  await expectNoSeriousViolations(page);
  await go(browser, 'spaceport.example/jess');
  await expectNoSeriousViolations(page);
});

test('a11y: Mail, TuneMole and Paint', async ({ page }) => {
  test.setTimeout(90_000);
  await logIn(page);
  await openBrowserOnline(page);

  await openFromStart(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  await expect(mail).toBeVisible();
  await mail.getByRole('button', { name: 'Send/Recv' }).click();
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 10_000 });
  await rows.nth(1).click();
  await expect(mail.getByLabel('Preview')).not.toBeEmpty();
  await expectNoSeriousViolations(page);

  await openFromStart(page, 'TuneMole');
  const mole = page.getByRole('region', { name: /TuneMole$/ });
  await expect(mole.getByRole('status')).toContainText('Connected to');
  await expectNoSeriousViolations(page);

  await openFromStart(page, 'Paint');
  await expect(page.getByRole('region', { name: /Paint$/ })).toBeVisible();
  await expectNoSeriousViolations(page);
});

test('a11y: Snapshot Booth (cartoon mode) and Message History', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logIn(page);

  await openFromStart(page, 'Snapshot Booth');
  const booth = page.getByRole('region', { name: /Snapshot Booth$/ });
  await booth.getByRole('button', { name: /use a cartoon me/i }).click();
  await expect(
    booth.getByRole('img', { name: 'Cartoon preview' }),
  ).toBeVisible();
  await expectNoSeriousViolations(page);
  await booth.getByRole('button', { name: 'Close' }).first().click();

  const messenger = await openMessenger(page);
  await messenger.getByRole('menuitem', { name: 'File', exact: true }).click();
  await page.getByRole('menuitem', { name: /View Message History/ }).click();
  const history = page.getByRole('region', { name: 'Message History' });
  await expect(history).toBeVisible();
  await expectNoSeriousViolations(page);
});

test('a11y: Mines and the canvas games expose a name and game state', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logIn(page);

  await openFromStart(page, 'Mines');
  const mines = page.getByRole('region', { name: /Mines$/ });
  await expect(mines.getByRole('group', { name: 'Mine field' })).toBeVisible();
  await expectNoSeriousViolations(page);
  await mines.getByRole('button', { name: 'Close' }).first().click();

  await openFromStart(page, 'Hen Hunt');
  const hen = page.getByRole('region', { name: /Hen Hunt$/ });
  await hen.getByRole('button', { name: 'Play' }).click();
  const field = hen.getByRole('img', { name: /Hen Hunt field/ });
  await expect(field).toBeVisible();
  await expect(hen.locator('#henhunt-status')).toContainText(
    /^Score 0, 8 shells/,
  );
  await expectNoSeriousViolations(page);
  await page.keyboard.press('Escape');
  await hen.getByRole('button', { name: 'Close' }).first().click();

  await openFromStart(page, 'Star Pinball');
  const pin = page.getByRole('region', { name: /Star Pinball$/ });
  await pin.getByRole('button', { name: 'Play' }).click();
  await expect(
    pin.getByRole('img', { name: /Star Pinball table/ }),
  ).toBeVisible();
  await expect(pin.locator('#pinball-status')).toContainText(
    /^Score 0, ball 1 of 3/,
  );
  await expectNoSeriousViolations(page);
});

test('a11y: keyboard path Mines — arrows, Space reveals, F flags', async ({
  page,
}) => {
  await logIn(page);
  await openFromStart(page, 'Mines');
  const mines = page.getByRole('region', { name: /Mines$/ });
  const field = mines.getByRole('group', { name: 'Mine field' });
  await field.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('f');
  await expect(
    field.getByRole('button', { name: 'Row 2, column 2: flag' }),
  ).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect(
    field.getByRole('button', { name: 'Row 2, column 3: hidden' }),
  ).toHaveCount(0);
  await expectNoSeriousViolations(page);
});

test('a11y: keyboard path Paint menu', async ({ page }) => {
  test.setTimeout(60_000);
  await logIn(page);
  await openFromStart(page, 'Paint');
  const paint = page.getByRole('region', { name: /Paint$/ });
  const file = paint.getByRole('menuitem', { name: 'File', exact: true });
  await file.focus();
  await page.keyboard.press('Enter');
  await expect(paint.getByRole('menuitem', { name: /^New/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(paint.getByRole('menuitem', { name: /^New/ })).toBeHidden();
});
