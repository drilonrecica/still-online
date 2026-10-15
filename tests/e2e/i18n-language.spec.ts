import { expect, test } from '@playwright/test';

test('language picker on the login screen persists across a reload', async ({
  page,
}) => {
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();

  const picker = page.getByLabel('Language / Sprache');
  await expect(picker).toHaveValue('en');
  await picker.selectOption('de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');

  await page.reload();
  await page.getByTestId('boot-screen').click();
  await expect(page.getByLabel('Language / Sprache')).toHaveValue('de');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

test('tray badge and Regional app switch the language live', async ({
  page,
}) => {
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  const badge = page.getByTestId('tray-language');
  await expect(badge).toHaveText('EN');
  await badge.click();
  await page.getByRole('menuitemradio', { name: 'Deutsch' }).click();
  await expect(badge).toHaveText('DE');
  await expect(badge).toHaveAccessibleName('Eingabesprache: Deutsch');
  await page.reload();
  await page.getByTestId('boot-screen').click();
  await expect(page.getByLabel('Language / Sprache')).toHaveValue('de');
});
