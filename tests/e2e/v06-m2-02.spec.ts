// v0.6 M2-02: Web Explorer on a phone. Pages lay out at 800 px and fit the screen with CSS zoom
// (or scroll sideways at Actual size); the toolbar is condensed and Favorites is a sheet. Every
// site is crawled on day 1 and day 10, and the forms and links work by tap.
/// <reference lib="dom" />
import { expect, test, type Locator, type Page } from '@playwright/test';
import { logIn, logInTouch, openAppTouch, setDay, tap } from './helpers';

/**
 * Every host in `SITES` (src/apps/browser/sites/index.ts) with its pages that take no query or
 * have no link to them. The crawl adds every same-host link it finds (profiles, bands, albums,
 * posts, tags) up to `CRAWL_LIMIT` pages per host.
 */
const SITE_PAGES: Readonly<Record<string, readonly string[]>> = {
  'searchly.example': ['/', '/search?q=tinfoil'],
  'tinfoilcomets.example': ['/', '/band', '/guestbook', '/pics'],
  'friendspace.example': [
    '/',
    '/me',
    '/bulletins',
    ...['jess', 'kayla', 'marco', 'dex', 'pia', 'theo'].map((id) => `/${id}`),
  ],
  'westfield-high.example': ['/', '/news', '/staff', '/cafeteria'],
  'celebgossip07.example': ['/', '/celebs'],
  'cheatcave.example': ['/', '/cheats', '/clips', '/forum'],
  'kickflipkings.example': ['/', '/crew', '/tricks', '/video', '/gigs'],
  'glittercodez.example': ['/', '/glitter', '/stickers', '/cursors'],
  'pixlog.example': [
    '/',
    '/me',
    ...['jess', 'kayla', 'marco', 'dex', 'pia', 'theo'].map((id) => `/${id}`),
  ],
  'virusguard.example': ['/'],
  'about.example': ['/', '/tips'],
};
const CRAWL_LIMIT = 24;
const fontSize = (el: Element) => parseFloat(getComputedStyle(el).fontSize);

/** Opens Web Explorer by touch and dials in through the offline page's Connect button. */
async function openWebTouch(page: Page): Promise<Locator> {
  await openAppTouch(page, 'Web Explorer');
  return connectTouch(page.getByRole('region', { name: /Web Explorer$/ }));
}

/** Taps Connect on the offline page and waits for the page to load. */
async function connectTouch(web: Locator): Promise<Locator> {
  await tap(
    web
      .getByTestId('page-cannot-be-displayed')
      .getByRole('button', { name: 'Connect' }),
  );
  // The tray's network icon hides behind the chevron on a phone: wait for the reload instead.
  await expect(web.getByTestId('page-cannot-be-displayed')).toHaveCount(0, {
    timeout: 15_000,
  });
  await expect(web.getByRole('status').last()).toHaveText('Done', {
    timeout: 10_000,
  });
  return web;
}

/** Types `url` into the address bar (tapped first, like a finger would) and waits for Done. */
async function goTouch(web: Locator, url: string) {
  const address = web.getByLabel('Address');
  await tap(address);
  await address.fill(url);
  await address.press('Enter');
  await expectDone(web);
}

async function expectDone(web: Locator) {
  // `.last()`: the status bar; pages such as GlitterCodez have their own live regions.
  await expect(web.getByRole('status').last()).toHaveText('Done', {
    timeout: 10_000,
  });
}

interface Fit {
  pageScroll: number;
  inner: number;
  /** The 800 px page: its content width and its own width (CSS px). */
  content: number;
  virtual: number;
  /** The page area: its content width and visible width. */
  areaScroll: number;
  areaWidth: number;
}

async function measure(web: Locator): Promise<Fit> {
  const area = web.getByTestId('browser-viewport');
  return area.evaluate((el) => {
    const virtual = el.querySelector('[data-testid="browser-page"]');
    return {
      pageScroll: document.documentElement.scrollWidth,
      inner: innerWidth,
      content: virtual?.scrollWidth ?? 0,
      virtual: virtual?.clientWidth ?? 0,
      areaScroll: el.scrollWidth,
      areaWidth: el.clientWidth,
    };
  });
}

/** Fit to screen: nothing wider than 800 px, and neither the page nor the area scrolls sideways. */
async function expectFitted(web: Locator, what: string) {
  const m = await measure(web);
  expect(m.pageScroll, `${what}: no sideways page scroll`).toBeLessThanOrEqual(
    m.inner,
  );
  expect(m.virtual, `${what}: 800 px layout`).toBe(800);
  expect(m.content, `${what}: nothing wider than 800 px`).toBeLessThanOrEqual(
    800,
  );
  expect(m.areaScroll, `${what}: fits the page area`).toBeLessThanOrEqual(
    m.areaWidth,
  );
}

/** A finger-sized target: at least 36 × 36 px. */
async function expectTapTarget(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('not visible');
  expect(box.height).toBeGreaterThanOrEqual(35.5);
  expect(box.width).toBeGreaterThanOrEqual(35.5);
}

/** Visits every listed page of every host, plus the same-host links found on them. */
async function crawlAllSites(page: Page, web: Locator, day: number) {
  for (const [host, paths] of Object.entries(SITE_PAGES)) {
    const queue = paths.map((p) => `http://${host}${p}`);
    const seen = new Set(queue);
    for (let i = 0; i < queue.length && i < CRAWL_LIMIT; i++) {
      const url = queue[i]!;
      await goTouch(web, url);
      await expectFitted(web, `day ${day} ${url}`);
      const links = await web
        .getByTestId('browser-page')
        .locator(`a[href^="http://${host}/"]`)
        .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const link of links.map((l) => l.split('#')[0]!)) {
        if (!seen.has(link)) {
          seen.add(link);
          queue.push(link);
        }
      }
    }
  }
}

for (const day of [1, 10]) {
  test(`every site fits a phone on day ${day} @phone`, async ({ page }) => {
    test.setTimeout(300_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await setDay(page, day);
    await logInTouch(page);
    const web = await openWebTouch(page);
    await expect(web.getByTestId('browser-viewport')).toHaveAttribute(
      'data-view',
      'fit',
    );
    await crawlAllSites(page, web, day);
    expect(errors).toEqual([]);
  });
}

test('the condensed toolbar, the Favorites sheet and Actual size @phone', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await logInTouch(page);
  const web = await openWebTouch(page);

  // Back, Forward, Refresh, Home and Favorites as 36 px icon buttons; the address on its own row.
  const toolbar = web.getByRole('toolbar', { name: 'Standard Buttons' });
  const tools = toolbar.getByRole('button');
  await expect(tools).toHaveCount(5);
  for (const tool of await tools.all()) await expectTapTarget(tool);
  const address = web.getByLabel('Address');
  const [bar, field] = [
    await toolbar.boundingBox(),
    await address.boundingBox(),
  ];
  expect(field!.y).toBeGreaterThanOrEqual(bar!.y + bar!.height - 1);
  expect(field!.height).toBeGreaterThanOrEqual(34);
  expect(await address.evaluate(fontSize)).toBeGreaterThanOrEqual(16);
  await expect(web.getByRole('button', { name: 'Stop' })).toHaveCount(0);
  for (const menu of await web.getByRole('menubar').getByRole('menuitem').all())
    expect((await menu.boundingBox())!.height).toBeGreaterThanOrEqual(35.5);
  // The status bar stays 20 px.
  const status = web.getByRole('status').last();
  expect((await status.locator('..').boundingBox())!.height).toBeLessThan(24);

  // Favorites: a sheet over the page; a tap beside it closes it, a site choice navigates.
  const star = toolbar.getByRole('button', { name: 'Favorites' });
  await tap(star);
  const sheet = web.getByTestId('favorites-sheet');
  await expect(sheet).toBeVisible();
  const pane = sheet.getByRole('complementary', { name: 'Favorites' });
  const paneBox = (await pane.boundingBox())!;
  const sheetBox = (await sheet.boundingBox())!;
  await sheet.tap({
    position: {
      x: sheetBox.width - 10,
      y: sheetBox.height - 10,
    },
  });
  await expect(sheet).toBeHidden();
  expect(paneBox.width).toBeLessThan(sheetBox.width);
  await tap(star);
  const tinfoil = sheet.getByRole('button', {
    name: 'Tinfoil Comets',
    exact: true,
  });
  await expectTapTarget(tinfoil);
  await tap(tinfoil);
  await expect(sheet).toBeHidden();
  await expectDone(web);
  await expect(address).toHaveValue('http://tinfoilcomets.example/');
  await expectFitted(web, 'Tinfoil Comets');

  // View → Actual size: the 800 px page scrolls sideways inside the page area, not the page.
  await tap(web.getByRole('menuitem', { name: 'View' }));
  const fitItem = web.getByRole('menuitemradio', { name: 'Fit to screen' });
  await expect(fitItem).toHaveAttribute('aria-checked', 'true');
  await expectTapTarget(fitItem);
  await tap(web.getByRole('menuitemradio', { name: 'Actual size' }));
  const area = web.getByTestId('browser-viewport');
  await expect(area).toHaveAttribute('data-view', 'actual');
  const actual = await measure(web);
  // Landscape (909 px) is wider than the page: there is nothing to scroll there.
  if (actual.areaWidth < 800)
    expect(actual.areaScroll).toBeGreaterThan(actual.areaWidth);
  else expect(actual.areaScroll).toBe(actual.areaWidth);
  expect(actual.pageScroll).toBeLessThanOrEqual(actual.inner);
  if (actual.areaWidth < 800) {
    await area.evaluate((el) => (el.scrollLeft = 200));
    expect(await area.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  }

  // The choice is saved: after a reload the page is still at actual size.
  await page.reload();
  await tap(page.getByTestId('boot-screen'));
  await tap(page.getByRole('button', { name: 'Log on as Ada' }));
  // The window comes back with the session; Connect reloads its page.
  const again = await connectTouch(
    page.getByRole('region', { name: /Web Explorer$/ }),
  );
  await expect(again.getByTestId('browser-viewport')).toHaveAttribute(
    'data-view',
    'actual',
  );
  await tap(again.getByRole('menuitem', { name: 'View' }));
  await tap(again.getByRole('menuitemradio', { name: 'Fit to screen' }));
  await expectFitted(again, 'Searchly after Fit to screen');
});

test('Searchly, a guestbook entry, Friendspace /me and a Pixlog album by tap @phone', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await logInTouch(page);
  const web = await openWebTouch(page);

  // Searchly: type a search, tap Search, tap a result.
  const search = web.getByRole('textbox', { name: /search/i }).first();
  await tap(search);
  await search.fill('tinfoil');
  await tap(web.getByRole('button', { name: 'Searchly Search' }));
  await expectDone(web);
  await expectFitted(web, 'Searchly results');
  await tap(web.getByRole('link', { name: /Tinfoil Comets/i }).first());
  await expectDone(web);
  await expect(web.getByLabel('Address')).toHaveValue(
    /^http:\/\/tinfoilcomets\.example\//,
  );

  // Tinfoil Comets: sign the guestbook. Its fields are 16 px, so Chrome never zooms in on focus.
  await goTouch(web, 'tinfoilcomets.example/guestbook');
  const name = web.getByLabel('Name:');
  await tap(name);
  await name.fill('Ada');
  const message = web.getByLabel('Message:');
  await tap(message);
  await message.fill('best band ever on my phone :D');
  for (const field of [name, message])
    expect(await field.evaluate(fontSize)).toBeGreaterThanOrEqual(16);
  await tap(web.getByRole('button', { name: 'Sign it!!!' }));
  await expect(web).toContainText('best band ever on my phone :D');
  await expectFitted(web, 'guestbook');

  // Friendspace /me: Edit Profile, change the headline, Save Changes.
  await goTouch(web, 'friendspace.example/me');
  await tap(web.getByRole('button', { name: 'Edit Profile' }));
  const headline = web.getByLabel('Headline:');
  await tap(headline);
  await headline.fill('typing this on a tiny screen');
  await expectFitted(web, 'Friendspace editor');
  await tap(web.getByRole('button', { name: 'Save Changes' }));
  await expect(web.getByRole('button', { name: 'Edit Profile' })).toBeVisible();
  await expect(web).toContainText('typing this on a tiny screen');

  // Pixlog: the first friend with an album out on day 1, that album, then its next photo.
  const album = web.locator('a[href*="/album?id="]').first();
  for (const id of ['jess', 'kayla', 'marco', 'dex', 'pia', 'theo']) {
    await goTouch(web, `pixlog.example/${id}`);
    if ((await album.count()) > 0) break;
  }
  await tap(album);
  await expectDone(web);
  await expect(web.getByLabel('Address')).toHaveValue(/\/album\?id=/);
  await expectFitted(web, 'Pixlog album');
  const next = web.locator('a[href*="&n=2"]').first();
  await tap(next);
  await expectDone(web);
  await expect(web.getByLabel('Address')).toHaveValue(/&n=2/);
});

test('a .example link in Mail opens Web Explorer by tap @phone', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  const first = await openWebTouch(page);
  await tap(first.getByRole('button', { name: 'Close', exact: true }));

  await openAppTouch(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  await tap(mail.getByRole('button', { name: 'Send/Recv' }));
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 15_000 });
  await tap(rows.filter({ hasText: /pixelpoint|Welcome/i }).first());
  await tap(mail.getByRole('link', { name: 'about.example' }).first());
  const web = page.getByRole('region', { name: /Web Explorer$/ });
  await expect(web.getByLabel('Address')).toHaveValue('http://about.example/');
  await expectDone(web);
  await expectFitted(web, 'about.example from Mail');
});

test('the desktop Web Explorer is unchanged', async ({ page }) => {
  await logIn(page);
  await page.getByRole('option', { name: 'Web Explorer' }).dblclick();
  const web = page.getByRole('region', { name: /Web Explorer$/ });
  // Offline, so the page is the fixed "cannot be displayed" one. The baseline was taken from the
  // v0.5 Web Explorer (this task's change stashed).
  await expect(web.getByTestId('page-cannot-be-displayed')).toBeVisible();
  await expect(web).toHaveScreenshot('web-explorer-desktop.png');
  const area = web.getByTestId('browser-viewport');
  await expect(area).not.toHaveAttribute('data-view', /.*/);
  await expect(web.getByTestId('browser-page')).toHaveCount(0);
  await expect(web.getByRole('menuitem', { name: 'View' })).toBeDisabled();
  const toolbar = web.getByRole('toolbar', { name: 'Standard Buttons' });
  await expect(toolbar.getByRole('button')).toHaveCount(6);
  await expect(toolbar.getByRole('button', { name: 'Back' })).toHaveText(
    'Back',
  );
  expect((await toolbar.boundingBox())!.height).toBeLessThan(36);
  await toolbar.getByRole('button', { name: 'Favorites' }).click();
  await expect(web.getByTestId('favorites-sheet')).toHaveCount(0);
  const pane = web.getByRole('complementary', { name: 'Favorites' });
  expect((await pane.boundingBox())!.width).toBeCloseTo(180, 0);
});
