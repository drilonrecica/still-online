import { expect, test } from '@playwright/test';

async function loginScreen(page: import('@playwright/test').Page) {
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
}

test.describe('German browser', () => {
  test.use({ locale: 'de-DE' });

  test('first visit shows the German login screen', async ({ page }) => {
    await loginScreen(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.getByLabel('Language / Sprache')).toHaveValue('de');
    await expect(page.getByLabel('Ihr Name')).toBeVisible();
    await expect(page.getByLabel('Your name')).toHaveCount(0);
    await page.getByLabel('Ihr Name').fill('Ada');
    await expect(
      page.getByRole('button', { name: 'Als Ada anmelden' }),
    ).toBeVisible();
  });
});

test.describe('English browser', () => {
  test.use({ locale: 'en-US' });

  test('first visit shows the English login screen', async ({ page }) => {
    await loginScreen(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByLabel('Language / Sprache')).toHaveValue('en');
    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel('Ihr Name')).toHaveCount(0);
  });
});

test.describe('Other browser language', () => {
  test.use({ locale: 'fr-FR' });

  test('falls back to English', async ({ page }) => {
    await loginScreen(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
