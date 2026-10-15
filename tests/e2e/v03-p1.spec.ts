import { expect, test } from '@playwright/test';
import { quietIdle } from './helpers';

test.use({ locale: 'de-DE' });

test('P1: a German browser gets the whole OS shell and the apps in German', async ({
  page,
}) => {
  await quietIdle(page);
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.getByLabel('Ihr Name').fill('Ada');
  await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Start menu and desktop icons.
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.getByRole('menu', { name: 'Startmenü' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('option', { name: 'Papierkorb' })).toBeVisible();

  // Arbeitsplatz opens with German chrome.
  await page.getByRole('option', { name: 'Arbeitsplatz' }).dblclick();
  await expect(
    page.getByRole('region', { name: 'Arbeitsplatz' }),
  ).toBeVisible();
  await page
    .getByRole('region', { name: 'Arbeitsplatz' })
    .getByRole('button', { name: 'Schließen', exact: true })
    .click();

  // Messenger: German sign-in and contact groups.
  await page.getByRole('option', { name: 'Messenger', exact: true }).dblclick();
  await page.getByRole('button', { name: 'Anmelden' }).click();
  await expect(page.getByRole('group', { name: 'Kontakte' })).toBeVisible();

  // Switching to English follows live.
  await page.getByTestId('tray-language').click();
  await page.getByRole('menuitemradio', { name: 'English' }).click();
  await expect(page.getByRole('button', { name: 'start' })).toBeVisible();
});
