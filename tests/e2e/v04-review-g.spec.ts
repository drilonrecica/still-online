import { expect, test, type Locator } from '@playwright/test';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import type { Locale, Messages } from '../../src/i18n/types';
import type { Gender } from '../../src/os/types';
import { openFromStart, pickGender, quietIdle } from './helpers';

const DIR = 'docs/review/v04-G';
const CATALOG: Record<Locale, Messages> = { en, de };

// G gate: every surface that changed with the player's gender, for a girl and a boy, each shot in
// English and then in German (the tray badge flips the language in place). Day 1 covers the login
// and Theo's bean-cell chat; the world then jumps to day 5 for Mom's mail and Dex's video.
for (const gender of ['girl', 'boy'] as const satisfies readonly Gender[]) {
  test(`G gate: ${gender} in English and German @review`, async ({ page }) => {
    test.setTimeout(300_000);
    const problems: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning')
        problems.push(`console ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

    let lang: Locale = 'en';
    const cat = () => CATALOG[lang];
    const shot = (name: string) =>
      page.screenshot({ path: `${DIR}/${name}-${gender}-${lang}.png` });

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

    /** Shoots in English, flips to German, shoots again (re-running `reopen` first), flips back. */
    async function both(name: string, reopen?: () => Promise<void>) {
      await page.mouse.move(1270, 790);
      await shot(name);
      if (reopen) await page.keyboard.press('Escape');
      await trayTo('de');
      if (reopen) await reopen();
      else await page.mouse.move(1270, 790);
      await shot(name);
      if (reopen) await page.keyboard.press('Escape');
      await trayTo('en');
    }

    async function closeAll() {
      const closers = page.getByRole('button', {
        name: cat().wm.close,
        exact: true,
      });
      for (let n = await closers.count(); n > 0; n = await closers.count()) {
        await closers.last().dispatchEvent('click');
        await expect(closers).toHaveCount(n - 1);
      }
    }

    const icon = (name: string) =>
      page.getByRole('option', { name, exact: true });
    const chats = () =>
      page.getByRole('region', {
        name: new RegExp(` - ${cat().apps['messenger-chat'].title}$`),
      });
    const contactList = () =>
      page.getByRole('group', { name: cat().messenger.list.contacts });

    async function logOn() {
      await page
        .getByRole('button', {
          name: cat().login.logOnAs.replace('{name}', 'Ada'),
        })
        .click();
      await expect(page.getByTestId('desktop')).toBeVisible();
    }

    // ── 1. Login with the gender picker ──
    await quietIdle(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./?speed=fast');
    await page.getByTestId('boot-screen').click();
    await expect(page.getByTestId('login-screen')).toBeVisible();
    await page.getByLabel(en.login.yourName).fill('Ada');
    await pickGender(page, gender);
    await page.mouse.move(10, 10);
    await shot('01-login');
    await page.getByRole('radio', { name: 'Deutsch' }).click();
    lang = 'de';
    await page.mouse.move(10, 10);
    await shot('01-login');
    await page.getByRole('radio', { name: 'English' }).click();
    lang = 'en';
    await logOn();

    // ── 6. Theo's day-1 chat: the bean-cell branch differs per gender ──
    await icon(en.apps.messenger.title).dblclick();
    await page
      .getByRole('button', { name: en.messenger.signIn.submit })
      .click();
    await expect(contactList()).toBeVisible();
    const theo = chats().filter({ hasText: 'Theo' });
    const replies = theo
      .getByRole('group', { name: en.messenger.chat.replies })
      .getByRole('button');
    // Theo's opening, then his project question two (fast) minutes later: always the first
    // choice, which leads through "plant cell!" to the gendered "bean cell" answer.
    for (let i = 0; i < 30; i++) {
      if (
        await theo
          .getByRole('log')
          .getByText(/start sketching/)
          .count()
      )
        break;
      if ((await theo.count()) === 0) {
        await contactList()
          .locator('[data-contact-id="theo"]')
          .dispatchEvent('dblclick');
        await expect(theo).toBeVisible();
      }
      const ready = await replies
        .first()
        .waitFor({ timeout: 4000 })
        .then(
          () => true,
          () => false,
        );
      if (!ready) continue;
      await replies.first().dispatchEvent('click');
      await theo
        .getByRole('button', { name: en.messenger.chat.send, exact: true })
        .dispatchEvent('click');
      await page.waitForTimeout(300);
    }
    await expect(
      theo.getByRole('log').getByText(/start sketching/),
    ).toBeVisible({
      timeout: 15_000,
    });
    // Only Theo's chat stays open.
    const others = chats().filter({ hasNotText: 'Theo' });
    for (let n = await others.count(); n > 0; n = await others.count()) {
      await others
        .first()
        .getByRole('button', { name: en.wm.close, exact: true })
        .dispatchEvent('click');
      await expect(others).toHaveCount(n - 1);
    }
    await both('06-theo-chat');

    // ── Jump to day 5: same real date, no shutdown pending, so the boot keeps the day ──
    await closeAll();
    await page.evaluate(() => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      localStorage.setItem(
        'still-online:v1:world',
        JSON.stringify({
          version: 1,
          state: {
            day: 5,
            lastRealDate: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
            shutdownPending: false,
            dayStartedAt: d.getTime(),
            unlocks: [],
          },
        }),
      );
    });
    await page.reload();
    await page.getByTestId('boot-screen').click();
    await expect(page.getByTestId('login-screen')).toBeVisible();
    await logOn();
    await page.waitForTimeout(1500);
    await closeAll();

    // ── 2. User Accounts ──
    await openFromStart(page, en.apps.useraccounts.title);
    await expect(
      page.getByRole('region', { name: en.apps.useraccounts.title }),
    ).toBeVisible();
    await both('02-useraccounts');
    await closeAll();

    // ── 3–5. My Documents, Recycle Bin, My Pictures (+ the webcam self-portrait) ──
    async function folder(label: string): Promise<Locator> {
      await icon(label).dblclick();
      const win = page.getByRole('region', { name: label }).first();
      await expect(win).toBeVisible();
      return win;
    }
    await folder(en.fs.folders.docs);
    await both('03-mydocuments');
    await closeAll();
    await folder(en.fs.folders.recycle);
    await both('04-recyclebin');
    await closeAll();
    const pics = await folder(en.fs.folders.pics);
    await both('05-mypictures');
    await pics.getByRole('option', { name: /^me_webcam_test/ }).dblclick();
    await page.waitForTimeout(800);
    await both('05-selfportrait');
    await closeAll();

    // ── 7. Mom's mail about Dex (day 5) ──
    await icon(en.apps.mail.title).dblclick();
    const mail = page.getByRole('region', { name: /Mail$/ }).first();
    await mail.getByRole('button', { name: en.mail.ui.sendRecv }).click();
    const momRow = mail.locator('tbody tr').filter({ hasText: 'who is Dex?' });
    await expect(momRow).toBeVisible({ timeout: 10_000 });
    await momRow.click();
    await page.waitForTimeout(500);
    await both('07-mom-dex-mail');
    await closeAll();

    // ── 8–10. CheatCave, Kickflip Kings, the Favorites menu ──
    await icon(en.apps.browser.title).dblclick();
    const web = page
      .getByRole('region', { name: new RegExp(`${en.apps.browser.title}$`) })
      .first();
    // Messenger dialled in on day 1 and the connection survives the reload; dial in if it didn't.
    const connect = web
      .getByTestId('page-cannot-be-displayed')
      .getByRole('button', { name: 'Connect' });
    const done = web
      .getByRole('status')
      .filter({ hasText: en.browser.status.done });
    await expect(connect.or(done)).toBeVisible({ timeout: 10_000 });
    if (await connect.isVisible()) await connect.click();
    await expect(page.getByTestId('tray-network')).toHaveAttribute(
      'data-status',
      'online',
    );
    await web
      .getByRole('button', { name: en.wm.maximize, exact: true })
      .click();
    async function open(url: string) {
      const address = web.getByLabel(en.browser.address);
      await address.fill(url);
      await address.press('Enter');
      await expect(web.getByRole('status')).toHaveText(en.browser.status.done, {
        timeout: 10_000,
      });
      await page.waitForTimeout(500);
    }
    for (const [name, url] of [
      ['08-cheatcave-home', 'cheatcave.example'],
      ['08-cheatcave-forum', 'cheatcave.example/forum'],
      ['09-kickflipkings-home', 'kickflipkings.example'],
      ['09-kickflipkings-video', 'kickflipkings.example/video'],
    ] as const) {
      await open(url);
      await both(name);
    }
    const favorites = async () => {
      await web
        .getByRole('menuitem', { name: cat().browser.menu.favorites })
        .click();
      await expect(
        web.getByRole('menu', { name: cat().browser.menu.favorites }),
      ).toBeVisible();
    };
    await open('searchly.example');
    await favorites();
    await both('10-favorites', favorites);

    expect(problems).toEqual([]);
  });
}
