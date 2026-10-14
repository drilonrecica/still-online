import { expect, test } from '@playwright/test';
import { logIn, openMessenger } from './helpers';

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

  await logIn(page);

  // Messenger first: sign in (closing Jess's nudge chat) and turn on "show what I'm listening to".
  const messenger = await openMessenger(page);
  // The theme hides the native checkbox, so click its visible label text.
  await page.getByText("Show what I'm listening to").click();
  await expect(page.getByLabel("Show what I'm listening to")).toBeChecked();

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

test('now playing: track started before Messenger shows, closing Amplifier stops it', async ({
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

  await logIn(page);

  // Music first, Messenger second (the order that used to show nothing).
  await page.getByRole('option', { name: 'Amplifier' }).dblclick();
  const amp = page.getByRole('group', { name: 'Amplifier' });
  await amp.getByRole('button', { name: 'Play', exact: true }).click();
  const time = amp.getByRole('button', { name: 'Time elapsed' });
  await expect(time).not.toHaveText('0:00', { timeout: 10_000 });
  await amp.getByRole('button', { name: 'Minimize' }).click();

  await openMessenger(page);

  const personal = page.getByLabel('Personal message');
  await expect(personal).toHaveValue('');
  await page.getByText("Show what I'm listening to").click();
  await expect(personal).toHaveValue(/^♫ .+ - .+/);

  // Close Amplifier from the taskbar: playback stops and the message clears.
  await page
    .getByRole('toolbar', { name: 'Taskbar' })
    .locator('button[title="Amplifier"]')
    .click();
  await amp.getByRole('button', { name: 'Close' }).click();
  await expect(amp).toBeHidden();
  await expect(personal).toHaveValue('');

  // Reopened, the player is stopped rather than still playing in the background.
  await page.getByRole('option', { name: 'Amplifier' }).dblclick();
  await expect(
    amp.getByRole('button', { name: 'Play', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  await expect(amp.getByRole('button', { name: 'Time elapsed' })).toHaveText(
    '0:00',
  );
});
