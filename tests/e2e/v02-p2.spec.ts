import { expect, test, type Page } from '@playwright/test';
import { logIn, openMessenger } from './helpers';

/** The highest persisted `presenceDay` across contacts (a string: the e2e tsconfig has no DOM types). */
async function presenceDays(page: Page): Promise<number> {
  return page.evaluate<number>(`(() => {
    const raw = localStorage.getItem('still-online:v1:messenger');
    const contacts = JSON.parse(raw ?? '{}').state?.progress?.contacts ?? {};
    return Math.max(0, ...Object.values(contacts).map((c) => c.presenceDay ?? 0));
  })()`);
}

test('P2: each power cycle is a new day with fresh presence and friends', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('./?speed=fast');
  await expect(page.getByTestId('boot-day')).toHaveText('Day 1');

  await logIn(page);
  const messenger = await openMessenger(page);
  const contacts = messenger.getByRole('group', { name: 'Contacts' });
  await expect(contacts).toBeVisible();

  // Days 2–5: a shutdown and power-on advances the day and the label says so.
  for (const day of [2, 3, 4, 5]) {
    await page.getByRole('button', { name: 'start' }).click();
    await page.getByRole('menuitem', { name: 'Turn Off Computer' }).click();
    await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('off-screen').click();
    await expect(page.getByTestId('boot-day')).toHaveText(`Day ${day}`);
    await expect(page.getByTestId('login-screen')).toBeVisible({
      timeout: 5000,
    });
    await page.getByRole('button', { name: /Log on as/ }).click();
    await expect(page.getByTestId('desktop')).toBeVisible();

    const m = page.getByRole('region', { name: 'Messenger' });
    if (!(await m.isVisible())) {
      await page.getByRole('option', { name: 'Messenger' }).dblclick();
    }
    const signIn = page.getByRole('button', { name: 'Sign in' });
    if (await signIn.isVisible()) await signIn.click();
    const list = page
      .getByRole('region', { name: 'Messenger' })
      .getByRole('group', { name: 'Contacts' });
    await expect(list).toBeVisible();
    // Presence for the day was applied to every friend that has signed in.
    await expect
      .poll(async () => presenceDays(page), { timeout: 15_000 })
      .toBe(day);
  }
});
