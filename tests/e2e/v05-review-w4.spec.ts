import { expect, test, type Locator, type Page } from '@playwright/test';
import { contacts } from '../../src/content/contacts';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import type { Messages } from '../../src/i18n/types';
import { openFromStart, setDay } from './helpers';

// W4 gate (release-ready): one save played the way a player would. Days 6–8 in English as a
// girl, then User Accounts → Boy and the tray → Deutsch, then days 9–10 in German as a boy. Every
// friend's chat is played out each day, then mail, every week-two site, Friendspace and Pixlog.

const DIR = 'docs/review/v05-W4';
const FRIENDS = ['jess', 'kayla', 'pia', 'theo', 'marco', 'dex'] as const;

type Msgs = Messages;

function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  return problems;
}

/**
 * Day 6 on a fresh save with week one done: every script counts as run except the `onDay` scripts
 * of days 6–10 and the follow-up threads that wait on them, so the week plays as it would after
 * a real week one.
 */
async function seedWeekTwo(page: Page) {
  await setDay(page, 6);
  const progress = Object.fromEntries(
    contacts.map(({ contact, scripts }) => {
      const keep = new Set(
        scripts
          .filter((s) => s.trigger.type === 'onDay' && s.trigger.day >= 6)
          .map((s) => s.id),
      );
      for (const s of scripts)
        if (s.trigger.type === 'afterScript' && keep.has(s.trigger.scriptId))
          keep.add(s.id);
      return [
        contact.id,
        {
          everSignedIn: true,
          status: 'online',
          personalMessage: 'initial',
          active: null,
          queue: [],
          scripts: Object.fromEntries(
            scripts
              .filter((s) => !keep.has(s.id))
              .map((s) => [
                s.id,
                {
                  runs: 1,
                  visited: [],
                  trackIds: [],
                  day: s.trigger.type === 'onDay' ? s.trigger.day : 1,
                },
              ]),
          ),
          transcript: [],
          unread: 0,
          presenceDay: 1,
        },
      ];
    }),
  );
  await page.evaluate((contacts) => {
    localStorage.setItem(
      'still-online:v1:messenger',
      JSON.stringify({ version: 1, state: { progress: { contacts } } }),
    );
  }, progress);
}

/** True once `scripts` of `contactId` have run and nothing of theirs is active or queued. */
async function chatDone(
  page: Page,
  contactId: string,
  scripts: readonly string[],
): Promise<boolean> {
  return page.evaluate(
    ({ contactId, scripts }) => {
      const saved = JSON.parse(
        localStorage.getItem('still-online:v1:messenger') ?? '{}',
      ) as {
        state?: {
          progress?: {
            contacts?: Record<
              string,
              {
                active: unknown;
                queue: unknown[];
                scripts: Record<string, { runs: number }>;
              }
            >;
          };
        };
      };
      const c = saved.state?.progress?.contacts?.[contactId];
      if (!c || c.active || c.queue.length) return false;
      return scripts.every((id) => (c.scripts[id]?.runs ?? 0) > 0);
    },
    { contactId, scripts },
  );
}

async function hideTacki(page: Page) {
  for (const name of [en.assistant.hide, de.assistant.hide]) {
    const hide = page.getByRole('button', { name });
    if (await hide.isVisible()) await hide.dispatchEvent('click');
  }
}

async function closeToasts(page: Page) {
  const toasts = page.getByRole('button', {
    name: new RegExp(
      `^(${en.toast.close}|${de.toast.close}|${en.balloon.close}|${de.balloon.close})$`,
    ),
  });
  for (let n = await toasts.count(); n > 0; n = await toasts.count()) {
    await toasts.first().dispatchEvent('click');
    await page.waitForTimeout(100);
  }
}

async function closeAll(page: Page, m: Msgs) {
  const closers = page.getByRole('button', { name: m.wm.close, exact: true });
  for (let n = await closers.count(); n > 0; n = await closers.count()) {
    await closers.last().dispatchEvent('click');
    await expect(closers).toHaveCount(n - 1);
  }
}

async function maximize(win: Locator, m: Msgs) {
  await win
    .getByRole('button', { name: m.wm.maximize, exact: true })
    .dispatchEvent('click');
}

/** Ends the day (Turn Off Computer / Ausschalten), boots into `day` and logs on again. */
async function nextDay(page: Page, m: Msgs, day: number) {
  await page.locator('[data-start-button]').click();
  await page
    .getByRole('menuitem', { name: m.startMenu.turnOff, exact: true })
    .dispatchEvent('click');
  await expect(page.getByTestId('off-screen')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('off-screen').click();
  await expect(page.getByTestId('boot-day')).toHaveText(
    m === de ? `Tag ${day}` : `Day ${day}`,
  );
  await expect(page.getByTestId('login-screen')).toBeVisible({ timeout: 5000 });
  await page
    .getByRole('button', {
      name: m === de ? 'Als Ada anmelden' : 'Log on as Ada',
    })
    .click();
  await expect(page.getByTestId('desktop')).toBeVisible();
}

/**
 * Plays `contactId`'s chats of the day to the end, always taking the first reply, then shoots the
 * thread maximized. `scripts` are the ids that must have run (the day's script and any follow-up).
 */
async function playOut(
  page: Page,
  m: Msgs,
  contactId: string,
  scripts: readonly string[],
  shot: (name: string) => Promise<void>,
  name: string,
) {
  const item = page
    .getByRole('group', { name: m.messenger.list.contacts })
    .locator(`[data-contact-id="${contactId}"]`);
  const chatName = async () => {
    const title = (await item.getAttribute('title')) ?? '';
    return `${title.replace(/ <[^<>]*>( - [^<>]*)?$/, '')} - ${m.messenger.chat.transcript}`;
  };
  const deadline = Date.now() + 150_000;
  let chat: Locator;
  while (!(await chatDone(page, contactId, scripts))) {
    expect(Date.now(), `${contactId} ${scripts.join('+')}`).toBeLessThan(
      deadline,
    );
    chat = page.getByRole('region', { name: await chatName(), exact: true });
    if ((await chat.count()) === 0) {
      await item.dispatchEvent('dblclick');
      await expect(chat).toBeVisible();
    }
    const replies = chat
      .getByRole('group', { name: m.messenger.chat.replies })
      .getByRole('button');
    const ready = await replies
      .first()
      .waitFor({ timeout: 1500 })
      .then(
        () => true,
        () => false,
      );
    if (!ready) continue;
    await replies.first().dispatchEvent('click');
    await chat
      .getByRole('button', { name: m.messenger.chat.send, exact: true })
      .dispatchEvent('click');
    await page.waitForTimeout(300);
  }
  // Alone and maximized, so the end of the thread fills the screen.
  const chats = page.getByRole('region', {
    name: new RegExp(` - ${m.messenger.chat.transcript}$`),
  });
  for (let n = await chats.count(); n > 0; n = await chats.count()) {
    await chats
      .first()
      .getByRole('button', { name: m.wm.close, exact: true })
      .dispatchEvent('click');
    await expect(chats).toHaveCount(n - 1);
  }
  await item.dispatchEvent('dblclick');
  chat = page.getByRole('region', { name: await chatName(), exact: true });
  await expect(chat).toBeVisible();
  await maximize(chat, m);
  await closeToasts(page);
  await shot(name);
  await chat
    .getByRole('button', { name: m.wm.close, exact: true })
    .dispatchEvent('click');
}

/** Opens Web Explorer maximized, dialling in when needed. */
async function openWeb(page: Page, m: Msgs): Promise<Locator> {
  await page
    .getByRole('option', { name: m.apps.browser.title, exact: true })
    .dispatchEvent('dblclick');
  const web = page
    .getByRole('region', { name: new RegExp(`${m.apps.browser.title}$`) })
    .first();
  const connect = web
    .getByTestId('page-cannot-be-displayed')
    .getByRole('button', { name: m === de ? 'Verbinden' : 'Connect' });
  const done = web
    .getByRole('status')
    .last()
    .filter({ hasText: m === de ? 'Fertig' : 'Done' });
  await expect(connect.or(done)).toBeVisible({ timeout: 10_000 });
  if (await connect.isVisible()) await connect.click();
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'online',
    { timeout: 15_000 },
  );
  await maximize(web, m);
  return web;
}

async function go(web: Locator, m: Msgs, url: string) {
  const address = web.getByLabel(m === de ? 'Adresse' : 'Address');
  await address.fill(url);
  await address.press('Enter');
  await expect(web.getByRole('status').last()).toHaveText(
    m === de ? 'Fertig' : 'Done',
    { timeout: 10_000 },
  );
}

/** Each day: the follow-up threads of the day's gender, the friends whose pages are shot. */
const DAYS = [
  { day: 6, m: en, followUps: {}, friend: 'jess', kickflip: '/', cheat: '/' },
  {
    day: 7,
    m: en,
    followUps: {},
    friend: 'kayla',
    kickflip: '/',
    cheat: '/',
  },
  {
    day: 8,
    m: en,
    followUps: { jess: ['lateNight'] },
    friend: 'theo',
    kickflip: '/',
    cheat: '/',
  },
  {
    day: 9,
    m: de,
    followUps: {},
    friend: 'dex',
    kickflip: '/video',
    cheat: '/',
  },
  {
    day: 10,
    m: de,
    followUps: { marco: ['loadInCrew'] },
    friend: 'marco',
    kickflip: '/',
    cheat: '/clips',
  },
] as const satisfies readonly {
  day: number;
  m: Msgs;
  followUps: Partial<Record<(typeof FRIENDS)[number], readonly string[]>>;
  friend: string;
  kickflip: string;
  cheat: string;
}[];

test('W4 gate: days 6–8 English girl, switch, days 9–10 German boy @review', async ({
  page,
}) => {
  test.setTimeout(1_500_000);
  const problems = watch(page);
  await page.setViewportSize({ width: 1280, height: 800 });

  let suffix = 'girl-en';
  const shot = async (name: string) => {
    await hideTacki(page);
    await page.mouse.move(1270, 790);
    await page.waitForTimeout(600);
    await closeToasts(page);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${DIR}/${name}-${suffix}.png` });
  };

  // A fresh visit (no quietIdle: the settings stay as a player has them, but the screensaver
  // would cut in on the fast clock, so it is off as in the other review specs).
  await page.addInitScript(() => {
    const key = 'still-online:v1:settings';
    const saved = JSON.parse(localStorage.getItem(key) ?? '{}') as {
      state?: Record<string, unknown>;
      version?: number;
    };
    const state = saved.state ?? {};
    localStorage.setItem(
      key,
      JSON.stringify({
        version: saved.version ?? 1,
        state: {
          ...state,
          screensaver: {
            ...((state.screensaver as object | undefined) ?? {}),
            minutes: 0,
          },
          awayMinutes: 0,
        },
      }),
    );
  });
  await page.goto('./?speed=fast');
  await seedWeekTwo(page);
  // The running app read the old save; reload so it boots from the seeded one.
  await page.reload();
  await page.getByTestId('boot-screen').click();
  await page.getByLabel('Your name').fill('Ada');
  await page.locator('[role="radio"][data-gender="girl"]').click();
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  for (const d of DAYS) {
    const { m } = d;
    const tag = `d${String(d.day).padStart(2, '0')}`;
    if (d.day > 6) await nextDay(page, m, d.day);

    // Messenger: every friend's chat, played out.
    await page
      .getByRole('option', { name: m.apps.messenger.title, exact: true })
      .dispatchEvent('dblclick');
    await page
      .getByRole('button', { name: m.messenger.signIn.submit, exact: true })
      .click();
    await expect(
      page.getByRole('group', { name: m.messenger.list.contacts }),
    ).toBeVisible();
    for (const id of FRIENDS) {
      const extra: readonly string[] =
        (d.followUps as Partial<Record<string, readonly string[]>>)[id] ?? [];
      await playOut(
        page,
        m,
        id,
        [`day${d.day}`, ...extra],
        shot,
        `${tag}-chat-${id}`,
      );
    }
    await closeToasts(page);
    await closeAll(page, m);

    // Mail: the inbox with the newest mail open.
    await page
      .getByRole('option', { name: m.apps.mail.title, exact: true })
      .dispatchEvent('dblclick');
    const mail = page
      .getByRole('region', { name: new RegExp(`${m.apps.mail.title}$`) })
      .first();
    await maximize(mail, m);
    await mail.getByRole('button', { name: m.mail.ui.sendRecv }).click();
    await page.waitForTimeout(1500);
    await mail.locator('tbody tr').first().click();
    await shot(`${tag}-mail`);
    await closeAll(page, m);

    // Every week-two site, Friendspace and Pixlog.
    const web = await openWeb(page, m);
    const pages: [string, string][] = [
      ['westfield', 'westfield-high.example/news'],
      ['tinfoilcomets', 'tinfoilcomets.example/'],
      ['kickflip', `kickflipkings.example${d.kickflip}`],
      ['celebgossip', 'celebgossip07.example/'],
      ['cheatcave', `cheatcave.example${d.cheat}`],
      ['bulletins', 'friendspace.example/bulletins'],
      [`friendspace-${d.friend}`, `friendspace.example/${d.friend}`],
      [`pixlog-${d.friend}`, `pixlog.example/${d.friend}`],
    ];
    if (d.day === 10)
      pages.push(
        ['band', 'friendspace.example/band/velvet-lantern'],
        ['pixlog-show-album', 'pixlog.example/album?id=marco-rec-hall&n=6'],
        ['friendspace-me', 'friendspace.example/me'],
      );
    for (const [name, url] of pages) {
      await go(web, m, `http://${url}`);
      await closeToasts(page);
      await shot(`${tag}-${name}`);
    }
    await closeAll(page, m);

    if (d.day === 8) {
      // The switch: User Accounts → Boy, then the tray → Deutsch.
      await openFromStart(page, 'User Accounts');
      const accounts = page.getByRole('region', { name: 'User Accounts' });
      await accounts.getByRole('radio', { name: 'Boy' }).click();
      await shot('d08-switch-user-accounts');
      await accounts.getByRole('button', { name: 'OK' }).click();
      await expect(accounts).toBeHidden();
      await page.getByTestId('tray-language').dispatchEvent('click');
      await page
        .getByRole('menuitemradio', { name: 'Deutsch' })
        .dispatchEvent('click');
      await expect(page.locator('html')).toHaveAttribute('lang', 'de');
      await page.waitForTimeout(400);
      suffix = 'boy-de';
      // My Documents re-rendered for a German boy.
      await page
        .getByRole('option', { name: 'Eigene Dateien', exact: true })
        .dispatchEvent('dblclick');
      await shot('d08-switch-my-documents');
      await closeAll(page, de);
    }
  }

  expect(problems).toEqual([]);
});
