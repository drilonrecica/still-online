// v0.4 P3 gate: the English content on the new sites. Day 5 follows Jess's "NEW PICS" bulletin to
// her Pixlog page and concert album, opens Velvet Lantern's band page and the 12 GlitterCodez
// layouts; day 1 shows none of the day-5 news.
import { expect, test, type Page } from '@playwright/test';
import { go, logIn, openBrowserOnline } from './helpers';

/** Starts on `day` on the same real date, so the boot keeps the day. */
async function startOnDay(page: Page, day: number) {
  await page.addInitScript((day) => {
    if (localStorage.getItem('still-online:v1:world')) return;
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    localStorage.setItem(
      'still-online:v1:world',
      JSON.stringify({
        version: 1,
        state: {
          day,
          lastRealDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
          shutdownPending: false,
          dayStartedAt: d.getTime(),
          unlocks: [],
        },
      }),
    );
  }, day);
}

test('day 5: a NEW PICS bulletin leads to the album; bands and layouts', async ({
  page,
}) => {
  await startOnDay(page, 5);
  await logIn(page);
  const web = await openBrowserOnline(page);

  await go(web, 'http://friendspace.example/bulletins');
  const pics = web
    .getByTestId('bulletin')
    .filter({ hasText: 'NEW PICS on pixlog!!! FRONT ROW!!!!!' });
  await pics.getByRole('link', { name: 'http://pixlog.example/jess' }).click();
  await expect(web.getByRole('status').last()).toHaveText('Done', {
    timeout: 10_000,
  });
  await expect(web.getByRole('heading', { level: 1 })).toBeVisible();

  await go(web, 'http://pixlog.example/jess?tab=photos');
  await web
    .getByRole('region', { name: 'Photos' })
    .getByRole('link', { name: /COMETS LIVE/ })
    .click();
  await expect(web.getByRole('status').last()).toHaveText('Done', {
    timeout: 10_000,
  });
  await expect(
    web.getByRole('heading', { name: 'COMETS LIVE!!!' }),
  ).toBeVisible();

  await go(web, 'http://friendspace.example/band/velvet-lantern');
  await expect(web.getByTestId('band')).toContainText('Velvet Lantern');

  await go(web, 'http://glittercodez.example/');
  await expect(web.locator('article textarea')).toHaveCount(12);
});

test('day 1: the day-5 news is not out yet', async ({ page }) => {
  await startOnDay(page, 1);
  await logIn(page);
  const web = await openBrowserOnline(page);

  await go(web, 'http://friendspace.example/bulletins');
  await expect(web.getByTestId('bulletin').first()).toBeVisible();
  await expect(web.getByTestId('bulletin')).toHaveCount(3);
  await expect(web.getByText(/FRONT ROW/)).toHaveCount(0);

  await go(web, 'http://pixlog.example/jess?tab=photos');
  await expect(web.getByText(/COMETS LIVE/)).toHaveCount(0);
});
