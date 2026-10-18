import { expect, test, type Page } from '@playwright/test';
import { logIn, openFromStart } from './helpers';

const startPicture = (page: Page) =>
  page.getByRole('menu', { name: 'Start menu' }).locator('img[data-picture]');

// G-01: the gender picked at login sets the default user picture; User Accounts changes it live.
test('G-01: pick Boy at login, switch to Girl in User Accounts', async ({
  page,
}) => {
  await logIn(page, 'Ada', { gender: 'boy' });

  await page.getByRole('button', { name: 'start' }).click();
  await expect(startPicture(page)).toHaveAttribute(
    'data-picture',
    'skateboard',
  );
  await page.keyboard.press('Escape');

  await openFromStart(page, 'User Accounts');
  const dialog = page.getByRole('region', { name: 'User Accounts' });
  await expect(dialog).toBeVisible();
  const girl = dialog.getByRole('radio', { name: 'Girl' });
  await expect(dialog.getByRole('radio', { name: 'Boy' })).toBeChecked();
  await girl.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(girl).toBeChecked();
  await dialog.getByRole('button', { name: 'OK' }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole('button', { name: 'start' }).click();
  await expect(startPicture(page)).toHaveAttribute('data-picture', 'butterfly');

  // The choice survives a reload; the return visit no longer asks.
  await page.reload();
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await expect(page.getByRole('radiogroup', { name: 'I am a:' })).toHaveCount(
    0,
  );
  await expect(
    page.getByTestId('login-screen').locator('img[data-picture]'),
  ).toHaveAttribute('data-picture', 'butterfly');
});
