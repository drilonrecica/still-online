import { expect, test, type Page } from '@playwright/test';
import { logIn, openMessenger } from './helpers';

/**
 * Balloons live only `scaleMs(9000)` = 90 ms with `?speed=fast`, too short to assert on
 * directly, so record every balloon text as it appears.
 */
async function recordBalloons(page: Page) {
  // A string, not a function: the e2e tsconfig has no DOM types.
  await page.evaluate(`(() => {
    const seen = (window.__balloons = []);
    new MutationObserver(() => {
      const text = document.querySelector('[data-testid="balloon"]')?.textContent;
      if (text && seen.at(-1) !== text) seen.push(text);
    }).observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });
  })()`);
  return () => page.evaluate<string>(`window.__balloons.join('\\n')`);
}

test('P1: dial-up from the tray, status balloon, disconnect, Messenger auto-dial', async ({
  page,
}) => {
  await logIn(page);
  const balloons = await recordBalloons(page);
  const tray = page.getByTestId('tray-network');
  await expect(tray).toHaveAttribute('data-status', 'offline');

  // Offline tray click opens "Connect to the Internet", which dials on its own and closes.
  await tray.click();
  await expect(tray).toHaveAttribute('data-status', 'online');
  await expect(
    page.getByRole('region', { name: 'Connect to the Internet' }),
  ).toHaveCount(0);
  await expect.poll(balloons).toContain('Connected at 56.0 Kbps');

  // Online: Status shows a balloon, Disconnect hangs up.
  await tray.click();
  await page.getByRole('menuitem', { name: 'Status' }).click();
  await expect
    .poll(balloons)
    .toContain('Connected at 56.0 Kbps · Duration 00:00');
  await tray.click();
  await page.getByRole('menuitem', { name: 'Disconnect' }).click();
  await expect(tray).toHaveAttribute('data-status', 'offline');

  // Messenger sign-in while offline dials automatically, then signs in.
  const messenger = await openMessenger(page);
  await expect(tray).toHaveAttribute('data-status', 'online');

  // Hanging up signs Messenger out.
  await tray.click();
  await page.getByRole('menuitem', { name: 'Disconnect' }).click();
  await expect(
    messenger.getByRole('button', { name: 'Sign in' }),
  ).toBeVisible();
});

test('P1: with "Connect automatically" off, Cancel aborts sign-in and Dial connects', async ({
  page,
}) => {
  await logIn(page);

  // Opened from the Start menu, the dialog waits for Dial.
  await page.getByRole('button', { name: 'start' }).click();
  await page.getByRole('menuitem', { name: /All Programs/ }).click();
  await page.getByRole('menuitem', { name: /Internet/ }).click();
  await page.getByRole('menuitem', { name: 'Connect to the Internet' }).click();
  const dialog = page.getByRole('region', { name: 'Connect to the Internet' });
  await expect(dialog.getByLabel('Dial:')).toHaveValue('555-0137');
  await dialog.getByText('Connect automatically').click();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);

  // Sign in now only opens the dialog; Cancel returns to the sign-in form.
  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  const messenger = page.getByRole('region', { name: 'Messenger' });
  await messenger.getByRole('button', { name: 'Sign in' }).click();
  await expect(dialog).toBeVisible();
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'offline',
  );
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(
    messenger.getByRole('button', { name: 'Sign in' }),
  ).toBeVisible();

  // Dial connects, and the waiting sign-in goes through.
  await messenger.getByRole('button', { name: 'Sign in' }).click();
  await dialog.getByRole('button', { name: 'Dial' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    messenger.getByRole('group', { name: 'Contacts' }),
  ).toBeVisible();
});

test('P1: Display Properties changes the colour scheme; Disk Cleanup frees 0 KB', async ({
  page,
}) => {
  await logIn(page);

  await page.mouse.click(900, 300, { button: 'right' });
  await page.getByRole('menuitem', { name: 'Properties' }).click();
  const display = page.getByRole('region', { name: 'Display Properties' });
  await display.getByRole('tab', { name: 'Appearance' }).click();
  await display.getByLabel('Color scheme:').selectOption({ label: 'Silver' });
  await display.getByRole('button', { name: 'OK' }).click();
  await expect(display).toHaveCount(0);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'silver');

  await page.getByRole('button', { name: 'start' }).click();
  await page.getByRole('menuitem', { name: /All Programs/ }).click();
  await page.getByRole('menuitem', { name: /System Tools/ }).click();
  await page.getByRole('menuitem', { name: 'Disk Cleanup' }).click();
  const cleanup = page.getByRole('region', { name: 'Disk Cleanup' });
  await expect(cleanup.getByText('Files to delete:')).toBeVisible();
  await cleanup.getByRole('button', { name: 'OK' }).click();
  await page
    .getByRole('dialog', { name: 'Disk Cleanup' })
    .getByRole('button', { name: 'Yes' })
    .click();
  const done = page.getByRole('dialog', { name: 'Disk Cleanup' });
  await expect(done.getByText(/freed 0 KB/)).toBeVisible();
  await done.getByRole('button', { name: 'OK' }).click();
  await expect(cleanup).toHaveCount(0);
});
