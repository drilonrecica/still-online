// v0.6 M3 gate (self-review): the four games on a phone (portrait and landscape) and a tablet,
// in English and German, each on its menu, its help and in play, plus one set as a boy on a
// phone. Saves to docs/review/v06-M3/ as `<nn>-<what>-<device>-<en|de>.png`, measures the games'
// own buttons (touch rubric), lists every visible control under 36 px per shot as a test
// attachment, and fails on any console or page error, sideways page scroll or a stage that
// leaves the screen.
//   npx playwright test v06-review-m3 --grep @review --project phone   (also phone-landscape, tablet)
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
import { longPress, quietIdle, swipe, tap } from './helpers';

const DIR = 'docs/review/v06-M3';

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

/** A zoomed stage (`ScaleToFit`) sits inside the screen. */
async function expectStageFits(page: Page, scope: Locator, what: string) {
  const stage = scope.getByTestId('scale-stage');
  if (!(await stage.count())) return;
  const b = (await stage.boundingBox())!;
  const vw = page.viewportSize()!;
  expect(b.x, `${what}: stage left`).toBeGreaterThanOrEqual(-0.5);
  expect(b.y, `${what}: stage top`).toBeGreaterThanOrEqual(-0.5);
  expect(b.x + b.width, `${what}: stage right`).toBeLessThanOrEqual(
    vw.width + 0.5,
  );
  expect(b.y + b.height, `${what}: stage bottom`).toBeLessThanOrEqual(
    vw.height + 0.5,
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
      if (r.width >= 35.5 && r.height >= 35.5) continue;
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

async function shoot(ctx: Ctx, nn: string, what: string, scope: Locator) {
  await ctx.page.waitForTimeout(600);
  await expectNoSideScroll(ctx.page, what);
  await expectStageFits(ctx.page, scope, what);
  await expect(scope).toBeInViewport();
  if (ctx.phone) {
    // Mines' cells are a field, not buttons; everything else should be finger-sized.
    const small = await smallTargets(scope);
    if (small.length) ctx.audit[`${nn}-${what}`] = small;
  }
  await ctx.page.screenshot({
    path: `${DIR}/${nn}-${what}-${ctx.device}-${ctx.suffix}.png`,
  });
}

/** Start → All Programs → Games → the game, by touch. */
async function openGame(ctx: Ctx, title: string) {
  const { page, m } = ctx;
  const icon = page
    .getByTestId('desktop')
    .getByRole('option', { name: title, exact: true });
  if (await icon.isVisible()) {
    await tap(icon);
    return;
  }
  await tap(page.locator('[data-start-button]'));
  await tap(
    page.getByRole('menuitem', { name: new RegExp(m.startMenu.allPrograms) }),
  );
  const programs = page.getByRole('menu', { name: m.startMenu.allPrograms });
  await tap(
    programs.getByRole('menuitem', {
      name: new RegExp(escape(m.startMenu.categories.games)),
    }),
  );
  await tap(page.getByRole('menuitem', { name: title, exact: true }).last());
}

function region(page: Page, title: string) {
  return page.getByRole('region', { name: new RegExp(`${escape(title)}$`) });
}

async function closeWindow(ctx: Ctx, win: Locator) {
  const id = await win.getAttribute('data-window-id');
  await win
    .getByRole('button', { name: ctx.m.wm.close, exact: true })
    .first()
    .dispatchEvent('click');
  await expect(ctx.page.locator(`[data-window-id="${id}"]`)).toHaveCount(0);
}

async function mines(ctx: Ctx) {
  const { page, m } = ctx;
  await openGame(ctx, m.apps.mines.title);
  const game = region(page, m.apps.mines.title);
  await expect(game).toBeVisible();
  const field = game.getByRole('group', { name: m.mines.field });
  const cell = (i: number) => field.locator(`[data-index="${i}"]`);
  await shoot(ctx, '01', 'mines', game);

  // Open the middle, flag a hidden cell by long-press, turn flag mode on.
  await tap(cell(40));
  await expect(cell(40)).not.toHaveAccessibleName(/: hidden$/);
  const hidden = field.locator('[aria-label$=": hidden"]');
  if (await hidden.count()) await longPress(page, hidden.first());
  const toggle = game.getByRole('button', { name: m.mines.flagMode });
  await tap(toggle);
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  if (ctx.phone) await expectTarget(toggle, 36);
  await shoot(ctx, '02', 'mines-flag-mode', game);
  await tap(toggle);

  // The Game menu by tap, then Expert (the widest board, zoomed to fit).
  await tap(game.getByRole('menuitem', { name: m.mines.menu.game }));
  const menu = game.getByRole('menu', { name: m.mines.menu.game });
  await expect(menu).toBeVisible();
  await shoot(ctx, '03', 'mines-menu', game);
  await tap(menu.getByRole('menuitem', { name: m.mines.level.expert }));
  await expect(field.locator('[data-index="479"]')).toBeAttached();
  await shoot(ctx, '04', 'mines-expert', game);
  // Back to Beginner, so the next run starts the same.
  await tap(game.getByRole('menuitem', { name: m.mines.menu.game }));
  await tap(menu.getByRole('menuitem', { name: m.mines.level.beginner }));
  await closeWindow(ctx, game);
}

async function henHunt(ctx: Ctx) {
  const { page, m } = ctx;
  await openGame(ctx, m.apps.henhunt.title);
  const game = region(page, m.apps.henhunt.title);
  await expect(game).toBeVisible();
  const menu = game.getByRole('navigation', { name: m.henhunt.menuLabel });
  await expect(menu).toBeVisible();
  if (ctx.phone)
    for (const b of await menu.getByRole('button').all())
      await expectTarget(b, 36);
  await shoot(ctx, '05', 'henhunt', game);
  await tap(menu.getByRole('button', { name: m.henhunt.help }));
  await expect(game.getByText(m.henhunt.helpTap)).toBeVisible();
  await shoot(ctx, '06', 'henhunt-help', game);
  await tap(game.getByRole('button', { name: m.henhunt.back }));
  await tap(menu.getByRole('button', { name: m.henhunt.play }));
  const field = game.getByRole('img', { name: m.henhunt.field });
  await expect(field).toBeVisible();
  // A drag to look around, then a shot at the centre (the crosshair shows for 300 ms).
  const r = (await field.boundingBox())!;
  const y = r.y + r.height * 0.8;
  await swipe(
    page,
    { x: r.x + r.width * 0.4, y },
    { x: r.x + r.width * 0.6, y },
  );
  await page.waitForTimeout(1200);
  await expectNoSideScroll(page, 'henhunt-playing');
  await expectStageFits(page, game, 'henhunt-playing');
  await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 3);
  await page.waitForTimeout(100);
  await page.screenshot({
    path: `${DIR}/07-henhunt-playing-${ctx.device}-${ctx.suffix}.png`,
  });
  await closeWindow(ctx, game);
}

async function pinball(ctx: Ctx) {
  const { page, m } = ctx;
  await openGame(ctx, m.apps.pinball.title);
  const game = region(page, m.apps.pinball.title);
  await expect(game).toBeVisible();
  const menu = game.getByRole('navigation', { name: m.pinball.menuLabel });
  await expect(menu).toBeVisible();
  if (ctx.phone)
    for (const b of await menu.getByRole('button').all())
      await expectTarget(b, 36);
  await shoot(ctx, '08', 'pinball', game);
  await tap(menu.getByRole('button', { name: m.pinball.help }));
  await expect(game.getByText(m.pinball.helpTitle).first()).toBeVisible();
  await shoot(ctx, '09', 'pinball-help', game);
  await tap(game.getByRole('button', { name: m.pinball.back }));
  await tap(menu.getByRole('button', { name: m.pinball.play }));
  const table = game.getByRole('img', {
    name: new RegExp(`^${m.pinball.table}`),
  });
  await expect(table).toBeVisible();
  // Launch the ball: hold on the launch lane (bottom right), then let go.
  const r = (await table.boundingBox())!;
  const cdp = await page.context().newCDPSession(page);
  const lane = { x: r.x + r.width * 0.92, y: r.y + r.height * 0.9 };
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [lane],
  });
  await page.waitForTimeout(700);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await cdp.detach();
  await page.waitForTimeout(500);
  await shoot(ctx, '10', 'pinball-playing', game);
  await closeWindow(ctx, game);
}

async function wrecker(ctx: Ctx) {
  const { page, m } = ctx;
  await openGame(ctx, m.apps.wrecker.title);
  const surface = page.getByRole('application', {
    name: new RegExp(escape(m.apps.wrecker.title)),
  });
  await expect(surface).toBeVisible();
  const tools = page.getByRole('toolbar', { name: m.wrecker.palette });
  // A few hammer blows, so the touch buttons show and the glass has cracks.
  const vw = page.viewportSize()!;
  for (const [fx, fy] of [
    [0.25, 0.35],
    [0.5, 0.55],
    [0.3, 0.7],
  ] as const) {
    await page.touchscreen.tap(vw.width * fx, vw.height * fy);
    await page.waitForTimeout(150);
  }
  const reset = tools.getByRole('button', { name: m.wrecker.touchReset });
  await expect(reset).toBeVisible();
  if (ctx.phone) {
    // Every palette button: the five tools, Repair, the two touch keys and Exit.
    for (const b of await tools.getByRole('button').all())
      await expectTarget(b, 36);
  }
  await shoot(ctx, '11', 'wrecker', tools);
  await tap(tools.getByRole('button', { name: new RegExp(m.wrecker.exit) }));
  await expect(surface).toHaveCount(0);
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

  await mines(ctx);
  await henHunt(ctx);
  await pinball(ctx);
  await wrecker(ctx);

  const audit = info.outputPath('small-targets.json');
  writeFileSync(audit, JSON.stringify(ctx.audit, null, 2));
  await info.attach('small-targets.json', {
    path: audit,
    contentType: 'application/json',
  });
  expect(problems).toEqual([]);
}

for (const language of ['en', 'de'] as const) {
  test(`M3 review: the games, ${language} @review @phone @tablet`, async ({
    page,
  }, info) => {
    test.setTimeout(180_000);
    await review(page, info, language, 'girl');
  });
}

test('M3 review on a phone as a boy @review @phone', async ({ page }, info) => {
  test.skip(info.project.name !== 'phone', 'one boy set: phone portrait');
  test.setTimeout(180_000);
  await review(page, info, 'en', 'boy');
});
