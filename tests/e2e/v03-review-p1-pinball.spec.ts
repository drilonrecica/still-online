import { expect, test } from '@playwright/test';
import { quietIdle } from './helpers';

const DIR = 'docs/review/v03-P1';

test.use({ locale: 'de-DE' });

test('P1-07: Star Pinball in German (menu, help, dot-matrix display) @review', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const problems: string[] = [];
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

  await quietIdle(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel('Ihr Name').fill('Ada');
  await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('menuitem', { name: /Alle Programme/ }).click();
  await page
    .getByRole('menu', { name: 'Alle Programme' })
    .getByRole('menuitem', { name: /Spiele/ })
    .hover();
  await page
    .getByRole('menuitem', { name: 'Sternen-Flipper', exact: true })
    .last()
    .click();
  const pin = page.getByRole('region', { name: /Sternen-Flipper$/ });
  await expect(
    pin.getByRole('heading', { name: /Sternen-\s*Flipper/ }),
  ).toBeVisible();
  await page.mouse.move(1270, 790);
  await pin.screenshot({ path: `${DIR}/pinball-menu-de.png` });

  await pin.getByRole('button', { name: 'Hilfe' }).click();
  await expect(pin.getByText(/Kadett → Fähnrich/)).toBeVisible();
  await pin.screenshot({ path: `${DIR}/pinball-help-de.png` });
  await pin.getByRole('button', { name: 'Zurück' }).click();

  await pin.getByRole('button', { name: 'Spielen' }).click();
  await expect(
    pin.getByRole('img', { name: /Sternen-Flipper-Tisch\. Leertaste/ }),
  ).toBeVisible();
  // Past the "BALL 1" message: the score and the "BALL 1  KADETT" status line.
  await page.waitForTimeout(1800);
  await pin.screenshot({ path: `${DIR}/pinball-play-de.png` });

  expect(problems).toEqual([]);
});
