import { expect, test } from '@playwright/test';
import { go, logIn, openBrowserOnline, openFromStart } from './helpers';

test('P4: search the web, read the fan page, sign its guestbook', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logIn(page);
  const browser = await openBrowserOnline(page);

  // Searchly is the homepage once online (Connect reloads it).
  await go(browser, 'searchly.example/search?q=tinfoil');
  await expect(
    browser.getByRole('link', { name: /Tinfoil Comets/i }).first(),
  ).toBeVisible();

  await go(browser, 'tinfoilcomets.example/guestbook');
  await browser.getByLabel('Name:').fill('Ada');
  await browser.getByLabel('Message:').fill('best band ever :D');
  await browser.getByRole('button', { name: 'Sign it!!!' }).click();
  await expect(browser).toContainText('best band ever :D');
});

test('P4: Mail delivers the day-1 inbox and TuneMole downloads a track', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await logIn(page);
  await openBrowserOnline(page);

  await openFromStart(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  await expect(mail).toBeVisible();
  await mail.getByRole('button', { name: 'Send/Recv' }).click();
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 10_000 });
  await rows.nth(1).click();
  await expect(mail.getByLabel('Preview')).not.toBeEmpty();

  await openFromStart(page, 'TuneMole');
  const mole = page.getByRole('region', { name: /TuneMole$/ });
  await expect(mole.getByRole('status')).toContainText('Connected to');
  await mole.getByLabel('Search for music').fill('surf');
  await mole.getByRole('button', { name: 'Search' }).click();
  await mole
    .getByRole('button', { name: /^Download Surf_Shimmy/ })
    .first()
    .click();
  await mole.getByRole('tab', { name: 'Downloads' }).click();
  await expect(mole.getByRole('table', { name: 'Downloads' })).toContainText(
    'Surf_Shimmy',
  );
});
