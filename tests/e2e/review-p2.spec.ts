import { expect, test } from '@playwright/test';
import { logIn } from './helpers';

const DIR = 'docs/review/P2';

// Plays days 1–5 with the fast clock via Turn Off → power on, saving the boot day label and
// the Messenger contact list for each day.
test('P2 gate: boot day label and contact list on days 1–5 @review', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./?speed=fast');
  await expect(page.getByTestId('boot-day')).toHaveText('Day 1');
  await page.screenshot({ path: `${DIR}/boot-day-1.png` });

  await logIn(page);

  for (const day of [1, 2, 3, 4, 5]) {
    if (day > 1) {
      await page.getByRole('button', { name: 'start' }).click();
      await page.getByRole('menuitem', { name: 'Turn Off Computer' }).click();
      await expect(page.getByTestId('off-screen')).toBeVisible({
        timeout: 5000,
      });
      await page.getByTestId('off-screen').click();
      await expect(page.getByTestId('boot-day')).toHaveText(`Day ${day}`);
      await page.screenshot({ path: `${DIR}/boot-day-${day}.png` });
      await page.getByRole('button', { name: /Log on as/ }).click();
      await expect(page.getByTestId('desktop')).toBeVisible();
    }

    const messenger = page.getByRole('region', { name: 'Messenger' });
    if (!(await messenger.isVisible())) {
      await page.getByRole('option', { name: 'Messenger' }).dblclick();
    }
    const signIn = page.getByRole('button', { name: 'Sign in' });
    if (await signIn.isVisible()) await signIn.click();
    const list = messenger.getByRole('group', { name: 'Contacts' });
    await expect(list).toBeVisible();
    // Let friends sign in and the new-day presence settle (the fast clock is 100x).
    await page.waitForTimeout(4000);
    await page.mouse.move(900, 700);
    await page.screenshot({ path: `${DIR}/contacts-day-${day}.png` });
  }

  expect(problems).toEqual([]);
});
