// v0.4 P4 gate: the German content on the new sites. Day 5 in German follows Jess's „NEUE FOTOS"
// bulletin to her Pixlog page and concert album, reads her German blog, opens Velvet Lantern's
// band page and the German GlitterCodez layouts; day 1 shows none of the day-5 news.
import { expect, test, type Page } from '@playwright/test';
import { pickGender, quietIdle, setDay } from './helpers';

test.use({ locale: 'de-DE' });

/** Logs on in German (the browser locale picks it) and dials in with Web Explorer. */
async function germanBrowser(page: Page) {
  await quietIdle(page);
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel('Ihr Name').fill('Ada');
  await pickGender(page);
  await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  await page
    .getByRole('option', { name: 'Web Explorer' })
    .dispatchEvent('dblclick');
  const web = page.getByRole('region', { name: /Web Explorer$/ }).first();
  await web
    .getByTestId('page-cannot-be-displayed')
    .getByRole('button')
    .first()
    .click();
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'online',
  );
  return web;
}

async function go(web: ReturnType<Page['locator']>, url: string) {
  const address = web.getByLabel('Adresse');
  await address.fill(url);
  await address.press('Enter');
  await expect(web.getByRole('status').last()).toHaveText('Fertig', {
    timeout: 10_000,
  });
}

test('Tag 5: ein NEUE-FOTOS-Bulletin führt zum Album; Bands und Layouts', async ({
  page,
}) => {
  await setDay(page, 5);
  const web = await germanBrowser(page);

  await go(web, 'http://friendspace.example/bulletins');
  const pics = web
    .getByTestId('bulletin')
    .filter({ hasText: 'NEUE FOTOS auf pixlog!!! ERSTE REIHE!!!!!' });
  await pics.getByRole('link', { name: 'http://pixlog.example/jess' }).click();
  await expect(web.getByRole('status').last()).toHaveText('Fertig', {
    timeout: 10_000,
  });
  await expect(web.getByRole('heading', { level: 1 })).toBeVisible();

  await go(web, 'http://pixlog.example/jess?tab=blog');
  await expect(web.getByText(/HAB ICH IHN GEFANGEN/)).toBeVisible();

  await go(web, 'http://pixlog.example/jess?tab=photos');
  await web
    .getByRole('region', { name: 'Fotos' })
    .getByRole('link', { name: /COMETS LIVE/ })
    .click();
  await expect(web.getByRole('status').last()).toHaveText('Fertig', {
    timeout: 10_000,
  });
  await expect(web.getByText('ERSTE REIHE!!!!')).toBeVisible();

  await go(web, 'http://friendspace.example/band/velvet-lantern');
  await expect(web.getByTestId('band')).toContainText(
    'Indie / Keller / Langsam',
  );

  await go(web, 'http://glittercodez.example/');
  await expect(web.locator('article textarea')).toHaveCount(12);
  await expect(web.getByText('Pony Pastell').first()).toBeVisible();
});

test('Tag 1: die Neuigkeiten von Tag 5 sind noch nicht da', async ({
  page,
}) => {
  await setDay(page, 1);
  const web = await germanBrowser(page);

  await go(web, 'http://friendspace.example/bulletins');
  await expect(web.getByTestId('bulletin')).toHaveCount(3);
  await expect(
    web.getByText('COUNTDOWN ZU DEN TINFOIL COMETS!!!'),
  ).toBeVisible();
  await expect(web.getByText(/ERSTE REIHE/)).toHaveCount(0);

  await go(web, 'http://pixlog.example/jess?tab=photos');
  await expect(web.getByText(/COMETS LIVE/)).toHaveCount(0);
});
