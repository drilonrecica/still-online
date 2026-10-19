// v0.4 G gate: a boy plays, switches to Girl in User Accounts, and finds both new sites.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { go, logIn, openBrowserOnline, openFromStart } from './helpers';

const docs = (page: Page) => page.getByRole('region', { name: 'My Documents' });

async function openDocs(page: Page) {
  await page.getByRole('option', { name: 'My Documents' }).dblclick();
  await expect(docs(page)).toBeVisible();
}

async function closeDocs(page: Page) {
  await docs(page).getByRole('button', { name: 'Close' }).click();
  await expect(docs(page)).toBeHidden();
}

async function favorites(web: Locator) {
  await web.getByRole('menuitem', { name: 'Favorites' }).click();
  const menu = web.getByRole('menu', { name: 'Favorites' });
  await expect(menu).toBeVisible();
  return menu;
}

test('G gate: boy files and favorites, switch to Girl, both sites on Searchly', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await logIn(page, 'Ada', { gender: 'boy' });

  // 1. A boy login shows the boy files and favorites.
  await openDocs(page);
  await expect(
    docs(page).getByText('my_wrestling_entrance_speech.txt'),
  ).toBeVisible();
  await expect(docs(page).getByText('poem_DO_NOT_READ.txt')).toHaveCount(0);
  await closeDocs(page);

  const web = await openBrowserOnline(page);
  let menu = await favorites(web);
  await expect(menu.getByRole('menuitem', { name: 'CheatCave' })).toBeVisible();
  await expect(
    menu.getByRole('menuitem', { name: 'Kickflip Kings' }),
  ).toBeVisible();
  await expect(
    menu.getByRole('menuitem', { name: 'Celeb Gossip 07' }),
  ).toHaveCount(0);
  await page.keyboard.press('Escape');

  // 2. Switching to Girl in User Accounts swaps untouched files and favorites live.
  await openFromStart(page, 'User Accounts');
  const accounts = page.getByRole('region', { name: 'User Accounts' });
  await accounts.getByRole('radio', { name: 'Girl' }).click();
  await accounts.getByRole('button', { name: 'OK' }).click();
  await expect(accounts).toBeHidden();

  await web.getByRole('button', { name: 'Minimize' }).click();
  await openDocs(page);
  await expect(docs(page).getByText('poem_DO_NOT_READ.txt')).toBeVisible();
  await expect(
    docs(page).getByText('my_wrestling_entrance_speech.txt'),
  ).toHaveCount(0);
  await closeDocs(page);

  await page.getByRole('button', { name: /Web Explorer$/ }).click();
  menu = await favorites(web);
  await expect(
    menu.getByRole('menuitem', { name: 'Celeb Gossip 07' }),
  ).toBeVisible();
  await expect(
    menu.getByRole('menuitem', { name: 'Tinfoil Comets' }),
  ).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'CheatCave' })).toHaveCount(
    0,
  );
  await page.keyboard.press('Escape');

  // 3. Both new sites are found through Searchly, and the results open them.
  for (const [query, host, title] of [
    ['cheats', 'cheatcave.example', /CheatCave/],
    ['kickflip', 'kickflipkings.example', /KICKFLIP KINGS/],
  ] as const) {
    await go(web, `searchly.example/search?q=${query}`);
    const result = web.getByRole('link', { name: title }).first();
    await expect(result).toBeVisible();
    await result.click();
    await expect(web.getByRole('status')).toHaveText('Done', {
      timeout: 10_000,
    });
    await expect(web.getByLabel('Address')).toHaveValue(
      new RegExp(`^http://${host.replace('.', '\\.')}/`),
    );
  }
});
