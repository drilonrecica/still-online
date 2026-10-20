import { expect, test } from '@playwright/test';
import type { Gender } from '../../src/os/types';
import { go, logIn, openBrowserOnline, setDay } from './helpers';

// W2: show night (day 10) outside Messenger, for both genders. Mom's mail about meeting Dex
// differs per gender, Westfield High names the co-reps, Marco's show album puts the player in the
// front row (girl) or on the crew (boy), and the band page says the show happened.
const SIDE = {
  girl: {
    mom: 'So THAT is Dex.',
    caption: 'front row: the kid. well. a row',
  },
  boy: {
    mom: 'He was not wearing a helmet.',
    caption: 'crew: the kid. carried the amp',
  },
} as const satisfies Record<Gender, { mom: string; caption: string }>;

for (const gender of ['girl', 'boy'] as const satisfies readonly Gender[]) {
  test(`day 10 as a ${gender}: mail, Westfield High, Pixlog and Friendspace`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await setDay(page, 10);
    await logIn(page, 'Ada', { gender });

    const web = await openBrowserOnline(page);
    await go(web, 'http://westfield-high.example/news');
    await expect(web).toContainText(
      'Class Rep: Co-Representatives Kayla and Brianna',
    );
    await go(web, 'http://pixlog.example/album?id=marco-rec-hall&n=6');
    await expect(web).toContainText('rec hall. capacity 80. (83)');
    await expect(web).toContainText(SIDE[gender].caption);
    await go(web, 'http://friendspace.example/band/velvet-lantern');
    await expect(web).toContainText('played. 83 people');
    await web.getByRole('button', { name: 'Close', exact: true }).click();

    await page
      .getByRole('option', { name: 'Mail', exact: true })
      .dispatchEvent('dblclick');
    const mail = page.getByRole('region', { name: /Mail$/ }).first();
    await mail.getByRole('button', { name: 'Send/Recv' }).click();
    const mom = mail.locator('tbody tr').filter({ hasText: 'about tonight' });
    await expect(mom).toBeVisible({ timeout: 10_000 });
    await mom.click();
    await expect(mail).toContainText(SIDE[gender].mom);
    await expect(mail).toContainText(
      gender === 'girl' ? 'Hi sweetie,' : 'Hi buddy,',
    );
  });
}
