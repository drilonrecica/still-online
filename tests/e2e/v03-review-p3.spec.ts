import { expect, test } from '@playwright/test';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import type { Locale, Messages } from '../../src/i18n/types';
import { pickGender, quietIdle } from './helpers';

const DIR = 'docs/review/v03-P3';
const CATALOG: Record<Locale, Messages> = { en, de };

test.use({ locale: 'de-DE' });

// Release gate: three German days via Turn Off → power on. On day 2 the player switches to
// English mid-game (Regional and Language Options) with windows open and plays on in English;
// day 3 boots in English and goes back to German in the login picker. Every checkpoint is shot
// in the current language, flipped with the tray badge for the other one, and flipped back.
test('P3 gate: three German days with a mid-game switch to English and back @review', async ({
  page,
}) => {
  test.setTimeout(900_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  let lang: Locale = 'de';
  const cat = () => CATALOG[lang];
  const shot = (name: string, l: Locale = lang) =>
    page.screenshot({ path: `${DIR}/${name}-${l}.png` });

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
    await page.mouse.move(1270, 790);
    await page.waitForTimeout(400);
  }

  /** Shoots the screen in the current language, then in the other one, then flips back. */
  async function both(name: string) {
    const here = lang;
    await page.mouse.move(1270, 790);
    await shot(name);
    await trayTo(here === 'de' ? 'en' : 'de');
    await shot(name);
    await trayTo(here);
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

  const icon = (id: 'messenger' | 'mail' | 'browser' | 'mines') => {
    const entry = cat().apps[id] as { title: string; label?: string };
    return page.getByRole('option', {
      name: entry.label ?? entry.title,
      exact: true,
    });
  };
  const chats = () =>
    page.getByRole('region', {
      name: new RegExp(` - ${cat().apps['messenger-chat'].title}$`),
    });
  const contactList = () =>
    page.getByRole('group', { name: cat().messenger.list.contacts });

  async function closeChats() {
    const open = chats();
    for (let n = await open.count(); n > 0; n = await open.count()) {
      await open
        .first()
        .getByRole('button', { name: cat().wm.close, exact: true })
        .dispatchEvent('click');
      await expect(open).toHaveCount(n - 1);
    }
  }

  /** Answers the open conversation with its first choice until it stops asking. */
  async function playChat() {
    const chat = chats().first();
    await expect(chat).toBeVisible();
    const choice = chat
      .getByRole('group', { name: cat().messenger.chat.replies })
      .getByRole('button')
      .first();
    for (let i = 0; i < 40; i++) {
      const ready = await choice.waitFor({ timeout: 4000 }).then(
        () => true,
        () => false,
      );
      if (!ready) return;
      await choice.dispatchEvent('click');
      await chat
        .getByRole('button', { name: cat().messenger.chat.send, exact: true })
        .dispatchEvent('click');
      await page.waitForTimeout(300);
    }
  }

  /** Signs in (if needed) and plays every waiting conversation; leaves Jess's chat open. */
  async function playMessenger() {
    await icon('messenger').dispatchEvent('dblclick');
    const signIn = page.getByRole('button', {
      name: cat().messenger.signIn.submit,
    });
    // Day 1 shows the sign-in form; later days remember the sign-in.
    await expect(signIn.or(contactList())).toBeVisible();
    if (await signIn.isVisible()) await signIn.click();
    await expect(contactList()).toBeVisible();
    await page.waitForTimeout(3000);
    for (let pass = 0; pass < 4; pass++) {
      const waiting: string[] = [];
      for (const el of await contactList()
        .locator('[data-awaiting-reply="true"]')
        .all())
        waiting.push((await el.getAttribute('data-contact-id')) ?? '');
      if (waiting.length === 0) break;
      for (const id of waiting) {
        await closeChats();
        await contactList()
          .locator(`[data-contact-id="${id}"]`)
          .dispatchEvent('dblclick');
        await playChat();
      }
      await page.waitForTimeout(3000);
    }
    await closeChats();
    await contactList()
      .locator('[data-contact-id="jess"]')
      .dispatchEvent('dblclick');
    await expect(chats().first()).toBeVisible();
    await page.waitForTimeout(1000);
  }

  async function openMail() {
    await icon('mail').dispatchEvent('dblclick');
    const mail = page.getByRole('region', { name: /Mail$/ }).first();
    await mail
      .getByRole('button', { name: cat().mail.ui.sendRecv })
      .dispatchEvent('click');
    const rows = mail
      .getByRole('table', { name: cat().mail.ui.messages })
      .getByRole('row');
    await expect(rows).not.toHaveCount(1, { timeout: 10_000 });
    await page.waitForTimeout(1500);
    const unread = mail.locator('tbody tr[data-unread="true"]');
    await (
      (await unread.count()) > 0 ? unread.first() : rows.nth(1)
    ).dispatchEvent('click');
  }

  async function openWeb(url: string) {
    await icon('browser').dispatchEvent('dblclick');
    const web = page
      .getByRole('region', { name: new RegExp(`${en.apps.browser.title}$`) })
      .first();
    await expect(web).toBeVisible();
    const address = web.getByLabel(cat().browser.address);
    await address.fill(url);
    await address.press('Enter');
    await expect(web.getByRole('status')).toHaveText(
      cat().browser.status.done,
      { timeout: 10_000 },
    );
  }

  async function openSeededText() {
    await page
      .getByRole('option', { name: cat().fs.folders.docs, exact: true })
      .dispatchEvent('dblclick');
    const docs = page
      .getByRole('region', { name: cat().fs.folders.docs })
      .first();
    await expect(docs).toBeVisible();
    await docs
      .getByRole('option', { name: /\.txt$/ })
      .first()
      .dispatchEvent('dblclick');
    await expect(
      page.getByRole('region', {
        name: new RegExp(` - ${cat().notepad.title.split(' - ').pop() ?? ''}$`),
      }),
    ).toBeVisible();
  }

  async function turnOff(day: number) {
    await closeAll();
    await page
      .getByRole('button', { name: cat().taskbar.start, exact: true })
      .dispatchEvent('click');
    await page
      .getByRole('menuitem', { name: cat().startMenu.turnOff })
      .dispatchEvent('click');
    await page.getByTestId('off-screen').click();
    await expect(page.getByTestId('boot-day')).toHaveText(
      cat().boot.day.replace('{day}', String(day)),
    );
  }

  const logOn = () =>
    page.getByRole('button', {
      name: cat().login.logOnAs.replace('{name}', 'Ada'),
    });

  // ── Day 1, German (detected from the browser) ──
  await quietIdle(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Deutsch' })).toBeChecked();
  await page.getByLabel(cat().login.yourName).fill('Ada');
  await pickGender(page);
  await page.mouse.move(10, 10);
  await shot('day1-login', 'de');
  await logOn().click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  await page
    .getByRole('button', { name: cat().taskbar.start, exact: true })
    .click();
  await expect(
    page.getByRole('menu', { name: cat().startMenu.label }),
  ).toBeVisible();
  await page.mouse.move(1270, 790);
  await shot('day1-startmenu', 'de');
  await page.keyboard.press('Escape');

  await playMessenger();
  await both('day1-messenger');
  await closeAll();
  await openMail();
  await both('day1-mail');
  await closeAll();
  await openWeb('friendspace.example/jess');
  await both('day1-spaceport-jess');

  // ── Day 2, German, then the mid-game switch ──
  await turnOff(2);
  await shot('day2-boot', 'de');
  await logOn().click();
  await expect(page.getByTestId('desktop')).toBeVisible();
  await closeAll();
  await playMessenger();
  await both('day2-messenger');

  // Many windows at once: Messenger + Jess, Mail, a seeded file, a website.
  await openMail();
  await openSeededText();
  await openWeb('celebgossip07.example');
  await page.mouse.move(1270, 790);
  await shot('day2-midgame', 'de');

  // Switch through Regional and Language Options, with all of that still open.
  await page
    .getByRole('button', { name: cat().taskbar.start, exact: true })
    .dispatchEvent('click');
  await page
    .getByRole('menuitem', { name: new RegExp(cat().startMenu.allPrograms) })
    .dispatchEvent('click');
  await page
    .getByRole('menu', { name: cat().startMenu.allPrograms })
    .getByRole('menuitem', {
      name: new RegExp(cat().startMenu.categories.system),
    })
    .dispatchEvent('click');
  await page
    .getByRole('menuitem', { name: cat().apps.regional.title, exact: true })
    .last()
    .dispatchEvent('click');
  const regional = page.getByRole('region', {
    name: cat().apps.regional.title,
  });
  await expect(regional).toBeVisible();
  await page.mouse.move(1270, 790);
  await shot('day2-regional', 'de');
  await regional.getByRole('combobox').selectOption('en');
  await regional
    .getByRole('button', { name: cat().common.apply })
    .dispatchEvent('click');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  lang = 'en';
  await expect(
    page.getByRole('region', { name: en.apps.regional.title }),
  ).toBeVisible();
  await page.mouse.move(1270, 790);
  await shot('day2-regional', 'en');
  await page
    .getByRole('region', { name: en.apps.regional.title })
    .getByRole('button', { name: en.wm.close, exact: true })
    .dispatchEvent('click');
  await page.mouse.move(1270, 790);
  await shot('day2-midgame', 'en');

  // Play on in English: another website and the Start menu.
  await closeAll();
  await openWeb('friendspace.example/kayla');
  await both('day2-spaceport-kayla');
  await closeAll();
  await page
    .getByRole('button', { name: cat().taskbar.start, exact: true })
    .click();
  await page.mouse.move(1270, 790);
  await shot('day2-startmenu', 'en');
  await page.keyboard.press('Escape');

  // ── Day 3: boots in English, back to German in the login picker ──
  await turnOff(3);
  await shot('day3-boot', 'en');
  await expect(page.getByRole('radio', { name: 'English' })).toBeChecked();
  await page.mouse.move(10, 10);
  await shot('day3-login', 'en');
  await page.getByRole('radio', { name: 'Deutsch' }).click();
  lang = 'de';
  await expect(logOn()).toBeVisible();
  await page.mouse.move(10, 10);
  await shot('day3-login', 'de');
  await logOn().click();
  await expect(page.getByTestId('desktop')).toBeVisible();
  await expect(page.getByTestId('tray-language')).toHaveText('DE');
  await closeAll();

  await playMessenger();
  await both('day3-messenger');
  await closeAll();
  await openMail();
  await both('day3-mail');
  await closeAll();
  await openSeededText();
  await both('day3-notepad');
  await closeAll();
  await openWeb('westfield-high.example');
  await both('day3-westfield');
  await closeAll();
  await icon('mines').dispatchEvent('dblclick');
  await expect(
    page.getByRole('region', { name: cat().apps.mines.title }).first(),
  ).toBeVisible();
  await both('day3-mines');

  expect(problems).toEqual([]);
});
