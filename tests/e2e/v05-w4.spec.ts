import { expect, test, type Locator, type Page } from '@playwright/test';
import type { Gender } from '../../src/os/types';
import {
  closeNudgeChats,
  go,
  logIn,
  openBrowserOnline,
  pickGender,
  playChat,
  quietIdle,
} from './helpers';
import { seedStoryDay, signInMessenger } from './week2';

// W4: the release flows at day 10 (show night). A girl and a boy open Marco's show album on
// Pixlog, find Theo's poster in Display Properties and read the Westfield High election result;
// the boy also gets Marco's crew thread. The German run repeats the girl's flow with locale de-DE.

/** Marks Theo's day-10 poster as unlocked (his chat does it in play; W1 tests that part). */
async function unlockPoster(page: Page) {
  await page.evaluate(() => {
    const key = 'still-online:v1:world';
    const saved = JSON.parse(localStorage.getItem(key) ?? '{}') as {
      state?: { unlocks?: string[] };
    };
    if (saved.state) saved.state.unlocks = ['lantern-poster'];
    localStorage.setItem(key, JSON.stringify(saved));
  });
}

const SIDE = {
  girl: { caption: 'front row: the kid. well. a row' },
  boy: { caption: 'crew: the kid. carried the amp' },
} as const satisfies Record<Gender, { caption: string }>;

for (const gender of ['girl', 'boy'] as const satisfies readonly Gender[]) {
  test(`day 10 as a ${gender}: show album, poster wallpaper and the election result`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await seedStoryDay(
      page,
      10,
      gender === 'boy'
        ? { theo: ['day10'], marco: ['day10', 'loadInCrew'] }
        : {},
    );
    // The girl's poster is seeded; the boy earns it in Theo's day-10 chat below.
    if (gender === 'girl') await unlockPoster(page);
    await logIn(page, 'Ada', { gender });

    if (gender === 'boy') {
      await signInMessenger(page);
      await playChat(page, 'theo', 'theo', /my ears r still ringing/);
      await expect
        .poll(() =>
          page.evaluate(() => localStorage.getItem('still-online:v1:world')),
        )
        .toContain('lantern-poster');
      const marco = await playChat(
        page,
        'marco',
        'marco | velvet lantern',
        /thanks kid/,
      );
      await expect(
        marco.getByRole('log').getByText('kid. crew report'),
      ).toBeVisible({ timeout: 15_000 });
      await closeNudgeChats(page, { wait: false });
      // The contact list would cover the Web Explorer icon.
      await page
        .getByRole('region', { name: 'Messenger', exact: true })
        .getByRole('button', { name: 'Close' })
        .dispatchEvent('click');
    }

    let web: Locator;
    if (gender === 'boy') {
      // Signing in to Messenger already dialed in, so there is no Connect page.
      await page.getByRole('option', { name: 'Web Explorer' }).dblclick();
      web = page.getByRole('region', { name: /Web Explorer$/ });
    } else {
      web = await openBrowserOnline(page);
    }
    await go(web, 'http://pixlog.example/album?id=marco-rec-hall&n=6');
    await expect(web).toContainText('rec hall. capacity 80. (83)');
    await expect(web).toContainText(SIDE[gender].caption);
    await go(web, 'http://westfield-high.example/news');
    await expect(web).toContainText(
      'Class Rep: Co-Representatives Kayla and Brianna',
    );
    await web
      .getByRole('button', { name: 'Close', exact: true })
      .dispatchEvent('click');

    await page.mouse.click(900, 300, { button: 'right' });
    await page.getByRole('menuitem', { name: 'Properties' }).click();
    const display = page.getByRole('region', { name: 'Display Properties' });
    await display.getByRole('tab', { name: 'Desktop' }).click();
    await display
      .getByRole('option', { name: 'Velvet Lantern Poster' })
      .click();
    await display.getByRole('button', { name: 'OK' }).click();
    await expect(display).toHaveCount(0);
  });
}

test.describe('German', () => {
  test.use({ locale: 'de-DE' });

  test('Tag 10 als Mädchen: Show-Album, Plakat-Hintergrund und Wahlergebnis', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await quietIdle(page);
    await seedStoryDay(page, 10, {});
    await unlockPoster(page);
    await page.getByTestId('boot-screen').click();
    await page.getByLabel('Ihr Name').fill('Ada');
    await pickGender(page, 'girl');
    await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
    await expect(page.getByTestId('desktop')).toBeVisible();

    await page
      .getByRole('option', { name: 'Web Explorer' })
      .dispatchEvent('dblclick');
    const web = page.getByRole('region', { name: /Web Explorer$/ }).first();
    const connect = web
      .getByTestId('page-cannot-be-displayed')
      .getByRole('button', { name: 'Verbinden' });
    await connect.click();
    await expect(page.getByTestId('tray-network')).toHaveAttribute(
      'data-status',
      'online',
      { timeout: 15_000 },
    );
    const open = async (url: string) => {
      const address = web.getByLabel('Adresse');
      await address.fill(url);
      await address.press('Enter');
      await expect(web.getByRole('status').last()).toHaveText('Fertig', {
        timeout: 10_000,
      });
    };
    await open('http://pixlog.example/album?id=marco-rec-hall&n=6');
    await expect(web).toContainText(
      'erste reihe: der zwerg. na ja. eine reihe',
    );
    await open('http://westfield-high.example/news');
    await expect(web).toContainText(
      'Kayla und Brianna sind Co-Klassensprecherinnen',
    );
    await web
      .getByRole('button', { name: 'Schließen', exact: true })
      .dispatchEvent('click');

    await page.mouse.click(900, 300, { button: 'right' });
    await page.getByRole('menuitem', { name: 'Eigenschaften' }).click();
    const display = page.getByRole('region', {
      name: 'Eigenschaften von Anzeige',
    });
    await display.getByRole('tab', { name: 'Desktop' }).click();
    await display
      .getByRole('option', { name: 'Velvet-Lantern-Plakat' })
      .click();
    await display.getByRole('button', { name: 'OK' }).click();
    await expect(display).toHaveCount(0);
  });
});
