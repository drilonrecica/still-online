import { expect, test } from '@playwright/test';

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
  test.setTimeout(90_000);

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
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();
  await page.mouse.move(900, 700);
  await page.screenshot({ path: `${DIR}/desktop.png` });

  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();
  // Jess nudges on sign-in and opens her chat over the contact list; close it
  // so the screenshot shows the list, then let a friend's toast arrive.
  const chat = page.getByRole('region', { name: /Conversation$/ });
  await expect(chat).toBeVisible({ timeout: 10_000 });
  await chat.getByRole('button', { name: 'Close' }).dispatchEvent('click');
  await expect(chat).toBeHidden();
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
});
