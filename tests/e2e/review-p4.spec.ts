import { expect, test } from '@playwright/test';
import { go, logIn, openBrowserOnline, openFromStart } from './helpers';

const DIR = 'docs/review/P4';

const PAGES: [name: string, url: string][] = [
  ['searchly-home', 'searchly.example'],
  ['searchly-results', 'searchly.example/search?q=tinfoil'],
  ['tinfoil-home', 'tinfoilcomets.example'],
  ['tinfoil-band', 'tinfoilcomets.example/band'],
  ['tinfoil-guestbook', 'tinfoilcomets.example/guestbook'],
  ['tinfoil-pics', 'tinfoilcomets.example/pics'],
  ['spaceport-home', 'spaceport.example'],
  ['spaceport-jess', 'spaceport.example/jess'],
  ['spaceport-kayla', 'spaceport.example/kayla'],
  ['spaceport-dex', 'spaceport.example/dex'],
  ['spaceport-pia', 'spaceport.example/pia'],
  ['spaceport-marco', 'spaceport.example/marco'],
  ['spaceport-theo', 'spaceport.example/theo'],
  ['spaceport-me', 'spaceport.example/me'],
  ['gossip-home', 'celebgossip07.example'],
  ['gossip-post', 'celebgossip07.example/post?id=tinfoil-sold-out'],
  ['gossip-tags', 'celebgossip07.example/tag'],
  ['gossip-celebs', 'celebgossip07.example/celebs'],
  ['school-home', 'westfield-high.example'],
  ['school-news', 'westfield-high.example/news'],
  ['school-staff', 'westfield-high.example/staff'],
  ['school-cafeteria', 'westfield-high.example/cafeteria'],
  ['virusguard', 'virusguard.example'],
  ['about', 'about.example'],
  ['about-tips', 'about.example/tips'],
];

test('P4 gate: every site and page, Mail, TuneMole @review', async ({
  page,
}) => {
  test.setTimeout(240_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  await page.setViewportSize({ width: 1280, height: 800 });

  await logIn(page);
  const browser = await openBrowserOnline(page);

  for (const [name, url] of PAGES) {
    await go(browser, url);
    await page.waitForTimeout(300);
    await page.mouse.move(1200, 780);
    await page.screenshot({ path: `${DIR}/${name}.png` });
  }

  await openFromStart(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  await mail.getByRole('button', { name: 'Send/Recv' }).click();
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 10_000 });
  await rows.nth(1).click();
  await page.mouse.move(1200, 780);
  await page.screenshot({ path: `${DIR}/mail.png` });

  await openFromStart(page, 'TuneMole');
  const mole = page.getByRole('region', { name: /TuneMole$/ });
  await mole.getByLabel('Search for music').fill('surf');
  await mole.getByRole('button', { name: 'Search' }).click();
  await mole
    .getByRole('button', { name: /^Download Surf_Shimmy/ })
    .first()
    .click();
  await page.waitForTimeout(500);
  await page.mouse.move(1200, 780);
  await page.screenshot({ path: `${DIR}/tunemole-search.png` });
  // A second search for a file that never finishes, so Downloads shows a live state.
  await mole.getByLabel('Search for music').fill('tinfoil');
  await mole.getByRole('button', { name: 'Search' }).click();
  await mole
    .getByRole('button', {
      name: /^Download Tinfoil_Comets_-_new_single_LEAKED/,
    })
    .first()
    .click();
  await mole.getByRole('tab', { name: 'Downloads' }).click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${DIR}/tunemole-downloads.png` });

  expect(problems).toEqual([]);
});
