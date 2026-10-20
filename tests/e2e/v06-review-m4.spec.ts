// v0.6 M4 gate (release-ready self-review): four saves played the way a player would.
//   - phone portrait: day 1 as a girl in English
//   - phone landscape: day 6 as a boy in German
//   - tablet: day 10 as a girl in English
//   - desktop (1280×800): day 6 as a girl in English, shot like docs/review/v05-W4/ for comparison
// Every friend with a chat that day is played to the end. Each run measures a sample of tap
// targets, emulates the on-screen keyboard (a shorter viewport while a text box is focused),
// rotates mid-use, lists every visible control under 36 px per shot as a test attachment, and
// fails on any console or page error or sideways page scroll. Saves to docs/review/v06-M4/ as
// `<nn>-<what>-<device>-<en|boy-de>.png`.
//   npx playwright test v06-review-m4 --grep @review --project phone   (also phone-landscape,
//   tablet, chromium)
import { writeFileSync } from 'node:fs';
import {
  expect,
  test,
  type Locator,
  type Page,
  type TestInfo,
} from '@playwright/test';
import { contacts } from '../../src/content/contacts';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import type { Locale } from '../../src/i18n/types';
import type { Gender } from '../../src/os/types';
import { longPress, quietIdle, swipe, tap } from './helpers';
import { seedStoryDay } from './week2';

const DIR = 'docs/review/v06-M4';

type Messages = typeof en;
type Device = 'phone' | 'phone-landscape' | 'tablet' | 'desktop';

interface Ctx {
  page: Page;
  device: Device;
  m: Messages;
  suffix: string;
  touch: boolean;
  audit: Record<string, string[]>;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ends = (s: string) => new RegExp(`${escape(s)}$`);

function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  return problems;
}

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

/** Every visible control smaller than 36×36 px (for the review notes, not asserted). */
async function smallTargets(page: Page): Promise<string[]> {
  return page.locator('body').evaluate((root) => {
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

async function shoot(ctx: Ctx, nn: string, what: string) {
  const { page } = ctx;
  if (!ctx.touch) await page.mouse.move(1270, 790);
  await page.waitForTimeout(600);
  await expectNoSideScroll(page, what);
  if (ctx.device.startsWith('phone')) {
    const small = await smallTargets(page);
    if (small.length) ctx.audit[`${nn}-${what}`] = small;
  }
  await page.screenshot({
    path: `${DIR}/${nn}-${what}-${ctx.device}-${ctx.suffix}.png`,
  });
}

/** A tap on touch devices, a click with the mouse (dispatched when a window may be shaking). */
async function press(ctx: Ctx, locator: Locator) {
  if (ctx.touch) await tap(locator);
  else await locator.click();
}

const front = (page: Page) =>
  page.locator('[data-window-id][data-active="true"]');

/** Closes every window, front first. */
async function closeAll(ctx: Ctx) {
  const { page, m } = ctx;
  const windows = page.locator('[data-window-id]');
  for (let n = await windows.count(); n > 0; n = await windows.count()) {
    const win = (await front(page).count()) ? front(page) : windows.first();
    await win
      .getByRole('button', { name: m.wm.close, exact: true })
      .first()
      .dispatchEvent('click');
    // Notepad and Paint ask to save what was typed or drawn: No.
    const no = page
      .getByRole('dialog')
      .getByRole('button', { name: m.common.no, exact: true });
    await no
      .waitFor({ timeout: 500 })
      .then(() => press(ctx, no))
      .catch(() => undefined);
    await expect(windows).toHaveCount(n - 1);
  }
}

/** Opens an app: its desktop icon (tap or double-click), else Start → All Programs → folder. */
async function openApp(ctx: Ctx, name: string) {
  const { page, m } = ctx;
  const icon = page
    .getByTestId('desktop')
    .getByRole('option', { name, exact: true });
  if (await icon.isVisible()) {
    if (ctx.touch) await tap(icon);
    else await icon.dblclick();
    return;
  }
  await press(ctx, page.locator('[data-start-button]'));
  await press(
    ctx,
    page.getByRole('menuitem', { name: new RegExp(m.startMenu.allPrograms) }),
  );
  const programs = page.getByRole('menu', { name: m.startMenu.allPrograms });
  const item = page.getByRole('menuitem', { name, exact: true }).last();
  const c = m.startMenu.categories;
  for (const folder of [c.accessories, c.internet, c.games, c.entertainment]) {
    if (await item.isVisible()) break;
    await press(
      ctx,
      programs.getByRole('menuitem', { name: new RegExp(escape(folder)) }),
    );
    await item.waitFor({ timeout: 1500 }).catch(() => undefined);
  }
  await press(ctx, item);
}

/** The scripts a friend has on `day`, with the follow-up threads that wait on them. */
function dayScripts(day: number): Record<string, string[]> {
  return Object.fromEntries(
    contacts.map(({ contact, scripts }) => {
      const keep = new Set(
        scripts
          .filter((s) => s.trigger.type === 'onDay' && s.trigger.day === day)
          .map((s) => s.id),
      );
      for (let grew = true; grew;) {
        grew = false;
        for (const s of scripts)
          if (
            s.trigger.type === 'afterScript' &&
            keep.has(s.trigger.scriptId) &&
            !keep.has(s.id)
          ) {
            keep.add(s.id);
            grew = true;
          }
      }
      return [contact.id, [...keep]];
    }),
  );
}

/** Boots (checking the day on the boot screen) and logs on as Ada in `language`. */
async function boot(ctx: Ctx, day: number, language: Locale, gender: Gender) {
  const { page, m } = ctx;
  await page.goto('./?speed=fast');
  await expect(page.getByTestId('boot-day')).toHaveText(
    m.boot.day.replace('{day}', String(day)),
  );
  await press(ctx, page.getByTestId('boot-screen'));
  await expect(page.getByTestId('login-screen')).toBeVisible();
  await press(
    ctx,
    page.getByRole('radio', {
      name: language === 'de' ? 'Deutsch' : 'English',
    }),
  );
  const field = page.getByLabel(m.login.yourName);
  await press(ctx, field);
  await field.fill('Ada');
  await press(ctx, page.locator(`[role="radio"][data-gender="${gender}"]`));
  await shoot(ctx, '01', 'login');
  await press(
    ctx,
    page.getByRole('button', {
      name: m.login.logOnAs.replace('{name}', 'Ada'),
    }),
  );
  await expect(page.getByTestId('desktop')).toBeVisible();
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toBeVisible({ timeout: 10_000 });
  await shoot(ctx, '02', 'desktop');
  await press(ctx, balloon.getByRole('button', { name: m.assistant.hide }));
  await expect(page.locator('[data-assistant]')).toHaveCount(0);
}

/** Start menu, then All Programs, each shot; the taskbar sizes are checked on touch. */
async function startMenu(ctx: Ctx) {
  const { page, m } = ctx;
  const start = page.locator('[data-start-button]');
  if (ctx.touch) await expectTarget(start, 40);
  await press(ctx, start);
  const menu = page.getByRole('menu', { name: m.startMenu.label });
  await expect(menu).toBeVisible();
  await shoot(ctx, '03', 'start-menu');
  await press(
    ctx,
    menu.getByRole('menuitem', { name: new RegExp(m.startMenu.allPrograms) }),
  );
  await expect(
    page.getByRole('menu', { name: m.startMenu.allPrograms }),
  ).toBeVisible();
  await shoot(ctx, '04', 'all-programs');
  await press(ctx, start);
  await expect(menu).toBeHidden();
}

interface Progress {
  active: unknown;
  queue: unknown[];
  scripts: Record<string, { runs: number }>;
}

function progress(page: Page) {
  return page.evaluate<Record<string, Progress>>(
    `JSON.parse(localStorage.getItem('still-online:v1:messenger') ?? '{}').state?.progress?.contacts ?? {}`,
  );
}

const chatOf = (page: Page, id: string) =>
  page.locator(`[data-window-id]:has([data-chat-contact="${id}"])`);

/** Answers `id`'s chat with the first reply until it stops asking. */
async function answerChat(ctx: Ctx, id: string) {
  const { page, m } = ctx;
  const chat = chatOf(page, id);
  if ((await chat.count()) === 0) {
    const chats = page.locator('[data-window-id]:has([data-chat-contact])');
    for (let n = await chats.count(); n > 0; n = await chats.count()) {
      await chats
        .first()
        .getByRole('button', { name: m.wm.close, exact: true })
        .dispatchEvent('click');
      await expect(chats).toHaveCount(n - 1);
    }
    const item = page
      .getByRole('group', { name: m.messenger.list.contacts })
      .locator(`[data-contact-id="${id}"]`);
    if (ctx.touch) await tap(item);
    else await item.dblclick();
  }
  await expect(chat).toBeVisible();
  const replies = chat
    .getByRole('group', { name: m.messenger.chat.replies })
    .getByRole('button');
  for (let i = 0; i < 40; i++) {
    const ready = await replies
      .first()
      .waitFor({ timeout: 4000 })
      .then(
        () => true,
        () => false,
      );
    if (!ready) break;
    await replies.first().dispatchEvent('click');
    const send = chat.getByRole('button', {
      name: m.messenger.chat.send,
      exact: true,
    });
    if (ctx.touch) await expect(send).toBeInViewport();
    await send.dispatchEvent('click');
    await page.waitForTimeout(300);
  }
  return chat;
}

/** Signs in and plays every friend who waits for a reply (or has a chat running) until nobody does. */
async function playDay(ctx: Ctx) {
  const { page, m } = ctx;
  await openApp(ctx, m.apps.messenger.title);
  await press(
    ctx,
    page.getByRole('button', { name: m.messenger.signIn.submit, exact: true }),
  );
  const list = page.getByRole('group', { name: m.messenger.list.contacts });
  await expect(list).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(3000);
  const played = new Set<string>();
  let quiet = 0;
  for (let pass = 0; pass < 60 && quiet < 3; pass++) {
    const waiting = await list
      .locator('[data-awaiting-reply="true"]')
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute('data-contact-id') ?? ''),
      );
    const busy = Object.entries(await progress(page))
      .filter(([, c]) => c.active !== null || c.queue.length > 0)
      .map(([id]) => id);
    const next = waiting[0] || busy[0];
    if (!next) {
      quiet++;
      await page.waitForTimeout(1000);
      continue;
    }
    quiet = 0;
    played.add(next);
    await answerChat(ctx, next);
  }
  expect(played.size, 'friends played').toBeGreaterThan(0);
  return played;
}

/** Opens Web Explorer and dials in from its offline page (unless online). */
async function openWeb(ctx: Ctx) {
  const { page, m } = ctx;
  await openApp(ctx, m.apps.browser.title);
  const web = page.getByRole('region', { name: ends(m.apps.browser.title) });
  const offline = web.getByTestId('page-cannot-be-displayed');
  await expect(
    offline.or(web.getByRole('status').last()).first(),
  ).toBeVisible();
  await expect(async () => {
    if (await offline.isVisible())
      await press(
        ctx,
        offline.getByRole('button', { name: m.browser.error.connect }),
      );
    await expect(offline).toHaveCount(0, { timeout: 4_000 });
  }).toPass({ timeout: 20_000 });
  await expect(web.getByRole('status').last()).toHaveText(
    m.browser.status.done,
    { timeout: 10_000 },
  );
  if (ctx.device === 'desktop')
    await web
      .getByRole('button', { name: m.wm.maximize, exact: true })
      .dispatchEvent('click');
  return web;
}

async function go(ctx: Ctx, web: Locator, url: string) {
  const address = web.getByLabel(ctx.m.browser.address, { exact: true });
  await press(ctx, address);
  await address.fill(url);
  await address.press('Enter');
  await expect(web.getByRole('status').last()).toHaveText(
    ctx.m.browser.status.done,
    { timeout: 10_000 },
  );
}

/** Mail: Send/Recv, the newest message open. Returns the window. */
async function mail(ctx: Ctx, nn: string) {
  const { page, m } = ctx;
  await openApp(ctx, m.apps.mail.title);
  const win = page.getByRole('region', { name: ends(m.apps.mail.title) });
  if (ctx.device === 'desktop')
    await win
      .getByRole('button', { name: m.wm.maximize, exact: true })
      .dispatchEvent('click');
  await press(ctx, win.getByRole('button', { name: m.mail.ui.sendRecv }));
  const rows = win
    .getByRole('table', { name: m.mail.ui.messages })
    .getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 15_000 });
  await page.waitForTimeout(1500);
  await press(ctx, rows.nth(1));
  await expect(
    win.getByRole('region', { name: m.mail.ui.preview }),
  ).not.toBeEmpty();
  await shoot(ctx, nn, 'mail');
  await closeAll(ctx);
}

/**
 * Keyboard rubric: Notepad's text box stays on screen when the viewport loses `keyboard` px to an
 * on-screen keyboard while it is focused.
 */
async function keyboard(ctx: Ctx, nn: string, keyboardPx: number) {
  const { page, m } = ctx;
  await openApp(ctx, m.apps.notepad.label);
  const notepad = page.getByRole('region', {
    name: ends(m.apps.notepad.label),
  });
  const doc = notepad.getByLabel(m.notepad.document);
  await tap(doc);
  await doc.pressSequentially('still online, on a phone. ');
  const size = page.viewportSize()!;
  await page.setViewportSize({
    width: size.width,
    height: size.height - keyboardPx,
  });
  await expect(doc).toBeFocused();
  await expect(doc).toBeInViewport();
  const box = (await notepad.boundingBox())!;
  expect(box.y + box.height, 'Notepad above the keyboard').toBeLessThanOrEqual(
    size.height - keyboardPx + 0.5,
  );
  await shoot(ctx, nn, 'keyboard');
  await page.setViewportSize(size);
  await closeAll(ctx);
}

/**
 * Orientation rubric: rotates with `win` open, checks it is still usable (on screen; on a phone
 * full width with a finger-sized Close button), shoots it, and rotates back.
 */
async function rotate(ctx: Ctx, nn: string, win: Locator) {
  const { page, m } = ctx;
  const size = page.viewportSize()!;
  await page.setViewportSize({ width: size.height, height: size.width });
  await page.waitForTimeout(400);
  await expect(win).toBeInViewport();
  const close = win.getByRole('button', { name: m.wm.close, exact: true });
  await expect(close.first()).toBeInViewport();
  if (ctx.device.startsWith('phone')) {
    // 36 px targets are the phone rule; a tablet's 36 px title bar is checked separately.
    await expectTarget(close.first(), 36);
    const b = (await win.boundingBox())!;
    expect(b.width, 'full width after rotating').toBeCloseTo(size.height, 0);
  }
  await shoot(ctx, nn, 'rotated');
  await page.setViewportSize(size);
  await page.waitForTimeout(400);
  await expect(win).toBeInViewport();
}

async function setUp(
  page: Page,
  info: TestInfo,
  day: number,
  language: Locale,
  gender: Gender,
): Promise<Ctx> {
  const device = (
    info.project.name === 'chromium' ? 'desktop' : info.project.name
  ) as Device;
  const ctx: Ctx = {
    page,
    device,
    m: (language === 'de' ? de : en) as Messages,
    suffix: gender === 'boy' ? `boy-${language}` : language,
    touch: device !== 'desktop',
    audit: {},
  };
  if (device === 'desktop')
    await page.setViewportSize({ width: 1280, height: 800 });
  await quietIdle(page);
  if (day > 1) await seedStoryDay(page, day, dayScripts(day));
  await boot(ctx, day, language, gender);
  return ctx;
}

async function finish(ctx: Ctx, info: TestInfo, problems: string[]) {
  const audit = info.outputPath('small-targets.json');
  writeFileSync(audit, JSON.stringify(ctx.audit, null, 2));
  await info.attach('small-targets.json', {
    path: audit,
    contentType: 'application/json',
  });
  expect(problems).toEqual([]);
}

test('M4 review: day 1 as a girl in English, phone portrait @review @phone', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'phone', 'phone portrait only');
  test.setTimeout(600_000);
  const problems = watch(page);
  const ctx = await setUp(page, info, 1, 'en', 'girl');
  const { m } = ctx;
  await startMenu(ctx);

  await openApp(ctx, m.apps.dialup.label);
  const dialup = page.getByRole('region', { name: m.apps.dialup.title });
  const dial = dialup.getByRole('button', { name: 'Dial', exact: true });
  await dial.scrollIntoViewIfNeeded();
  await shoot(ctx, '05', 'dialup');
  await tap(dial);
  await expect(dialup).toHaveCount(0, { timeout: 20_000 });

  await mail(ctx, '06');
  await playDay(ctx);
  await shoot(ctx, '07', 'messenger');
  const chat = await answerChat(ctx, 'jess');
  await expectTarget(
    chat.getByRole('button', { name: m.messenger.chat.send, exact: true }),
    36,
  );
  await shoot(ctx, '08', 'chat-jess');
  await rotate(ctx, '09', chat);
  await closeAll(ctx);

  const web = await openWeb(ctx);
  await go(ctx, web, 'http://searchly.example/');
  await shoot(ctx, '10', 'searchly');
  await go(ctx, web, 'http://tinfoilcomets.example/');
  await shoot(ctx, '11', 'tinfoilcomets');
  await go(ctx, web, 'http://friendspace.example/jess');
  await shoot(ctx, '12', 'friendspace-jess');
  await closeAll(ctx);

  await tap(page.locator('[data-start-button]'));
  await tap(page.getByRole('menuitem', { name: 'My Documents', exact: true }));
  const docs = page.getByRole('region', { name: 'My Documents' });
  await expect(docs).toBeVisible();
  await shoot(ctx, '13', 'my-documents');
  await tap(docs.getByRole('option', { name: /homework_math/ }));
  await expect(
    page.getByRole('region', { name: /homework_math.*Notepad$/ }),
  ).toBeVisible();
  await shoot(ctx, '14', 'notepad');
  await closeAll(ctx);

  await keyboard(ctx, '15', 330);

  await openApp(ctx, m.apps.mines.title);
  const mines = page.getByRole('region', { name: ends(m.apps.mines.title) });
  await tap(
    mines
      .getByRole('group', { name: m.mines.field })
      .locator('[data-index="40"]'),
  );
  await shoot(ctx, '16', 'mines');
  await closeAll(ctx);

  // The wallpaper by long-press, then Turn Off.
  await longPress(page, page.getByTestId('desktop'));
  await tap(page.getByRole('menuitem', { name: m.desktop.menu.properties }));
  const display = page.getByRole('region', { name: m.apps.display.title });
  await tap(display.getByRole('tab', { name: m.display.tabs.desktop }));
  const tulips = display.getByRole('option', { name: m.wallpapers.tulips });
  await tulips.scrollIntoViewIfNeeded();
  await tap(tulips);
  await shoot(ctx, '17', 'display');
  await tap(display.getByRole('button', { name: m.common.ok }));
  await expect(display).toHaveCount(0);
  await shoot(ctx, '18', 'wallpaper');
  await tap(page.locator('[data-start-button]'));
  await tap(page.getByRole('menuitem', { name: m.startMenu.turnOff }));
  await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 10_000 });
  await shoot(ctx, '19', 'turned-off');
  await finish(ctx, info, problems);
});

test.describe('German', () => {
  test.use({ locale: 'de-DE' });

  test('M4 review: Tag 6 als Junge auf Deutsch, Handy quer @review @phone', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'phone-landscape', 'phone landscape only');
    test.setTimeout(600_000);
    const problems = watch(page);
    const ctx = await setUp(page, info, 6, 'de', 'boy');
    const { m } = ctx;
    await startMenu(ctx);

    const played = await playDay(ctx);
    await shoot(ctx, '05', 'messenger');
    for (const id of ['dex', 'marco'] as const) {
      if (!played.has(id)) continue;
      const chat = await answerChat(ctx, id);
      await shoot(ctx, id === 'dex' ? '06' : '07', `chat-${id}`);
      if (id === 'dex') await rotate(ctx, '08', chat);
    }
    await closeAll(ctx);

    await mail(ctx, '09');
    const web = await openWeb(ctx);
    await go(ctx, web, 'http://kickflipkings.example/');
    await shoot(ctx, '10', 'kickflip');
    await go(ctx, web, 'http://friendspace.example/jess');
    await shoot(ctx, '11', 'friendspace-jess');
    await go(ctx, web, 'http://pixlog.example/jess');
    await shoot(ctx, '12', 'pixlog-jess');
    await closeAll(ctx);

    await openApp(ctx, m.apps.amplifier.title);
    await expect(
      page.getByRole('region', { name: ends(m.apps.amplifier.title) }),
    ).toBeVisible();
    await shoot(ctx, '13', 'amplifier');
    await closeAll(ctx);

    await openApp(ctx, m.apps.paint.label);
    const paint = page.getByRole('region', { name: ends(m.apps.paint.label) });
    const canvas = paint.getByRole('img', { name: m.paint.picture });
    const box = (await canvas.boundingBox())!;
    await swipe(
      page,
      { x: box.x + 20, y: box.y + 40 },
      { x: box.x + 160, y: box.y + 90 },
    );
    await shoot(ctx, '14', 'paint');
    await closeAll(ctx);

    // A landscape phone has 412 px: the keyboard takes about half.
    await keyboard(ctx, '15', 200);
    await finish(ctx, info, problems);
  });
});

test('M4 review: day 10 as a girl in English, tablet @review @tablet', async ({
  page,
}, info) => {
  test.setTimeout(600_000);
  const problems = watch(page);
  const ctx = await setUp(page, info, 10, 'en', 'girl');
  const { m } = ctx;
  await startMenu(ctx);

  // Title bars are 36 px on a tablet.
  await openApp(ctx, m.apps.mycomputer.title);
  const computer = page.getByRole('region', { name: m.apps.mycomputer.title });
  await expect(computer).toBeVisible();
  const bar = (await computer.locator('.title-bar').first().boundingBox())!;
  expect(bar.height, 'tablet title bar').toBeGreaterThanOrEqual(35.5);
  await closeAll(ctx);

  await playDay(ctx);
  await answerChat(ctx, 'marco');
  await shoot(ctx, '05', 'chat-marco');
  await closeAll(ctx);

  await mail(ctx, '06');
  const web = await openWeb(ctx);
  await go(ctx, web, 'http://pixlog.example/album?id=marco-rec-hall&n=6');
  await shoot(ctx, '07', 'pixlog-show-album');
  await go(ctx, web, 'http://friendspace.example/band/velvet-lantern');
  await shoot(ctx, '08', 'band');

  // Four floating windows: Web Explorer, Messenger and a chat, Notepad, dragged and resized.
  // Web Explorer now covers the desktop icons, so they come from the Start menu.
  const fromStart = async (name: string) => {
    await tap(page.locator('[data-start-button]'));
    await tap(
      page
        .getByRole('menu', { name: m.startMenu.label })
        .getByRole('menuitem', { name, exact: true }),
    );
  };
  await fromStart(m.apps.messenger.title);
  await answerChat(ctx, 'jess');
  await fromStart(m.apps.notepad.label);
  const notepad = page.getByRole('region', {
    name: ends(m.apps.notepad.label),
  });
  const before = (await notepad.boundingBox())!;
  const grab = { x: before.x + 80, y: before.y + 18 };
  await swipe(page, grab, { x: grab.x - 120, y: grab.y + 80 });
  await expect
    .poll(async () => (await notepad.boundingBox())?.x)
    .toBeCloseTo(before.x - 120, 0);
  const moved = (await notepad.boundingBox())!;
  const corner = {
    x: moved.x + moved.width + 4,
    y: moved.y + moved.height + 4,
  };
  await swipe(page, corner, { x: corner.x + 80, y: corner.y + 40 });
  await expect
    .poll(async () => (await notepad.boundingBox())?.width)
    .toBeCloseTo(moved.width + 80, 0);
  await expect(page.locator('[data-window-id]')).toHaveCount(4);
  await shoot(ctx, '09', 'four-windows');
  await rotate(ctx, '10', notepad);
  await closeAll(ctx);

  // A tablet keyboard takes about a third (768 − 260 = 508 px stays a tablet, not a phone).
  await keyboard(ctx, '11', 260);
  await finish(ctx, info, problems);
});

test('M4 review: desktop regression at 1280×800, day 6 as a girl in English @review', async ({
  page,
}, info) => {
  test.setTimeout(600_000);
  const problems = watch(page);
  const ctx = await setUp(page, info, 6, 'en', 'girl');
  const { m } = ctx;
  await startMenu(ctx);

  await playDay(ctx);
  // As in v05-W4: Jess's thread alone and maximized.
  await closeAll(ctx);
  await openApp(ctx, m.apps.messenger.title);
  const list = page.getByRole('group', { name: m.messenger.list.contacts });
  await expect(list).toBeVisible();
  await list.locator('[data-contact-id="jess"]').dblclick();
  const chat = chatOf(page, 'jess');
  await expect(chat).toBeVisible();
  await chat
    .getByRole('button', { name: m.wm.maximize, exact: true })
    .dispatchEvent('click');
  await shoot(ctx, '05', 'chat-jess');
  await closeAll(ctx);

  await mail(ctx, '06');
  const web = await openWeb(ctx);
  await go(ctx, web, 'http://friendspace.example/jess');
  await shoot(ctx, '07', 'friendspace-jess');
  await go(ctx, web, 'http://pixlog.example/jess');
  await shoot(ctx, '08', 'pixlog-jess');
  await closeAll(ctx);
  await finish(ctx, info, problems);
});
