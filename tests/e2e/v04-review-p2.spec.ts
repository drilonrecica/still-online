import { expect, test } from '@playwright/test';
import { pickGender, quietIdle } from './helpers';

const DIR = 'docs/review/v04-P2';

// P2 gate: the Pixlog home feed, a friend's photos tab, an album, and /me with album + survey + visitors.
for (const lang of ['en', 'de'] as const) {
  test(`P2 gate: Pixlog in ${lang} @review`, async ({ page }) => {
    test.setTimeout(90_000);
    const de = lang === 'de';
    const problems: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning')
        problems.push(`console ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

    // Day 5 on the same real date: Jess's album is up and the feed has several days in it.
    await page.addInitScript(() => {
      if (localStorage.getItem('still-online:v1:world')) return;
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
    await quietIdle(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./?speed=fast');
    await page.getByTestId('boot-screen').click();
    await expect(page.getByTestId('login-screen')).toBeVisible();
    await page.getByRole('radio', { name: de ? 'Deutsch' : 'English' }).click();
    await page.getByRole('textbox').first().fill('Ada');
    await pickGender(page, 'girl');
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

    // 1. Home feed.
    await visit('pixlog.example');
    await shot('01-home-feed');

    // 2. A friend's photos tab.
    await visit('pixlog.example/jess?tab=photos');
    await shot('02-friend-photos');

    // 3. An album.
    await visit('pixlog.example/album?id=jess-comets-show');
    await shot('03-album');

    // 4. /me with an album, a survey and the visitors box.
    await visit('pixlog.example/me');
    await web
      .getByRole('button', { name: de ? 'Fotos hinzufügen' : 'Add photos' })
      .click();
    const pick = web.getByRole('button', {
      name: de ? /^(?!Fotos hinzufügen$).+ hinzufügen$/ : /^Add (?!photos$).+/,
    });
    for (let i = 0; i < 2; i++) await pick.first().click();
    await web
      .getByRole('button', { name: de ? 'Schließen' : 'Close', exact: true })
      .last()
      .click();
    await web
      .getByRole('button', {
        name: de ? 'Umfrage ausfüllen' : 'Fill in a survey',
      })
      .click();
    const answers = web
      .getByRole('region', { name: de ? 'Meine Umfragen' : 'My surveys' })
      .locator('input[type="text"]');
    const count = await answers.count();
    for (let i = 0; i < count; i++)
      await answers.nth(i).fill(de ? 'Pizza' : 'pizza');
    await web
      .getByRole('button', {
        name: de ? 'Auf mein Profil stellen' : 'Post to my profile',
      })
      .click();
    await expect(web.locator('dl').first()).toBeVisible();
    await web.getByRole('heading', { level: 1 }).scrollIntoViewIfNeeded();
    await shot('04-me');

    expect(problems).toEqual([]);
  });
}
