import { expect, test, type Page } from '@playwright/test';
import { logIn } from './helpers';

/** A `link` file in My Documents, so a double-click emits `browser:open`. */
async function seedLink(page: Page) {
  await page.addInitScript(() => {
    const at = Date.UTC(2007, 5, 12, 15, 30);
    localStorage.setItem(
      'still-online:v1:fs',
      JSON.stringify({
        version: 1,
        state: {
          nodes: {
            'f:tips': {
              id: 'f:tips',
              parentId: 'docs',
              name: 'Surfing tips',
              type: 'link',
              url: 'http://about.example/tips',
              createdAt: at,
              modifiedAt: at,
            },
          },
          purgedSeeds: [],
        },
      }),
    );
  });
}

test('Web Explorer: offline page, Connect, navigate, Back/Forward, Favorites, browser:open', async ({
  page,
}) => {
  await seedLink(page);
  await logIn(page);

  // Offline: the homepage can't be displayed; Connect dials and reloads.
  await page.getByRole('option', { name: 'Web Explorer' }).dblclick();
  const browser = page.getByRole('region', { name: /Web Explorer$/ });
  const error = browser.getByTestId('page-cannot-be-displayed');
  await expect(error).toContainText('You are not connected to the Internet.');
  await error.getByRole('button', { name: 'Connect' }).click();
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'online',
  );
  // The reload lands on the Searchly homepage.
  await expect(error).toHaveCount(0);
  await expect(
    browser.getByRole('button', { name: 'Searchly Search' }),
  ).toBeVisible();

  // Type an address; follow a site link; Back and Forward.
  const address = browser.getByLabel('Address');
  await address.fill('about.example');
  await address.press('Enter');
  await expect(
    browser.getByRole('heading', { name: 'Welcome to Web Explorer!' }),
  ).toBeVisible();
  await expect(browser.getByRole('status')).toHaveText('Done');
  await expect(
    page.getByRole('region', {
      name: 'Welcome to Web Explorer - Web Explorer',
    }),
  ).toBeVisible();
  await browser.getByRole('link', { name: /Surfing Tips/ }).click();
  await expect(
    browser.getByRole('heading', { name: 'Surfing Tips' }),
  ).toBeVisible();
  await browser.getByRole('button', { name: 'Back' }).click();
  await expect(
    browser.getByRole('heading', { name: 'Welcome to Web Explorer!' }),
  ).toBeVisible();
  await browser.getByRole('button', { name: 'Forward' }).click();
  await expect(
    browser.getByRole('heading', { name: 'Surfing Tips' }),
  ).toBeVisible();

  // Favorites: add this page, then open it from the menu after going Home.
  await browser.getByRole('menuitem', { name: 'Favorites' }).click();
  await browser.getByRole('menuitem', { name: 'Add to Favorites...' }).click();
  await browser.getByRole('button', { name: 'Home' }).click();
  await expect(address).toHaveValue('http://searchly.example/');
  await browser.getByRole('menuitem', { name: 'Favorites' }).click();
  await browser
    .getByRole('menu', { name: 'Favorites' })
    .getByRole('menuitem', { name: 'Web Explorer Surfing Tips' })
    .click();
  await expect(
    browser.getByRole('heading', { name: 'Surfing Tips' }),
  ).toBeVisible();
  await browser.getByRole('button', { name: 'Close' }).click();

  // browser:open: a link file in My Documents opens a new Web Explorer window.
  await page.getByRole('option', { name: 'My Documents' }).dblclick();
  await page
    .getByRole('region', { name: 'My Documents' })
    .getByText('Surfing tips')
    .dblclick();
  const opened = page.getByRole('region', { name: /Web Explorer$/ });
  await expect(opened.getByLabel('Address')).toHaveValue(
    'http://about.example/tips',
  );
  await expect(
    opened.getByRole('heading', { name: 'Surfing Tips' }),
  ).toBeVisible();
});
