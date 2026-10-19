import { expect, test } from '@playwright/test';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import type { Locale, Messages } from '../../src/i18n/types';
import { openFromStart, pickGender, quietIdle } from './helpers';

const DIR = 'docs/review/v04-P5';
const CATALOG: Record<Locale, Messages> = { en, de };

// P5 gate (release): one save played day by day through Turn Off. Days 1–3 as a girl in English,
// days 4–5 as a boy in German (switched in User Accounts and the tray). Every shot is taken in the
// played language and again in the other one (the tray flips it in place), suffix `-en`/`-de`.
test('P5 gate: release playthrough @review', async ({ page, context }) => {
  test.setTimeout(420_000);
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  let lang: Locale = 'en';
  const t = () => CATALOG[lang];
  const web = page.getByRole('region', { name: /Web Explorer$/ }).first();

  async function trayTo(next: Locale) {
    await page.getByTestId('tray-language').dispatchEvent('click');
    await page
      .getByRole('menuitemradio', {
        name: next === 'en' ? 'English' : 'Deutsch',
      })
      .dispatchEvent('click');
    await expect(page.locator('html')).toHaveAttribute('lang', next);
    lang = next;
    await page.waitForTimeout(500);
  }

  /** Shoots in the played language, flips to the other, shoots again, flips back. */
  async function both(name: string) {
    const played = lang;
    await page.mouse.move(1270, 790);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${DIR}/${name}-${lang}.png` });
    await trayTo(played === 'en' ? 'de' : 'en');
    await page.mouse.move(1270, 790);
    await page.screenshot({ path: `${DIR}/${name}-${lang}.png` });
    await trayTo(played);
  }

  /** Opens Web Explorer, or restores it from the taskbar (a minimized window has no region). */
  async function browser() {
    const taskbar = page.getByRole('button', { name: /Web Explorer$/ });
    if ((await taskbar.count()) === 0) {
      await page
        .getByRole('option', { name: t().apps.browser.title })
        .dispatchEvent('dblclick');
    } else if (!(await web.isVisible())) {
      await taskbar.first().click();
    }
    const connect = web
      .getByTestId('page-cannot-be-displayed')
      .getByRole('button');
    const done = web
      .getByRole('status')
      .last()
      .filter({ hasText: t().browser.status.done });
    await expect(connect.or(done).first()).toBeVisible({ timeout: 10_000 });
    if (await connect.isVisible()) await connect.first().click();
    await expect(page.getByTestId('tray-network')).toHaveAttribute(
      'data-status',
      'online',
    );
    const maximize = web.getByRole('button', {
      name: t().wm.maximize,
      exact: true,
    });
    if (await maximize.isVisible()) await maximize.click();
  }

  async function go(url: string) {
    const address = web.getByLabel(t().browser.address);
    await address.fill(url);
    await address.press('Enter');
    await expect(web.getByRole('status').last()).toHaveText(
      t().browser.status.done,
      { timeout: 10_000 },
    );
  }

  async function visit(url: string, name: string) {
    await go(url);
    await both(name);
  }

  async function closeChats() {
    const chats = page.getByRole('region', {
      name: new RegExp(` - ${t().apps['messenger-chat'].title}$`),
    });
    for (let n = await chats.count(); n > 0; n = await chats.count()) {
      await chats
        .first()
        .getByRole('button', { name: t().wm.close, exact: true })
        .dispatchEvent('click');
      await expect(chats).toHaveCount(n - 1);
    }
  }

  /** Signs in to Messenger with the browser minimized, shoots the list (or `contact`'s chat). */
  async function messenger(name: string, contact?: string) {
    await web
      .getByRole('button', { name: t().wm.minimize, exact: true })
      .dispatchEvent('click');
    await page
      .getByRole('option', { name: t().apps.messenger.title, exact: true })
      .dispatchEvent('dblclick');
    await page
      .getByRole('button', { name: t().messenger.signIn.submit })
      .click();
    await expect(
      page.getByRole('group', { name: t().messenger.list.contacts }),
    ).toBeVisible();
    // Let the sign-in chats (Jess's nudge, the day's opener) arrive and settle.
    await page.waitForTimeout(4000);
    if (contact) {
      await closeChats();
      await page
        .getByRole('group', { name: t().messenger.list.contacts })
        .locator(`[data-contact-id="${contact}"]`)
        .dispatchEvent('dblclick');
      await page.waitForTimeout(6000);
    }
    await both(name);
    await closeChats();
    await page
      .getByRole('region', { name: t().apps.messenger.title, exact: true })
      .getByRole('button', { name: t().wm.minimize, exact: true })
      .dispatchEvent('click');
    await browser();
  }

  async function nextDay(day: number) {
    await page.locator('[data-start-button]').click();
    await page
      .getByRole('menuitem', { name: t().startMenu.turnOff })
      .dispatchEvent('click');
    await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('off-screen').click();
    await expect(page.getByTestId('boot-day')).toHaveText(
      t().boot.day.replace('{day}', String(day)),
    );
    await expect(page.getByTestId('login-screen')).toBeVisible({
      timeout: 5000,
    });
    await page
      .getByRole('button', {
        name: t().login.logOnAs.replace('{name}', 'Ada'),
      })
      .click();
    await expect(page.getByTestId('desktop')).toBeVisible();
    await page.waitForTimeout(800);
    await browser();
  }

  const editProfile = () =>
    web.getByRole('button', {
      name: lang === 'de' ? 'Profil bearbeiten' : 'Edit Profile',
    });
  const saveChanges = () =>
    web.getByRole('button', {
      name: lang === 'de' ? 'Änderungen speichern' : 'Save Changes',
    });

  // ── Day 1, English, girl ──
  await quietIdle(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel(en.login.yourName).fill('Ada');
  await pickGender(page, 'girl');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();
  await browser();
  await messenger('d1-01-messenger');
  await visit('friendspace.example', 'd1-02-friendspace-home');
  await go('pixlog.example/theo');
  await web.getByRole('button', { name: 'Give kudos ★' }).click();
  await expect(
    web.getByRole('button', { name: 'Kudos given today!' }),
  ).toBeDisabled();
  await both('d1-03-pixlog-theo-kudos');
  await visit('glittercodez.example', 'd1-04-glittercodez');
  await web
    .locator('article')
    .first()
    .getByRole('button', { name: 'Copy code!!' })
    .click();
  const code = await page.evaluate<string>('navigator.clipboard.readText()');
  await go('friendspace.example/me');
  await editProfile().click();
  await web.getByLabel('Layout code:').fill(code);
  await saveChanges().click();
  await expect(editProfile()).toBeVisible();
  await both('d1-05-me-pasted-layout');

  // ── Day 2: drop Kayla from the Top 8 ──
  await nextDay(2);
  await visit('friendspace.example/bulletins', 'd2-01-bulletins');
  await go('friendspace.example/me');
  await editProfile().click();
  await web
    .getByRole('list', { name: 'Top 8 order' })
    .getByRole('listitem')
    .filter({ hasText: 'Kayla' })
    .getByRole('button', { name: /Remove .* from the Top 8/ })
    .click();
  await both('d2-02-top8-editor-dropped');
  await saveChanges().click();
  await expect(editProfile()).toBeVisible();
  await both('d2-03-me-without-kayla');

  // ── Day 3: Kayla reacts in Messenger; put her back; an album photo ──
  await nextDay(3);
  await messenger('d3-01-messenger');
  await go('friendspace.example/me');
  await editProfile().click();
  await web.getByRole('button', { name: 'Add', exact: true }).click();
  await saveChanges().click();
  await expect(editProfile()).toBeVisible();
  await page.waitForTimeout(1500);
  await both('d3-02-me-kayla-back');
  await go('pixlog.example/me');
  await web.getByRole('button', { name: 'Add photos' }).click();
  await web
    .getByRole('button', { name: /^Add (?!photos$).+/ })
    .first()
    .click();
  await web.getByRole('button', { name: 'Edit album' }).click();
  await web.getByLabel('Caption for photo 1').fill('me on day 3 lol');
  await web.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(web.getByText('me on day 3 lol')).toBeVisible();
  await both('d3-03-pixlog-me-album');

  // ── Day 4: switch to Boy in User Accounts and to German in the tray ──
  await nextDay(4);
  await web
    .getByRole('button', { name: en.wm.minimize, exact: true })
    .dispatchEvent('click');
  await openFromStart(page, en.apps.useraccounts.title);
  const accounts = page.getByRole('region', {
    name: en.apps.useraccounts.title,
  });
  await accounts.locator('[role="radio"][data-gender="boy"]').click();
  await trayTo('de');
  await both('d4-01-useraccounts-boy');
  await page
    .getByRole('region', { name: de.apps.useraccounts.title })
    .getByRole('button', { name: de.common.ok })
    .click();
  await browser();
  await visit('friendspace.example/bulletins', 'd4-02-bulletins');
  await visit('friendspace.example/me', 'd4-03-me');
  await visit('pixlog.example/me', 'd4-04-pixlog-me-night');
  await visit('pixlog.example/pia', 'd4-05-pixlog-pia');
  await visit('glittercodez.example', 'd4-06-glittercodez-boy');
  await visit('cheatcave.example', 'd4-07-cheatcave');
  await visit('kickflipkings.example', 'd4-08-kickflipkings');
  await messenger('d4-09-messenger');

  // ── Day 5, German, boy: Jess's day-5 news, the concert album, kudos ──
  await nextDay(5);
  await visit('friendspace.example/bulletins', 'd5-01-bulletins');
  await go('pixlog.example/jess');
  await web.getByRole('button', { name: 'Kudos geben ★' }).click();
  await both('d5-02-pixlog-jess-kudos');
  await visit('pixlog.example/album?id=jess-comets-show', 'd5-03-album-comets');
  await visit('friendspace.example/jess', 'd5-04-friendspace-jess');
  await visit('pixlog.example/dex?tab=blog', 'd5-05-pixlog-dex-blog');
  await visit('kickflipkings.example/video', 'd5-06-kickflipkings-video');
  await messenger('d5-07-messenger-jess-chat', 'jess');

  expect(problems).toEqual([]);
});
