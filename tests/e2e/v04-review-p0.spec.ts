import { expect, test } from '@playwright/test';
import { pickGender, quietIdle } from './helpers';

const DIR = 'docs/review/v04-P0';

// P0 gate: the renamed Friendspace (home, a friend's profile, /me) in English and German.
for (const lang of ['en', 'de'] as const) {
  test(`P0 gate: Friendspace in ${lang} @review`, async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning')
        problems.push(`console ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

    await quietIdle(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./?speed=fast');
    await page.getByTestId('boot-screen').click();
    await expect(page.getByTestId('login-screen')).toBeVisible();
    await page
      .getByRole('radio', { name: lang === 'de' ? 'Deutsch' : 'English' })
      .click();
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

    for (const [name, url] of [
      ['01-friendspace-home', 'friendspace.example'],
      ['02-friend-profile', 'friendspace.example/jess'],
      ['03-me', 'friendspace.example/me'],
    ] as const) {
      const address = web.getByLabel(lang === 'de' ? 'Adresse' : 'Address');
      await address.fill(url);
      await address.press('Enter');
      await expect(web.getByRole('status')).toHaveText(
        lang === 'de' ? 'Fertig' : 'Done',
        { timeout: 10_000 },
      );
      await expect(address).toHaveValue(
        `http://${url}${url.endsWith('example') ? '/' : ''}`,
      );
      await expect(web).not.toContainText('Spaceport');
      await page.waitForTimeout(500);
      await page.mouse.move(1270, 790);
      await page.screenshot({ path: `${DIR}/${name}-${lang}.png` });
    }
    expect(problems).toEqual([]);
  });
}
