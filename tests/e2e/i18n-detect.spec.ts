import { expect, test } from '@playwright/test';
import { pickGender } from './helpers';

/** Requests for the lazy German chunk (`src/content/de/bundle.ts` → `assets/bundle-*.js`). */
function watchGermanChunk(page: import('@playwright/test').Page) {
  const seen: string[] = [];
  page.on('request', (r) => {
    if (/\/assets\/bundle-[\w-]+\.js$/.test(r.url())) seen.push(r.url());
  });
  return seen;
}

async function loginScreen(page: import('@playwright/test').Page) {
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
}

test.describe('German browser', () => {
  test.use({ locale: 'de-DE' });

  test('first visit shows the German login screen', async ({ page }) => {
    const german = watchGermanChunk(page);
    await loginScreen(page);
    expect(german).toHaveLength(1);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    await expect(page.getByRole('radio', { name: 'Deutsch' })).toBeChecked();
    await expect(page.getByLabel('Ihr Name')).toBeVisible();
    await expect(page.getByLabel('Your name')).toHaveCount(0);
    await page.getByLabel('Ihr Name').fill('Ada');
    await pickGender(page);
    await expect(
      page.getByRole('button', { name: 'Als Ada anmelden' }),
    ).toBeVisible();
  });
});

test.describe('English browser', () => {
  test.use({ locale: 'en-US' });

  test('first visit shows the English login screen', async ({ page }) => {
    const german = watchGermanChunk(page);
    await loginScreen(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('radio', { name: 'English' })).toBeChecked();
    await expect(page.getByLabel('Your name')).toBeVisible();
    await expect(page.getByLabel('Ihr Name')).toHaveCount(0);
    // English players never download German.
    expect(german).toEqual([]);
  });

  test('picking Deutsch fetches German on demand and switches live', async ({
    page,
  }) => {
    const german = watchGermanChunk(page);
    await loginScreen(page);
    await page.getByRole('radio', { name: 'Deutsch' }).click();
    await expect(page.getByLabel('Ihr Name')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
    expect(german).toHaveLength(1);
  });
});

test.describe('Other browser language', () => {
  test.use({ locale: 'fr-FR' });

  test('falls back to English', async ({ page }) => {
    await loginScreen(page);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
