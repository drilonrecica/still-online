// v0.4 G2 gate: Dex's boy-only skate thread runs for a boy and never for a girl, and a boy's
// My Pictures holds his own photos.
import { expect, test, type Page } from '@playwright/test';
import type { Gender } from '../../src/os/types';
import { logIn, nextDay, openMessenger, playChat } from './helpers';

/** Day 2 in Messenger: plays Dex's day-2 chat to its end and returns his chat log. */
async function dexDay2(page: Page, gender: Gender) {
  await logIn(page, 'Ada', { gender });
  await nextDay(page, 2);
  await openMessenger(page);
  const chat = await playChat(page, 'dex', 'dex', /tmrw for sure/, [
    /how did it go/,
    /did u land the kickflip/,
  ]);
  return chat.getByRole('log');
}

test('G2 gate: a boy gets the skate session thread and his own photos', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await dexDay2(page, 'boy');
  // 6 (fast) minutes after day 2, Dex asks him to the gas-station curb.
  const chat = await playChat(page, 'dex', 'dex', /ollie first/, [/sweet/]);
  await expect(chat.getByRole('log')).toContainText(
    'the curb at the gas station',
  );

  await page.getByRole('option', { name: 'My Pictures' }).dblclick();
  const pics = page.getByRole('region', { name: 'My Pictures' });
  for (const name of [
    'skatepark_wipeout.jpg',
    'lan_party_marcos.jpg',
    'dexs_ramp.jpg',
  ])
    await expect(pics.getByRole('option', { name })).toBeVisible();
  await expect(
    pics.getByRole('option', { name: 'beach_holiday.jpg' }),
  ).toHaveCount(0);
});

test('G2 gate: a girl never gets the boy-only thread', async ({ page }) => {
  test.setTimeout(90_000);
  const log = await dexDay2(page, 'girl');
  // Well past the boy thread's 6 (fast) minutes plus its typing pauses.
  await page.waitForTimeout(10_000);
  await expect(log).not.toContainText('gas station');
  await expect(log).not.toContainText('helmet ur mom bought');
});
