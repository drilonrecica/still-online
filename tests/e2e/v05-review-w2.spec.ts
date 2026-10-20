import { expect, test, type Locator, type Page } from '@playwright/test';
import { en } from '../../src/i18n/messages/en';
import type { Gender } from '../../src/os/types';
import { go, logIn, nextDay, setDay } from './helpers';

const DIR = 'docs/review/v05-W2';

interface Day {
  day: number;
  /** The mail opened in the inbox shot (a subject on that day). */
  mail: string;
  /** The day's site shot: file name part and URL. */
  site: { name: string; url: string; expect: string };
}

// W2 gate: days 6–10 played through in English as a girl, then as a boy (German shows the English
// placeholders until W3). Each day: the inbox with one of the day's mails open, one site and the
// Friendspace bulletins. Day 10 adds the Westfield High election result, Marco's show album on
// Pixlog, the Velvet Lantern band page and Theo's poster on the desktop.
const DAYS: readonly Day[] = [
  {
    day: 6,
    mail: 'how was your week??',
    site: {
      name: 'westfield-news',
      url: 'westfield-high.example/news',
      expect: 'Cell Drawings on the Art Wall',
    },
  },
  {
    day: 7,
    mail: 'MY DRAWING (dont show mom yet)',
    site: {
      name: 'tinfoilcomets',
      url: 'tinfoilcomets.example/',
      expect: 'FAN ART CONTEST',
    },
  },
  {
    day: 8,
    mail: 'a note from school',
    site: {
      name: 'celebgossip',
      url: 'celebgossip07.example/',
      expect: 'Lakeview',
    },
  },
  {
    day: 9,
    mail: '~*61 to 61*~ (HELP)',
    site: {
      name: 'kickflip-video',
      url: 'kickflipkings.example/video',
      expect: '140',
    },
  },
  {
    day: 10,
    mail: 'about tonight',
    site: {
      name: 'cheatcave-clips',
      url: 'cheatcave.example/clips',
      expect: 'upside down',
    },
  },
];

async function closeAll(page: Page) {
  const closers = page.getByRole('button', { name: en.wm.close, exact: true });
  for (let n = await closers.count(); n > 0; n = await closers.count()) {
    await closers.last().dispatchEvent('click');
    await expect(closers).toHaveCount(n - 1);
  }
}

async function maximize(win: Locator) {
  await win
    .getByRole('button', { name: en.wm.maximize, exact: true })
    .dispatchEvent('click');
}

/** Opens Web Explorer maximized, dialling in when the boot dropped the connection. */
async function openWeb(page: Page): Promise<Locator> {
  await page
    .getByRole('option', { name: en.apps.browser.title, exact: true })
    .dispatchEvent('dblclick');
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
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'online',
    { timeout: 15_000 },
  );
  await maximize(win);
  return win;
}

for (const gender of ['girl', 'boy'] as const satisfies readonly Gender[]) {
  test(`W2 gate: days 6–10 (${gender}) @review`, async ({ page }) => {
    test.setTimeout(300_000);
    const problems: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning')
        problems.push(`console ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

    const shot = async (name: string) => {
      const hide = page.getByRole('button', { name: en.assistant.hide });
      if (await hide.isVisible()) await hide.dispatchEvent('click');
      await page.mouse.move(1270, 790);
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${DIR}/${name}-${gender}-en.png` });
    };

    await page.setViewportSize({ width: 1280, height: 800 });
    await setDay(page, 6);
    await logIn(page, 'Ada', { gender });

    for (const d of DAYS) {
      if (d.day > 6) await nextDay(page, d.day);
      const tag = `d${String(d.day).padStart(2, '0')}`;

      // The inbox, with one of the day's mails open.
      await page
        .getByRole('option', { name: en.apps.mail.title, exact: true })
        .dispatchEvent('dblclick');
      const mail = page.getByRole('region', { name: /Mail$/ }).first();
      await maximize(mail);
      await mail.getByRole('button', { name: en.mail.ui.sendRecv }).click();
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
        await expect(web).toContainText('Co-Representatives');
        await shot('d10-westfield-election');
        await go(web, 'http://pixlog.example/album?id=marco-rec-hall&n=6');
        await expect(web).toContainText('rec hall. capacity 80. (83)');
        await shot('d10-pixlog-show-album');
        await go(web, 'http://friendspace.example/band/velvet-lantern');
        await expect(web).toContainText('played. 83 people');
        await shot('d10-friendspace-band');
      }
      await closeAll(page);
    }

    // Theo's poster on the desktop: his day-10 chat unlocks it (W1); here the unlock is seeded.
    await page.evaluate(() => {
      const key = 'still-online:v1:world';
      const saved = JSON.parse(localStorage.getItem(key) ?? '{}') as {
        state?: { unlocks?: string[] };
      };
      if (saved.state) saved.state.unlocks = ['lantern-poster'];
      localStorage.setItem(key, JSON.stringify(saved));
    });
    await page.reload();
    await page.getByTestId('boot-screen').click();
    await page.getByRole('button', { name: 'Log on as Ada' }).click();
    await expect(page.getByTestId('desktop')).toBeVisible();
    await page.mouse.click(900, 300, { button: 'right' });
    await page.getByRole('menuitem', { name: 'Properties' }).click();
    const display = page.getByRole('region', { name: 'Display Properties' });
    await display.getByRole('tab', { name: 'Desktop' }).click();
    await display
      .getByRole('option', { name: 'Velvet Lantern Poster' })
      .click();
    await display.getByRole('button', { name: 'OK' }).click();
    await expect(display).toHaveCount(0);
    await shot('d10-poster-wallpaper');

    expect(problems).toEqual([]);
  });
}
