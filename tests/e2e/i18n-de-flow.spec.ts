import { expect, test } from '@playwright/test';
import { quietIdle } from './helpers';

test.use({ locale: 'de-DE' });

test('German happy path: Start menu, Messenger, Searchly, Mail, a game', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await quietIdle(page);
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel('Ihr Name').fill('Ada');
  await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Start menu
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('menu', { name: 'Startmenü' })).toBeVisible();
  await expect(
    page.getByRole('menuitem', { name: /Alle Programme/ }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

  // Messenger: sign in (goes online) and a conversation with a choice.
  await page
    .getByRole('option', { name: 'Messenger', exact: true })
    .dispatchEvent('dblclick');
  await page.getByRole('button', { name: 'Anmelden' }).click();
  const list = page.getByRole('group', { name: 'Kontakte' });
  await expect(list).toBeVisible();
  const chat = page.getByRole('region', { name: /Unterhaltung$/ }).first();
  await expect(chat).toBeVisible({ timeout: 10_000 });
  const replies = chat.getByRole('group', { name: 'Antworten' });
  await expect(replies).toBeVisible({ timeout: 10_000 });
  // Dispatched directly: a nudging chat window is never "stable" for a normal click.
  await replies.getByRole('button').first().dispatchEvent('click');
  await chat
    .getByRole('button', { name: 'Senden', exact: true })
    .dispatchEvent('click');
  await expect(
    chat
      .getByRole('log', { name: 'Unterhaltung' })
      .locator('[data-from="player"]')
      .first(),
  ).toBeVisible();
  for (const c of await page
    .getByRole('region', { name: /Unterhaltung$/ })
    .all())
    await c.getByRole('button', { name: 'Schließen' }).dispatchEvent('click');

  // Web Explorer: a German Searchly search.
  await page
    .getByRole('option', { name: 'Web Explorer' })
    .dispatchEvent('dblclick');
  const web = page.getByRole('region', { name: /Web Explorer$/ }).first();
  const address = web.getByLabel('Adresse');
  await address.fill('searchly.example/search?q=tinfoil');
  await address.press('Enter');
  await expect(web.getByRole('status')).toHaveText('Fertig', {
    timeout: 10_000,
  });
  await expect(web).toContainText('Ergebnisse');
  await expect(web).not.toContainText('Results ');

  // Mail: fetch and read the German welcome message.
  await page
    .getByRole('option', { name: 'Mail', exact: true })
    .dispatchEvent('dblclick');
  const mail = page.getByRole('region', { name: /Mail$/ }).first();
  await mail.getByRole('button', { name: 'Senden/Empfangen' }).click();
  await mail
    .getByRole('row', { name: /Willkommen bei Ihrem neuen PixelPoint/ })
    .click();
  await expect(mail).toContainText('Sehr geehrte Kundin');

  // A game: Minen opens with German chrome.
  await page.getByRole('option', { name: 'Minen' }).dispatchEvent('dblclick');
  await expect(
    page.getByRole('region', { name: 'Minen' }).first(),
  ).toBeVisible();
});
