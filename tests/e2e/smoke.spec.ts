import { expect, test } from '@playwright/test';

test('loads the app and shows the title', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'still-online' }),
  ).toBeVisible();
});
