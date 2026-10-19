// v0.4.1 F-01: a girl pastes a layout on `/me` and saves; after a switch to Boy in User Accounts
// `/me` shows the boy's default headline and his User Accounts picture, and the layout stays.
import { expect, test } from '@playwright/test';
import { go, logIn, openBrowserOnline, openFromStart } from './helpers';

test('F-01: Save with only a layout, switch to Boy, /me shows his defaults', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logIn(page, 'Ada', { gender: 'girl' });
  const web = await openBrowserOnline(page);
  await go(web, 'http://friendspace.example/me');

  await web.getByRole('button', { name: 'Edit Profile' }).click();
  await web.getByLabel('Layout code:').fill('[layout bg=starry]');
  await web.getByRole('button', { name: 'Save Changes' }).click();
  const profile = web.getByTestId('profile');
  await expect(profile).toContainText('new 2 Friendspace!!');
  await expect(web.getByRole('img', { name: "Ada's picture" })).toHaveAttribute(
    'data-picture',
    'butterfly',
  );

  await openFromStart(page, 'User Accounts');
  const accounts = page.getByRole('region', { name: 'User Accounts' });
  await accounts.getByRole('radio', { name: 'Boy' }).click();
  await accounts.getByRole('button', { name: 'OK' }).click();
  await expect(accounts).toBeHidden();

  await expect(profile).toContainText('new to Friendspace. skate all day');
  await expect(profile).not.toContainText('new 2 Friendspace!!');
  await expect(profile).not.toHaveCSS('background-image', 'none');
  await expect(web.getByRole('img', { name: "Ada's picture" })).toHaveAttribute(
    'data-picture',
    'skateboard',
  );
});
