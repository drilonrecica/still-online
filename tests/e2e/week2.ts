// Week-two e2e steps (W1-G): put a fresh save on a story day with only the chosen scripts left.
import { expect, type Page } from '@playwright/test';
import { contacts } from '../../src/content/contacts';
import { setDay } from './helpers';

/**
 * Puts the save on `day` and marks every Messenger script as already run except `keep`
 * (contact id → script ids). A fresh save on day 9 would otherwise queue each friend's days 1–9
 * one after another; this way the key day's chat (and its follow-up thread) plays alone.
 * Call it before logging on.
 */
export async function seedStoryDay(
  page: Page,
  day: number,
  keep: Readonly<Record<string, readonly string[]>>,
) {
  await setDay(page, day);
  const progress = Object.fromEntries(
    contacts.map(({ contact, scripts }) => [
      contact.id,
      {
        everSignedIn: true,
        status: 'online',
        personalMessage: 'initial',
        active: null,
        queue: [],
        scripts: Object.fromEntries(
          scripts
            .filter((s) => !keep[contact.id]?.includes(s.id))
            .map((s) => [
              s.id,
              {
                runs: 1,
                visited: [],
                trackIds: [],
                day: s.trigger.type === 'onDay' ? s.trigger.day : 1,
              },
            ]),
        ),
        transcript: [],
        unread: 0,
        presenceDay: 1,
      },
    ]),
  );
  await page.evaluate((contacts) => {
    localStorage.setItem(
      'still-online:v1:messenger',
      JSON.stringify({ version: 1, state: { progress: { contacts } } }),
    );
  }, progress);
}

/** Opens Messenger and signs in on a seeded day; no chat is guaranteed, so nothing waits for one. */
export async function signInMessenger(page: Page) {
  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();
}
