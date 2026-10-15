import { expect, test } from '@playwright/test';
import { closeNudgeChats, logIn, openMessenger } from './helpers';

const DIR = 'docs/review/P3';

test('P3 gate: away summary, history, wink, emoticon picker @review', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  await page.setViewportSize({ width: 1280, height: 800 });

  await logIn(page);
  const messenger = await openMessenger(page);

  // Away summary toast.
  await messenger.getByLabel('My status').selectOption('away');
  await page
    .getByRole('dialog', { name: 'Away message' })
    .getByRole('button', { name: 'OK' })
    .click();
  await page.waitForTimeout(8000);
  await messenger.getByLabel('My status').selectOption('online');
  await expect(
    page.getByTestId('toast-layer').getByText('While you were away'),
  ).toBeVisible();
  await page.waitForTimeout(800); // let the toast finish fading in
  await page.screenshot({ path: `${DIR}/away-summary.png` });

  // Message History.
  await messenger.getByRole('menuitem', { name: 'File', exact: true }).click();
  await page.getByRole('menuitem', { name: /View Message History/ }).click();
  const history = page.getByRole('region', { name: 'Message History' });
  await expect(history).toBeVisible();
  await history.getByRole('option').first().click();
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/message-history.png` });
  await history.getByRole('button', { name: 'Close' }).first().click();

  // Wink mid-play and the emoticon picker, in Jess's chat.
  await closeNudgeChats(page, { wait: false });
  await messenger
    .getByRole('group', { name: 'Contacts' })
    .getByText(/jess/i)
    .first()
    .dblclick();
  const chat = page.getByRole('region', { name: /Conversation$/ }).first();
  await expect(chat).toBeVisible();
  await chat.getByRole('button', { name: 'Winks ▾' }).click();
  await chat.getByRole('menuitem', { name: 'Hamster' }).click();
  await expect(chat.locator('[data-wink]')).toBeVisible();
  await page.waitForTimeout(700); // mid-play: the hamster is on its way across
  await page.screenshot({ path: `${DIR}/wink-mid-play.png` });
  await expect(chat.locator('[data-wink]')).toHaveCount(0, { timeout: 6000 });

  await chat.getByRole('button', { name: 'Emoticons' }).click();
  await expect(chat.getByRole('menu', { name: 'Emoticons' })).toBeVisible();
  await page.screenshot({ path: `${DIR}/emoticon-picker.png` });

  expect(problems).toEqual([]);
});
