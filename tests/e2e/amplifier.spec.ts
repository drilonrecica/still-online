import { expect, test } from '@playwright/test';

// Chromium needs no user gesture to start audio; the tracks are replaced by a
// short silent WAV so the spec does not depend on real MP3 download speed.
test.use({
  launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
});

/** 8-bit mono 8 kHz PCM silence: a valid WAV the media element can decode. */
function silentWav(seconds: number): Buffer {
  const rate = 8000;
  const data = Buffer.alloc(rate * seconds, 0x80);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate, 28); // byte rate
  header.writeUInt16LE(1, 32); // block align
  header.writeUInt16LE(8, 34); // bits per sample
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

test('amplifier: play, time advances, next track, playlist, Messenger now playing', async ({
  page,
}) => {
  const wav = silentWav(30);
  await page.route('**/music/*.mp3', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'audio/wav',
      headers: { 'Accept-Ranges': 'none' },
      body: wav,
    }),
  );

  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await page.getByLabel('Your name').fill('Ada');
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Messenger first: sign in and turn on "show what I'm listening to".
  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('tree', { name: 'Contacts' })).toBeVisible();
  // Jess nudges on sign-in, which opens (and shakes) her chat over Messenger.
  // Wait for it and close it so it cannot intercept the clicks below.
  const nudgeChat = page.getByRole('region', { name: /Conversation$/ });
  await expect(nudgeChat).toBeVisible({ timeout: 10_000 });
  await nudgeChat.getByRole('button', { name: 'Close' }).dispatchEvent('click');
  await expect(nudgeChat).toBeHidden();
  // The theme hides the native checkbox, so click its visible label text.
  await page.getByText("Show what I'm listening to").click();
  await expect(page.getByLabel("Show what I'm listening to")).toBeChecked();
  const messenger = page.getByRole('region', { name: 'Messenger' });

  // Minimize it so it does not cover the Amplifier icon, then open and play.
  await messenger.getByRole('button', { name: 'Minimize' }).click();
  await expect(messenger).toBeHidden();
  await page.getByRole('option', { name: 'Amplifier' }).dblclick();
  const amp = page.getByRole('group', { name: 'Amplifier' });
  await expect(amp).toBeVisible();
  await amp.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(
    amp.getByRole('button', { name: 'Play', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const marquee = amp.getByTestId('marquee');
  await expect(marquee).toContainText('1. ');

  // Time advances past 0:00.
  const time = amp.getByRole('button', { name: 'Time elapsed' });
  await expect(time).not.toHaveText('0:00', { timeout: 10_000 });

  // Next track.
  await amp.getByRole('button', { name: 'Next' }).click();
  await expect(marquee).toContainText('2. ');

  // Playlist toggle: opens with the current track highlighted, then closes.
  const playlistToggle = amp.getByRole('button', { name: 'Playlist' });
  await playlistToggle.click();
  const playlist = amp.getByTestId('playlist');
  await expect(playlist).toBeVisible();
  await expect(playlist.getByRole('option', { selected: true })).toContainText(
    '2. ',
  );
  await playlistToggle.click();
  await expect(playlist).toBeHidden();

  // Restore Messenger: the current track is now its personal message.
  await page
    .getByRole('toolbar', { name: 'Taskbar' })
    .locator('button[title="Messenger"]')
    .click();
  await expect(messenger).toBeVisible();
  await expect(page.getByLabel('Personal message')).toHaveValue(/^♫ .+ - .+/);
});
