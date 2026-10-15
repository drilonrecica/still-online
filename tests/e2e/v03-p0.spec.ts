import { expect, test } from '@playwright/test';
import { logIn, openFromStart, setLanguage } from './helpers';

test('P0: language picker, Regional and Language Options and tray menu stay in sync', async ({
  page,
}) => {
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await setLanguage(page, 'de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await setLanguage(page, 'en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Regional and Language Options: Apply switches the whole OS, live.
  await openFromStart(page, 'Regional and Language Options');
  const regional = page.getByRole('region', {
    name: 'Regional and Language Options',
  });
  await expect(regional).toBeVisible();
  await regional.getByRole('combobox').selectOption('de');
  await regional.getByRole('button', { name: 'Apply' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(
    page.getByRole('region', { name: 'Regions- und Sprachoptionen' }),
  ).toBeVisible();

  // Tray badge flips back, window title follows.
  const badge = page.getByTestId('tray-language');
  await expect(badge).toHaveText('DE');
  await badge.click();
  await page.getByRole('menuitemradio', { name: 'English' }).click();
  await expect(badge).toHaveText('EN');
  await expect(badge.locator('img[data-flag="en"]')).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Regional and Language Options' }),
  ).toBeVisible();
});

test('P0: German choice survives a reload and a fresh log-on', async ({
  page,
}) => {
  await logIn(page);
  await page.getByTestId('tray-language').click();
  await page.getByRole('menuitemradio', { name: 'Deutsch' }).click();
  // The first switch fetches the German chunk; the choice is saved once it has applied.
  await expect(page.getByTestId('tray-language')).toHaveText('DE');
  await page.reload();
  await page.getByTestId('boot-screen').click();
  await expect(page.getByRole('radio', { name: 'Deutsch' })).toBeChecked();
});
