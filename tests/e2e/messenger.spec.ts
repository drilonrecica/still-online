import { expect, test } from '@playwright/test';

test('messenger: sign in, toast, chat, choice, reply, nudges', async ({
  page,
}) => {
  // Fast clock: Messenger timers run at 1/100 of their real delays.
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Open Messenger and sign in.
  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();

  // A contact signs in: toast appears; clicking it opens the chat.
  const toast = page
    .getByRole('status')
    .filter({ hasText: 'JeSs~Xx :D has just signed in' });
  await expect(toast.first()).toBeVisible();
  await toast
    .first()
    .getByRole('button', { name: /JeSs.*has just signed in/ })
    // Dispatched directly: the toast is still sliding in, so it is never "stable".
    .dispatchEvent('click');

  const chat = page.getByRole('region', {
    name: 'xX~JeSs~Xx :D - Conversation',
  });
  await expect(chat).toBeVisible();
  const log = chat.getByRole('log', { name: 'Conversation' });

  // Receive messages, pick a choice, receive the reply.
  const incoming = log.locator('[data-from="contact"]');
  const replies = chat.getByRole('group', { name: 'Replies' });
  await expect(replies).toBeVisible();
  const before = await incoming.count();
  expect(before).toBeGreaterThan(0);
  const choice = replies.getByRole('button').first();
  const choiceText = (await choice.getAttribute('title')) ?? '';
  await choice.click();
  await chat.getByRole('button', { name: 'Send' }).click();
  await expect(log.locator('[data-from="player"]').first()).toContainText(
    choiceText,
  );
  await expect.poll(() => incoming.count()).toBeGreaterThan(before);

  // Nudges: Jess's opening line nudges the player; then the player nudges back.
  await expect(log).toContainText('just sent you a nudge!');
  await chat.getByRole('button', { name: 'Nudge' }).click();
  await expect(log).toContainText('You have just sent a nudge!');
});
