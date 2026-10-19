// v0.4 P1-02: band pages play through the Amplifier, profile songs autoplay quietly, ■ stops them
// and /me can turn autoplay off.
import { expect, test } from '@playwright/test';
import { go, logIn, openBrowserOnline } from './helpers';

// As in amplifier.spec.ts: no gesture needed for audio, and the tracks are a short silent WAV.
test.use({
  launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
});

function silentWav(seconds: number): Buffer {
  const rate = 8000;
  const data = Buffer.alloc(rate * seconds, 0x80);
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

test('band page plays through the Amplifier; profile songs autoplay and stop', async ({
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
  const web = await openBrowserOnline(page);
  const amplifierWindow = page.getByRole('group', { name: 'Amplifier' });

  // Jess's Top 8 links the band; its page autoplays without opening the Amplifier window.
  await go(web, 'http://friendspace.example/jess');
  // Jess's own song autoplayed; stop it so the band page starts from silence.
  const strip = web.getByRole('region', { name: 'Profile song' });
  await expect(strip).toContainText('now playing in Amplifier');
  await strip.getByRole('button', { name: 'Stop' }).click();
  await expect(strip).toContainText('click to play');

  await web
    .getByRole('list', { name: 'Top 8' })
    .getByRole('link', { name: /Tinfoil Comets/ })
    .click();
  await expect(web.getByRole('status')).toHaveText('Done', { timeout: 10_000 });
  const player = web.getByTestId('band-player');
  await expect(player).toContainText('Voxel Revolution');
  await expect(player.getByRole('button', { name: 'Pause' })).toBeVisible();
  await expect(amplifierWindow).toHaveCount(0);

  await player.getByRole('button', { name: 'Pause' }).click();
  await expect(
    player.getByRole('button', { name: 'Play', exact: true }),
  ).toBeVisible();
  await player.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(player.getByRole('button', { name: 'Pause' })).toBeVisible();

  // Turned off on /me, a friend's page stays quiet.
  await player.getByRole('button', { name: 'Pause' }).click();
  await go(web, 'http://friendspace.example/me');
  await web.getByText('Autoplay profile songs').click();
  await expect(web.getByLabel('Autoplay profile songs')).not.toBeChecked();
  await go(web, 'http://friendspace.example/dex');
  await expect(web.getByRole('region', { name: 'Profile song' })).toContainText(
    'click to play',
  );
});

test('bulletins, a GlitterCodez layout pasted on /me, and the Top 8 editor', async ({
  page,
}) => {
  await logIn(page);
  const web = await openBrowserOnline(page);

  // Bulletins: day 1 has one; opening the page clears the nav dot.
  await go(web, 'http://friendspace.example/me');
  await expect(
    web.getByRole('link', { name: 'Bulletins (new)' }),
  ).toBeVisible();
  await go(web, 'http://friendspace.example/bulletins');
  await expect(web.getByTestId('bulletin').first()).toContainText(
    'TINFOIL COMETS COUNTDOWN',
  );
  await expect(web.getByRole('link', { name: 'Bulletins (new)' })).toHaveCount(
    0,
  );

  // GlitterCodez: take the first gallery code and paste it into the /me editor.
  await go(web, 'http://glittercodez.example/');
  const code = await web.locator('article textarea').first().inputValue();
  expect(code).toContain('[layout');
  await go(web, 'http://friendspace.example/me');
  await web.getByRole('button', { name: 'Edit Profile' }).click();
  await web.getByLabel('Layout code:').fill(code);
  await expect(web.getByRole('group', { name: 'Preview:' })).toBeVisible();

  // Top 8: remove the first entry and add another; the saved profile shows 7 → 8 again.
  const order = web.getByRole('list', { name: 'Top 8 order' });
  const before = await order.getByRole('listitem').count();
  await order
    .getByRole('listitem')
    .first()
    .getByRole('button', { name: /Remove .* from the Top 8/ })
    .click();
  await expect(order.getByRole('listitem')).toHaveCount(before - 1);
  await web.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(order.getByRole('listitem')).toHaveCount(before);
  await web.getByRole('button', { name: 'Save Changes' }).click();

  await expect(web.getByRole('button', { name: 'Edit Profile' })).toBeVisible();
  await expect(web.getByRole('list', { name: 'Top 8' })).toBeVisible();
});
