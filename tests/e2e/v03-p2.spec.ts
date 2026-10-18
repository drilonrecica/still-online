import { expect, test } from '@playwright/test';
import { jess } from '../../src/content/de/contacts/jess';
import { MAIL_CONTENT } from '../../src/content/de/mail';
import { jessProfile } from '../../src/content/de/profiles/jess';
import { de } from '../../src/i18n/messages/de';
import { closeNudgeChats, pickGender, quietIdle } from './helpers';

test.use({ locale: 'de-DE' });

test('P2: German content in chat, mail and on the web', async ({ page }) => {
  test.setTimeout(90_000);
  await quietIdle(page);
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel(de.login.yourName).fill('Ada');
  await pickGender(page);
  await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Messenger: Jess's German opening and her German personal message.
  await page.getByRole('option', { name: 'Messenger', exact: true }).dblclick();
  await page.getByRole('button', { name: de.messenger.signIn.submit }).click();
  const chat = page.getByRole('region', { name: /- Unterhaltung$/ }).first();
  const log = chat.getByRole('log', { name: de.messenger.chat.transcript });
  await expect(log).toContainText(jess.scripts.opening?.hi?.lines[1] ?? '-', {
    timeout: 15_000,
  });
  const choice = jess.scripts.opening?.hi?.choices?.[0];
  await chat
    .getByRole('group', { name: de.messenger.chat.replies })
    .getByRole('button')
    .first()
    .click();
  await chat
    .getByRole('button', { name: de.messenger.chat.send, exact: true })
    .click();
  await expect(log.locator('[data-from="player"]').first()).toContainText(
    choice?.text ?? '-',
  );
  await closeNudgeChats(page, { wait: false });
  await expect(page.getByRole('group', { name: 'Kontakte' })).toContainText(
    // Emoticon codes like (L) render as images, so compare the text before them.
    (jess.personalMessage ?? '-').replace(/\s*\(L\)$/, ''),
  );

  // Mail: the day-1 inbox arrives in German.
  // Dispatched directly: friends keep nudging chats open, so the desktop is never "stable".
  await page
    .getByRole('option', { name: 'Mail', exact: true })
    .dispatchEvent('dblclick');
  const mail = page.getByRole('region', { name: /Mail$/ }).first();
  await mail.getByRole('button', { name: de.mail.ui.sendRecv }).click();
  const welcome = MAIL_CONTENT.find((m) => m.id === 'd1-pixelpoint-welcome');
  await expect(
    mail.getByRole('table', { name: de.mail.ui.messages }),
  ).toContainText(welcome?.subject ?? '-', { timeout: 10_000 });

  // Web Explorer: a German Friendspace profile and a German Searchly search.
  await page
    .getByRole('option', { name: de.apps.browser.title, exact: true })
    .dispatchEvent('dblclick');
  const web = page.getByRole('region', { name: /Web Explorer$/ }).first();
  const address = web.getByLabel(de.browser.address);
  await address.fill('friendspace.example/jess');
  await address.press('Enter');
  await expect(web).toContainText(jessProfile.headline, { timeout: 10_000 });
  await address.fill('searchly.example/search?q=gästebuch');
  await address.press('Enter');
  await expect(web.getByRole('status')).toHaveText(de.browser.status.done, {
    timeout: 10_000,
  });
  await expect(
    web.getByRole('link', { name: /Tinfoil Comets/i }).first(),
  ).toBeVisible();
});
