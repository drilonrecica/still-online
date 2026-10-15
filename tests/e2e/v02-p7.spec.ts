import { expect, test, type Page } from '@playwright/test';
import { go, logIn, openBrowserOnline, openFromStart } from './helpers';

async function nextDay(page: Page, day: number) {
  await page.getByRole('button', { name: 'start' }).click();
  await page.getByRole('menuitem', { name: 'Turn Off Computer' }).click();
  await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('off-screen').click();
  await expect(page.getByTestId('boot-day')).toHaveText(`Day ${day}`);
  await page.getByRole('button', { name: /Log on as/ }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();
}

// The release playthrough: three power cycles, and each day delivers new mail and wall comments.
test('P7: three days bring new mail and Friendspace comments', async ({
  page,
}) => {
  test.setTimeout(150_000);
  await logIn(page);
  await openBrowserOnline(page);
  await openFromStart(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');

  const mailCounts: number[] = [];
  const wallCounts: number[] = [];
  for (const day of [1, 2, 3]) {
    if (day > 1) {
      await nextDay(page, day);
      // The mail window and the browser survive the power cycle only if reopened.
      if (!(await mail.isVisible())) await openFromStart(page, 'Mail');
    }
    await mail.getByRole('button', { name: 'Send/Recv' }).click();
    await expect(rows).not.toHaveCount(1, { timeout: 10_000 });
    await page.waitForTimeout(1500);
    mailCounts.push(await rows.count());

    const web = page.getByRole('region', { name: /Web Explorer$/ });
    if (!(await web.isVisible())) {
      await openFromStart(page, 'Web Explorer');
      const connect = web
        .getByTestId('page-cannot-be-displayed')
        .getByRole('button', { name: 'Connect' });
      if (await connect.isVisible()) await connect.click();
    }
    await go(web, 'friendspace.example/jess');
    const wall = web.getByRole('list', { name: 'Comments' });
    await expect(web.getByTestId('profile')).toBeVisible();
    wallCounts.push(await wall.getByRole('listitem').count());
  }

  expect(mailCounts[1]).toBeGreaterThan(mailCounts[0]!);
  expect(mailCounts[2]).toBeGreaterThan(mailCounts[1]!);
  expect(wallCounts[2]).toBeGreaterThanOrEqual(wallCounts[0]!);
});
