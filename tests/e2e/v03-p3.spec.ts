import { expect, test } from '@playwright/test';
import { pickGender, quietIdle } from './helpers';

test.use({ locale: 'de-DE' });

// Release flow: a German player switches to English mid-game, keeps it across a new day, and
// switches back on the login screen; the old day-1 chat follows every switch.
test('P3: German game, English mid-game, back to German on the next day', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await quietIdle(page);
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByRole('radio', { name: 'Deutsch' })).toBeChecked();
  await page.getByLabel('Ihr Name').fill('Ada');
  await pickGender(page);
  await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Day 1 in German: Messenger, Jess nudges, answer her once.
  await page
    .getByRole('option', { name: 'Messenger', exact: true })
    .dispatchEvent('dblclick');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  const chat = page.getByRole('region', {
    name: 'xX~JeSs~Xx :D - Unterhaltung',
  });
  const replies = chat.getByRole('group', { name: 'Antworten' });
  await expect(replies).toBeVisible({ timeout: 15_000 });
  // Dispatched directly: a nudging chat window is never "stable" for a normal click.
  await replies.getByRole('button').first().dispatchEvent('click');
  await chat
    .getByRole('button', { name: 'Senden', exact: true })
    .dispatchEvent('click');
  const log = chat.getByRole('log', { name: 'Unterhaltung' });
  await expect(log.locator('[data-from="player"]').first()).toBeVisible();
  await expect(log).toContainText('hat Ihnen einen Nudge geschickt');

  // Mid-game: tray badge → English. The open chat re-renders.
  await page.getByTestId('tray-language').dispatchEvent('click');
  await page
    .getByRole('menuitemradio', { name: 'English' })
    .dispatchEvent('click');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const enChat = page.getByRole('region', {
    name: 'xX~JeSs~Xx :D - Conversation',
  });
  await expect(enChat.getByRole('log', { name: 'Conversation' })).toContainText(
    'just sent you a nudge!',
  );
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();

  // Turn Off → Day 2: English sticks through boot and login.
  await page
    .getByRole('button', { name: 'start', exact: true })
    .dispatchEvent('click');
  await page
    .getByRole('menuitem', { name: 'Turn Off Computer' })
    .dispatchEvent('click');
  await page.getByTestId('off-screen').click();
  await expect(page.getByTestId('boot-day')).toHaveText('Day 2');
  await expect(page.getByRole('radio', { name: 'English' })).toBeChecked();
  await expect(
    page.getByRole('button', { name: 'Log on as Ada' }),
  ).toBeVisible();

  // Back to German in the login picker, before logging on.
  await page.getByRole('radio', { name: 'Deutsch' }).click();
  await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();
  await expect(page.getByTestId('tray-language')).toHaveText('DE');

  // Day 1's conversation is still there, in German.
  await page
    .getByRole('option', { name: 'Messenger', exact: true })
    .dispatchEvent('dblclick');
  const signIn = page.getByRole('button', { name: 'Anmelden' });
  const list = page.getByRole('group', { name: 'Kontakte' });
  await expect(signIn.or(list)).toBeVisible();
  if (await signIn.isVisible()) await signIn.click();
  await expect(list).toBeVisible();
  await list.locator('[data-contact-id="jess"]').dispatchEvent('dblclick');
  const deLog = chat.getByRole('log', { name: 'Unterhaltung' });
  await expect(deLog).toContainText('hat Ihnen einen Nudge geschickt');
  await expect(deLog).not.toContainText('just sent you a nudge');
});
