import { expect, test, type Locator } from '@playwright/test';
import { en } from '../../src/i18n/messages/en';
import type { Locale } from '../../src/i18n/types';
import {
  closeNudgeChats,
  go,
  nextDay,
  openBrowserOnline,
  openFromStart,
  openMessenger,
  pickGender,
  playChat,
  quietIdle,
} from './helpers';

const DIR = 'docs/review/v041-F';

// F gate: the v0.4.1 fixes, each shot in English and German. Day 1 as a girl: Stapley beside the
// browser and folded away over it maximized, a long survey bulletin, Friendspace /me saved with
// only a layout, Kayla's „1 obviously" reply and Theo's chat after a language flip. Then a switch
// to Boy: Friendspace /me and Pixlog /me with his defaults and picture. Day 5: Jess's concert album.
test('v0.4.1 F gate @review', async ({ page }) => {
  test.setTimeout(300_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  let lang: Locale = 'en';
  const shot = (name: string) =>
    page.screenshot({ path: `${DIR}/${name}-${lang}.png` });

  // Dispatched directly throughout: nudging chat windows are never "stable" for a normal click.
  async function trayTo(next: Locale) {
    await page.getByTestId('tray-language').dispatchEvent('click');
    await page
      .getByRole('menuitemradio', {
        name: next === 'en' ? 'English' : 'Deutsch',
      })
      .dispatchEvent('click');
    await expect(page.locator('html')).toHaveAttribute('lang', next);
    lang = next;
    await page.waitForTimeout(400);
  }

  /** Shoots in English, flips to German, shoots again and flips back. */
  async function shots(name: string) {
    await page.mouse.move(1270, 790);
    await shot(name);
    await trayTo('de');
    await page.mouse.move(1270, 790);
    await shot(name);
    await trayTo('en');
  }

  async function closeAll() {
    const closers = page.getByRole('button', {
      name: en.wm.close,
      exact: true,
    });
    for (let n = await closers.count(); n > 0; n = await closers.count()) {
      await closers.last().dispatchEvent('click');
      await expect(closers).toHaveCount(n - 1);
    }
  }

  /** Opens Web Explorer maximized, dialling in only if the connection dropped. */
  async function openWeb(): Promise<Locator> {
    await page.getByRole('option', { name: en.apps.browser.title }).dblclick();
    const win = page
      .getByRole('region', { name: new RegExp(`${en.apps.browser.title}$`) })
      .first();
    const connect = win
      .getByTestId('page-cannot-be-displayed')
      .getByRole('button', { name: 'Connect' });
    const done = win
      .getByRole('status')
      .last()
      .filter({ hasText: en.browser.status.done });
    await expect(connect.or(done)).toBeVisible({ timeout: 10_000 });
    if (await connect.isVisible()) await connect.click();
    await win
      .getByRole('button', { name: en.wm.maximize, exact: true })
      .click();
    return win;
  }

  async function openChat(contactId: string, displayName: string) {
    await page
      .getByRole('group', { name: 'Contacts' })
      .locator(`[data-contact-id="${contactId}"]`)
      .dispatchEvent('dblclick');
    const chat = page.getByRole('region', {
      name: `${displayName} - Conversation`,
      exact: true,
    });
    await expect(chat).toBeVisible();
    return chat;
  }

  // ── Day 1, a girl ──
  await quietIdle(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel(en.login.yourName).fill('Ada');
  await pickGender(page, 'girl');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toContainText("I'm Stapley", { timeout: 10_000 });

  // Stapley's balloon beside a normal browser window, then folded away over a maximized one.
  const web = await openBrowserOnline(page);
  await shots('07a-stapley-browser');
  await web.getByRole('button', { name: en.wm.maximize, exact: true }).click();
  await expect(balloon).toHaveCount(0, { timeout: 12_000 });
  await shots('07b-stapley-maximized');
  await page.getByRole('button', { name: 'Stapley the stapler' }).click();
  await balloon
    .getByRole('button', { name: en.assistant.hide })
    .dispatchEvent('click');
  await expect(page.locator('[data-assistant]')).toHaveCount(0);

  // A long survey bulletin, in one column beside the sender picture.
  await go(web, 'http://friendspace.example/bulletins');
  const survey = web
    .getByTestId('bulletin')
    .filter({ hasText: '20 qs about me' });
  await survey.scrollIntoViewIfNeeded();
  await shots('05-survey-bulletin');

  // Friendspace /me saved with only a layout.
  await go(web, 'http://friendspace.example/me');
  await web.getByRole('button', { name: 'Edit Profile' }).click();
  await web.getByLabel('Layout code:').fill('[layout bg=starry]');
  await web.getByRole('button', { name: 'Save Changes' }).click();
  const profile = web.getByTestId('profile');
  await expect(profile).toContainText('new 2 Friendspace!!');
  await shots('01a-me-saved-girl');
  await web.getByRole('button', { name: en.wm.minimize, exact: true }).click();

  // Kayla's status poll: the „1 obviously" reply.
  await openMessenger(page);
  const kayla = await openChat('kayla', '~*Kayla*~ <3');
  const replies = kayla
    .getByRole('group', { name: 'Replies' })
    .getByRole('button');
  const digit = replies.filter({ hasText: '1 obviously' });
  for (let i = 0; i < 30 && !(await digit.count()); i++) {
    if (await replies.count()) {
      await replies.first().dispatchEvent('click');
      await kayla
        .getByRole('button', { name: 'Send', exact: true })
        .dispatchEvent('click');
    }
    await page.waitForTimeout(500);
  }
  await expect(digit).toBeVisible();
  await shots('04-reply-digit');
  await closeNudgeChats(page, { wait: false });

  // Theo's chat after a language flip: German first, then back to English.
  await playChat(page, 'theo', 'theo', /mr dalton paired us/);
  await page.waitForTimeout(2500);
  await closeNudgeChats(page, { wait: false });
  const theo = await openChat('theo', 'theo');
  await theo
    .getByRole('button', { name: en.wm.maximize, exact: true })
    .dispatchEvent('click');
  await page.waitForTimeout(800);
  await trayTo('de');
  await page.mouse.move(1270, 790);
  await shot('06-theo-flip');
  await trayTo('en');
  await page.mouse.move(1270, 790);
  await shot('06-theo-flip');
  await closeAll();

  // ── Switch to Boy: Friendspace /me and Pixlog /me ──
  await openFromStart(page, 'User Accounts');
  const accounts = page.getByRole('region', { name: 'User Accounts' });
  await accounts.getByRole('radio', { name: 'Boy' }).click();
  await accounts.getByRole('button', { name: 'OK' }).click();
  await expect(accounts).toBeHidden();

  const web2 = await openWeb();
  await go(web2, 'http://friendspace.example/me');
  await expect(web2.getByTestId('profile')).toContainText(
    'new to Friendspace. skate all day',
  );
  await shots('01b-me-switched-boy');
  await go(web2, 'http://pixlog.example/me');
  await expect(web2.getByRole('img', { name: 'Your picture' })).toHaveAttribute(
    'data-picture',
    'skateboard',
  );
  await shots('02-pixlog-me-picture');
  await closeAll();

  // ── Day 5: Jess's concert album, stamped the night of day 4 ──
  for (const day of [2, 3, 4, 5]) await nextDay(page, day);
  const web3 = await openWeb();
  await go(web3, 'http://pixlog.example/album?id=jess-comets-show');
  await expect(web3.getByRole('img', { name: 'FRONT ROW!!!!' })).toBeVisible();
  await shots('03-concert-album');

  expect(problems).toEqual([]);
});
