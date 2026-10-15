import { expect, type Page, test } from '@playwright/test';
import { logIn } from './helpers';

const SAVERS = [
  ['pipes', 'Pipes'],
  ['panes', 'Flying Panes'],
  ['marquee', 'Marquee'],
  ['slideshow', 'My Pictures Slideshow'],
] as const;

/** Persists a screensaver choice before any app script runs (`quiet: false` keeps it). */
async function chooseSaver(page: Page, id: string, minutes: number) {
  await page.addInitScript(
    ({ id, minutes }) => {
      localStorage.setItem(
        'still-online:v1:settings',
        JSON.stringify({
          version: 1,
          state: {
            screensaver: { id, minutes, text: 'brb, at dinner' },
            awayMinutes: 0,
          },
        }),
      );
    },
    { id, minutes },
  );
}

/** Two procedural photos in My Pictures for the slideshow. */
async function seedPictures(page: Page) {
  await page.addInitScript(() => {
    const at = Date.UTC(2007, 5, 12);
    const photo = (id: string, scene: string, seed: number) => ({
      id,
      parentId: 'pics',
      name: `${id.slice(2)}.jpg`,
      type: 'image',
      createdAt: at,
      modifiedAt: at,
      photo: { scene, seed },
    });
    const nodes = [photo('f:party', 'party', 5), photo('f:beach', 'beach', 9)];
    localStorage.setItem(
      'still-online:v1:fs',
      JSON.stringify({
        version: 1,
        state: {
          nodes: Object.fromEntries(nodes.map((n) => [n.id, n])),
          purgedSeeds: [],
        },
      }),
    );
  });
}

async function previewFromDisplay(page: Page, name: string) {
  await page.mouse.click(900, 300, { button: 'right' });
  await page.getByRole('menuitem', { name: 'Properties' }).click();
  const dialog = page.getByRole('region', { name: 'Display Properties' });
  await dialog.getByRole('tab', { name: 'Screen Saver' }).click();
  await dialog.getByLabel('Screen saver:').selectOption({ label: name });
  await dialog.getByRole('button', { name: 'Preview' }).click();
}

const saver = (page: Page) =>
  page.getByRole('dialog', { name: 'Screen saver' });

test('the screensaver starts after the idle time and the first key stops it', async ({
  page,
}) => {
  await chooseSaver(page, 'marquee', 1);
  await logIn(page, 'Ada', { quiet: false });
  // One minute is 600 ms with ?speed=fast.
  await expect(saver(page)).toHaveAttribute('data-saver', 'marquee');
  await page.waitForTimeout(500);
  await page.keyboard.press('Enter');
  await expect(saver(page)).toHaveCount(0);
  // It comes back after the next idle period.
  await expect(saver(page)).toBeVisible();
});

test('Preview in Display Properties runs until the mouse moves; the click does not land', async ({
  page,
}) => {
  await logIn(page);
  await previewFromDisplay(page, 'Flying Panes');
  await expect(saver(page)).toHaveAttribute('data-saver', 'panes');
  await page.waitForTimeout(600);
  await page.mouse.move(700, 500);
  await page.mouse.move(760, 520);
  await expect(saver(page)).toHaveCount(0);

  await previewFromDisplay(page, 'Pipes');
  await expect(saver(page)).toBeVisible();
  await page.waitForTimeout(600);
  // Clicking where the Start button is only stops the saver.
  await page.getByRole('button', { name: 'start' }).click({ force: true });
  await expect(saver(page)).toHaveCount(0);
  await expect(page.getByRole('menu', { name: 'Start menu' })).toHaveCount(0);
});

test('reduced motion shows a still screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await logIn(page);
  await previewFromDisplay(page, 'Pipes');
  await expect(saver(page)).toHaveAttribute('data-reduced', 'true');
  await expect(saver(page).getByText('still online')).toBeVisible();
  await expect(saver(page).locator('canvas')).toHaveCount(0);
});

test('every screensaver animates @review', async ({ browser }) => {
  test.setTimeout(120_000);
  const shots: string[] = [];
  for (const [id, name] of SAVERS) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    await seedPictures(page);
    await logIn(page);
    await previewFromDisplay(page, name);
    await expect(saver(page)).toHaveAttribute('data-saver', id);
    const canvas = saver(page).locator('canvas');
    await page.waitForTimeout(2500);
    const first = await canvas.screenshot();
    await page.waitForTimeout(700);
    const second = await canvas.screenshot();
    expect(second.equals(first), `${id} animates`).toBe(false);
    shots.push(
      `data:image/png;base64,${(await page.screenshot()).toString('base64')}`,
    );
    await page.close();
  }
  const grid = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await grid.setContent(
    `<body style="margin:0;padding:8px;background:#222;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;font:12px sans-serif;color:#fff">${shots
      .map(
        (url, i) =>
          `<figure style="margin:0"><img src="${url}" style="width:100%;display:block"><figcaption>${SAVERS[i]?.[1]}</figcaption></figure>`,
      )
      .join('')}</body>`,
  );
  await grid.screenshot({ path: 'docs/review/P1/screensavers.png' });
  await grid.close();
});
