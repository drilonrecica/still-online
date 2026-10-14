import { expect, test } from '@playwright/test';

test('loads the app and shows the title', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle('still-online');
  await expect(page.getByTestId('boot-screen')).toBeVisible();
});
