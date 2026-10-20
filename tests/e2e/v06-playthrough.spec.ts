// v0.6 M3-02: the phone playthrough, by touch only (taps, long-presses and swipes; no dblclick,
// no hover). Day 1 as a girl in English and day 10 as a boy in German, plus the touch easter
// eggs: the Konami swipe and Fluff. Runs in `phone` (portrait) and `phone-landscape`.
import { expect, test, type Locator, type Page } from '@playwright/test';
import { LEVELS, createBoard, reveal } from '../../src/apps/mines/board';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import {
  logInTouch,
  longPress,
  openAppTouch,
  pickGender,
  quietIdle,
  swipe,
  tap,
} from './helpers';
import { seedStoryDay } from './week2';

type Messages = typeof de;

/** Fails the test on any console error or page error. */
function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  return problems;
}

async function expectNoSideScroll(page: Page, what: string) {
  const [scrollWidth, width] = await page.evaluate<[number, number]>(
    '[document.scrollingElement.scrollWidth, innerWidth]',
  );
  expect(scrollWidth, `${what}: no sideways page scroll`).toBeLessThanOrEqual(
    width,
  );
}

/** A screenshot in the test's output folder, after the page has settled. */
async function shot(page: Page, name: string) {
  await page.waitForTimeout(400);
  await expectNoSideScroll(page, name);
  await page.screenshot({ path: test.info().outputPath(`${name}.png`) });
}

const front = (page: Page) =>
  page.locator('[data-window-id][data-active="true"]');

/** Taps the Close button of every open window, front first. */
async function closeAll(page: Page, m: Messages) {
  const windows = page.locator('[data-window-id]');
  for (let n = await windows.count(); n > 0; n = await windows.count()) {
    const win = (await front(page).count()) ? front(page) : windows.first();
    await tap(
      win.getByRole('button', { name: m.wm.close, exact: true }).first(),
    );
    await expect(windows).toHaveCount(n - 1);
  }
}

/** Sends Stapley away (his first-login greeting sits over the bottom of a phone screen). */
async function hideStapley(page: Page, m: Messages) {
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toBeVisible({ timeout: 10_000 });
  await tap(balloon.getByRole('button', { name: m.assistant.hide }));
  await expect(page.locator('[data-assistant]')).toHaveCount(0);
}

interface Progress {
  status: string;
  active: unknown;
  queue: unknown[];
  scripts: Record<string, { runs: number }>;
}

/** Each friend's script progress, from the saved Messenger store. */
function progress(page: Page) {
  return page.evaluate<Record<string, Progress>>(
    `JSON.parse(localStorage.getItem('still-online:v1:messenger') ?? '{}').state?.progress?.contacts ?? {}`,
  );
}

/** Answers `contactId`'s open chat with the first reply until it stops asking. */
async function answerChat(page: Page, m: Messages, contactId: string) {
  const list = page.getByRole('group', { name: m.messenger.list.contacts });
  const chat = page.locator(
    `[data-window-id]:has([data-chat-contact="${contactId}"])`,
  );
  if ((await chat.count()) === 0) {
    await closeChats(page, m);
    await tap(list.locator(`[data-contact-id="${contactId}"]`));
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
    if (!ready) return chat;
    await expect(replies.first()).toBeInViewport();
    await tap(replies.first());
    const send = chat.getByRole('button', {
      name: m.messenger.chat.send,
      exact: true,
    });
    await expect(send).toBeInViewport();
    await tap(send);
    await page.waitForTimeout(300);
  }
  return chat;
}

/** Closes every open chat window (not the contact list). */
async function closeChats(page: Page, m: Messages) {
  const chats = page.locator('[data-window-id]:has([data-chat-contact])');
  for (let n = await chats.count(); n > 0; n = await chats.count()) {
    await tap(
      chats.first().getByRole('button', { name: m.wm.close, exact: true }),
    );
    await expect(chats).toHaveCount(n - 1);
  }
}

/**
 * Plays every friend who is waiting for a reply until nobody is: the same pass a player makes
 * through the contact list. Returns the ids that were played.
 */
async function playEveryone(page: Page, m: Messages): Promise<Set<string>> {
  const played = new Set<string>();
  const list = page.getByRole('group', { name: m.messenger.list.contacts });
  let quiet = 0;
  for (let pass = 0; pass < 30 && quiet < 3; pass++) {
    const waiting = await list
      .locator('[data-awaiting-reply="true"]')
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute('data-contact-id')),
      );
    const busy = Object.entries(await progress(page))
      .filter(([, c]) => c.active !== null || c.queue.length > 0)
      .map(([id]) => id);
    if (waiting.length === 0 && busy.length === 0) {
      quiet++;
      await page.waitForTimeout(1000);
      continue;
    }
    quiet = 0;
    const next = (waiting[0] ?? null) || busy[0];
    if (!next) continue;
    played.add(next);
    await answerChat(page, m, next);
  }
  return played;
}

/** Long-press on the desktop → Properties → Desktop tab: picks `wallpaper` and taps OK. */
async function chooseWallpaper(page: Page, m: Messages, wallpaper: string) {
  await longPress(page, page.getByTestId('desktop'));
  const properties = page.getByRole('menuitem', {
    name: m.desktop.menu.properties,
  });
  await expect(properties).toBeVisible();
  await tap(properties);
  const display = page.getByRole('region', { name: m.apps.display.title });
  await tap(display.getByRole('tab', { name: m.display.tabs.desktop }));
  const option = display.getByRole('option', { name: wallpaper });
  await option.scrollIntoViewIfNeeded();
  await tap(option);
  await expect(option).toHaveAttribute('aria-selected', 'true');
  await shot(page, 'display-desktop');
  await tap(display.getByRole('button', { name: m.common.ok }));
  await expect(display).toHaveCount(0);
}

/** Opens Web Explorer and dials in from its offline page, unless already online. */
async function openWeb(page: Page, m: Messages, label: string) {
  await openAppTouch(page, label);
  const web = page.getByRole('region', {
    name: new RegExp(`${m.apps.browser.title}$`),
  });
  const offline = web.getByTestId('page-cannot-be-displayed');
  const status = web.getByRole('status').last();
  await expect(offline.or(status).first()).toBeVisible();
  await expect(async () => {
    if (await offline.isVisible())
      await tap(offline.getByRole('button', { name: m.browser.error.connect }));
    await expect(offline).toHaveCount(0, { timeout: 4_000 });
  }).toPass({ timeout: 20_000 });
  await expectDone(web, m);
  return web;
}

async function expectDone(web: Locator, m: Messages) {
  // `.last()`: the status bar; some pages have their own live regions.
  await expect(web.getByRole('status').last()).toHaveText(
    m.browser.status.done,
    { timeout: 10_000 },
  );
}

/** Favorites sheet → `name`. */
async function favorite(web: Locator, m: Messages, name: string) {
  await tap(
    web
      .getByRole('toolbar', { name: m.browser.toolbar.label })
      .getByRole('button', { name: m.browser.toolbar.favorites }),
  );
  const sheet = web.getByTestId('favorites-sheet');
  await tap(sheet.getByRole('button', { name, exact: true }));
  await expect(sheet).toBeHidden();
  await expectDone(web, m);
}

async function goTouch(web: Locator, m: Messages, url: string) {
  const address = web.getByLabel(m.browser.address, { exact: true });
  await tap(address);
  await address.fill(url);
  await address.press('Enter');
  await expectDone(web, m);
}

test('day 1 as a girl in English, by touch @phone', async ({ page }) => {
  test.setTimeout(300_000);
  const m = en;
  const problems = watch(page);
  await logInTouch(page, 'Ada', { gender: 'girl' });
  await shot(page, 'd1-desktop');
  await hideStapley(page, m);

  // Connect: Connect to the Internet → Dial.
  await openAppTouch(page, 'Connect to the Internet');
  const dialup = page.getByRole('region', { name: 'Connect to the Internet' });
  const dial = dialup.getByRole('button', { name: 'Dial', exact: true });
  await dial.scrollIntoViewIfNeeded();
  await tap(dial);
  await expect(dialup).toHaveCount(0, { timeout: 20_000 });

  // Mail: fetch, then read every message (a tap opens it full screen, Back returns).
  await openAppTouch(page, 'Mail');
  const mail = page.getByRole('region', { name: /Mail$/ });
  await tap(mail.getByRole('button', { name: 'Send/Recv' }));
  const rows = mail.getByRole('table', { name: 'Messages' }).getByRole('row');
  await expect(rows).not.toHaveCount(1, { timeout: 15_000 });
  await page.waitForTimeout(1500);
  const count = (await rows.count()) - 1;
  expect(count).toBeGreaterThan(0);
  for (let i = 1; i <= count; i++) {
    await tap(rows.nth(i));
    const preview = mail.getByRole('region', { name: 'Preview' });
    await expect(preview).not.toBeEmpty();
    if (i === 1) await shot(page, 'd1-mail');
    await tap(mail.getByRole('button', { name: 'Back' }));
    await expect(preview).toHaveCount(0);
  }
  await expect(mail.locator('tbody tr[data-unread="true"]')).toHaveCount(0);
  await closeAll(page, m);

  // Messenger: sign in and play every online friend's day-1 script to its end.
  await openAppTouch(page, 'Messenger');
  await tap(page.getByRole('button', { name: 'Sign in' }));
  const contacts = page.getByRole('group', { name: 'Contacts' });
  await expect(contacts).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(3000);
  await shot(page, 'd1-messenger');
  const played = await playEveryone(page, m);
  const after = await progress(page);
  const online = await contacts
    .locator('[data-contact-id]:not([data-status="offline"])')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-contact-id')!));
  expect(online.length).toBeGreaterThan(0);
  for (const id of online) {
    const c = after[id];
    expect(played, `${id} was played`).toContain(id);
    expect(c?.active, `${id}'s script ended`).toBeNull();
    expect(c?.queue, `${id} has nothing queued`).toEqual([]);
  }
  await answerChat(page, m, 'jess');
  await shot(page, 'd1-chat');
  await closeAll(page, m);

  // Web Explorer: Searchly (a search), then two sites from the Favorites sheet.
  const web = await openWeb(page, m, 'Web Explorer');
  await favorite(web, m, m.browser.defaultFavorites.searchly);
  const search = web.getByLabel(m.sites.searchly.searchLabel);
  await tap(search);
  await search.fill('tinfoil comets');
  await search.press('Enter');
  await expectDone(web, m);
  await expect(web.getByTestId('browser-page')).toContainText('tinfoil', {
    ignoreCase: true,
  });
  await shot(page, 'd1-searchly');
  await favorite(web, m, m.browser.defaultFavorites.tinfoilcomets);
  await expect(web.getByLabel('Address')).toHaveValue(
    'http://tinfoilcomets.example/',
  );
  await favorite(web, m, m.browser.defaultFavorites.friendspace);
  await expect(web.getByLabel('Address')).toHaveValue(/friendspace\.example/);
  await shot(page, 'd1-friendspace');
  await closeAll(page, m);

  // My Documents: a tap opens a file in Notepad (notes.txt is the player's own, still empty).
  await openAppTouch(page, 'My Documents');
  const docs = page.getByRole('region', { name: 'My Documents' });
  await tap(
    docs
      .getByRole('listbox', { name: 'My Documents' })
      .getByRole('option', { name: /homework_math/ }),
  );
  const notepad = page.getByRole('region', { name: /homework_math.*Notepad$/ });
  await expect(notepad.getByLabel('Notepad document')).not.toHaveValue('');
  await shot(page, 'd1-notepad');
  await closeAll(page, m);

  // The wallpaper: long-press the desktop → Properties.
  await chooseWallpaper(page, m, m.wallpapers.tulips);
  await shot(page, 'd1-wallpaper');

  // Turn Off.
  await tap(page.locator('[data-start-button]'));
  await tap(page.getByRole('menuitem', { name: m.startMenu.turnOff }));
  await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 10_000 });
  expect(problems).toEqual([]);
});

test.describe('German', () => {
  test.use({ locale: 'de-DE' });

  test('Tag 10 als Junge auf Deutsch, per Touch @phone', async ({ page }) => {
    test.setTimeout(300_000);
    const m = de;
    const problems = watch(page);
    await quietIdle(page);
    // Only Marco's day-10 chat (and its crew thread) is left to play, and Theo's poster is
    // already earned (W1 tests that chat), so the day starts where the playthrough needs it.
    await seedStoryDay(page, 10, { marco: ['day10', 'loadInCrew'] });
    await page.evaluate(() => {
      const key = 'still-online:v1:world';
      const saved = JSON.parse(localStorage.getItem(key) ?? '{}') as {
        state?: { unlocks?: string[] };
      };
      if (saved.state) saved.state.unlocks = ['lantern-poster'];
      localStorage.setItem(key, JSON.stringify(saved));
    });
    await page.goto('./?speed=fast');
    await tap(page.getByTestId('boot-screen'));
    await expect(page.getByTestId('login-screen')).toBeVisible();
    const field = page.getByLabel(m.login.yourName);
    await tap(field);
    await field.fill('Ada');
    await pickGender(page, 'boy');
    await tap(page.getByRole('button', { name: 'Als Ada anmelden' }));
    await expect(page.getByTestId('desktop')).toBeVisible();
    await hideStapley(page, m);

    // Pixlog: Marco's show album, from his profile.
    const web = await openWeb(page, m, 'Web Explorer');
    await goTouch(web, m, 'http://pixlog.example/marco');
    // In landscape the album sits below the fold: the tap scrolls the page area first.
    await tap(
      web
        .getByTestId('browser-page')
        .locator('a[href*="marco-rec-hall"]')
        .first(),
    );
    await expectDone(web, m);
    await expect(web).toContainText('juz. platz für 80. (83)');
    // Page through by tap to the photo with the boy's caption.
    const album = web.getByTestId('browser-page');
    for (let n = 2; n <= 6; n++) {
      await tap(album.getByText('Weiter »'));
      await expect(album).toContainText(`Foto ${n} von 6`);
    }
    await expect(album).toContainText('crew: der zwerg. hat den verstärker');
    await shot(page, 'd10-album');
    await closeAll(page, m);

    // Theo's poster as the wallpaper.
    await chooseWallpaper(page, m, m.wallpapers.lanternPoster);
    await expect
      .poll(() =>
        page.evaluate(() => localStorage.getItem('still-online:v1:settings')),
      )
      .toContain('lantern-poster');
    await shot(page, 'd10-wallpaper');

    // One game of Minen, on a pinned board: every safe cell by tap wins it.
    await page.evaluate(`Math.random = () => 0.5`);
    await openAppTouch(page, m.apps.mines.title);
    const game = page.getByRole('region', {
      name: new RegExp(`${m.apps.mines.title}$`),
    });
    const fieldGroup = game.getByRole('group', { name: m.mines.field });
    const cell = (i: number) => fieldGroup.locator(`[data-index="${i}"]`);
    const { width, height } = LEVELS.beginner;
    const first = 4 * width + 4;
    const board = reveal(
      createBoard(LEVELS.beginner, (0.5 * 0x100000000) >>> 0),
      first,
    );
    await tap(cell(first));
    for (let i = 0; i < width * height; i++) {
      if (board.cells[i]!.mine || board.cells[i]!.revealed) continue;
      if (
        (await cell(i).getAttribute('aria-label'))?.endsWith(
          m.mines.state.hidden,
        )
      )
        await tap(cell(i));
    }
    const won = game.getByRole('dialog');
    await expect(won).toBeVisible();
    await shot(page, 'd10-mines');
    await tap(won.getByRole('button', { name: m.common.ok }));
    await closeAll(page, m);

    // Messenger: Marco's show-night chat and his crew thread.
    await openAppTouch(page, 'Messenger');
    await tap(page.getByRole('button', { name: m.messenger.signIn.submit }));
    await expect(
      page.getByRole('group', { name: m.messenger.list.contacts }),
    ).toBeVisible({ timeout: 15_000 });
    // His show-night chat, then (5 game minutes later) the crew thread: answer while he talks.
    for (let i = 0; i < 90; i++) {
      const marco = (await progress(page)).marco;
      if (marco?.scripts.loadInCrew?.runs && marco.active === null) break;
      if (marco?.active) await answerChat(page, m, 'marco');
      else await page.waitForTimeout(1000);
    }
    expect((await progress(page)).marco?.scripts.loadInCrew?.runs).toBe(1);
    const chat = await answerChat(page, m, 'marco');
    await expect(chat.getByRole('log')).toContainText('zwerg. crew-bericht');
    await shot(page, 'd10-marco');
    expect(problems).toEqual([]);
  });
});

test('the Konami swipe unlocks Retro Grid, and Fluff is dragged and petted by touch @phone', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const m = en;
  const problems = watch(page);
  await logInTouch(page);
  await hideStapley(page, m);

  // On the desktop background, clear of the icon columns.
  const desk = (await page.getByTestId('desktop').boundingBox())!;
  const c = { x: desk.x + desk.width * 0.72, y: desk.y + desk.height * 0.45 };
  const d = 60;
  const moves = {
    up: [
      { x: c.x, y: c.y + d },
      { x: c.x, y: c.y - d },
    ],
    down: [
      { x: c.x, y: c.y - d },
      { x: c.x, y: c.y + d },
    ],
    left: [
      { x: c.x + d, y: c.y },
      { x: c.x - d, y: c.y },
    ],
    right: [
      { x: c.x - d, y: c.y },
      { x: c.x + d, y: c.y },
    ],
  } as const;
  const unlocks = () =>
    page.evaluate<string[]>(
      `JSON.parse(localStorage.getItem('still-online:v1:world')).state.unlocks`,
    );
  for (const dir of [
    'up',
    'up',
    'down',
    'down',
    'left',
    'right',
    'left',
  ] as const)
    await swipe(page, moves[dir][0], moves[dir][1]);
  await swipe(page, moves.right[0], moves.right[1]);
  await page.touchscreen.tap(c.x, c.y);
  expect(await unlocks()).not.toContain('konami');
  await page.touchscreen.tap(c.x, c.y);
  await expect(page.getByText(m.toast.cheatTitle)).toBeVisible();
  expect(await unlocks()).toContain('konami');
  await shot(page, 'konami');

  // The swipes opened nothing and the page never panned.
  await expect(page.locator('[data-window-id]')).toHaveCount(0);
  expect(await page.evaluate('scrollY')).toBe(0);

  // Fluff: let out from the hidden tray icons, he drops onto the taskbar.
  await tap(page.getByRole('button', { name: m.taskbar.showHidden }));
  await tap(page.getByRole('button', { name: m.pet.tray }));
  const pet = page.locator('[data-pet]');
  const sheep = pet.getByRole('button', { name: m.pet.label });
  // Every mode he passes through (a bleat is short, and a slow poll could miss it).
  await pet.evaluate((el) => {
    const seen: string[] = [];
    (window as unknown as { petModes: string[] }).petModes = seen;
    new MutationObserver(() =>
      seen.push(el.getAttribute('data-mode') ?? ''),
    ).observe(el, { attributeFilter: ['data-mode'] });
  });
  const modes = () => page.evaluate<string[]>('window.petModes.splice(0)');
  /** Waits until Fluff stands still (sitting, grazing or asleep) on the taskbar. */
  const still = () =>
    expect(pet).toHaveAttribute('data-mode', /sit|graze|sleep/, {
      timeout: 20_000,
    });

  // His touch target is at least 36 px tall, though the sprite is 32: it grows 6 px each way
  // (the taskbar covers the part below his feet), so a tap 4 px above the sprite still lands on
  // him, and pets him.
  await still();
  const above = await sheep.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const hit = (y: number) =>
      document.elementFromPoint(x, y)?.closest('[data-pet]') !== null;
    return {
      x,
      y: r.top - 4,
      h: r.height,
      top: hit(r.top - 4),
    };
  });
  expect(above.h).toBeLessThan(36);
  expect(above.top).toBe(true);
  await modes();
  await page.touchscreen.tap(above.x, above.y);
  await expect.poll(modes, { intervals: [50] }).toContain('baa');

  // A finger drags him up and away; he follows it and falls when let go.
  await still();
  const from = (await sheep.boundingBox())!;
  const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const to = { x: start.x - 80, y: start.y - 200 };
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [start],
  });
  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        {
          x: start.x + ((to.x - start.x) * i) / 10,
          y: start.y + ((to.y - start.y) * i) / 10,
        },
      ],
    });
  }
  await expect(pet).toHaveAttribute('data-mode', 'drag');
  // He follows the finger, keeping the grab offset.
  await expect
    .poll(async () => {
      const held = (await sheep.boundingBox())!;
      return Math.hypot(
        held.x + held.width / 2 - to.x,
        held.y + held.height / 2 - to.y,
      );
    })
    .toBeLessThan(8);
  await shot(page, 'fluff-drag');
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  });
  await cdp.detach();
  await expect(pet).not.toHaveAttribute('data-mode', 'drag');
  await expect(pet).toHaveAttribute('data-mode', /walk|sit|graze|baa|sleep/, {
    timeout: 10_000,
  });
  expect(problems).toEqual([]);
});
