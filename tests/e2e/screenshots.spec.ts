import { expect, test } from '@playwright/test';
import {
  closeNudgeChats,
  go,
  logIn,
  openFromStart,
  pickGender,
  quietIdle,
} from './helpers';

// Regenerates the README images: npx playwright test --grep @screenshots
const DIR = 'docs/screenshots';

test.use({
  launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
});

/** 8-bit mono 8 kHz PCM, a few mixed tones so the visualizer has bars to draw. */
function toneWav(seconds: number): Buffer {
  const rate = 8000;
  const data = Buffer.alloc(rate * seconds);
  for (let i = 0; i < data.length; i++) {
    const t = i / rate;
    const v =
      Math.sin(2 * Math.PI * 220 * t) +
      Math.sin(2 * Math.PI * 660 * t) * 0.8 +
      Math.sin(2 * Math.PI * 1500 * t) * 0.6;
    data[i] = Math.round(128 + v * 40);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate, 28);
  header.writeUInt16LE(1, 32);
  header.writeUInt16LE(8, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

test('README screenshots @screenshots', async ({ page }) => {
  test.setTimeout(180_000);

  const wav = toneWav(60);
  await page.route('**/music/*.mp3', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'audio/wav',
      headers: { 'Accept-Ranges': 'none' },
      body: wav,
    }),
  );

  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/desktop.png` });

  // Stapley's greeting would sit over every later shot.
  const stapley = page.locator('[data-assistant-balloon]');
  await expect(stapley).toContainText("I'm Stapley", { timeout: 10_000 });
  await stapley.getByRole('button', { name: 'No thanks' }).click();

  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();
  // Jess nudges on sign-in and opens her chat over the contact list; close it
  // so the screenshot shows the list, then let a friend's toast arrive.
  await closeNudgeChats(page);
  await page.waitForTimeout(1500);
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/messenger.png` });

  const messenger = page.getByRole('region', { name: 'Messenger' });
  await messenger.getByRole('button', { name: 'Minimize' }).click();
  await expect(messenger).toBeHidden();

  await page.getByRole('option', { name: 'Amplifier' }).dblclick();
  const amp = page.getByRole('group', { name: 'Amplifier' });
  await expect(amp).toBeVisible();
  await amp.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(
    amp.getByRole('button', { name: 'Time elapsed' }),
  ).not.toHaveText('0:00', { timeout: 10_000 });
  await amp.getByRole('button', { name: 'Playlist' }).click();
  await expect(amp.getByTestId('playlist')).toBeVisible();
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/amplifier.png` });

  await amp.getByRole('button', { name: 'Close' }).click();

  // Web Explorer on the Searchly homepage, then a Friendspace profile.
  // Messenger's sign-in already dialed up, so the browser opens online.
  await page.getByRole('option', { name: 'Web Explorer' }).dblclick();
  const browser = page.getByRole('region', { name: /Web Explorer$/ });
  await expect(
    browser.getByRole('button', { name: 'Searchly Search' }),
  ).toBeVisible();
  await page.mouse.move(900, 700);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/browser.png` });
  await go(browser, 'friendspace.example/jess');
  await page.mouse.move(900, 700);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/friendspace.png` });
  await browser.getByRole('button', { name: 'Close' }).click();

  // Paint with a small drawing.
  await openFromStart(page, 'Paint');
  const paint = page.getByRole('region', { name: /Paint$/ });
  const canvas = paint.getByRole('img', { name: 'Picture' });
  const box = (await canvas.boundingBox())!;
  await paint.getByRole('button', { name: 'Color #ff0000' }).click();
  await paint.getByRole('button', { name: 'Rectangle', exact: true }).click();
  await paint.getByRole('button', { name: 'Fill only' }).click();
  await page.mouse.move(box.x + 40, box.y + 60);
  await page.mouse.down();
  await page.mouse.move(box.x + 160, box.y + 140, { steps: 4 });
  await page.mouse.up();
  await paint.getByRole('button', { name: 'Ellipse', exact: true }).click();
  await paint.getByRole('button', { name: 'Color #0000ff' }).click();
  await page.mouse.move(box.x + 120, box.y + 100);
  await page.mouse.down();
  await page.mouse.move(box.x + 260, box.y + 190, { steps: 4 });
  await page.mouse.up();
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/paint.png` });
  await paint.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'No', exact: true }).click();

  // Mines after the first click opens a patch of the board.
  await openFromStart(page, 'Mines');
  const mines = page.getByRole('region', { name: /Mines$/ });
  const field = mines.getByRole('group', { name: 'Mine field' });
  await field.locator('[data-index="40"]').click();
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/mines.png` });
  await mines.getByRole('button', { name: 'Close' }).click();

  // Hen Hunt mid-round.
  await openFromStart(page, 'Hen Hunt');
  const hen = page.getByRole('region', { name: /Hen Hunt$/ });
  await hen.getByRole('button', { name: 'Play' }).click();
  await expect(hen.getByRole('img', { name: /Hen Hunt field/ })).toBeVisible();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${DIR}/henhunt.png` });
});

test.describe('German README screenshot', () => {
  test.use({ locale: 'de-DE' });

  test('desktop with the Start menu open @screenshots', async ({ page }) => {
    await quietIdle(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./?speed=fast');
    await page.getByTestId('boot-screen').click();
    await page.getByLabel('Ihr Name').fill('Ada');
    await pickGender(page);
    await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
    await expect(page.getByTestId('desktop')).toBeVisible();
    // Tacki's greeting would sit over the desktop.
    const assistant = page.locator('[data-assistant-balloon]');
    await expect(assistant).toBeVisible({ timeout: 10_000 });
    await assistant.getByRole('button').last().click();
    await page.getByRole('button', { name: 'Start', exact: true }).click();
    await expect(page.getByRole('menu', { name: 'Startmenü' })).toBeVisible();
    await page.mouse.move(900, 400);
    await page.screenshot({ path: `${DIR}/desktop-de.png` });
  });
});
