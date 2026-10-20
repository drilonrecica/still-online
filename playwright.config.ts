import { defineConfig, devices, type Project } from '@playwright/test';

// @review (phase-gate) and @screenshots (README images) specs only run when
// asked for explicitly, e.g. `npx playwright test --grep @screenshots`.
const optIn = process.argv.some(
  (a) => a.includes('@review') || a.includes('@screenshots'),
);

/**
 * Tag rules per project (docs/touch.md). The desktop project (`touchTag` undefined) skips
 * `@phone` and `@tablet` specs; a touch project runs only specs with its own tag. `@review` and
 * `@screenshots` stay opt-in everywhere. Playwright ANDs a CLI `--grep` with the project's
 * `grep`, so `--grep @review` in a touch project still only runs its own tag's review specs.
 */
function tagFilter(
  touchTag?: '@phone' | '@tablet',
): Pick<Project, 'grep' | 'grepInvert'> {
  const skip = optIn ? [] : ['@review', '@screenshots'];
  if (!touchTag) skip.push('@phone', '@tablet');
  return {
    ...(touchTag ? { grep: new RegExp(touchTag) } : {}),
    grepInvert: skip.length ? new RegExp(skip.join('|')) : undefined,
  };
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    // English browser by default; German specs use `test.use({ locale: 'de-DE' })`.
    locale: 'en-US',
    baseURL: 'http://localhost:4173/still-online/',
    trace: 'on-first-retry',
  },
  // Chromium only: the touch projects emulate their devices in Chromium.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      ...tagFilter(),
    },
    {
      name: 'phone',
      use: { ...devices['Pixel 7'] },
      ...tagFilter('@phone'),
    },
    {
      name: 'phone-landscape',
      use: { ...devices['Pixel 7'], viewport: { width: 915, height: 412 } },
      ...tagFilter('@phone'),
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 2,
      },
      ...tagFilter('@tablet'),
    },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173/still-online/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
