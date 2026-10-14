import { expect, test } from '@playwright/test';

test('M0 preview serves the app under /still-online/ @review', async ({
  page,
}) => {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('response', (res) => {
    if (res.status() >= 400)
      problems.push(`HTTP ${res.status()}: ${res.url()}`);
  });
  const requested: string[] = [];
  page.on('request', (req) => requested.push(req.url()));

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('./', { waitUntil: 'networkidle' });
  await expect(page.getByText('still-online')).toBeVisible();
  await expect(page).toHaveTitle('still-online');
  await page.screenshot({ path: 'docs/review/M0/preview.png' });

  expect(requested.some((u) => u.includes('/still-online/assets/'))).toBe(true);
  expect(problems).toEqual([]);
});
