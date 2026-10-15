import { expect, test } from '@playwright/test';
import { openFromStart, setLanguage } from './helpers';

const DIR = 'docs/review/v03-P0';

test('P0 gate: language picker, Regional and Language Options, tray menu @review', async ({
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
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();

  await setLanguage(page, 'en');
  await page.mouse.move(10, 10);
  await page.screenshot({ path: `${DIR}/login-picker-en.png` });
  await setLanguage(page, 'de');
  await page.screenshot({ path: `${DIR}/login-picker-de.png` });
  await setLanguage(page, 'en');

  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  const regionalEn = page.getByRole('region', {
    name: 'Regional and Language Options',
  });
  await openFromStart(page, 'Regional and Language Options');
  await expect(regionalEn).toBeVisible();
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/regional-en.png` });

  await regionalEn.getByRole('combobox').selectOption('de');
  await regionalEn.getByRole('button', { name: 'Apply' }).click();
  const regionalDe = page.getByRole('region', {
    name: 'Regions- und Sprachoptionen',
  });
  await expect(regionalDe).toBeVisible();
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/regional-de.png` });

  // Tray menu: German first (current state), then English.
  const badge = page.getByTestId('tray-language');
  await badge.click();
  await expect(
    page.getByRole('menu', { name: 'Eingabesprache' }),
  ).toBeVisible();
  await page.screenshot({ path: `${DIR}/tray-menu-de.png` });
  await page.getByRole('menuitemradio', { name: 'English' }).click();
  await expect(badge).toHaveText('EN');
  await badge.click();
  await expect(
    page.getByRole('menu', { name: 'Input language' }),
  ).toBeVisible();
  await page.screenshot({ path: `${DIR}/tray-menu-en.png` });

  expect(problems).toEqual([]);
});
