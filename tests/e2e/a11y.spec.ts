import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

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
  await boot(page);
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();
  await page.getByRole('button', { name: 'start' }).click();
  await expect(page.getByRole('menu', { name: 'Start menu' })).toBeVisible();
  await expectNoSeriousViolations(page);
});

test('a11y: Messenger chat and Amplifier', async ({ page }) => {
  await boot(page);
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();
  const chat = page.getByRole('region', { name: /Conversation$/ });
  await expect(chat).toBeVisible({ timeout: 10_000 });
  await expectNoSeriousViolations(page);

  // Clear the windows off the Amplifier icon, then open it.
  await chat.getByRole('button', { name: 'Close' }).dispatchEvent('click');
  await expect(chat).toBeHidden();
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
