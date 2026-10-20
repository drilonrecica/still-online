// v0.6 M2 gate (self-review): every app on a phone (portrait and landscape) and a tablet, in
// English and German, plus four sites in Web Explorer on a phone. Saves to docs/review/v06-M2/
// as `<nn>-<what>-<device>-<en|de>.png`, measures a sample of tap targets (touch rubric), lists
// every visible control under 36 px per app as a test attachment, and fails on any console or
// page error or sideways page scroll.
//   npx playwright test v06-review-m2 --grep @review --project phone   (also phone-landscape, tablet)
import { writeFileSync } from 'node:fs';
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
import { logIn, longPress, quietIdle, tap } from './helpers';

const DIR = 'docs/review/v06-M2';

type Device = 'phone' | 'phone-landscape' | 'tablet';
type Messages = typeof en;

function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  return problems;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Touch rubric: at least `w`×`h` px. */
async function expectTarget(locator: Locator, w: number, h = w) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('not visible');
  expect(b.width, 'tap target width').toBeGreaterThanOrEqual(w - 0.5);
  expect(b.height, 'tap target height').toBeGreaterThanOrEqual(h - 0.5);
}

async function expectNoSideScroll(page: Page, what: string) {
  const [scrollWidth, width] = await page.evaluate<[number, number]>(
    '[document.scrollingElement.scrollWidth, innerWidth]',
  );
  expect(scrollWidth, `${what}: no sideways page scroll`).toBeLessThanOrEqual(
    width,
  );
}

/** Every visible control in `scope` smaller than 36×36 px (for the review notes, not asserted). */
async function smallTargets(scope: Locator): Promise<string[]> {
  return scope.evaluate((root) => {
    const out: string[] = [];
    const sel =
      'button, a[href], input:not([type=hidden]), select, textarea, [role=button], [role=menuitem], [role=tab], [role=option], [role=radio], [role=checkbox]';
    for (const el of root.querySelectorAll<HTMLElement>(sel)) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.bottom < 0 || r.top > innerHeight) continue;
      if (getComputedStyle(el).visibility === 'hidden') continue;
      // `zoom` (Fit to screen, the Amplifier skin) is already in the client rect.
      if (r.width >= 35.5 && r.height >= 35.5) continue;
      // A text field or a list row stretched across the window is still easy to hit.
      if (r.width >= 120 && r.height >= 30) continue;
      const name =
        el.getAttribute('aria-label') ??
        el.getAttribute('title') ??
        (el.textContent ?? '').trim().slice(0, 30);
      out.push(
        `${el.tagName.toLowerCase()}${el.getAttribute('role') ? `[${el.getAttribute('role')}]` : ''} "${name}" ${Math.round(r.width)}×${Math.round(r.height)}`,
      );
    }
    return out;
  });
}

interface Ctx {
  page: Page;
  device: Device;
  m: Messages;
  suffix: string;
  phone: boolean;
  audit: Record<string, string[]>;
}

const front = (page: Page) =>
  page.locator('[data-window-id][data-active="true"]');

async function shoot(ctx: Ctx, nn: string, what: string, scope?: Locator) {
  await ctx.page.waitForTimeout(600);
  await expectNoSideScroll(ctx.page, what);
  if (ctx.phone && scope) {
    const small = await smallTargets(scope);
    if (small.length) ctx.audit[`${nn}-${what}`] = small;
  }
  await ctx.page.screenshot({
    path: `${DIR}/${nn}-${what}-${ctx.device}-${ctx.suffix}.png`,
  });
}

/**
 * Opens an app by touch, in either language: a tap on its desktop icon, or else Start → All
 * Programs → its folder.
 */
async function openApp(ctx: Ctx, name: string) {
  const { page, m } = ctx;
  const icon = page
    .getByTestId('desktop')
    .getByRole('option', { name, exact: true });
  if (await icon.isVisible()) {
    await tap(icon);
    return;
  }
  await tap(page.locator('[data-start-button]'));
  await tap(
    page.getByRole('menuitem', { name: new RegExp(m.startMenu.allPrograms) }),
  );
  const programs = page.getByRole('menu', { name: m.startMenu.allPrograms });
  const item = page.getByRole('menuitem', { name, exact: true }).last();
  if (
    !(await programs.getByRole('menuitem', { name, exact: true }).isVisible())
  ) {
    const c = m.startMenu.categories;
    for (const folder of [c.internet, c.accessories, c.games, c.system]) {
      await tap(
        programs.getByRole('menuitem', { name: new RegExp(escape(folder)) }),
      );
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
  await tap(item);
}

/** Opens a place (My Documents, My Computer, …) from the Start menu. */
async function openPlace(ctx: Ctx, name: string) {
  await tap(ctx.page.locator('[data-start-button]'));
  await tap(ctx.page.getByRole('menuitem', { name, exact: true }));
}

/** Closes the front window by its title-bar Close (or an app's own close/exit). */
async function closeFront(ctx: Ctx) {
  const { page, m } = ctx;
  const win = front(page);
  const id = await win.getAttribute('data-window-id');
  for (const name of [m.wm.close, m.amplifier.close, m.wrecker.exit]) {
    const b = win.getByRole('button', { name, exact: true }).first();
    if (await b.isVisible()) {
      // Dispatched directly: a shaking chat window is never "stable" for a tap.
      await b.dispatchEvent('click');
      break;
    }
  }
  await expect(page.locator(`[data-window-id="${id}"]`)).toHaveCount(0);
}

/** Waits for the app's window, shoots it, checks the title-bar Close on a phone, closes it. */
async function shootApp(
  ctx: Ctx,
  nn: string,
  what: string,
  title: string | RegExp,
  { close = true, xp = true } = {},
) {
  const win = ctx.page.getByRole('region', {
    name: typeof title === 'string' ? new RegExp(`${escape(title)}$`) : title,
  });
  await expect(win.first()).toBeVisible({ timeout: 10_000 });
  await shoot(ctx, nn, what, win.first());
  // Still on screen after the shot (not minimized or closed by a stray tap).
  await expect(win.first()).toBeInViewport();
  if (ctx.phone && xp) {
    await expectTarget(
      win.first().getByRole('button', { name: ctx.m.wm.close, exact: true }),
      36,
    );
  }
  if (close) await closeFront(ctx);
  return win.first();
}

async function review(
  page: Page,
  info: TestInfo,
  language: Locale,
  gender: Gender,
) {
  const device = info.project.name as Device;
  const phone = device.startsWith('phone');
  const m = (language === 'de' ? de : en) as Messages;
  const suffix = gender === 'boy' ? `boy-${language}` : language;
  const problems = watch(page);
  const ctx: Ctx = { page, device, m, suffix, phone, audit: {} };
  const label = (key: keyof Messages['apps']) => {
    const app = m.apps[key] as { title: string; label?: string };
    return app.label ?? app.title;
  };

  await quietIdle(page);
  await page.goto('./?speed=fast');
  await tap(page.getByTestId('boot-screen'));
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await tap(
    page.getByRole('radio', {
      name: language === 'de' ? 'Deutsch' : 'English',
    }),
  );
  const field = page.getByLabel(m.login.yourName);
  await tap(field);
  await field.fill('Ada');
  await tap(page.locator(`[role="radio"][data-gender="${gender}"]`));
  await tap(
    page.getByRole('button', {
      name: m.login.logOnAs.replace('{name}', 'Ada'),
    }),
  );
  await expect(page.getByTestId('desktop')).toBeVisible();
  const stapley = page.locator('[data-assistant]');
  await expect(stapley).toBeVisible();
  await tap(stapley.getByRole('button', { name: m.assistant.hide }));
  await expect(stapley).toBeHidden();

  // Folders and the system apps.
  await openPlace(ctx, m.fs.folders.docs);
  await shootApp(ctx, '01', 'my-documents', m.fs.folders.docs);
  await openPlace(ctx, m.apps.mycomputer.title);
  const myComputer = await shootApp(
    ctx,
    '02',
    'my-computer',
    m.apps.mycomputer.title,
    { close: false },
  );
  if (phone)
    await expectTarget(
      myComputer.getByRole('link', { name: m.mycomputer.credits }),
      36,
    );
  await closeFront(ctx);
  await openApp(ctx, m.apps.recyclebin.title);
  await shootApp(ctx, '03', 'recycle-bin', m.apps.recyclebin.title);
  await longPress(page, page.getByTestId('desktop'));
  await tap(page.getByRole('menuitem', { name: m.desktop.menu.properties }));
  await shootApp(ctx, '04', 'display', m.apps.display.title);
  await openApp(ctx, label('useraccounts'));
  await shootApp(ctx, '05', 'user-accounts', m.apps.useraccounts.title);
  await openApp(ctx, label('regional'));
  await shootApp(ctx, '06', 'regional', m.apps.regional.title);
  await openApp(ctx, label('diskcleanup'));
  await shootApp(ctx, '07', 'disk-cleanup', m.apps.diskcleanup.title);
  await openApp(ctx, label('dialup'));
  await shootApp(ctx, '08', 'dialup', m.apps.dialup.title);

  // Messenger: sign in; Jess nudges and her chat opens.
  await openApp(ctx, label('messenger'));
  await tap(
    page.getByRole('button', { name: m.messenger.signIn.submit, exact: true }),
  );
  const chat = page.getByRole('region', {
    name: new RegExp(`${escape(m.apps['messenger-chat'].title)}$`),
  });
  await expect(chat.first()).toBeVisible({ timeout: 15_000 });
  await expect(chat.first()).not.toHaveAttribute('data-shaking', 'true', {
    timeout: 10_000,
  });
  await shootApp(ctx, '10', 'messenger-chat', m.apps['messenger-chat'].title);
  // Let the sign-in toasts go before the contact list's shot.
  await expect(
    page
      .getByRole('status')
      .filter({ has: page.getByRole('button', { name: m.toast.close }) }),
  ).toHaveCount(0, { timeout: 15_000 });
  await shootApp(ctx, '09', 'messenger', m.apps.messenger.title);

  await openApp(ctx, label('mail'));
  await shootApp(ctx, '11', 'mail', m.apps.mail.title);

  // Web Explorer: dial in from the offline page; on a phone, four sites in Fit to screen.
  await openApp(ctx, label('browser'));
  const web = page.getByRole('region', { name: /Web Explorer$/ });
  await expect(web).toBeVisible();
  await page.waitForTimeout(1000);
  // Messenger's sign-in may already have dialed in.
  const offline = web.getByTestId('page-cannot-be-displayed');
  if (await offline.isVisible()) {
    await tap(offline.getByRole('button', { name: m.browser.error.connect }));
  }
  await expect(offline).toHaveCount(0, { timeout: 15_000 });
  const done = web.getByRole('status').last();
  await expect(done).toHaveText(m.browser.status.done, { timeout: 10_000 });
  if (device === 'phone') {
    const address = web.getByLabel(m.browser.address);
    for (const [nn, what, url] of [
      ['13', 'site-searchly', 'http://searchly.example/search?q=tinfoil'],
      ['14', 'site-tinfoilcomets', 'http://tinfoilcomets.example/'],
      ['15', 'site-friendspace', 'http://friendspace.example/jess'],
      ['16', 'site-pixlog', 'http://pixlog.example/'],
    ] as const) {
      await tap(address);
      await address.fill(url);
      await address.press('Enter');
      await expect(done).toHaveText(m.browser.status.done, { timeout: 10_000 });
      await shoot(ctx, nn, what, web);
    }
  }
  if (phone) {
    // The menu bar, including German's one-character „?" (Help).
    for (const item of await web
      .getByRole('menubar')
      .getByRole('menuitem')
      .all())
      await expectTarget(item, 36);
  }
  await shootApp(ctx, '12', 'web-explorer', /Web Explorer$/);

  await openApp(ctx, label('tunemole'));
  await shootApp(ctx, '17', 'tunemole', m.apps.tunemole.title);
  await openApp(ctx, label('amplifier'));
  await shootApp(ctx, '18', 'amplifier', m.apps.amplifier.title, { xp: false });
  await openApp(ctx, label('notepad'));
  await shootApp(ctx, '19', 'notepad', m.apps.notepad.title);
  await openApp(ctx, label('paint'));
  await shootApp(ctx, '20', 'paint', m.apps.paint.title);
  await openApp(ctx, label('photobooth'));
  const booth = page.getByRole('region', {
    name: new RegExp(`${escape(m.apps.photobooth.title)}$`),
  });
  await tap(booth.getByRole('button', { name: m.photobooth.useCartoon }));
  await shootApp(ctx, '21', 'snapshot-booth', m.apps.photobooth.title);

  // The games, before M3 adapts them (a baseline for the M3 gate).
  await openApp(ctx, label('mines'));
  await shootApp(ctx, '22', 'mines', m.apps.mines.title);
  await openApp(ctx, label('henhunt'));
  await shootApp(ctx, '23', 'henhunt', m.apps.henhunt.title);
  await openApp(ctx, label('pinball'));
  await shootApp(ctx, '24', 'pinball', m.apps.pinball.title);
  await openApp(ctx, label('wrecker'));
  const wrecker = await shootApp(ctx, '25', 'wrecker', m.apps.wrecker.title, {
    xp: false,
    close: false,
  });
  await page.keyboard.press('Escape');
  await expect(wrecker).toBeHidden();

  const audit = info.outputPath('small-targets.json');
  writeFileSync(audit, JSON.stringify(ctx.audit, null, 2));
  await info.attach('small-targets.json', {
    path: audit,
    contentType: 'application/json',
  });
  expect(problems).toEqual([]);
}

for (const language of ['en', 'de'] as const) {
  test(`M2 review: every app, ${language} @review @phone @tablet`, async ({
    page,
  }, info) => {
    test.setTimeout(240_000);
    await review(page, info, language, 'girl');
  });
}

test('M2 review on a phone as a boy @review @phone', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'one boy set: phone portrait');
  test.setTimeout(240_000);
  await review(page, info, 'en', 'boy');
});

// Touch rubric, desktop: one 1280×800 shot to hold against docs/review/v05-W4/d06-mail-girl-en.png.
test('M2 review: Mail on the desktop @review', async ({ page }) => {
  const problems = watch(page);
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  await page.getByRole('option', { name: 'Mail' }).dblclick();
  const mail = page.getByRole('region', { name: /Mail$/ });
  await mail.getByRole('button', { name: 'Send/Recv' }).click();
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 15_000 });
  await rows.nth(1).click();
  await expect(mail.getByRole('region', { name: 'Preview' })).not.toBeEmpty();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${DIR}/11-mail-desktop-en.png` });
  expect(problems).toEqual([]);
});
