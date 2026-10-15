import { expect, test } from '@playwright/test';

const DIR = 'docs/review/P1';

// The wallpaper grid and screensaver grid are produced by wallpapers.spec.ts and
// screensaver.spec.ts (both @review). This spec adds the rest of the P1 gate screenshots.
// It runs at real speed (no ?speed=fast) so balloons and the scan stay on screen long enough.
test('P1 gate: Display Properties, dial-up, balloon, Disk Cleanup @review', async ({
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
  await page.goto('./');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Display Properties: every tab.
  await page.mouse.click(900, 300, { button: 'right' });
  await page.getByRole('menuitem', { name: 'Properties' }).click();
  const display = page.getByRole('region', { name: 'Display Properties' });
  await expect(display).toBeVisible();
  for (const [tab, file] of [
    ['Themes', 'display-themes'],
    ['Desktop', 'display-desktop'],
    ['Screen Saver', 'display-screensaver'],
    ['Appearance', 'display-appearance'],
  ] as const) {
    await display.getByRole('tab', { name: tab }).click();
    await page.mouse.move(900, 700);
    await page.screenshot({ path: `${DIR}/${file}.png` });
  }
  await display.getByRole('button', { name: 'Cancel' }).click();
  await expect(display).toHaveCount(0);

  // Dial-up dialog mid-handshake, then the "Connected" balloon.
  await page.getByTestId('tray-network').click();
  const dialup = page.getByRole('region', { name: 'Connect to the Internet' });
  await expect(dialup).toBeVisible();
  await page.waitForTimeout(1500);
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/dialup.png` });
  await expect(page.getByTestId('balloon')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('balloon')).toContainText('Connected at');
  await page.screenshot({ path: `${DIR}/balloon.png` });
  await page.getByRole('button', { name: 'Close balloon' }).click();

  // Disk Cleanup: scanning, then the list.
  await page.getByRole('button', { name: 'start' }).click();
  await page.getByRole('menuitem', { name: /All Programs/ }).click();
  await page.getByRole('menuitem', { name: /System Tools/ }).click();
  await page.getByRole('menuitem', { name: 'Disk Cleanup' }).click();
  const cleanup = page.getByRole('region', { name: 'Disk Cleanup' });
  await expect(cleanup).toBeVisible();
  await expect(cleanup.getByRole('progressbar')).toBeVisible();
  await page.waitForTimeout(1500);
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/disk-cleanup-scanning.png` });
  await expect(cleanup.getByText('Files to delete:')).toBeVisible({
    timeout: 60_000,
  });
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/disk-cleanup.png` });

  expect(problems).toEqual([]);
});
