import { expect, test, type Page } from '@playwright/test';
import type { Gender } from '../../src/os/types';
import { pickGender, quietIdle, setDay } from './helpers';

const DIR = 'docs/review/v04-P3';

/** Starts the save on `day` (same real date, so the boot keeps it) and logs on in `lang`. */
async function start(
  page: Page,
  day: number,
  lang: 'en' | 'de',
  gender: Gender,
) {
  const de = lang === 'de';
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  await setDay(page, day);
  await quietIdle(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await page.getByRole('radio', { name: de ? 'Deutsch' : 'English' }).click();
  await page.getByRole('textbox').first().fill('Ada');
  await pickGender(page, gender);
  await page
    .locator('button[type="submit"], button:has-text("Ada")')
    .last()
    .click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  await page
    .getByRole('option')
    .filter({ hasText: /Web Explorer|Web-Explorer/ })
    .dblclick();
  const web = page.getByRole('region', { name: /Web ?Explorer$/ }).first();
  await web
    .getByTestId('page-cannot-be-displayed')
    .getByRole('button')
    .first()
    .click();
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'online',
  );
  await web.getByRole('button', { name: /^(Maximize|Maximieren)$/ }).click();

  const address = web.getByLabel(de ? 'Adresse' : 'Address');
  const visit = async (url: string) => {
    await address.fill(url);
    await address.press('Enter');
    await expect(web.getByRole('status').last()).toHaveText(
      de ? 'Fertig' : 'Done',
      { timeout: 10_000 },
    );
  };
  const shot = async (name: string) => {
    await page.waitForTimeout(500);
    await page.mouse.move(1270, 790);
    await page.screenshot({ path: `${DIR}/${name}-${lang}.png` });
  };
  return { web, visit, shot, problems };
}

/** The friend whose Pixlog news follows that day's chat (an album or a "NEW PICS" bulletin). */
const FRIEND_OF_THE_DAY: Record<number, string> = {
  1: 'theo',
  2: 'dex',
  3: 'kayla',
  4: 'pia',
  5: 'jess',
};

// P3 gate, day by day: the bulletins, the Pixlog feed and one friend's Pixlog page per day.
for (const lang of ['en', 'de'] as const) {
  for (const day of [1, 2, 3, 4, 5]) {
    test(`P3 gate: day ${day} in ${lang} @review`, async ({ page }) => {
      test.setTimeout(90_000);
      const { visit, shot, problems } = await start(page, day, lang, 'girl');
      const friend = FRIEND_OF_THE_DAY[day];

      await visit('friendspace.example/bulletins');
      await shot(`d${day}-01-bulletins`);
      await visit('pixlog.example');
      await shot(`d${day}-02-pixlog-feed`);
      await visit(`pixlog.example/${friend}`);
      await shot(`d${day}-03-pixlog-${friend}`);

      expect(problems).toEqual([]);
    });
  }

  // Day 5: every friend's Pixlog page and the day-5 albums, the four bands, GlitterCodez.
  test(`P3 gate: day 5 sites in ${lang} @review`, async ({ page }) => {
    test.setTimeout(120_000);
    const { visit, shot, problems } = await start(page, 5, lang, 'girl');

    for (const friend of ['jess', 'kayla', 'pia', 'marco', 'theo', 'dex']) {
      await visit(`pixlog.example/${friend}?tab=blog`);
      await shot(`d5-blog-${friend}`);
    }
    for (const album of [
      'jess-comets-show',
      'kayla-sleepover',
      'pia-stardust-home',
      'marco-bean-cellar',
      'theo-cell-project',
      'dex-premiere',
    ]) {
      await visit(`pixlog.example/album?id=${album}`);
      await shot(`d5-album-${album}`);
    }
    for (const band of [
      'tinfoil-comets',
      'velvet-lantern',
      'grip-tapes',
      'sugarcube-parade',
    ]) {
      await visit(`friendspace.example/band/${band}`);
      await shot(`d5-band-${band}`);
    }
    await visit('glittercodez.example');
    await shot('d5-glittercodez');

    expect(problems).toEqual([]);
  });

  // Gender: the same day as a boy (day 3 has the crush chain letter; the boy gets his own).
  test(`P3 gate: day 3 as a boy in ${lang} @review`, async ({ page }) => {
    test.setTimeout(90_000);
    const { visit, shot, problems } = await start(page, 3, lang, 'boy');

    await visit('friendspace.example/bulletins');
    await shot('d3-boy-01-bulletins');
    await visit('glittercodez.example');
    await shot('d3-boy-02-glittercodez');

    expect(problems).toEqual([]);
  });
}
