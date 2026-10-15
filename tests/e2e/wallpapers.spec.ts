import { expect, type Page, test } from '@playwright/test';
import { logIn } from './helpers';

const WALLPAPER_IDS = [
  'hill',
  'ripple',
  'autumn',
  'dunes',
  'stones',
  'tulips',
  'orbit',
  'bloom',
  'peaks',
  'ponies',
  'retro',
];

/** Persists a wallpaper choice (and world unlocks) before any app script runs. */
async function chooseWallpaper(
  page: Page,
  wallpaper: Record<string, string>,
  unlocks: string[] = [],
) {
  await page.addInitScript(
    ({ wallpaper, unlocks }) => {
      const put = (key: string, state: Record<string, unknown>) =>
        localStorage.setItem(
          `still-online:v1:${key}`,
          JSON.stringify({ version: 1, state }),
        );
      if (!localStorage.getItem('still-online:v1:settings')) {
        put('settings', { wallpaper, wallpaperPosition: 'stretch' });
      }
      if (unlocks.length && !localStorage.getItem('still-online:v1:world')) {
        put('world', { day: 1, unlocks });
      }
    },
    { wallpaper, unlocks },
  );
}

const JPEG_URL = /^url\("data:image\/jpeg/;

test('the desktop shows the chosen wallpaper', async ({ page }) => {
  await chooseWallpaper(page, { kind: 'builtin', id: 'ripple' });
  await logIn(page);
  await expect(page.locator('.desktop-root')).toHaveCSS(
    'background-image',
    JPEG_URL,
  );
});

test('a locked easter egg falls back to the CSS hill', async ({ page }) => {
  await chooseWallpaper(page, { kind: 'builtin', id: 'retro' });
  await logIn(page);
  await expect(page.locator('.desktop-root')).toHaveCSS(
    'background-image',
    /radial-gradient/,
  );
});

test('every wallpaper renders in a grid @review', async ({ browser }) => {
  test.setTimeout(120_000);
  const urls: string[] = [];
  for (const id of WALLPAPER_IDS) {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 800 },
    });
    await chooseWallpaper(page, { kind: 'builtin', id }, ['ponies', 'konami']);
    await logIn(page);
    await expect(page.locator('.desktop-root'), id).toHaveCSS(
      'background-image',
      JPEG_URL,
    );
    const shot = await page.screenshot({ type: 'jpeg', quality: 80 });
    urls.push(`data:image/jpeg;base64,${shot.toString('base64')}`);
    await page.close();
  }
  const grid = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await grid.setContent(
    `<body style="margin:0;padding:8px;background:#222;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font:12px sans-serif;color:#fff">${urls
      .map(
        (url, i) =>
          `<figure style="margin:0"><img src="${url}" style="width:100%;display:block"><figcaption>${WALLPAPER_IDS[i]}</figcaption></figure>`,
      )
      .join('')}</body>`,
  );
  await grid.screenshot({ path: 'docs/review/P1/wallpapers.png' });
});
