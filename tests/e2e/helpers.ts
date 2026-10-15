// Shared e2e steps. See docs/architecture-v0.2.md → "Testing".
import { expect, type Locator, type Page } from '@playwright/test';
import { SETTINGS_V02_DEFAULTS } from '../../src/os/types';

const SETTINGS_KEY = 'still-online:v1:settings';

export interface LogInOptions {
  /**
   * Default true: turn off the screensaver and Messenger auto-away. Idle thresholds go through
   * `scaleMs`, so with `?speed=fast` 5 idle minutes are 3 s, which a slow assertion can reach.
   * Specs that test idle behaviour pass `false`.
   */
  quiet?: boolean;
}

/** Merges idle-off settings into the persisted settings before any app script runs. */
async function quietIdle(page: Page) {
  await page.addInitScript(
    ({ key, screensaver }) => {
      try {
        const raw = localStorage.getItem(key);
        const saved = raw
          ? (JSON.parse(raw) as {
              state?: Record<string, unknown>;
              version?: number;
            })
          : {};
        const state = saved.state ?? {};
        const current =
          typeof state.screensaver === 'object' && state.screensaver !== null
            ? state.screensaver
            : screensaver;
        localStorage.setItem(
          key,
          JSON.stringify({
            version: saved.version ?? 1,
            state: {
              ...state,
              screensaver: { ...current, minutes: 0 },
              awayMinutes: 0,
            },
          }),
        );
      } catch {
        // Storage blocked: the defaults apply.
      }
    },
    { key: SETTINGS_KEY, screensaver: SETTINGS_V02_DEFAULTS.screensaver },
  );
}

/** Fresh visit with the fast clock: skip boot, enter the name, log on, wait for the desktop. */
export async function logIn(
  page: Page,
  name = 'Ada',
  { quiet = true }: LogInOptions = {},
) {
  if (quiet) await quietIdle(page);
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await page.getByLabel('Your name').fill(name);
  await page.getByRole('button', { name: `Log on as ${name}` }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();
}

/**
 * Closes every open chat window. Jess nudges on sign-in, which opens (and shakes) her chat;
 * with `wait` (default) this first waits for that chat to appear.
 */
export async function closeNudgeChats(page: Page, { wait = true } = {}) {
  const chats = page.getByRole('region', { name: /Conversation$/ });
  if (wait) await expect(chats.first()).toBeVisible({ timeout: 10_000 });
  for (let n = await chats.count(); n > 0; n = await chats.count()) {
    // Dispatched directly: the shaking window is never "stable" for a normal click.
    await chats
      .first()
      .getByRole('button', { name: 'Close' })
      .dispatchEvent('click');
    await expect(chats).toHaveCount(n - 1);
  }
}

/** Opens Messenger from the desktop, signs in, and closes Jess's auto-opened nudge chat. */
export async function openMessenger(page: Page): Promise<Locator> {
  await page.getByRole('option', { name: 'Messenger' }).dblclick();
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('group', { name: 'Contacts' })).toBeVisible();
  await closeNudgeChats(page);
  return page.getByRole('region', { name: 'Messenger' });
}

/** Opens Web Explorer and dials in through the offline page's Connect button. */
export async function openBrowserOnline(page: Page): Promise<Locator> {
  await page.getByRole('option', { name: 'Web Explorer' }).dblclick();
  const browser = page.getByRole('region', { name: /Web Explorer$/ });
  await browser
    .getByTestId('page-cannot-be-displayed')
    .getByRole('button', { name: 'Connect' })
    .click();
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'online',
  );
  return browser;
}

export async function go(browser: Locator, url: string) {
  const address = browser.getByLabel('Address');
  await address.fill(url);
  await address.press('Enter');
  await expect(browser.getByRole('status')).toHaveText('Done', {
    timeout: 10_000,
  });
}

/** Opens an app from Start → All Programs by its menu name. */
export async function openFromStart(page: Page, name: string) {
  await page.getByRole('button', { name: 'start' }).click();
  await page.getByRole('menuitem', { name: /All Programs/ }).click();
  const programs = page.getByRole('menu', { name: 'All Programs' });
  const item = page.getByRole('menuitem', { name, exact: true }).last();
  if (
    !(await programs.getByRole('menuitem', { name, exact: true }).isVisible())
  ) {
    // The app lives in a flyout: try each folder until the item shows up.
    for (const folder of [/Internet/, /Accessories/, /Games/]) {
      await programs.getByRole('menuitem', { name: folder }).hover();
      if (
        await item.waitFor({ timeout: 1500 }).then(
          () => true,
          () => false,
        )
      ) {
        break;
      }
    }
  }
  await item.click();
}
