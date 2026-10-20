// v0.6 M1 gate (self-review): the touch shell on every device, in English and German, plus one
// set as a boy. Saves to docs/review/v06-M1/ as `<nn>-<what>-<device>-<en|de>.png`, measures a
// sample of tap targets (touch rubric) and fails on any console or page error.
//   npx playwright test --grep @review --project phone            (also phone-landscape, tablet)
//   npx playwright test v06-review-m1 --grep @review --project chromium   (desktop, 1280×800)
import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import type { Locale } from '../../src/i18n/types';
import type { Gender } from '../../src/os/types';
import { quietIdle } from './helpers';

const DIR = 'docs/review/v06-M1';

type Device = 'phone' | 'phone-landscape' | 'tablet' | 'desktop';

function deviceOf(info: TestInfo): Device {
  const name = info.project.name;
  return name === 'chromium' ? 'desktop' : (name as Device);
}

function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  return problems;
}

async function box(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('not visible');
  return b;
}

/** Touch rubric: at least `w`×`h` px. */
async function expectTarget(locator: Locator, w: number, h = w) {
  const b = await box(locator);
  expect(b.width, 'tap target width').toBeGreaterThanOrEqual(w - 0.5);
  expect(b.height, 'tap target height').toBeGreaterThanOrEqual(h - 0.5);
}

async function expectNoSideScroll(page: Page) {
  const [scrollWidth, width] = await page.evaluate<[number, number]>(
    '[document.scrollingElement.scrollWidth, innerWidth]',
  );
  expect(scrollWidth).toBeLessThanOrEqual(width);
}

async function shoot(
  page: Page,
  device: Device,
  suffix: string,
  nn: string,
  what: string,
) {
  await page.waitForTimeout(400);
  await page.screenshot({
    path: `${DIR}/${nn}-${what}-${device}-${suffix}.png`,
  });
}

async function review(
  page: Page,
  info: TestInfo,
  language: Locale,
  gender: Gender,
) {
  const device = deviceOf(info);
  const touch = device !== 'desktop';
  const phone = device.startsWith('phone');
  const m = language === 'de' ? de : en;
  const suffix = gender === 'boy' ? `boy-${language}` : language;
  const press = (l: Locator) => (touch ? l.tap() : l.click());
  const problems = watch(page);

  if (device === 'desktop')
    await page.setViewportSize({ width: 1280, height: 800 });
  await quietIdle(page);
  await page.goto('./?speed=fast');
  await press(page.getByTestId('boot-screen'));
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await press(
    page.getByRole('radio', {
      name: language === 'de' ? 'Deutsch' : 'English',
    }),
  );
  const field = page.getByLabel(m.login.yourName);
  await press(field);
  await field.fill('Ada');
  await press(page.locator(`[role="radio"][data-gender="${gender}"]`));
  await expectNoSideScroll(page);
  await shoot(page, device, suffix, '01', 'login');
  await press(
    page.getByRole('button', {
      name: m.login.logOnAs.replace('{name}', 'Ada'),
    }),
  );
  await expect(page.getByTestId('desktop')).toBeVisible();

  // Stapley greets on the first log on.
  const stapley = page.locator('[data-assistant]');
  await expect(stapley).toBeVisible();
  await shoot(page, device, suffix, '08', 'stapley');
  if (phone)
    await expectTarget(
      stapley.getByRole('button', { name: m.assistant.hide }),
      36,
    );
  await press(stapley.getByRole('button', { name: m.assistant.hide }));
  await expect(stapley).toBeHidden();

  await expectNoSideScroll(page);
  await shoot(page, device, suffix, '02', 'desktop');

  const start = page.locator('[data-start-button]');
  const menu = page.getByRole('menu', { name: m.startMenu.label });
  await press(start);
  await expect(menu).toBeVisible();
  await shoot(page, device, suffix, '03', 'start-menu');
  if (phone) {
    for (const item of [
      menu.getByRole('menuitem', { name: new RegExp(m.startMenu.allPrograms) }),
      menu.getByRole('menuitem', { name: m.apps.mycomputer.title }),
      menu.getByRole('menuitem', { name: m.startMenu.turnOff }),
    ]) {
      await expectTarget(item, 36);
    }
  }
  await press(
    menu.getByRole('menuitem', { name: new RegExp(m.startMenu.allPrograms) }),
  );
  const programs = page.getByRole('menu', { name: m.startMenu.allPrograms });
  await expect(programs).toBeVisible();
  await shoot(page, device, suffix, '04', 'all-programs');
  if (phone) {
    await expectTarget(
      programs.getByRole('menuitem', { name: m.startMenu.back }),
      36,
    );
    await expectTarget(
      programs.getByRole('menuitem', {
        name: new RegExp(m.startMenu.categories.games),
      }),
      36,
    );
  }
  await press(start);
  await expect(menu).toBeHidden();

  // Four windows from the Start menu's places.
  for (const name of [
    m.fs.folders.docs,
    m.fs.folders.pics,
    m.apps.mycomputer.title,
    m.apps.recyclebin.title,
  ]) {
    await press(start);
    await press(menu.getByRole('menuitem', { name, exact: true }));
    await expect(menu).toBeHidden();
  }
  const taskbar = page.getByRole('toolbar', { name: m.taskbar.label });
  await expect(taskbar.locator('button[data-active]')).toHaveCount(4);
  await expectNoSideScroll(page);
  await shoot(page, device, suffix, '05', 'taskbar-4-windows');
  if (phone) {
    for (const b of await taskbar.locator('button[data-active]').all()) {
      await expectTarget(b, 40);
    }
    const front = page.getByRole('region', { name: m.apps.recyclebin.title });
    await expectTarget(front.getByRole('button', { name: m.wm.minimize }), 36);
    await expectTarget(front.getByRole('button', { name: m.wm.close }), 36);
  }

  if (phone) {
    await press(page.getByTestId('tray-chevron'));
    await expect(page.getByTestId('tray-hidden')).toBeVisible();
    await shoot(page, device, suffix, '06', 'tray-chevron');
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('tray-hidden')).toBeHidden();
  } else {
    await shoot(page, device, suffix, '06', 'tray');
  }

  // A dialog: Notepad asks before closing unsaved text.
  await press(start);
  await press(
    menu.getByRole('menuitem', { name: m.apps.notepad.label, exact: true }),
  );
  const notepad = page.getByRole('region', { name: m.apps.notepad.title });
  const doc = notepad.getByLabel(m.notepad.document);
  await press(doc);
  await doc.fill('dear diary');
  await press(notepad.getByRole('button', { name: m.wm.close, exact: true }));
  const dialog = notepad.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expectNoSideScroll(page);
  await shoot(page, device, suffix, '09', 'dialog');
  if (phone) {
    for (const b of await dialog.getByRole('button').all())
      await expectTarget(b, 36);
  }
  await press(dialog.getByRole('button', { name: m.common.no }));
  await expect(notepad).toBeHidden();

  // A toast: friends signing in to Messenger.
  await press(start);
  await press(
    menu.getByRole('menuitem', { name: m.apps.messenger.title, exact: true }),
  );
  await press(
    page.getByRole('button', { name: m.messenger.signIn.submit, exact: true }),
  );
  const toast = page
    .getByRole('status')
    .filter({ has: page.getByRole('button', { name: m.toast.close }) });
  // `.last()`: a phone shows only the newest toast.
  await expect(toast.last()).toBeVisible({ timeout: 10_000 });
  if (phone)
    await expectTarget(
      toast.last().getByRole('button', { name: m.toast.close }),
      36,
    );
  await shoot(page, device, suffix, '07', 'toast');

  expect(problems).toEqual([]);
}

for (const [language, gender] of [
  ['en', 'girl'],
  ['de', 'girl'],
] as const) {
  test(`M1 review on touch: ${language} @review @phone @tablet`, async ({
    page,
  }, info) => {
    await review(page, info, language, gender);
  });

  test(`M1 review on the desktop: ${language} @review`, async ({
    page,
  }, info) => {
    await review(page, info, language, gender);
  });
}

test('M1 review on a phone as a boy @review @phone', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'one boy set: phone portrait');
  await review(page, info, 'en', 'boy');
});
