import { expect, test } from '@playwright/test';
import { pickGender } from './helpers';

test('language picker on the login screen persists across a reload', async ({
  page,
}) => {
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();

  await expect(page.getByRole('radio', { name: 'English' })).toBeChecked();
  await page.getByRole('radio', { name: 'Deutsch' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');

  await page.reload();
  await page.getByTestId('boot-screen').click();
  await expect(page.getByRole('radio', { name: 'Deutsch' })).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

test('tray badge and Regional app switch the language live', async ({
  page,
}) => {
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel('Your name').fill('Ada');
  await pickGender(page);
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  const badge = page.getByTestId('tray-language');
  await expect(badge).toHaveText('EN');
  await expect(badge.locator('img[data-flag="en"]')).toBeVisible();
  await badge.click();
  await page.getByRole('menuitemradio', { name: 'Deutsch' }).click();
  await expect(badge).toHaveText('DE');
  await expect(badge).toHaveAccessibleName('Eingabesprache: Deutsch');
  await page.reload();
  await page.getByTestId('boot-screen').click();
  await expect(page.getByRole('radio', { name: 'Deutsch' })).toBeChecked();
});
