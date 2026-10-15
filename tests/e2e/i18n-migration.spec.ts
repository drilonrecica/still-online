import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { quietIdle } from './helpers';

const save = JSON.parse(
  readFileSync('src/test/fixtures/v02-save.json', 'utf8'),
) as Record<'settings' | 'windows' | 'fs' | 'mail' | 'web', unknown>;

for (const [locale, lang] of [
  ['en-US', 'en'],
  ['de-DE', 'de'],
] as const) {
  test.describe(`v0.2 save in a ${lang} browser`, () => {
    test.use({ locale });

    test('loads, keeps the player files and mail, and follows the detected language', async ({
      page,
    }) => {
      await quietIdle(page);
      // Seeded once, before the app runs; reloads would keep whatever the app wrote since.
      await page.addInitScript((data) => {
        if (localStorage.getItem('still-online:v1:fs')) return;
        for (const [name, value] of Object.entries(data))
          localStorage.setItem(
            `still-online:v1:${name}`,
            JSON.stringify(value),
          );
      }, save);
      // quietIdle's init script merges into settings; run order keeps the fixture's other fields.
      await page.goto('./?speed=fast');
      await page.getByTestId('boot-screen').click();
      await expect(page.getByTestId('login-screen')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', lang);

      await page.getByRole('button', { name: /^(Log on as|Als) / }).click();
      await expect(page.getByTestId('desktop')).toBeVisible();

      // Restored windows re-render their titles in the active language.
      const t =
        lang === 'de'
          ? {
              pad: 'mine.txt - Editor',
              pics: 'Eigene Bilder',
              chat: 'Unterhaltung',
              close: 'Schließen',
            }
          : {
              pad: 'mine.txt - Notepad',
              pics: 'My Pictures',
              chat: 'Conversation',
              close: 'Close',
            };
      const pad = page.getByRole('region', { name: t.pad });
      await expect(pad).toBeVisible();
      await expect(pad.getByRole('textbox')).toHaveValue('player text');
      await expect(page.getByRole('region', { name: t.pics })).toBeVisible();
      await expect(
        page.getByRole('region', { name: `xX~JeSs~Xx :D - ${t.chat}` }),
      ).toBeVisible();

      // The restored windows cover the desktop icons: close them like a player would.
      const closers = page.getByRole('button', { name: t.close, exact: true });
      for (let n = await closers.count(); n > 0; n = await closers.count()) {
        await closers.last().dispatchEvent('click');
        await expect(closers).toHaveCount(n - 1);
      }

      // Player-made and renamed files survive in My Documents / the seed folders.
      const docs = lang === 'de' ? 'Eigene Dateien' : 'My Documents';
      await page.getByRole('option', { name: docs }).dblclick();
      const folder = page.getByRole('region', { name: docs }).first();
      await expect(
        folder.getByRole('option', { name: 'mine.txt' }),
      ).toBeVisible();
      await expect(
        folder.getByRole('option', { name: 'my renamed.txt' }),
      ).toBeVisible();

      // Saved v0.2 mail survives and the chrome is in the active language.
      const mailIcon = page.getByRole('option', { name: 'Mail', exact: true });
      await mailIcon.dblclick();
      const mail = page.getByRole('region', { name: /Mail$/ }).first();
      await expect(mail).toBeVisible();
      await mail
        .getByRole('table', {
          name: lang === 'de' ? 'Nachrichten' : 'Messages',
        })
        .getByRole('row')
        .nth(1)
        .waitFor();
      await expect(mail).toContainText(lang === 'de' ? 'Posteingang' : 'Inbox');
    });
  });
}
