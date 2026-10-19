// v0.4 P5 gate (release): one save played through all five days by Turn Off. Days 1–3 in English
// as a girl (kudos, a pasted GlitterCodez layout, a Top 8 drop and re-add, an album photo), then
// User Accounts switches to Boy and the tray to German for days 4–5 (the `night` Pixlog skin, the
// boyish layouts first, his chain letter, CheatCave and Kickflip Kings, Jess's day-5 album).
import { expect, test } from '@playwright/test';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import type { Messages } from '../../src/i18n/types';
import { logIn, openFromStart } from './helpers';

test('P5 gate: days 1–3 as a girl in English, 4–5 as a boy in German', async ({
  page,
  context,
}) => {
  test.setTimeout(240_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  let t: Messages = en;
  const web = page.getByRole('region', { name: /Web Explorer$/ }).first();

  /** Opens Web Explorer (if needed) and makes sure the tray says online. */
  async function browser() {
    if ((await web.count()) === 0) {
      await page
        .getByRole('option', { name: t.apps.browser.title })
        .dispatchEvent('dblclick');
    }
    const connect = web
      .getByTestId('page-cannot-be-displayed')
      .getByRole('button');
    const done = web
      .getByRole('status')
      .last()
      .filter({ hasText: t.browser.status.done });
    await expect(connect.or(done).first()).toBeVisible({ timeout: 10_000 });
    if (await connect.isVisible()) await connect.first().click();
    await expect(page.getByTestId('tray-network')).toHaveAttribute(
      'data-status',
      'online',
    );
  }

  async function go(url: string) {
    const address = web.getByLabel(t.browser.address);
    await address.fill(url);
    await address.press('Enter');
    await expect(web.getByRole('status').last()).toHaveText(
      t.browser.status.done,
      { timeout: 10_000 },
    );
  }

  /** Start → Turn Off → Power on → log on again; checks the boot shows the next day. */
  async function nextDay(day: number) {
    await page.locator('[data-start-button]').click();
    await page
      .getByRole('menuitem', { name: t.startMenu.turnOff })
      .dispatchEvent('click');
    await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('off-screen').click();
    await expect(page.getByTestId('boot-day')).toHaveText(
      t.boot.day.replace('{day}', String(day)),
    );
    await expect(page.getByTestId('login-screen')).toBeVisible({
      timeout: 5000,
    });
    await page
      .getByRole('button', { name: t.login.logOnAs.replace('{name}', 'Ada') })
      .click();
    await expect(page.getByTestId('desktop')).toBeVisible();
    await browser();
  }

  async function saveProfile(edit: () => Promise<void>) {
    await go('http://friendspace.example/me');
    await web.getByRole('button', { name: 'Edit Profile' }).click();
    await edit();
    await web.getByRole('button', { name: 'Save Changes' }).click();
    await expect(
      web.getByRole('button', { name: 'Edit Profile' }),
    ).toBeVisible();
  }

  // ── Day 1, English, girl: kudos, then a GlitterCodez layout on /me ──
  await logIn(page);
  await browser();
  await go('http://pixlog.example/theo');
  await web.getByRole('button', { name: 'Give kudos ★' }).click();
  await expect(
    web.getByRole('button', { name: 'Kudos given today!' }),
  ).toBeDisabled();

  await go('http://glittercodez.example/');
  await expect(web.locator('article').first()).not.toContainText(
    /Skater Grunge|Gamer Green/,
  );
  await web
    .locator('article')
    .first()
    .getByRole('button', { name: 'Copy code!!' })
    .click();
  const code = await page.evaluate<string>('navigator.clipboard.readText()');
  expect(code).toContain('[layout');
  await saveProfile(() => web.getByLabel('Layout code:').fill(code));
  const profile = web.getByTestId('profile');
  await expect(profile.locator('[data-sticker]').first()).toBeVisible();

  // ── Day 2: drop Kayla from the Top 8 ──
  await nextDay(2);
  await saveProfile(() =>
    web
      .getByRole('list', { name: 'Top 8 order' })
      .getByRole('listitem')
      .filter({ hasText: 'Kayla' })
      .getByRole('button', { name: /Remove .* from the Top 8/ })
      .click(),
  );
  await expect(
    web.getByRole('list', { name: 'Top 8' }).getByText(/Kayla/),
  ).toHaveCount(0);

  // ── Day 3: put her back; add a My Pictures photo to the Pixlog album ──
  await nextDay(3);
  await saveProfile(() =>
    web.getByRole('button', { name: 'Add', exact: true }).click(),
  );
  await expect(
    web.getByRole('list', { name: 'Top 8' }).getByText(/Kayla/).first(),
  ).toBeVisible();
  await go('http://pixlog.example/me');
  await expect(web.locator('[data-skin]').first()).toHaveAttribute(
    'data-skin',
    'bubblegum',
  );
  await web.getByRole('button', { name: 'Add photos' }).click();
  await web
    .getByRole('button', { name: /^Add (?!photos$).+/ })
    .first()
    .click();
  await web.getByRole('button', { name: 'Edit album' }).click();
  await web.getByLabel('Caption for photo 1').fill('day 3 me');
  await web.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(web.getByText('day 3 me')).toBeVisible();

  // ── Day 4: User Accounts → Boy, tray → Deutsch ──
  await nextDay(4);
  await web
    .getByRole('button', { name: t.wm.minimize, exact: true })
    .dispatchEvent('click');
  await openFromStart(page, en.apps.useraccounts.title);
  const accounts = page.getByRole('region', {
    name: en.apps.useraccounts.title,
  });
  await accounts.locator('[role="radio"][data-gender="boy"]').click();
  await accounts.getByRole('button', { name: en.common.ok }).click();
  await expect(accounts).toBeHidden();
  await page.getByTestId('tray-language').dispatchEvent('click');
  await page
    .getByRole('menuitemradio', { name: 'Deutsch' })
    .dispatchEvent('click');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  t = de;
  await page.getByRole('button', { name: /Web Explorer$/ }).click();

  // Ids, not text, were saved: the pasted layout, the album and Kayla's Top 8 spot stay.
  await go('http://friendspace.example/me');
  await expect(profile.locator('[data-sticker]').first()).toBeVisible();
  await expect(
    web.getByRole('list', { name: 'Top 8' }).getByText(/Kayla/).first(),
  ).toBeVisible();
  await go('http://friendspace.example/bulletins');
  await expect(web.getByText(/HIGHSCORE-TEST/)).toBeVisible();
  await expect(web.getByText(/SCHWARM-TEST/)).toHaveCount(0);
  await go('http://pixlog.example/me');
  await expect(web.locator('[data-skin]').first()).toHaveAttribute(
    'data-skin',
    'night',
  );
  await expect(web.getByText('day 3 me')).toBeVisible();
  await go('http://glittercodez.example/');
  await expect(web.locator('article').first()).toContainText(
    /Skater Grunge|Gamer Green/,
  );
  await go('http://cheatcave.example/');
  await expect(web.getByRole('heading').first()).toBeVisible();
  await go('http://kickflipkings.example/');
  await expect(web.getByText(/KICKFLIP KINGS/i).first()).toBeVisible();

  // ── Day 5, German, boy: Jess's „NEUE FOTOS“ bulletin leads to her concert album; kudos ──
  await nextDay(5);
  await go('http://friendspace.example/bulletins');
  await web
    .getByTestId('bulletin')
    .filter({ hasText: 'NEUE FOTOS auf pixlog!!! ERSTE REIHE!!!!!' })
    .getByRole('link', { name: 'http://pixlog.example/jess' })
    .click();
  await expect(web.getByRole('status').last()).toHaveText('Fertig', {
    timeout: 10_000,
  });
  await web.getByRole('button', { name: 'Kudos geben ★' }).click();
  await expect(
    web.getByRole('button', { name: 'Heute schon Kudos gegeben!' }),
  ).toBeDisabled();
  await go('http://pixlog.example/jess?tab=photos');
  await web
    .getByRole('region', { name: 'Fotos' })
    .getByRole('link', { name: /COMETS LIVE/ })
    .click();
  await expect(web.getByText('ERSTE REIHE!!!!')).toBeVisible();
});
