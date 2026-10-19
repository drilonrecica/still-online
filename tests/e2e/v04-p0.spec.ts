// v0.4 P0-01: Spaceport is now Friendspace. Old addresses and favorites land on the new host.
import { expect, test } from '@playwright/test';
import { go, logIn, openBrowserOnline } from './helpers';

test('an old spaceport.example address opens Friendspace', async ({ page }) => {
  await logIn(page);
  const web = await openBrowserOnline(page);
  await go(web, 'http://spaceport.example/jess');
  await expect(web.getByLabel('Address')).toHaveValue(
    'http://friendspace.example/jess',
  );
  await expect(web.getByTestId('profile')).toBeVisible();
  await expect(
    web.getByRole('link', { name: 'Friendspace', exact: true }),
  ).toBeVisible();
  await expect(web).not.toContainText('Spaceport');
});

test('an old Spaceport favorite opens Friendspace', async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('still-online:v1:web')) return;
    localStorage.setItem(
      'still-online:v1:web',
      JSON.stringify({
        state: {
          favorites: [{ title: 'Spaceport', url: 'http://spaceport.example/' }],
        },
        version: 1,
      }),
    );
  });
  await logIn(page);
  const web = await openBrowserOnline(page);
  await web.getByRole('menuitem', { name: 'Favorites' }).click();
  await web
    .getByRole('menu', { name: 'Favorites' })
    .getByRole('menuitem', { name: 'Friendspace' })
    .click();
  await expect(web.getByRole('status')).toHaveText('Done', { timeout: 10_000 });
  await expect(web.getByLabel('Address')).toHaveValue(
    'http://friendspace.example/',
  );
});

test('Friendspace home, a friend profile and /me all render', async ({
  page,
}) => {
  await logIn(page, 'Ada');
  const web = await openBrowserOnline(page);
  await go(web, 'http://friendspace.example/');
  await expect(
    web.getByRole('heading', { name: 'a place for friends in orbit' }),
  ).toBeVisible();
  await go(web, 'http://friendspace.example/jess');
  await expect(web.getByTestId('profile')).toBeVisible();
  await expect(web).toContainText('Top 8');
  await go(web, 'http://spaceport.example/me');
  await expect(web.getByLabel('Address')).toHaveValue(
    'http://friendspace.example/me',
  );
  await expect(web).toContainText('Hello, Ada');
  await expect(web).not.toContainText('Spaceport');
});
