import { expect, test, type Locator } from '@playwright/test';
import { en } from '../../src/i18n/messages/en';
import type { Locale } from '../../src/i18n/types';
import type { Gender } from '../../src/os/types';
import {
  closeNudgeChats,
  nextDay,
  openMessenger,
  pickGender,
  playChat,
  quietIdle,
} from './helpers';

const DIR = 'docs/review/v04-G2';

// G2 gate: what the boyish pass changed, for a boy (English, then German via the tray) and for a
// girl (English) to compare. One save per gender: day 1 Jess's concert sign and Pia's horse quiz,
// day 2 Dex (his boy-only skate thread), day 3 Kayla's Brianna chat, then the pictures, the lyrics
// notebook and the Pixlog /me album.
for (const gender of ['boy', 'girl'] as const satisfies readonly Gender[]) {
  test(`G2 gate: ${gender} @review`, async ({ page }) => {
    test.setTimeout(300_000);
    const problems: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning')
        problems.push(`console ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
    const boy = gender === 'boy';

    let lang: Locale = 'en';
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

    /** Shoots in English; for a boy also flips to German, shoots again and flips back. */
    async function shots(name: string) {
      // Stapley's tip balloons would cover the windows.
      const hide = page.getByRole('button', { name: en.assistant.hide });
      if (await hide.isVisible()) await hide.dispatchEvent('click');
      await page.mouse.move(1270, 790);
      await shot(name);
      if (!boy) return;
      await trayTo('de');
      await page.mouse.move(1270, 790);
      await shot(name);
      await trayTo('en');
    }

    const chats = () => page.getByRole('region', { name: / - Conversation$/ });

    /** Lets the last lines arrive, closes every chat, reopens `contactId`'s alone and shoots. */
    async function chatShot(contactId: string, name: string) {
      await page.waitForTimeout(2500);
      await closeNudgeChats(page, { wait: false });
      await page
        .getByRole('group', { name: 'Contacts' })
        .locator(`[data-contact-id="${contactId}"]`)
        .dispatchEvent('dblclick');
      await expect(chats()).toHaveCount(1);
      // Maximized, so the whole thread fits instead of only its last lines.
      await chats()
        .getByRole('button', { name: en.wm.maximize, exact: true })
        .dispatchEvent('click');
      await page.waitForTimeout(800);
      await shots(name);
    }

    /** Signs in to Messenger on a later day: no nudge chat is guaranteed, so nothing waits for one. */
    async function signIn() {
      await page.getByRole('option', { name: 'Messenger' }).dblclick();
      await page.getByRole('button', { name: 'Sign in' }).click();
      await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();
      await page.waitForTimeout(2000);
      await closeNudgeChats(page, { wait: false });
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

    // ── Day 1: Jess's concert sign, Pia's horse quiz ──
    await quietIdle(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./?speed=fast');
    await page.getByTestId('boot-screen').click();
    await page.getByLabel(en.login.yourName).fill('Ada');
    await pickGender(page, gender);
    await page.getByRole('button', { name: 'Log on as Ada' }).click();
    await expect(page.getByTestId('desktop')).toBeVisible();
    await openMessenger(page);

    // Opening, then the follow-up two (fast) minutes later, through the sign to the drumstick.
    await playChat(page, 'jess', 'xX~JeSs~Xx :D', /drumstick spin thing/);
    await chatShot('jess', '01-jess-sign');

    await playChat(page, 'pia', 'pia (L) ponies (L)', /CORRECT/, [
      /why are u messaging/,
      /sure/i,
      /foal/,
    ]);
    await chatShot('pia', '03-pia-horse-quiz');
    await closeAll();

    // ── Day 2: Dex; for a boy his skate-session thread follows the day-2 chat ──
    await nextDay(page, 2);
    await signIn();
    const dexPrefer = [/how did it go/, /did u land the kickflip/, /sweet/];
    await playChat(page, 'dex', 'dex', /tmrw for sure/, dexPrefer);
    if (boy) await playChat(page, 'dex', 'dex', /ollie first/, dexPrefer);
    else await page.waitForTimeout(8000);
    await chatShot('dex', '04-dex-day2-thread');
    await closeAll();

    // ── Day 3: Kayla and Brianna's party ──
    await nextDay(page, 3);
    await signIn();
    await playChat(page, 'kayla', '~*Kayla*~ <3', /one more than brianna/);
    await chatShot('kayla', '02-kayla-brianna');
    await closeAll();

    // ── My Pictures, the skatepark photo (its slot for a girl), the lyrics notebook ──
    async function folder(label: string): Promise<Locator> {
      await page.getByRole('option', { name: label, exact: true }).dblclick();
      const win = page.getByRole('region', { name: label }).first();
      await expect(win).toBeVisible();
      return win;
    }
    const pics = await folder(en.fs.folders.pics);
    await shots('05-mypictures');
    await pics
      .getByRole('option', {
        name: boy ? /^skatepark_wipeout/ : /^school_trip_museum/,
      })
      .dblclick();
    await page.waitForTimeout(800);
    await shots('06-skatepark-photo');
    await closeAll();
    const docs = await folder(en.fs.folders.docs);
    await docs
      .getByRole('option', { name: /^song_lyrics_notebook/ })
      .dblclick();
    await page.waitForTimeout(800);
    await shots('07-lyrics-notebook');
    await closeAll();

    // ── Pixlog /me: the album picker reads My Pictures ──
    await page.getByRole('option', { name: en.apps.browser.title }).dblclick();
    const web = page
      .getByRole('region', { name: new RegExp(`${en.apps.browser.title}$`) })
      .first();
    // Messenger dialled in; dial in here if the connection dropped.
    const connect = web
      .getByTestId('page-cannot-be-displayed')
      .getByRole('button', { name: 'Connect' });
    const done = web
      .getByRole('status')
      .last()
      .filter({ hasText: en.browser.status.done });
    await expect(connect.or(done)).toBeVisible({ timeout: 10_000 });
    if (await connect.isVisible()) await connect.click();
    await web
      .getByRole('button', { name: en.wm.maximize, exact: true })
      .click();
    const address = web.getByLabel(en.browser.address);
    await address.fill('pixlog.example/me');
    await address.press('Enter');
    await expect(web.getByRole('status').last()).toHaveText(
      en.browser.status.done,
      { timeout: 10_000 },
    );
    await web.getByRole('button', { name: 'Add photos' }).click();
    await web
      .getByRole('button', {
        name: boy ? 'Add skatepark_wipeout.jpg' : 'Add school_trip_museum.jpg',
      })
      .click();
    await page.waitForTimeout(500);
    await shots('08-pixlog-me-album');

    expect(problems).toEqual([]);
  });
}
