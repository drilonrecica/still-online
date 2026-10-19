// v0.4.1 F gate: the player profile across both sites. A girl saves only a layout on Friendspace
// `/me`, picks another User Accounts picture, and both `/me` pages show it; after a switch to
// German the saved profile shows the German default headline instead of the frozen English one.
import { expect, test } from '@playwright/test';
import { go, logIn, openBrowserOnline, openFromStart } from './helpers';

test('F gate: the saved profile follows the language and the User Accounts picture', async ({
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

  await openFromStart(page, 'User Accounts');
  const accounts = page.getByRole('region', { name: 'User Accounts' });
  await accounts.getByRole('button', { name: 'Rocket' }).click();
  await accounts.getByRole('button', { name: 'OK' }).click();
  await expect(accounts).toBeHidden();
  await expect(web.getByRole('img', { name: "Ada's picture" })).toHaveAttribute(
    'data-picture',
    'rocket',
  );

  await go(web, 'http://pixlog.example/me');
  await expect(web.getByRole('img', { name: 'Your picture' })).toHaveAttribute(
    'data-picture',
    'rocket',
  );

  await go(web, 'http://friendspace.example/me');
  await page.getByTestId('tray-language').dispatchEvent('click');
  await page
    .getByRole('menuitemradio', { name: 'Deutsch' })
    .dispatchEvent('click');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(profile).toContainText('neu auf Friendspace!!');
  await expect(profile).not.toContainText('new 2 Friendspace!!');
  await expect(profile).not.toHaveCSS('background-image', 'none');
});
