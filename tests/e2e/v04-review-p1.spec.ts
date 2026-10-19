import { expect, test } from '@playwright/test';
import { pickGender, quietIdle } from './helpers';

const DIR = 'docs/review/v04-P1';

// The band tracks are a short silent WAV so the player really plays (as in v04-p1.spec.ts).
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

// P1 gate: bulletins, a band page playing, GlitterCodez home, /me with a pasted layout, the Top 8 editor.
for (const lang of ['en', 'de'] as const) {
  test(`P1 gate: Friendspace + GlitterCodez in ${lang} @review`, async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const de = lang === 'de';
    const problems: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning')
        problems.push(`console ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

    const wav = silentWav(30);
    await page.route('**/music/*.mp3', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'audio/wav',
        headers: { 'Accept-Ranges': 'none' },
        body: wav,
      }),
    );

    await quietIdle(page);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('./?speed=fast');
    await page.getByTestId('boot-screen').click();
    await expect(page.getByTestId('login-screen')).toBeVisible();
    await page.getByRole('radio', { name: de ? 'Deutsch' : 'English' }).click();
    await page.getByRole('textbox').first().fill('Ada');
    await pickGender(page, 'girl');
    await page
      .locator('button[type="submit"], button:has-text("Ada")')
      .last()
      .click();
    await expect(page.getByTestId('desktop')).toBeVisible();

    await page
      .getByRole('option')
      .filter({ hasText: /Web Explorer|Web-Explorer/ })
      .dblclick();
    const web = page.getByRole('region', { name: /Web ?Explorer$/ }).first();
    await web
      .getByTestId('page-cannot-be-displayed')
      .getByRole('button')
      .first()
      .click();
    await expect(page.getByTestId('tray-network')).toHaveAttribute(
      'data-status',
      'online',
    );
    await web.getByRole('button', { name: /^(Maximize|Maximieren)$/ }).click();

    const address = web.getByLabel(de ? 'Adresse' : 'Address');
    const visit = async (url: string) => {
      await address.fill(url);
      await address.press('Enter');
      await expect(web.getByRole('status').last()).toHaveText(
        de ? 'Fertig' : 'Done',
        {
          timeout: 10_000,
        },
      );
    };
    const shot = async (name: string) => {
      await page.waitForTimeout(500);
      await page.mouse.move(1270, 790);
      await page.screenshot({ path: `${DIR}/${name}-${lang}.png` });
    };

    // 1. Bulletins.
    await visit('friendspace.example/bulletins');
    await expect(web.getByTestId('bulletin').first()).toBeVisible();
    await shot('01-bulletins');

    // 2. A band page, playing.
    await visit('friendspace.example/band/tinfoil-comets');
    const player = web.getByTestId('band-player');
    await expect(player.getByRole('button', { name: 'Pause' })).toBeVisible();
    await shot('02-band-playing');
    await player.getByRole('button', { name: 'Pause' }).click();

    // 3. GlitterCodez home.
    await visit('glittercodez.example');
    const tiles = web.locator('article textarea');
    await expect(tiles.first()).toBeVisible();
    await shot('03-glittercodez-home');

    // 4. /me with a pasted layout: sparkle cursor, a glitter headline and stickers.
    const layout = [
      '<!-- GlitterCodez.example layout: review -->',
      '[layout bg=starry text=#ffffff accent=#ff66cc panel=none font=comic glitter=on]',
      '[cursor sparkle]',
      '[sticker star top-right]',
      '[sticker heart bottom-left]',
      '[sticker flame bottom-right]',
    ].join('\n');
    await visit('friendspace.example/me');
    await web
      .getByRole('button', { name: de ? 'Profil bearbeiten' : 'Edit Profile' })
      .click();
    await web.getByLabel(de ? 'Layout-Code:' : 'Layout code:').fill(layout);
    await web
      .getByRole('button', {
        name: de ? 'Änderungen speichern' : 'Save Changes',
      })
      .click();
    await expect(
      web.getByRole('button', {
        name: de ? 'Profil bearbeiten' : 'Edit Profile',
      }),
    ).toBeVisible();
    await shot('04-me-layout');

    // 5. The Top 8 editor.
    await web
      .getByRole('button', { name: de ? 'Profil bearbeiten' : 'Edit Profile' })
      .click();
    await web
      .getByRole('button', {
        name: de ? 'Änderungen speichern' : 'Save Changes',
      })
      .scrollIntoViewIfNeeded();
    await shot('05-top8-editor');

    expect(problems).toEqual([]);
  });
}
