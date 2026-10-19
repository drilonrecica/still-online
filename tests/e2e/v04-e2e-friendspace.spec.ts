// v0.4 P5-01 (flows 1, 3, 4, 5): the Spaceport → Friendspace rename, band pages and the Amplifier,
// the bulletins dot, and the Top 8 drama (drop → Turn Off → next day → Kayla reacts; re-add).
// Flows 2, 6 and 8 (layouts and Pixlog, English/German/boy) are in v04-e2e-layouts-pixlog.spec.ts.
import { expect, test } from '@playwright/test';
import { go, logIn, openBrowserOnline } from './helpers';

// As in v04-p1.spec.ts: no gesture needed for audio, and the tracks are a short silent WAV.
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

test('1: spaceport.example/jess opens Friendspace Jess; a Spaceport favorite opens Friendspace', async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (localStorage.getItem('still-online:v1:web')) return;
    localStorage.setItem(
      'still-online:v1:web',
      JSON.stringify({
        state: {
          favorites: [{ title: 'Spaceport', url: 'http://spaceport.example/' }],
        },
        version: 1,
      }),
    );
  });
  await logIn(page);
  const web = await openBrowserOnline(page);

  await go(web, 'http://spaceport.example/jess');
  await expect(web.getByLabel('Address')).toHaveValue(
    'http://friendspace.example/jess',
  );
  await expect(web.getByTestId('profile')).toContainText('Jess');
  await expect(web).not.toContainText('Spaceport');

  await web.getByRole('menuitem', { name: 'Favorites' }).click();
  await web
    .getByRole('menu', { name: 'Favorites' })
    .getByRole('menuitem', { name: 'Friendspace' })
    .click();
  await expect(web.getByRole('status')).toHaveText('Done', { timeout: 10_000 });
  await expect(web.getByLabel('Address')).toHaveValue(
    'http://friendspace.example/',
  );
});

test('3: a band page plays in the Amplifier; muting stops profile autoplay', async ({
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
  await page.getByRole('option', { name: 'Amplifier' }).dblclick();
  const web = await openBrowserOnline(page);

  // Jess's own song autoplays; stop it, then go to the band from her Top 8.
  await go(web, 'http://friendspace.example/jess');
  const strip = web.getByRole('region', { name: 'Profile song' });
  await expect(strip).toContainText('now playing in Amplifier');
  await strip.getByRole('button', { name: 'Stop' }).click();
  await web
    .getByRole('list', { name: 'Top 8' })
    .getByRole('link', { name: /Tinfoil Comets/ })
    .click();
  await expect(web.getByRole('status')).toHaveText('Done', { timeout: 10_000 });
  const player = web.getByTestId('band-player');
  await expect(player.getByRole('button', { name: 'Pause' })).toBeVisible();

  // The Amplifier window shows the track.
  const amp = page.getByRole('group', { name: 'Amplifier' });
  await expect(amp).toContainText('Voxel Revolution');

  // Muted (tray speaker), a profile song does not start by itself.
  await page.getByRole('button', { name: 'Mute sound' }).click();
  await player.getByRole('button', { name: 'Pause' }).click();
  await go(web, 'http://friendspace.example/dex');
  await expect(web.getByRole('region', { name: 'Profile song' })).toContainText(
    'click to play',
  );
});

test('4: the Bulletins dot shows on /me and is gone after opening /bulletins', async ({
  page,
}) => {
  await logIn(page);
  const web = await openBrowserOnline(page);
  await go(web, 'http://friendspace.example/me');
  await expect(
    web.getByRole('link', { name: 'Bulletins (new)' }),
  ).toBeVisible();
  await go(web, 'http://friendspace.example/bulletins');
  await expect(web.getByTestId('bulletin').first()).toBeVisible();
  await go(web, 'http://friendspace.example/me');
  await expect(
    web.getByRole('link', { name: 'Bulletins', exact: true }),
  ).toBeVisible();
  await expect(web.getByRole('link', { name: 'Bulletins (new)' })).toHaveCount(
    0,
  );
});

test('5: drop Kayla from the Top 8, Turn Off, and she reacts next day; re-add makes her happy', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await logIn(page);
  let web = await openBrowserOnline(page);

  await go(web, 'http://friendspace.example/me');
  await web.getByRole('button', { name: 'Edit Profile' }).click();
  const order = web.getByRole('list', { name: 'Top 8 order' });
  await order
    .getByRole('listitem')
    .filter({ hasText: 'Kayla' })
    .getByRole('button', { name: /Remove .* from the Top 8/ })
    .click();
  await expect(
    order.getByRole('listitem').filter({ hasText: 'Kayla' }),
  ).toHaveCount(0);
  await web.getByRole('button', { name: 'Save Changes' }).click();
  await expect(web.getByRole('button', { name: 'Edit Profile' })).toBeVisible();

  // Turn Off → power on: day 2.
  await page.getByRole('button', { name: 'start' }).click();
  await page.getByRole('menuitem', { name: 'Turn Off Computer' }).click();
  await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('off-screen').click();
  await expect(page.getByTestId('boot-day')).toHaveText('Day 2');
  await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /Log on as/ }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Signing in to Messenger: Kayla's reaction chat opens by itself.
  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page
    .getByRole('group', { name: 'Contacts' })
    .locator('[data-contact-id="kayla"]')
    .dispatchEvent('dblclick');
  const kayla = page.getByRole('region', { name: /Kayla.* - Conversation$/ });
  // Her day-2 chat comes first: answer with the first choice until the Top 8 reaction shows.
  const replies = kayla
    .getByRole('group', { name: 'Replies' })
    .getByRole('button');
  for (let i = 0; i < 60; i++) {
    if (
      await kayla
        .getByRole('log')
        .getByText('and im not in ur top 8 anymore??')
        .count()
    )
      break;
    const ready = await replies
      .first()
      .waitFor({ timeout: 2000 })
      .then(
        () => true,
        () => false,
      );
    if (!ready) continue;
    await replies.first().dispatchEvent('click');
    await kayla
      .getByRole('button', { name: 'Send', exact: true })
      .dispatchEvent('click');
    await page.waitForTimeout(100);
  }
  await expect(kayla.getByRole('log')).toContainText(
    'and im not in ur top 8 anymore??',
  );

  // Answering her ends the reaction, which puts her line on /me's wall.
  await replies.first().dispatchEvent('click');
  await kayla
    .getByRole('button', { name: 'Send', exact: true })
    .dispatchEvent('click');

  // /me's wall shows her line.
  await page
    .getByRole('option', { name: 'Web Explorer' })
    .dispatchEvent('dblclick');
  web = page.getByRole('region', { name: /Web Explorer$/ });
  const connect = web
    .getByTestId('page-cannot-be-displayed')
    .getByRole('button', { name: 'Connect' });
  if (await connect.isVisible()) await connect.click();
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'online',
  );
  await go(web, 'http://friendspace.example/me');
  await expect(web).toContainText('real friends stay true', {
    timeout: 20_000,
  });

  // Put her back: the wall turns happy (and Kayla's re-add chat is queued).
  await web.getByRole('button', { name: 'Edit Profile' }).click();
  await web.getByRole('button', { name: 'Add', exact: true }).click();
  await web.getByRole('button', { name: 'Save Changes' }).click();
  await expect(web.getByRole('button', { name: 'Edit Profile' })).toBeVisible();
  await expect(web).toContainText('ONLY bc u put me back', {
    timeout: 30_000,
  });
  await expect(kayla.getByRole('log')).toContainText(
    'omg im back in ur top 8',
    {
      timeout: 30_000,
    },
  );
});
