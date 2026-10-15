import { expect, test } from '@playwright/test';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import { quietIdle } from './helpers';

const DIR = 'docs/review/v03-P1';

// Desktop apps the gate walks through, in both languages.
const APP_IDS = [
  'mycomputer',
  'messenger',
  'browser',
  'mail',
  'tunemole',
  'amplifier',
  'notepad',
  'paint',
  'photobooth',
  'mines',
  'henhunt',
  'pinball',
  'wrecker',
  'diskcleanup',
  'recyclebin',
] as const;

for (const lang of ['en', 'de'] as const) {
  const cat = lang === 'en' ? en : de;
  test.describe(lang, () => {
    test.use({ locale: lang === 'en' ? 'en-US' : 'de-DE' });

    test(`P1 gate: every app in ${lang} @review`, async ({ page }) => {
      test.setTimeout(180_000);
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
      await page.getByLabel(cat.login.yourName).fill('Ada');
      await page
        .getByRole('button', {
          name: cat.login.logOnAs.replace('{name}', 'Ada'),
        })
        .click();
      await expect(page.getByTestId('desktop')).toBeVisible();
      await page.mouse.move(1270, 790);
      await page.screenshot({ path: `${DIR}/desktop-${lang}.png` });

      for (const id of APP_IDS) {
        const entry = cat.apps[id] as { title: string; label?: string };
        const icon = entry.label ?? entry.title;
        await page.getByRole('option', { name: icon, exact: true }).dblclick();
        const win = page.getByRole('region', { name: entry.title }).first();
        await expect(win).toBeVisible();
        if (id === 'messenger') {
          await win
            .getByRole('button', { name: cat.messenger.signIn.submit })
            .click();
          await expect(win.getByRole('group').first()).toBeVisible();
        }
        await page.waitForTimeout(id === 'diskcleanup' ? 2500 : 400);
        await page.mouse.move(1270, 790);
        await page.screenshot({ path: `${DIR}/${id}-${lang}.png` });
        // Desktop Wrecker is a full-screen overlay without a title bar: Escape exits.
        if (id === 'wrecker') await page.keyboard.press('Escape');
        // Messenger's sign-in may auto-open a nudge chat: close everything.
        const closers = page.getByRole('button', {
          name: cat.wm.close,
          exact: true,
        });
        for (let n = await closers.count(); n > 0; n = await closers.count()) {
          await closers.last().dispatchEvent('click');
          await expect(closers).toHaveCount(n - 1);
        }
      }

      expect(problems).toEqual([]);
    });
  });
}
