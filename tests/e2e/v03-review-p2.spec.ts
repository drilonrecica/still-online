import { expect, type Page, test } from '@playwright/test';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import type { Messages } from '../../src/i18n/types';
import { quietIdle } from './helpers';

const DIR = 'docs/review/v03-P2';

// Web pages visited per day: one friend profile each day plus a site whose content the day changes.
const PAGES: Record<number, readonly [string, string][]> = {
  1: [
    ['spaceport-jess', 'friendspace.example/jess'],
    ['searchly', 'searchly.example/search?q=tinfoil'],
  ],
  2: [
    ['spaceport-kayla', 'friendspace.example/kayla'],
    ['celebgossip', 'celebgossip07.example'],
  ],
  3: [
    ['spaceport-dex', 'friendspace.example/dex'],
    ['westfield', 'westfield-high.example'],
  ],
  4: [
    ['spaceport-theo', 'friendspace.example/theo'],
    ['tinfoil-guestbook', 'tinfoilcomets.example/guestbook'],
  ],
  5: [
    ['spaceport-marco', 'friendspace.example/marco'],
    ['spaceport-pia', 'friendspace.example/pia'],
    ['virusguard', 'virusguard.example'],
  ],
};

async function closeAll(page: Page, close: string) {
  const closers = page.getByRole('button', { name: close, exact: true });
  for (let n = await closers.count(); n > 0; n = await closers.count()) {
    // Dispatched directly: a nudging chat window is never "stable" for a normal click.
    await closers.last().dispatchEvent('click');
    await expect(closers).toHaveCount(n - 1);
  }
}

type Catalog = Messages;

const chats = (page: Page, cat: Catalog) =>
  page.getByRole('region', {
    name: new RegExp(` - ${cat.apps['messenger-chat'].title}$`),
  });

async function closeChats(page: Page, cat: Catalog) {
  const open = chats(page, cat);
  for (let n = await open.count(); n > 0; n = await open.count()) {
    await open
      .first()
      .getByRole('button', { name: cat.wm.close, exact: true })
      .dispatchEvent('click');
    await expect(open).toHaveCount(n - 1);
  }
}

/** Answers the open conversation with its first choice until it stops asking. */
async function playChat(page: Page, cat: Catalog) {
  const chat = chats(page, cat).first();
  await expect(chat).toBeVisible();
  const choice = chat
    .getByRole('group', { name: cat.messenger.chat.replies })
    .getByRole('button')
    .first();
  for (let i = 0; i < 40; i++) {
    const ready = await choice.waitFor({ timeout: 4000 }).then(
      () => true,
      () => false,
    );
    if (!ready) return;
    await choice.click();
    await chat
      .getByRole('button', { name: cat.messenger.chat.send, exact: true })
      .click();
    await page.waitForTimeout(300);
  }
}

// Full five-day playthrough via Turn Off → power on, once per language. Each day: Messenger (the
// day's scripts fire on sign-in; the first reply is picked), Mail (newest message), and web pages.
for (const lang of ['en', 'de'] as const) {
  const cat = lang === 'en' ? en : de;
  test.describe(lang, () => {
    test.use({ locale: lang === 'en' ? 'en-US' : 'de-DE' });

    test(`P2 gate: five-day playthrough in ${lang} @review`, async ({
      page,
    }) => {
      test.setTimeout(900_000);
      const problems: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning')
          problems.push(`console ${msg.type()}: ${msg.text()}`);
      });
      page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
      const shot = (name: string) =>
        page.screenshot({ path: `${DIR}/${name}-${lang}.png` });
      const icon = (id: 'messenger' | 'mail' | 'browser') => {
        const entry = cat.apps[id] as { title: string; label?: string };
        return page.getByRole('option', {
          name: entry.label ?? entry.title,
          exact: true,
        });
      };
      const logOn = page.getByRole('button', {
        name: cat.login.logOnAs.replace('{name}', 'Ada'),
      });

      await quietIdle(page);
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('./?speed=fast');
      await page.getByTestId('boot-screen').click();
      await expect(page.getByTestId('login-screen')).toBeVisible();
      await page.getByLabel(cat.login.yourName).fill('Ada');
      await logOn.click();
      await expect(page.getByTestId('desktop')).toBeVisible();

      for (const day of [1, 2, 3, 4, 5]) {
        if (day > 1) {
          await closeAll(page, cat.wm.close);
          await page
            .getByRole('button', { name: cat.taskbar.start, exact: true })
            .click();
          await page
            .getByRole('menuitem', { name: cat.startMenu.turnOff })
            .click();
          await page.getByTestId('off-screen').click();
          await expect(page.getByTestId('boot-day')).toHaveText(
            cat.boot.day.replace('{day}', String(day)),
          );
          await shot(`day${day}-boot`);
          await logOn.click();
          await expect(page.getByTestId('desktop')).toBeVisible();
          await closeAll(page, cat.wm.close);
        }

        // Messenger: sign in; the day's scripts start, Jess nudges her chat open.
        await icon('messenger').dblclick();
        await page
          .getByRole('button', { name: cat.messenger.signIn.submit })
          .click();
        const list = page.getByRole('group', {
          name: cat.messenger.list.contacts,
        });
        await expect(list).toBeVisible();
        await page.waitForTimeout(3000);
        // A friend's next script waits until the current one is answered, so play every
        // conversation to its end, the way a player would. Jess goes last for the screenshot.
        for (let pass = 0; pass < 4; pass++) {
          const waiting: string[] = [];
          for (const el of await list
            .locator('[data-awaiting-reply="true"]')
            .all())
            waiting.push((await el.getAttribute('data-contact-id')) ?? '');
          if (waiting.length === 0) break;
          for (const id of waiting) {
            await closeChats(page, cat);
            await list.locator(`[data-contact-id="${id}"]`).dblclick();
            await playChat(page, cat);
          }
          await page.waitForTimeout(3000);
        }
        await closeChats(page, cat);
        await list.locator('[data-contact-id="jess"]').dblclick();
        await page.waitForTimeout(1000);
        await page.mouse.move(1270, 790);
        await shot(`day${day}-messenger`);
        await closeAll(page, cat.wm.close);

        // Mail: fetch and open the day's first unread message.
        await icon('mail').dblclick();
        const mail = page.getByRole('region', { name: /Mail$/ }).first();
        await mail.getByRole('button', { name: cat.mail.ui.sendRecv }).click();
        const rows = mail
          .getByRole('table', { name: cat.mail.ui.messages })
          .getByRole('row');
        await expect(rows).not.toHaveCount(1, { timeout: 10_000 });
        await page.waitForTimeout(1500);
        // The day's news: the first unread message (the inbox keeps older days' mail too).
        const unread = mail.locator('tbody tr[data-unread="true"]');
        await (
          (await unread.count()) > 0 ? unread.first() : rows.nth(1)
        ).click();
        await page.mouse.move(1270, 790);
        await shot(`day${day}-mail`);
        await closeAll(page, cat.wm.close);

        // Web Explorer: already online from the Messenger sign-in.
        await icon('browser').dblclick();
        const web = page
          .getByRole('region', {
            name: new RegExp(`${en.apps.browser.title}$`),
          })
          .first();
        await expect(web).toBeVisible();
        for (const [name, url] of PAGES[day] ?? []) {
          const address = web.getByLabel(cat.browser.address);
          await address.fill(url);
          await address.press('Enter');
          await expect(web.getByRole('status')).toHaveText(
            cat.browser.status.done,
            { timeout: 10_000 },
          );
          await page.mouse.move(1270, 790);
          await shot(`day${day}-${name}`);
        }
        await closeAll(page, cat.wm.close);

        // Day 1 only: the seeded documents and one of them in the text editor.
        if (day === 1) {
          await page
            .getByRole('option', { name: cat.fs.folders.docs, exact: true })
            .dblclick();
          const docs = page
            .getByRole('region', { name: cat.fs.folders.docs })
            .first();
          await expect(docs).toBeVisible();
          await page.mouse.move(1270, 790);
          await shot('day1-documents');
          await docs
            .getByRole('option', { name: /\.txt$/ })
            .first()
            .dblclick();
          await expect(
            page.getByRole('region', {
              name: new RegExp(
                ` - ${cat.apps.notepad.title.split(' - ').pop() ?? ''}$`,
              ),
            }),
          ).toBeVisible();
          await page.mouse.move(1270, 790);
          await shot('day1-notepad');
          await closeAll(page, cat.wm.close);
        }
      }

      expect(problems).toEqual([]);
    });
  });
}
