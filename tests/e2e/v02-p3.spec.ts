import { expect, test } from '@playwright/test';
import { logIn } from './helpers';

test('P3: send a wink and receive one back', async ({ page }) => {
  await logIn(page);
  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Jess nudges on sign-in, which opens her chat; wait for the shake to end.
  const chat = page.getByRole('region', { name: /JeSs.*Conversation$/ });
  await expect(chat).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-shaking]')).toHaveCount(0);
  const log = chat.getByRole('log', { name: 'Conversation' });

  await chat.getByRole('button', { name: 'Winks ▾' }).click();
  await chat.getByRole('menuitem', { name: 'Pickle' }).click();
  await expect(log).toContainText('You sent a wink: Pickle');
  const overlay = chat.locator('[data-wink]');
  await expect(overlay).toHaveAttribute('data-wink', 'pickle');
  await expect(overlay).toHaveCount(0, { timeout: 5000 });

  // Guessing "a hamster" makes Jess send one back.
  await chat.getByRole('button', { name: 'A hamster?' }).click();
  await chat.getByRole('button', { name: 'Send' }).click();
  await expect(log).toContainText('sent you a wink: Hamster', {
    timeout: 10_000,
  });
});
