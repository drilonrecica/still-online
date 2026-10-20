import { expect, test, type Locator, type Page } from '@playwright/test';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import type { Gender } from '../../src/os/types';
import { closeNudgeChats, logIn, playChat, setDay } from './helpers';
import { seedStoryDay, signInMessenger } from './week2';

const DIR = 'docs/review/v05-W3';

function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  return problems;
}

/** Switches the game to German through the tray; persisted chats and mail re-render in German. */
async function trayToGerman(page: Page) {
  await page.getByTestId('tray-language').dispatchEvent('click');
  await page
    .getByRole('menuitemradio', { name: 'Deutsch' })
    .dispatchEvent('click');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.waitForTimeout(400);
}

async function hideTacki(page: Page) {
  for (const name of [en.assistant.hide, de.assistant.hide]) {
    const hide = page.getByRole('button', { name });
    if (await hide.isVisible()) await hide.dispatchEvent('click');
  }
}

// ── Part 1: the W1 key chats, played in English, then re-rendered and shot in German ──

interface ChatShot {
  name: string;
  day: number;
  contactId: string;
  displayName: string;
  /** Scripts left to run; everything else of every contact counts as already run. */
  scripts: readonly string[];
  /** The last (English) line of each script in `scripts`, in order. */
  until: readonly RegExp[];
  prefer?: readonly RegExp[];
  only?: Gender;
}

// Same chats and choices as the W1 gate (`v05-review-w1.spec.ts`), so the -de shots sit next to
// W1's -en ones.
const CHATS: readonly ChatShot[] = [
  {
    name: '01-jess-day9',
    day: 9,
    contactId: 'jess',
    displayName: 'xX~JeSs~Xx :D',
    scripts: ['day9'],
    until: [/its in CAPS/],
    prefer: [/u were robbed/, /pasta isnt art/],
  },
  {
    name: '02-kayla-day9',
    day: 9,
    contactId: 'kayla',
    displayName: '~*Kayla*~ <3',
    scripts: ['day9'],
    until: [/i will be dramatic until then/],
    prefer: [/u could share it/],
  },
  {
    name: '03-pia-day10',
    day: 10,
    contactId: 'pia',
    displayName: 'pia (L) ponies (L)',
    scripts: ['day10'],
    until: [/he swam the whole time/],
    prefer: [/next year for sure/, /u didnt miss much/],
  },
  {
    name: '04-theo-day9',
    day: 9,
    contactId: 'theo',
    displayName: 'theo',
    scripts: ['day9'],
    until: [/its a plan|marco cant see us there/],
    prefer: [/i saw one/, /id like that/, /obviously dude/],
  },
  {
    name: '05-marco-day8',
    day: 8,
    contactId: 'marco',
    displayName: 'marco | velvet lantern',
    scripts: ['day8'],
    until: [/ok practice\. later kid/],
    prefer: [/which words/],
  },
  {
    name: '06-dex-day9',
    day: 9,
    contactId: 'dex',
    displayName: 'dex',
    scripts: ['day9'],
    until: [/saving it for something/],
    prefer: [/did kev get it/],
  },
  {
    name: '07-boy-only-marco-load-in-crew',
    day: 10,
    contactId: 'marco',
    displayName: 'marco | velvet lantern',
    scripts: ['day10', 'loadInCrew'],
    until: [/thanks kid/, /same pay|i owe u a soda/],
    prefer: [/did they like my song/, /do i get the soda/],
    only: 'boy',
  },
  {
    name: '08-girl-only-jess-late-night',
    day: 8,
    contactId: 'jess',
    displayName: 'xX~JeSs~Xx :D',
    scripts: ['day8', 'lateNight'],
    until: [/I NEED A NEW SIGN/, /nite/],
    prefer: [/come to marcos show/, /im awake/, /\.\.\.maybe/],
    only: 'girl',
  },
];

for (const gender of ['girl', 'boy'] as const satisfies readonly Gender[]) {
  for (const s of CHATS) {
    if (s.only && s.only !== gender) continue;
    test(`W3 gate: ${s.name} (${gender}) @review`, async ({ page }) => {
      test.setTimeout(120_000);
      const problems = watch(page);

      await page.setViewportSize({ width: 1280, height: 800 });
      await seedStoryDay(page, s.day, { [s.contactId]: s.scripts });
      await logIn(page, 'Ada', { gender });
      await signInMessenger(page);
      for (const until of s.until)
        await playChat(page, s.contactId, s.displayName, until, s.prefer);

      // Reopened alone and maximized, so the thread fills the screen.
      await page.waitForTimeout(1500);
      await closeNudgeChats(page, { wait: false });
      await page
        .getByRole('group', { name: 'Contacts' })
        .locator(`[data-contact-id="${s.contactId}"]`)
        .dispatchEvent('dblclick');
      const chat = page.getByRole('region', { name: / - Conversation$/ });
      await expect(chat).toHaveCount(1);
      await chat
        .getByRole('button', { name: en.wm.maximize, exact: true })
        .dispatchEvent('click');
      await trayToGerman(page);
      // Sign-in toasts would cover the display picture (one may arrive during the switch).
      await page.waitForTimeout(1000);
      const toasts = page.getByRole('button', {
        name: new RegExp(
          `^(${en.toast.close}|${de.toast.close}|${de.balloon.close})$`,
        ),
      });
      for (let n = await toasts.count(); n > 0; n = await toasts.count()) {
        await toasts.first().dispatchEvent('click');
        await expect(toasts).toHaveCount(n - 1);
      }
      const log = page
        .getByRole('region', { name: / - Unterhaltung$/ })
        .getByRole('log');
      // The English last line is gone: the whole thread re-rendered in German.
      await expect(log.getByText(s.until.at(-1) ?? /^$/)).toHaveCount(0);
      await hideTacki(page);
      await page.mouse.move(1270, 790);
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${DIR}/${s.name}-${gender}-de.png` });

      expect(problems).toEqual([]);
    });
  }
}

// ── Part 2: days 6–10 in German, mail, one site and the bulletins a day, plus show night ──

interface Day {
  day: number;
  /** The mail opened in the inbox shot (its German subject). */
  mail: string;
  /** The day's site shot: file name part, URL and a German text it shows. */
  site: { name: string; url: string; expect: string };
}

// Same mails and sites as the W2 gate (`v05-review-w2.spec.ts`).
const DAYS: readonly Day[] = [
  {
    day: 6,
    mail: 'wie war deine Woche??',
    site: {
      name: 'westfield-news',
      url: 'westfield-high.example/news',
      expect: 'Zellzeichnungen an der Kunstwand',
    },
  },
  {
    day: 7,
    mail: 'MEIN BILD (noch NICH mama zeigen)',
    site: {
      name: 'tinfoilcomets',
      url: 'tinfoilcomets.example/',
      expect: 'FAN-ART',
    },
  },
  {
    day: 8,
    mail: 'eine Nachricht von der Schule',
    site: {
      name: 'celebgossip',
      url: 'celebgossip07.example/',
      expect: 'Lakeview',
    },
  },
  {
    day: 9,
    mail: '~*61 zu 61*~ (HILFE)',
    site: {
      name: 'kickflip-video',
      url: 'kickflipkings.example/video',
      expect: '140',
    },
  },
  {
    day: 10,
    mail: 'wegen heute Abend',
    site: {
      name: 'cheatcave-clips',
      url: 'cheatcave.example/clips',
      expect: 'mikro geht nur verkehrt rum',
    },
  },
];

async function closeAll(page: Page) {
  const closers = page.getByRole('button', { name: de.wm.close, exact: true });
  for (let n = await closers.count(); n > 0; n = await closers.count()) {
    await closers.last().dispatchEvent('click');
    await expect(closers).toHaveCount(n - 1);
  }
}

async function maximize(win: Locator) {
  await win
    .getByRole('button', { name: de.wm.maximize, exact: true })
    .dispatchEvent('click');
}

async function go(web: Locator, url: string) {
  const address = web.getByLabel('Adresse');
  await address.fill(url);
  await address.press('Enter');
  await expect(web.getByRole('status').last()).toHaveText('Fertig', {
    timeout: 10_000,
  });
}

/** Opens Web Explorer maximized, dialling in when the boot dropped the connection. */
async function openWeb(page: Page): Promise<Locator> {
  await page
    .getByRole('option', { name: 'Web Explorer', exact: true })
    .dispatchEvent('dblclick');
  const web = page.getByRole('region', { name: /Web Explorer$/ }).first();
  const connect = web
    .getByTestId('page-cannot-be-displayed')
    .getByRole('button', { name: 'Verbinden' });
  const done = web.getByRole('status').last().filter({ hasText: 'Fertig' });
  await expect(connect.or(done)).toBeVisible({ timeout: 10_000 });
  if (await connect.isVisible()) await connect.click();
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'online',
    { timeout: 15_000 },
  );
  await maximize(web);
  return web;
}

/** Ausschalten, boot into `day` and log on again (German UI). */
async function nextDayDe(page: Page, day: number) {
  await page.locator('[data-start-button]').click();
  await page
    .getByRole('menuitem', { name: de.startMenu.turnOff, exact: true })
    .dispatchEvent('click');
  await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('off-screen').click();
  await expect(page.getByTestId('boot-day')).toHaveText(`Tag ${day}`);
  await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();
}

for (const gender of ['girl', 'boy'] as const satisfies readonly Gender[]) {
  test(`W3 gate: days 6–10 in German (${gender}) @review`, async ({ page }) => {
    test.setTimeout(300_000);
    const problems = watch(page);

    const shot = async (name: string) => {
      await hideTacki(page);
      await page.mouse.move(1270, 790);
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/${name}-${gender}-de.png` });
    };

    await page.setViewportSize({ width: 1280, height: 800 });
    await setDay(page, 6);
    await logIn(page, 'Ada', { gender });
    await trayToGerman(page);

    for (const d of DAYS) {
      if (d.day > 6) await nextDayDe(page, d.day);
      const tag = `d${String(d.day).padStart(2, '0')}`;

      // The inbox, with one of the day's mails open.
      await page
        .getByRole('option', { name: 'Mail', exact: true })
        .dispatchEvent('dblclick');
      const mail = page.getByRole('region', { name: /Mail$/ }).first();
      await maximize(mail);
      await mail.getByRole('button', { name: de.mail.ui.sendRecv }).click();
      const row = mail.locator('tbody tr').filter({ hasText: d.mail }).first();
      await expect(row).toBeVisible({ timeout: 15_000 });
      await row.click();
      await shot(`${tag}-mail`);
      await closeAll(page);

      // One site, then the Friendspace bulletins.
      const web = await openWeb(page);
      await go(web, `http://${d.site.url}`);
      await expect(web).toContainText(d.site.expect);
      await shot(`${tag}-${d.site.name}`);
      await go(web, 'http://friendspace.example/bulletins');
      await shot(`${tag}-bulletins`);

      if (d.day === 10) {
        await go(web, 'http://westfield-high.example/news');
        await expect(web).toContainText('Co-Klassensprecherinnen');
        await shot('d10-westfield-election');
        await go(web, 'http://pixlog.example/album?id=marco-rec-hall&n=6');
        await expect(web).toContainText('juz. platz für 80. (83)');
        await shot('d10-pixlog-show-album');
        await go(web, 'http://friendspace.example/band/velvet-lantern');
        await expect(web).toContainText('gespielt. 83 leute');
        await shot('d10-friendspace-band');
      }
      await closeAll(page);
    }

    expect(problems).toEqual([]);
  });
}
