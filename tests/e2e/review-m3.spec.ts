import { expect, test } from '@playwright/test';

const DIR = 'docs/review/M3';

// Chromium needs no user gesture to start audio; the tracks are replaced by a
// generated tone WAV so the gate does not depend on real MP3 download speed.
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

test('M3 gate: amplifier, playlist, messenger now playing @review', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

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

  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();
  // Jess nudges on sign-in, which opens (and shakes) her chat over Messenger.
  // Wait for it and close it so it cannot intercept the clicks below.
  const nudgeChat = page.getByRole('region', { name: /Conversation$/ });
  await expect(nudgeChat).toBeVisible({ timeout: 10_000 });
  await nudgeChat.getByRole('button', { name: 'Close' }).dispatchEvent('click');
  await expect(nudgeChat).toBeHidden();
  await page.getByText("Show what I'm listening to").click();
  await expect(page.getByLabel("Show what I'm listening to")).toBeChecked();
  const messenger = page.getByRole('region', { name: 'Messenger' });
  await messenger.getByRole('button', { name: 'Minimize' }).click();
  await expect(messenger).toBeHidden();

  await page.getByRole('option', { name: 'Amplifier' }).dblclick();
  const amp = page.getByRole('group', { name: 'Amplifier' });
  await expect(amp).toBeVisible();
  await amp.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(
    amp.getByRole('button', { name: 'Play', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    amp.getByRole('button', { name: 'Time elapsed' }),
  ).not.toHaveText('0:00', { timeout: 10_000 });
  await page.mouse.move(900, 600);
  await page.screenshot({ path: `${DIR}/amplifier-playing.png` });

  await amp.getByRole('button', { name: 'Playlist' }).click();
  await expect(amp.getByTestId('playlist')).toBeVisible();
  await page.screenshot({ path: `${DIR}/amplifier-playlist.png` });

  await page
    .getByRole('toolbar', { name: 'Taskbar' })
    .locator('button[title="Messenger"]')
    .click();
  await expect(messenger).toBeVisible();
  await expect(page.getByLabel('Personal message')).toHaveValue(/^♫ .+ - .+/);
  await page.screenshot({ path: `${DIR}/messenger-now-playing.png` });

  expect(problems).toEqual([]);
});
