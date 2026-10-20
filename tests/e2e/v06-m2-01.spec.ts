// v0.6 M2-01: Messenger, Mail, folders, the system apps, Notepad and TuneMole on a phone. Every
// flow is touch-only (no dblclick, no hover), and no screen scrolls the page sideways.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { logInTouch, longPress, openAppTouch, tap } from './helpers';

/** The page never scrolls sideways; returns the viewport size. */
async function expectNoSideScroll(page: Page) {
  const [w, h, scrollWidth] = await page.evaluate<[number, number, number]>(
    '[innerWidth, Math.floor(visualViewport.height), document.scrollingElement.scrollWidth]',
  );
  expect(scrollWidth, 'no sideways page scroll').toBeLessThanOrEqual(w);
  return { w, h };
}

/** The element sits inside the viewport horizontally (nothing cut off at the right edge). */
async function expectWithinWidth(page: Page, locator: Locator) {
  const { w } = await expectNoSideScroll(page);
  const box = await locator.boundingBox();
  if (!box) throw new Error('not visible');
  expect(box.x).toBeGreaterThanOrEqual(-0.5);
  expect(box.x + box.width).toBeLessThanOrEqual(w + 0.5);
}

/** A finger-sized target: at least 36 px tall (and wide). */
async function expectTapTarget(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('not visible');
  expect(box.height).toBeGreaterThanOrEqual(36 - 0.5);
  expect(box.width).toBeGreaterThanOrEqual(36 - 0.5);
}

/** Taps the window's Close button. */
async function closeWindow(win: Locator) {
  await tap(win.getByRole('button', { name: 'Close', exact: true }));
  await expect(win).toBeHidden();
}

test('Messenger: chat with Jess with the keyboard open @phone', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  await openAppTouch(page, 'Messenger');
  await tap(page.getByRole('button', { name: 'Sign in' }));
  const contacts = page.getByRole('group', { name: 'Contacts' });
  await expect(contacts).toBeVisible({ timeout: 15_000 });

  // Jess nudges on sign-in and her chat opens full-screen; a tap on her row also brings it up.
  const chat = page.getByRole('region', { name: /JeSs.* - Conversation$/ });
  await expect(chat).toBeVisible({ timeout: 10_000 });
  await expect(chat).not.toHaveAttribute('data-shaking', 'true');
  const tools = chat.getByRole('toolbar', { name: /tools/i });
  for (const button of await tools.getByRole('button').all()) {
    await expectTapTarget(button);
  }

  // The emoticon picker fits the screen.
  const emoticons = chat.getByRole('button', { name: 'Emoticons' });
  await expectTapTarget(emoticons);
  await tap(emoticons);
  const picker = chat.getByRole('menu', { name: 'Emoticons' });
  await expectWithinWidth(page, picker);
  await tap(emoticons);
  await expect(picker).toBeHidden();

  // The keyboard: a shorter viewport while the input has focus keeps it (and Send) in view.
  const replies = chat
    .getByRole('group', { name: 'Replies' })
    .getByRole('button');
  await expect(replies.first()).toBeVisible({ timeout: 15_000 });
  for (const reply of await replies.all()) await expectWithinWidth(page, reply);
  const text = (await replies.first().getAttribute('title')) ?? '';
  await tap(replies.first());
  const input = chat.getByLabel('Message', { exact: true });
  await input.focus();
  const { w } = await expectNoSideScroll(page);
  await page.setViewportSize({ width: w, height: 500 });
  await expect(input).toBeInViewport();
  await page.screenshot({ path: test.info().outputPath('keyboard.png') });
  const send = chat.getByRole('button', { name: 'Send', exact: true });
  await expect(send).toBeInViewport();
  await expectWithinWidth(page, send);
  await tap(send);
  await expect(chat.getByRole('log')).toContainText(text.slice(0, 20));
  await expect(input).toBeInViewport();
  await expectNoSideScroll(page);
});

test('Mail: read a message, go Back, and reply @phone', async ({ page }) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  await openAppTouch(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  await tap(mail.getByRole('button', { name: 'Send/Recv' }));
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 15_000 });

  // Stacked: the folders are a drop-down above a full-width list; no reading pane yet.
  const folders = mail.getByRole('combobox', { name: 'Folders' });
  await expect(folders).toHaveValue('inbox');
  await expect(mail.getByRole('list', { name: 'Folders' })).toHaveCount(0);
  await expect(mail.getByRole('region', { name: 'Preview' })).toHaveCount(0);
  await expectWithinWidth(page, mail.getByRole('table', { name: 'Messages' }));
  await expectTapTarget(rows.nth(1));

  // A tap opens the message full screen, with Back in the toolbar.
  await tap(rows.nth(1));
  const preview = mail.getByRole('region', { name: 'Preview' });
  await expect(preview).not.toBeEmpty();
  await expect(rows).toHaveCount(0);
  const back = mail.getByRole('button', { name: 'Back' });
  await expectTapTarget(back);
  await tap(back);
  await expect(preview).toHaveCount(0);
  await expect(rows.nth(1)).toBeVisible();

  // Reply: Compose is full screen with To, Subject and Body stacked; Send files it in Sent Items.
  await tap(rows.nth(1));
  await tap(mail.getByRole('button', { name: 'Reply' }));
  const compose = mail.getByRole('form', { name: 'Create Mail' });
  await expect(compose.getByLabel('To', { exact: true })).not.toHaveValue('');
  const body = compose.getByLabel('Message body');
  await tap(body);
  await body.press('Control+Home');
  await body.pressSequentially('thx!! ');
  await expectWithinWidth(page, body);
  await tap(compose.getByRole('button', { name: 'Send' }));
  await expect(folders).toHaveValue('sent');
  await expect(rows).toHaveCount(2);
  await expectNoSideScroll(page);
});

test('My Documents: browse, select by long-press, Details as a list @phone', async ({
  page,
}) => {
  await logInTouch(page);
  await openAppTouch(page, 'My Documents');
  const docs = page.getByRole('region', { name: 'My Documents' });
  const list = docs.getByRole('listbox', { name: 'My Documents' });

  // No task pane; its actions are in the toolbar.
  await expect(docs.getByRole('navigation')).toHaveCount(0);
  const tasks = docs.getByRole('group', { name: 'File and Folder Tasks' });
  await expect(tasks.getByRole('button', { name: 'Rename' })).toBeDisabled();

  // A long-press selects without opening, so Rename works by touch.
  const notes = list.getByRole('option', { name: /notes\.txt/ });
  await longPress(page, notes);
  await expect(notes).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('region', { name: /Notepad$/ })).toHaveCount(0);
  await expect(tasks.getByRole('button', { name: 'Rename' })).toBeEnabled();

  // Details is a single-column list of tap-sized rows.
  await tap(docs.getByRole('button', { name: 'Details' }));
  await expectTapTarget(notes);
  await expectWithinWidth(page, notes);

  // A tap opens a folder, Up goes back.
  await tap(list.getByRole('option', { name: 'My Pictures' }));
  await expect(page.getByRole('region', { name: 'My Pictures' })).toBeVisible();
  await tap(page.getByRole('button', { name: 'Up' }));
  await expect(docs).toBeVisible();
  await expectNoSideScroll(page);
});

test('User Accounts: change the picture @phone', async ({ page }) => {
  await logInTouch(page);
  await openAppTouch(page, 'User Accounts');
  const dialog = page.getByRole('region', { name: 'User Accounts' });
  const current = dialog.getByTestId('useraccounts-current');
  const before = await current.getAttribute('data-picture');
  // The last tile (before "Use default"): never the gender's default picture, which is first.
  const buttons = dialog
    .getByRole('group', { name: 'Change my picture' })
    .getByRole('button');
  const pick = buttons.nth((await buttons.count()) - 2);
  await expectTapTarget(pick);
  await expectWithinWidth(page, pick);
  await tap(pick);
  await expect(pick).toHaveAttribute('aria-pressed', 'true');
  await tap(dialog.getByRole('button', { name: 'Apply' }));
  await expect(current).not.toHaveAttribute('data-picture', before ?? '');
  await expectNoSideScroll(page);
  await tap(dialog.getByRole('button', { name: 'OK' }));
  await expect(dialog).toBeHidden();
});

test('Notepad: menus by tap, write and save @phone', async ({ page }) => {
  await logInTouch(page);
  await openAppTouch(page, 'Notepad');
  const notepad = page.getByRole('region', { name: 'Untitled - Notepad' });
  const doc = notepad.getByLabel('Notepad document');
  await tap(doc);
  await doc.pressSequentially('dear diary');

  // One tap opens a menu, a tap on another switches to it.
  const file = notepad.getByRole('menuitem', { name: 'File' });
  await expectTapTarget(file);
  await tap(file);
  await expect(notepad.getByRole('menu', { name: 'File' })).toBeVisible();
  await tap(notepad.getByRole('menuitem', { name: 'Edit' }));
  await expect(notepad.getByRole('menu', { name: 'Edit' })).toBeVisible();
  await expect(notepad.getByRole('menu', { name: 'File' })).toHaveCount(0);
  await tap(notepad.getByRole('menuitem', { name: 'File' }));
  await tap(notepad.getByRole('menuitem', { name: 'Save As…' }));

  const dialog = notepad.getByRole('dialog');
  await expectWithinWidth(page, dialog);
  const name = dialog.getByLabel('File name', { exact: true });
  await name.fill('diary');
  await tap(dialog.getByRole('button', { name: 'Save' }));
  await expect(
    page.getByRole('region', { name: 'diary.txt - Notepad' }),
  ).toBeVisible();
  await expectNoSideScroll(page);
});

test('TuneMole: search and download a track @phone', async ({ page }) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  await openAppTouch(page, 'TuneMole');
  const mole = page.getByRole('region', { name: /TuneMole$/ });
  await expect(mole.getByRole('status')).toContainText('Connected to', {
    timeout: 15_000,
  });
  const search = mole.getByLabel('Search for music');
  await tap(search);
  await search.fill('surf');
  await tap(mole.getByRole('button', { name: 'Search' }));

  // Condensed: the file name over size · bitrate · peer, and the Download button.
  const results = mole.getByRole('table', { name: 'Search results' });
  await expect(results.getByRole('columnheader')).toHaveCount(2);
  await expect(results).toContainText('kbps');
  await expectWithinWidth(page, results);
  const download = mole
    .getByRole('button', { name: /^Download Surf_Shimmy/ })
    .first();
  await expectTapTarget(download);
  await tap(download);

  await tap(mole.getByRole('tab', { name: 'Downloads' }));
  const downloads = mole.getByRole('table', { name: 'Downloads' });
  await expect(downloads).toContainText('Surf_Shimmy');
  await expectWithinWidth(page, downloads);
  await expect(downloads).toContainText('Complete', { timeout: 30_000 });
  await expectNoSideScroll(page);
});

test('system apps and folders fit the phone without sideways scrolling @phone', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await logInTouch(page);

  // Display Properties: from the desktop's long-press menu. Every tab fits.
  await longPress(page, page.getByTestId('desktop'));
  await tap(page.getByRole('menuitem', { name: 'Properties' }));
  const display = page.getByRole('region', { name: 'Display Properties' });
  for (const tab of await display.getByRole('tab').all()) {
    await tap(tab);
    await expectWithinWidth(page, display.getByRole('tabpanel'));
  }
  await expectWithinWidth(page, display.getByRole('button', { name: 'Apply' }));
  await closeWindow(display);

  for (const name of [
    'Regional and Language Options',
    'Disk Cleanup',
    'Connect to the Internet',
    'My Computer',
    'Recycle Bin',
  ]) {
    await openAppTouch(page, name);
    const win = page.getByRole('region', { name, exact: true });
    await expect(win).toBeVisible();
    // Disk Cleanup's scan swaps its buttons when it ends; measure the list it settles on.
    if (name === 'Disk Cleanup')
      await expect(win.getByRole('list')).toBeVisible({ timeout: 15_000 });
    await expectNoSideScroll(page);
    for (const button of await win.getByRole('button').all()) {
      if (await button.isVisible()) await expectWithinWidth(page, button);
    }
    await closeWindow(win);
  }
});
