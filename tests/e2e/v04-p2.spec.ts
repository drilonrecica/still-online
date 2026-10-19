// v0.4 P2 gate: Pixlog. The feed on the home page, a friend's photos tab and album, kudos once a
// day, and /me with an album from My Pictures, a posted survey and the visitors box.
import { expect, test } from '@playwright/test';
import { go, logIn, openBrowserOnline } from './helpers';

/** Day 5 on the same real date, so Jess's day-5 album is visible and the boot keeps the day. */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('still-online:v1:world')) return;
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    localStorage.setItem(
      'still-online:v1:world',
      JSON.stringify({
        version: 1,
        state: {
          day: 5,
          lastRealDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
          shutdownPending: false,
          dayStartedAt: d.getTime(),
          unlocks: [],
        },
      }),
    );
  });
});

test('pixlog: feed, a friend’s photos and album, kudos, and /me', async ({
  page,
}) => {
  await logIn(page);
  const web = await openBrowserOnline(page);

  // Home: the shouts feed and the visitors box.
  await go(web, 'http://pixlog.example/');
  await expect(
    web.getByRole('region', { name: 'What your friends are up to' }),
  ).toBeVisible();
  await expect(
    web.getByRole('region', { name: /visited/i }).first(),
  ).toBeVisible();

  // A friend's photos tab links to an album with its photos and comments.
  await go(web, 'http://pixlog.example/jess?tab=photos');
  await web
    .getByRole('region', { name: 'Photos' })
    .getByRole('link')
    .first()
    .click();
  await expect(web.getByRole('status').last()).toHaveText('Done', {
    timeout: 10_000,
  });
  await expect(
    web.getByRole('heading', { name: 'COMETS LIVE!!!' }),
  ).toBeVisible();
  await expect(web.getByText('Photo 1 of 6')).toBeVisible();

  // Kudos: once per friend per day.
  await go(web, 'http://pixlog.example/jess');
  await web.getByRole('button', { name: 'Give kudos ★' }).click();
  await expect(
    web.getByRole('button', { name: 'Kudos given today!' }),
  ).toBeDisabled();

  // /me: add a picture from My Pictures, caption it, post a survey.
  await go(web, 'http://pixlog.example/me');
  await expect(web.getByText(/^Kudos received: \d+$/)).toBeVisible();
  await web.getByRole('button', { name: 'Add photos' }).click();
  await web
    .getByRole('button', { name: /^Add (?!photos$).+/ })
    .first()
    .click();
  await web.getByRole('button', { name: 'Edit album' }).click();
  await web.getByLabel('Caption for photo 1').fill('my first pic');
  await web.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(web.getByText('my first pic')).toBeVisible();

  await web.getByRole('button', { name: 'Fill in a survey' }).click();
  await web
    .getByRole('region', { name: 'My surveys' })
    .locator('input[type="text"]')
    .first()
    .fill('pizza');
  await web.getByRole('button', { name: 'Post to my profile' }).click();
  await expect(
    web
      .getByRole('region', { name: 'My surveys' })
      .getByText('pizza', { exact: true }),
  ).toBeVisible();
  await expect(
    web.getByRole('region', { name: /visited/i }).first(),
  ).toBeVisible();
});
