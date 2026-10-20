import { expect, test } from '@playwright/test';
import type { Gender } from '../../src/os/types';
import { logIn, playChat } from './helpers';
import { seedStoryDay, signInMessenger } from './week2';

// W1: the show night (day 10) for both genders. Theo's chat unlocks the lantern poster wallpaper;
// Marco's crew report follows his day-10 chat for a boy only.
for (const gender of ['girl', 'boy'] as const satisfies readonly Gender[]) {
  test(`day 10 as a ${gender}: the poster unlock and Marco's crew thread`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    await seedStoryDay(page, 10, {
      theo: ['day10'],
      marco: ['day10', 'loadInCrew'],
    });
    await logIn(page, 'Ada', { gender });
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
    const crew = marco.getByRole('log').getByText('kid. crew report');
    if (gender === 'boy') {
      await expect(crew).toBeVisible({ timeout: 15_000 });
    } else {
      // The follow-up waits 5 (fast) minutes, 3 s; give it twice that to (not) arrive.
      await page.waitForTimeout(6000);
      await expect(crew).toHaveCount(0);
    }
  });
}
