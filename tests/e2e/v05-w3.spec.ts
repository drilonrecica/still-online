import { expect, test } from '@playwright/test';
import type { Gender } from '../../src/os/types';
import { pickGender, quietIdle } from './helpers';
import { seedStoryDay } from './week2';

test.use({ locale: 'de-DE' });

// W3: show night (day 10) in German, for both genders. Marco's day-10 chat, Mom's mail about
// meeting Dex, Westfield's co-reps, Marco's show album caption and the band page are real German.
const SIDE = {
  girl: {
    greeting: 'Hallo Schatz,',
    mom: 'DAS ist also Dex!!',
    caption: 'erste reihe: der zwerg. na ja. eine reihe',
  },
  boy: {
    greeting: 'Hallo mein Großer,',
    mom: 'Einen Helm hatte er nicht auf.',
    caption: 'crew: der zwerg. hat den verstärker geschleppt',
  },
} as const satisfies Record<
  Gender,
  { greeting: string; mom: string; caption: string }
>;

for (const gender of ['girl', 'boy'] as const satisfies readonly Gender[]) {
  test(`Tag 10 als ${gender}: Chat, Mail, Westfield, Pixlog und Friendspace auf Deutsch`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await quietIdle(page);
    await seedStoryDay(page, 10, { marco: ['day10'] });
    await page.getByTestId('boot-screen').click();
    await page.getByLabel('Ihr Name').fill('Ada');
    await pickGender(page, gender);
    await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
    await expect(page.getByTestId('desktop')).toBeVisible();

    // Marco's day-10 chat waits in the contact list; opened, it is German.
    await page
      .getByRole('option', { name: 'Messenger', exact: true })
      .dispatchEvent('dblclick');
    await page.getByRole('button', { name: 'Anmelden' }).click();
    const contacts = page.getByRole('group', { name: 'Kontakte' });
    await expect(contacts).toBeVisible();
    await contacts
      .locator('[data-contact-id="marco"]')
      .dispatchEvent('dblclick');
    const chat = page.getByRole('region', {
      name: 'marco | velvet lantern - Unterhaltung',
    });
    await expect(chat.getByRole('log')).toContainText('die show ist gelaufen', {
      timeout: 15_000,
    });
    await expect(chat.getByRole('log')).not.toContainText('the show happened');
    await chat
      .getByRole('button', { name: 'Schließen' })
      .dispatchEvent('click');

    await page
      .getByRole('option', { name: 'Web Explorer' })
      .dispatchEvent('dblclick');
    const web = page.getByRole('region', { name: /Web Explorer$/ }).first();
    const connect = web
      .getByTestId('page-cannot-be-displayed')
      .getByRole('button', { name: 'Verbinden' });
    if (await connect.isVisible()) await connect.click();
    await expect(page.getByTestId('tray-network')).toHaveAttribute(
      'data-status',
      'online',
      { timeout: 15_000 },
    );
    const go = async (url: string) => {
      const address = web.getByLabel('Adresse');
      await address.fill(url);
      await address.press('Enter');
      await expect(web.getByRole('status').last()).toHaveText('Fertig', {
        timeout: 10_000,
      });
    };
    await go('http://westfield-high.example/news');
    await expect(web).toContainText(
      'Kayla und Brianna sind Co-Klassensprecherinnen',
    );
    await go('http://pixlog.example/album?id=marco-rec-hall&n=6');
    await expect(web).toContainText(SIDE[gender].caption);
    await go('http://friendspace.example/band/velvet-lantern');
    await expect(web).toContainText('gespielt. 83 leute');
    await web
      .getByRole('button', { name: 'Schließen', exact: true })
      .dispatchEvent('click');

    await page
      .getByRole('option', { name: 'Mail', exact: true })
      .dispatchEvent('dblclick');
    const mail = page.getByRole('region', { name: /Mail$/ }).first();
    await mail.getByRole('button', { name: 'Senden/Empfangen' }).click();
    const mom = mail
      .locator('tbody tr')
      .filter({ hasText: 'wegen heute Abend' });
    await expect(mom).toBeVisible({ timeout: 10_000 });
    await mom.click();
    await expect(mail).toContainText(SIDE[gender].greeting);
    await expect(mail).toContainText(SIDE[gender].mom);
  });
}
