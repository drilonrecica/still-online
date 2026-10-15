import { expect, test } from '@playwright/test';
import { closeNudgeChats, logIn, openMessenger } from './helpers';

test('P3: send a wink and receive one back', async ({ page }) => {
  await logIn(page);
  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Jess nudges on sign-in, which opens her chat; wait for the shake to end.
  const chat = page.getByRole('region', { name: /JeSs.*Conversation$/ });
  await expect(chat).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('[data-shaking]')).toHaveCount(0);
  const log = chat.getByRole('log', { name: 'Conversation' });

  await chat.getByRole('button', { name: 'Winks ▾' }).click();
  await chat.getByRole('menuitem', { name: 'Pickle' }).click();
  await expect(log).toContainText('You sent a wink: Pickle');
  const overlay = chat.locator('[data-wink]');
  await expect(overlay).toHaveAttribute('data-wink', 'pickle');
  await expect(overlay).toHaveCount(0, { timeout: 5000 });

  // Guessing "a hamster" makes Jess send one back.
  await chat.getByRole('button', { name: 'A hamster?' }).click();
  await chat.getByRole('button', { name: 'Send' }).click();
  await expect(log).toContainText('sent you a wink: Hamster', {
    timeout: 10_000,
  });
});

test('P3: away summary, Message History and the emoticon picker', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logIn(page);
  const messenger = await openMessenger(page);

  // Go Away by hand; friends keep messaging, and coming back lists what arrived.
  await messenger.getByLabel('My status').selectOption('away');
  await page
    .getByRole('dialog', { name: 'Away message' })
    .getByRole('button', { name: 'OK' })
    .click();
  await expect(messenger.getByText(/Away: brb/)).toBeVisible();
  const toasts = page.getByTestId('toast-layer');
  await messenger.getByLabel('My status').selectOption('online');
  // Messages may or may not have landed yet; wait for them in Away, then return.
  await messenger.getByLabel('My status').selectOption('away');
  await page
    .getByRole('dialog', { name: 'Away message' })
    .getByRole('button', { name: 'OK' })
    .click();
  await expect(toasts).toBeVisible();
  await page.waitForTimeout(6000);
  await messenger.getByLabel('My status').selectOption('online');
  await expect(toasts.getByText('While you were away')).toBeVisible({
    timeout: 5000,
  });

  // Message History lists contacts with a transcript, from the File menu.
  await messenger.getByRole('menuitem', { name: 'File', exact: true }).click();
  await page.getByRole('menuitem', { name: /View Message History/ }).click();
  const history = page.getByRole('region', { name: 'Message History' });
  await expect(history).toBeVisible();
  await expect(history.getByRole('option').first()).toBeVisible();
  await history.getByRole('option').first().click();
  await expect(history.getByRole('log', { name: 'History' })).toBeVisible();

  // A chat's emoticon picker lists the built-ins and "Create emoticon…".
  await page
    .getByRole('region', { name: 'Message History' })
    .getByRole('button', { name: 'Close' })
    .first()
    .click();
  await closeNudgeChats(page, { wait: false });
  await messenger
    .getByRole('group', { name: 'Contacts' })
    .getByText(/jess/i)
    .first()
    .dblclick();
  const chat = page.getByRole('region', { name: /Conversation$/ }).first();
  await chat.getByRole('button', { name: 'Emoticons' }).click();
  await expect(chat.getByRole('menuitem', { name: /pizza/i })).toBeVisible();
  await expect(
    chat.getByRole('menuitem', { name: /Create emoticon/ }),
  ).toBeVisible();
});
