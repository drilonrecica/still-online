// v0.6 M0-02: touch primitives. A tap opens what a double-click opens; a long-press opens
// what a right-click opens. See docs/touch.md.
import { expect, test } from '@playwright/test';
import { seedFs } from './fsSeed';
import {
  closeNudgeChats,
  logIn,
  logInTouch,
  longPress,
  openAppTouch,
  tap,
} from './helpers';

test('phone: a tap opens My Documents and a document @phone', async ({
  page,
}) => {
  await seedFs(page);
  await logInTouch(page);
  await openAppTouch(page, 'My Documents');
  const docs = page.getByRole('region', { name: 'My Documents' });
  await expect(docs).toBeVisible();
  await tap(docs.getByRole('option', { name: 'todo.txt' }));
  const notepad = page.getByRole('region', { name: 'todo.txt - Notepad' });
  await expect(notepad).toBeVisible();
  await expect(notepad.getByRole('textbox')).toHaveValue(/more homework/);
});

test('phone: a tap opens a Messenger chat @phone', async ({ page }) => {
  await logInTouch(page);
  await openAppTouch(page, 'Messenger');
  await tap(page.getByRole('button', { name: 'Sign in' }));
  const contacts = page.getByRole('group', { name: 'Contacts' });
  await expect(contacts).toBeVisible();
  await closeNudgeChats(page);
  await tap(contacts.locator('[data-contact-id]').first());
  await expect(page.getByRole('region', { name: /Conversation$/ })).toHaveCount(
    1,
  );
});

test('phone: long-presses open the desktop and Stapley menus @phone', async ({
  page,
}) => {
  await logInTouch(page);
  const desktop = page.getByTestId('desktop');
  const menu = desktop.getByRole('menu');
  await longPress(page, desktop);
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole('menuitem', { name: 'Properties' }),
  ).toBeVisible();
  // The lift's click was swallowed, so the menu stays open; a tap on an item acts.
  await tap(menu.getByRole('menuitem', { name: 'Refresh' }));
  await expect(menu).toHaveCount(0);

  const stapley = page.getByRole('button', { name: 'Stapley the stapler' });
  await expect(stapley).toBeVisible();
  await longPress(page, stapley);
  const stapleyMenu = page.getByRole('menu', { name: 'Stapley' });
  await expect(stapleyMenu).toBeVisible();
  await tap(stapleyMenu.getByRole('menuitem', { name: 'Hide Stapley' }));
  await expect(page.locator('[data-assistant]')).toHaveCount(0);
});

test('desktop: a double-click still opens, and a single click only selects', async ({
  page,
}) => {
  await seedFs(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  // A right-click still opens the desktop menu.
  const desktop = page.getByTestId('desktop');
  await desktop.click({ button: 'right', position: { x: 600, y: 400 } });
  await expect(desktop.getByRole('menu')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(desktop.getByRole('menu')).toHaveCount(0);

  const icon = page.getByTestId('desktop').getByRole('option', {
    name: 'My Documents',
  });
  await icon.click();
  await expect(icon).toHaveAttribute('aria-selected', 'true');
  // Give a would-be double-click time to pass: nothing opens from one click.
  await page.waitForTimeout(600);
  await expect(page.getByRole('region', { name: 'My Documents' })).toHaveCount(
    0,
  );

  await icon.dblclick();
  const docs = page.getByRole('region', { name: 'My Documents' });
  await expect(docs).toBeVisible();
  const todo = docs.getByRole('option', { name: 'todo.txt' });
  await todo.click();
  await expect(todo).toHaveAttribute('aria-selected', 'true');
  await page.waitForTimeout(600);
  await expect(page.getByRole('region', { name: /Notepad$/ })).toHaveCount(0);
  await todo.dblclick();
  await expect(
    page.getByRole('region', { name: 'todo.txt - Notepad' }),
  ).toBeVisible();
});
