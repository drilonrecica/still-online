import { expect, test } from '@playwright/test';
import { logIn } from './helpers';
import { contacts } from '../../src/content/contacts';

const DIR = 'docs/review/M2';

test('M2 gate: every contact opening plays through @review', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();

  // Everyone signs in within ~3s on the fast clock.
  await expect(
    page.locator('[data-contact-id][data-status]:not([data-status=offline])'),
  ).toHaveCount(contacts.length, { timeout: 15_000 });

  // Contacts alternate between the first and last reply so both ends of the graph are exercised.
  for (const [i, { contact }] of contacts.entries()) {
    await page
      .locator(`[data-contact-id="${contact.id}"]`)
      .dispatchEvent('dblclick');
    const chat = page.getByRole('region', {
      name: `${contact.displayName} - Conversation`,
    });
    await expect(chat).toBeVisible();
    const log = chat.getByRole('log', { name: 'Conversation' });
    const replies = chat.getByRole('group', { name: 'Replies' });

    let turns = 0;
    for (;;) {
      try {
        await replies.waitFor({ state: 'visible', timeout: 3_000 });
      } catch {
        break; // script ended
      }
      const buttons = replies.getByRole('button');
      // Dispatched directly: a nudge shakes the window, so it is never "stable".
      await (i % 2 ? buttons.last() : buttons.first()).dispatchEvent('click');
      await chat
        .getByRole('button', { name: 'Send', exact: true })
        .dispatchEvent('click');
      turns++;
      expect(turns).toBeLessThan(15);
    }
    expect(turns, `${contact.id} offered choices`).toBeGreaterThan(1);
    expect(await log.locator('[data-from="contact"]').count()).toBeGreaterThan(
      2,
    );
    await expect(log).not.toContainText(/\{[a-z]+\}/);
    await page.screenshot({ path: `${DIR}/chat-${contact.id}.png` });
    await chat.getByRole('button', { name: 'Close' }).dispatchEvent('click');
  }

  // Chats closed: the contact list with everyone signed in and the status changes applied.
  await page.mouse.move(900, 300);
  await page.screenshot({ path: `${DIR}/contact-list.png` });

  expect(problems).toEqual([]);
});
