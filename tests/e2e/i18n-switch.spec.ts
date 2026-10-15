import { expect, test } from '@playwright/test';
import { logIn, openMessenger } from './helpers';

// Everything open stays open across the switch and re-renders in place, without a reload.
test('mid-game switch re-renders open chats, mail, files and titles', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await logIn(page);

  // English: Messenger, Jess's chat with one picked choice.
  await openMessenger(page);
  const list = page.getByRole('group', { name: 'Contacts' });
  await list.locator('[data-contact-id="jess"]').dblclick();
  const chat = page.getByRole('region', {
    name: 'xX~JeSs~Xx :D - Conversation',
  });
  await expect(chat).toBeVisible();
  const replies = chat.getByRole('group', { name: 'Replies' });
  await expect(replies).toBeVisible({ timeout: 10_000 });
  // Dispatched directly: Jess's nudge keeps the window shaking, so it is never "stable".
  await replies.getByRole('button').first().dispatchEvent('click');
  await chat.getByRole('button', { name: 'Send' }).dispatchEvent('click');
  const log = chat.getByRole('log', { name: 'Conversation' });
  await expect(log.locator('[data-from="player"]').first()).toBeVisible();
  await expect(log).toContainText('just sent you a nudge!');

  // From here on the open chat can overlap anything, so events are dispatched directly.
  // English: a mail, and a seeded file in Notepad.
  await page
    .getByRole('option', { name: 'Mail', exact: true })
    .dispatchEvent('dblclick');
  const mail = page.getByRole('region', { name: /Mail$/ }).first();
  await mail.getByRole('button', { name: 'Send/Recv' }).dispatchEvent('click');
  const welcome = mail.getByRole('row', {
    name: /Welcome to your new PixelPoint HomeStar 3000!/,
  });
  await welcome.dispatchEvent('click');
  await expect(mail).toContainText('Dear Valued Customer');

  await page
    .getByRole('option', { name: 'My Documents' })
    .dispatchEvent('dblclick');
  const docs = page.getByRole('region', { name: 'My Documents' }).first();
  await docs
    .getByRole('option', { name: 'poem_DO_NOT_READ.txt' })
    .dispatchEvent('dblclick');
  const pad = page.getByRole('region', {
    name: 'poem_DO_NOT_READ.txt - Notepad',
  });
  await expect(pad).toBeVisible();
  await expect(pad.getByRole('textbox')).toHaveValue(/DO NOT READ THIS/);

  // Switch via the tray badge: no reload, no English left on the open windows.
  await page.getByTestId('tray-language').dispatchEvent('click');
  await page
    .getByRole('menuitemradio', { name: 'Deutsch' })
    .dispatchEvent('click');
  await expect(page.getByTestId('tray-language')).toHaveText('DE');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');

  await expect(page.getByRole('group', { name: 'Kontakte' })).toBeVisible();
  const deChat = page.getByRole('region', {
    name: 'xX~JeSs~Xx :D - Unterhaltung',
  });
  await expect(deChat).toBeVisible();
  const deLog = deChat.getByRole('log', { name: 'Unterhaltung' });
  await expect(deLog).toContainText('Nudge geschickt');
  await expect(deLog).not.toContainText('just sent you a nudge');
  await expect(deChat.getByRole('button', { name: 'Senden' })).toBeVisible();

  await expect(mail).toContainText('Sehr geehrte Kundin');
  await expect(mail).not.toContainText('Dear Valued Customer');
  await expect(
    mail.getByRole('row', { name: /Willkommen bei Ihrem neuen PixelPoint/ }),
  ).toBeVisible();
  await expect(
    mail.getByRole('button', { name: 'Senden/Empfangen' }),
  ).toBeVisible();

  const dePad = page.getByRole('region', {
    name: 'geheimes gedicht.txt - Editor',
  });
  await expect(dePad).toBeVisible();
  await expect(dePad.getByRole('textbox')).toHaveValue(/NICHT LESEN/);
  await expect(dePad.getByRole('textbox')).not.toHaveValue(/DO NOT READ THIS/);
  await expect(
    page.getByRole('region', { name: 'Eigene Dateien' }).first(),
  ).toBeVisible();

  // Back to English through Regional and Language Options.
  await page
    .getByRole('button', { name: 'Start', exact: true })
    .dispatchEvent('click');
  await page
    .getByRole('menuitem', { name: /Alle Programme/ })
    .dispatchEvent('click');
  const programs = page.getByRole('menu', { name: 'Alle Programme' });
  // Dispatched directly: the open chat window overlaps the flyout's hit area.
  await programs
    .getByRole('menuitem', { name: /Systemprogramme/ })
    .dispatchEvent('click');
  await page
    .getByRole('menuitem', { name: 'Regions- und Sprachoptionen', exact: true })
    .last()
    .dispatchEvent('click');
  const regional = page.getByRole('region', {
    name: 'Regions- und Sprachoptionen',
  });
  await regional.getByRole('combobox').selectOption('en');
  await regional
    .getByRole('button', { name: 'Übernehmen' })
    .dispatchEvent('click');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(
    page.getByRole('region', { name: 'xX~JeSs~Xx :D - Conversation' }),
  ).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'poem_DO_NOT_READ.txt - Notepad' }),
  ).toBeVisible();
  await expect(mail).toContainText('Dear Valued Customer');
});
