// v0.6 M2-03: Paint, Snapshot Booth and Amplifier on a phone. Every flow is touch-only: real
// touch pointer events through CDP (one finger draws, two fingers pan), taps and long-presses.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { logInTouch, longPress, openAppTouch, swipe, tap } from './helpers';

// Amplifier plays without a gesture; the tracks are a short silent WAV (as in amplifier.spec).
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

/** RGBA of one pixel of Paint's picture (a string script: e2e types have no DOM lib). */
function pixel(page: Page, x: number, y: number) {
  return page.evaluate<number[]>(`(() => {
    const canvas = document.querySelector('canvas[aria-label="Picture"]');
    return Array.from(canvas.getContext('2d').getImageData(${x}, ${y}, 1, 1).data);
  })()`);
}

/** The page never scrolls sideways. */
async function expectNoSideScroll(page: Page) {
  const [w, scrollWidth] = await page.evaluate<[number, number]>(
    '[innerWidth, document.scrollingElement.scrollWidth]',
  );
  expect(scrollWidth, 'no sideways page scroll').toBeLessThanOrEqual(w);
}

/** A finger-sized target: at least 36×36 px on screen. */
async function expectTapTarget(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error('not visible');
  expect(box.height).toBeGreaterThanOrEqual(36 - 0.5);
  expect(box.width).toBeGreaterThanOrEqual(36 - 0.5);
}

/**
 * Lets day 1's tray balloons ("unused icons", then "updates"; ~2 s and ~5 s after log-in at
 * `?speed=fast`) come and go. They pop up over the bottom of a phone screen, where Paint's
 * colours and the Booth's buttons are, and a touch on one opens its app over the window.
 */
async function waitOutBalloons(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate<string[]>(
          `JSON.parse(localStorage.getItem('still-online:v1:settings') ?? '{}').state?.seenTips ?? []`,
        ),
      { timeout: 20_000 },
    )
    .toEqual(expect.arrayContaining(['unused-icons', 'updates-1']));
  await expect(page.getByTestId('balloon')).toBeHidden();
}

async function menu(paint: Locator, bar: string, item: RegExp) {
  await tap(paint.getByRole('menuitem', { name: bar, exact: true }));
  await tap(paint.getByRole('menuitem', { name: item }));
}

const WHITE = [255, 255, 255, 255];
const BLACK = [0, 0, 0, 255];
const RED = [255, 0, 0, 255];

test('Paint: draw a line, fill, secondary colour by long-press, save and reopen @phone', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  await waitOutBalloons(page);
  await openAppTouch(page, 'Paint');
  const paint = page.getByRole('region', { name: /Paint$/ });
  await expect(paint).toBeVisible();
  const canvas = paint.getByRole('img', { name: 'Picture' });
  await expect(canvas).toBeVisible();
  await expectNoSideScroll(page);

  // A new picture fills the canvas area (at least 200×200) and every tool is finger-sized.
  const size = await paint.getByText(/^\d+x\d+$/).innerText();
  const [w, h] = size.split('x').map(Number) as [number, number];
  const area = (await paint
    .getByRole('region', { name: 'Canvas' })
    .boundingBox())!;
  expect(w).toBeGreaterThanOrEqual(200);
  expect(h).toBeGreaterThanOrEqual(200);
  expect(w).toBeLessThanOrEqual(area.width);
  expect(w).toBeGreaterThan(area.width - 12);
  await expectTapTarget(paint.getByRole('button', { name: 'Line' }));
  await expectTapTarget(paint.getByRole('button', { name: 'Color #ff0000' }));
  await expectTapTarget(paint.getByRole('menuitem', { name: 'File' }));

  // One finger draws a line.
  await tap(paint.getByRole('button', { name: 'Line' }));
  const box = (await canvas.boundingBox())!;
  await swipe(
    page,
    { x: box.x + 20, y: box.y + 60 },
    { x: box.x + 160, y: box.y + 60 },
  );
  await expect.poll(() => pixel(page, 90, 60)).toEqual(BLACK);

  // Two fingers pan and never paint: the second finger cancels the stroke the first began.
  await tap(paint.getByRole('button', { name: 'Pencil' }));
  const cdp = await page.context().newCDPSession(page);
  const a = { x: box.x + 30, y: box.y + 120 };
  const b = { x: box.x + 130, y: box.y + 120 };
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [a],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: a.x + 20, y: a.y }],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: a.x + 20, y: a.y }, b],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { x: a.x + 20, y: a.y - 30 },
      { x: b.x, y: b.y - 30 },
    ],
  });
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await cdp.detach();
  for (const x of [32, 40, 48]) {
    expect(await pixel(page, x, 120)).toEqual(WHITE);
  }

  // Fill with red.
  await tap(paint.getByRole('button', { name: 'Color #ff0000' }));
  await tap(paint.getByRole('button', { name: 'Fill With Color' }));
  await canvas.tap({ position: { x: 10, y: 10 } });
  await expect.poll(() => pixel(page, 10, 10)).toEqual(RED);
  expect(await pixel(page, 90, 60)).toEqual(BLACK);

  // A long-press on a swatch sets the secondary colour.
  const green = paint.getByRole('button', { name: 'Color #008000' });
  await green.scrollIntoViewIfNeeded();
  await longPress(page, green);
  await expect(
    paint.getByRole('img', { name: /secondary color #008000/ }),
  ).toBeVisible();
  await expect(
    paint.getByRole('img', { name: /Primary color #ff0000/ }),
  ).toBeVisible();

  // Save As, start over, open it again: same size, same pixels.
  await menu(paint, 'File', /^Save As/);
  const save = page.getByRole('dialog', { name: 'Save As' });
  await expect(save.getByLabel('File name')).toHaveValue('untitled.png');
  const dialogBox = (await save.boundingBox())!;
  expect(dialogBox.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await tap(save.getByRole('button', { name: 'Save' }));
  await expect(paint).toHaveAccessibleName('untitled.png - Paint');
  await menu(paint, 'File', /^New/);
  await expect.poll(() => pixel(page, 10, 10)).toEqual(WHITE);
  await menu(paint, 'File', /^Open/);
  const open = page.getByRole('dialog', { name: 'Open' });
  await tap(open.getByRole('option', { name: /untitled\.png/ }));
  await expect.poll(() => pixel(page, 10, 10)).toEqual(RED);
  expect(await pixel(page, 90, 60)).toEqual(BLACK);
  await expect(paint.getByText(size, { exact: true })).toBeVisible();
  await expectNoSideScroll(page);
});

test('Snapshot Booth: a photo with the cartoon fallback @phone', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logInTouch(page);
  await waitOutBalloons(page);
  await openAppTouch(page, 'Snapshot Booth');
  const booth = page.getByRole('region', { name: /Snapshot Booth$/ });
  await tap(booth.getByRole('button', { name: /use a cartoon me/i }));
  const preview = booth.getByRole('img', { name: 'Cartoon preview' });
  await expect(preview).toBeVisible();

  // Stacked: the preview on top, the controls below it.
  const take = booth.getByRole('button', { name: 'Take Photo' });
  const previewBox = (await preview.boundingBox())!;
  expect((await take.boundingBox())!.y).toBeGreaterThan(previewBox.y);
  expect(previewBox.height).toBeGreaterThanOrEqual(100);
  await expectTapTarget(take);
  await expectTapTarget(booth.getByRole('button', { name: 'Comic' }));

  await tap(booth.getByRole('button', { name: 'Comic' }));
  await tap(take);
  const photos = booth.getByRole('list', { name: 'Photos' });
  await expect(photos.getByRole('listitem')).toHaveCount(1, {
    timeout: 15_000,
  });
  await expectTapTarget(
    photos.getByRole('button', { name: 'Set as display picture' }),
  );
  await expectNoSideScroll(page);
});

test('Amplifier: play, pause, skip and reorder the playlist by long-press @phone', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const wav = silentWav(30);
  await page.route('**/music/*.mp3', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'audio/wav',
      headers: { 'Accept-Ranges': 'none' },
      body: wav,
    }),
  );
  await logInTouch(page);
  await waitOutBalloons(page);
  await openAppTouch(page, 'Amplifier');
  const amp = page.getByRole('group', { name: 'Amplifier' });
  await expect(amp).toBeVisible();

  // The skin fills the screen's width and every button is finger-sized after the zoom.
  const width = page.viewportSize()!.width;
  const ampBox = (await amp.boundingBox())!;
  expect(ampBox.width).toBeGreaterThan(width - 4);
  const play = amp.getByRole('button', { name: 'Play', exact: true });
  const pause = amp.getByRole('button', { name: 'Pause', exact: true });
  for (const button of await amp.getByRole('button').all()) {
    await expectTapTarget(button);
  }

  await tap(play);
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  const marquee = amp.getByTestId('marquee');
  await expect(marquee).toContainText('1. ');
  await tap(pause);
  await expect(pause).toHaveAttribute('aria-pressed', 'true');
  await tap(amp.getByRole('button', { name: 'Next' }));
  await expect(marquee).toContainText('2. ');

  // The playlist (open from the start on a phone): a long-press on a row opens its menu at the
  // finger; Move down reorders.
  await expect(amp.getByRole('button', { name: 'Playlist' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const rows = amp.getByTestId('playlist').getByRole('option');
  const first = (await rows.nth(0).innerText()).replace(/^1\.\s*/, '');
  const second = (await rows.nth(1).innerText()).replace(/^2\.\s*/, '');
  await expectTapTarget(rows.nth(0));
  await longPress(page, rows.nth(0));
  const trackMenu = amp.getByRole('menu', { name: 'Track menu' });
  await expect(trackMenu).toBeVisible();
  const row = (await rows.nth(0).boundingBox())!;
  const menuBox = (await trackMenu.boundingBox())!;
  expect(Math.abs(menuBox.y - (row.y + row.height / 2))).toBeLessThan(40);
  expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(width + 0.5);
  await tap(trackMenu.getByRole('menuitem', { name: 'Move down' }));
  await expect(rows.nth(0)).toContainText(second.split('\n')[0]!);
  await expect(rows.nth(1)).toContainText(first.split('\n')[0]!);

  // The EQ stays usable: its ON switch is finger-sized and toggles.
  await tap(amp.getByRole('button', { name: 'Equalizer' }));
  const on = amp
    .getByTestId('equalizer')
    .getByRole('button', { name: 'Equalizer on' });
  await expectTapTarget(on);
  const pressed = await on.getAttribute('aria-pressed');
  await tap(on);
  await expect(on).toHaveAttribute(
    'aria-pressed',
    pressed === 'true' ? 'false' : 'true',
  );
  await expectNoSideScroll(page);
  await page.screenshot({ path: test.info().outputPath('amplifier.png') });
});

test('Amplifier: the track menu in German @phone', async ({ page }) => {
  await logInTouch(page);
  await waitOutBalloons(page);
  await tap(page.getByTestId('tray-language'));
  await tap(page.getByRole('menuitemradio', { name: 'Deutsch' }));
  await expect(page.getByTestId('tray-language')).toContainText('DE');
  await openAppTouch(page, 'Amplifier');
  const amp = page.getByRole('group', { name: 'Amplifier' });
  await expect(
    amp.getByRole('button', { name: 'Wiedergabeliste' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await longPress(
    page,
    amp.getByTestId('playlist').getByRole('option').first(),
  );
  const trackMenu = amp.getByRole('menu', { name: 'Titelmenü' });
  const down = trackMenu.getByRole('menuitem', { name: 'Nach unten' });
  await expect(down).toBeVisible();
  await expectTapTarget(down);
});
