import { expect, test } from '@playwright/test';
import { go, logIn, openBrowserOnline, openFromStart } from './helpers';

const DIR = 'docs/review/P7';

// Full playthrough over 3 days via Turn Off → power on, saving per-day evidence and logging
// how much new content (mail, Spaceport comments, guestbook entries, chats) each day brings.
test('P7 gate: three-day playthrough @review', async ({ page }) => {
  test.setTimeout(180_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await openBrowserOnline(page);
  await openFromStart(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  const web = page.getByRole('region', { name: /Web Explorer$/ });
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  const stats: string[] = [];

  for (const day of [1, 2, 3]) {
    if (day > 1) {
      await page.getByRole('button', { name: 'start' }).click();
      await page.getByRole('menuitem', { name: 'Turn Off Computer' }).click();
      await page.getByTestId('off-screen').click();
      await expect(page.getByTestId('boot-day')).toHaveText(`Day ${day}`);
      await page.screenshot({ path: `${DIR}/boot-day-${day}.png` });
      await page.getByRole('button', { name: /Log on as/ }).click();
      await expect(page.getByTestId('desktop')).toBeVisible();
      if (!(await mail.isVisible())) await openFromStart(page, 'Mail');
    }
    await mail.getByRole('button', { name: 'Send/Recv' }).click();
    await expect(rows).not.toHaveCount(1, { timeout: 10_000 });
    await page.waitForTimeout(1500);
    const mailCount = (await rows.count()) - 1;
    await page.screenshot({ path: `${DIR}/mail-day-${day}.png` });

    if (!(await web.isVisible())) {
      await openFromStart(page, 'Web Explorer');
      const connect = web
        .getByTestId('page-cannot-be-displayed')
        .getByRole('button', { name: 'Connect' });
      if (await connect.isVisible()) await connect.click();
    }
    await go(web, 'spaceport.example/jess');
    const walls = await web
      .getByRole('list', { name: 'Comments' })
      .getByRole('listitem')
      .count();
    await page.screenshot({ path: `${DIR}/spaceport-day-${day}.png` });

    await go(web, 'tinfoilcomets.example/guestbook');
    await page.screenshot({ path: `${DIR}/guestbook-day-${day}.png` });
    const guest = (await web.innerText()).length;

    stats.push(
      `day ${day}: mail rows=${mailCount}, jess wall comments=${walls}, guestbook text chars=${guest}`,
    );
  }

  console.log(stats.join('\n'));
  expect(problems).toEqual([]);
});
