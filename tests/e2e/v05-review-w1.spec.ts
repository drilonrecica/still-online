import { expect, test } from '@playwright/test';
import { en } from '../../src/i18n/messages/en';
import type { Gender } from '../../src/os/types';
import { closeNudgeChats, logIn, playChat } from './helpers';
import { seedStoryDay, signInMessenger } from './week2';

const DIR = 'docs/review/v05-W1';

interface Shot {
  name: string;
  day: number;
  contactId: string;
  displayName: string;
  /** Scripts left to run; everything else of every contact counts as already run. */
  scripts: readonly string[];
  /** The last line of each script in `scripts`, in order. */
  until: readonly RegExp[];
  prefer?: readonly RegExp[];
  only?: Gender;
}

// W1 gate: one chat per friend on its key day of week two, for a girl and for a boy (English;
// German shows the English placeholders until W3), plus one boy-only and one girl-only thread.
// Each shot is a fresh save on its day with only that chat left to run (`seedStoryDay`).
const SHOTS: readonly Shot[] = [
  {
    name: '01-jess-day9',
    day: 9,
    contactId: 'jess',
    displayName: 'xX~JeSs~Xx :D',
    scripts: ['day9'],
    until: [/its in CAPS/],
    prefer: [/u were robbed/, /pasta isnt art/],
  },
  {
    name: '02-kayla-day9',
    day: 9,
    contactId: 'kayla',
    displayName: '~*Kayla*~ <3',
    scripts: ['day9'],
    until: [/i will be dramatic until then/],
    prefer: [/u could share it/],
  },
  {
    name: '03-pia-day10',
    day: 10,
    contactId: 'pia',
    displayName: 'pia (L) ponies (L)',
    scripts: ['day10'],
    until: [/he swam the whole time/],
    prefer: [/next year for sure/, /u didnt miss much/],
  },
  {
    name: '04-theo-day9',
    day: 9,
    contactId: 'theo',
    displayName: 'theo',
    scripts: ['day9'],
    until: [/its a plan|marco cant see us there/],
    prefer: [/i saw one/, /id like that/, /obviously dude/],
  },
  {
    name: '05-marco-day8',
    day: 8,
    contactId: 'marco',
    displayName: 'marco | velvet lantern',
    scripts: ['day8'],
    until: [/ok practice\. later kid/],
    prefer: [/which words/],
  },
  {
    name: '06-dex-day9',
    day: 9,
    contactId: 'dex',
    displayName: 'dex',
    scripts: ['day9'],
    until: [/saving it for something/],
    prefer: [/did kev get it/],
  },
  {
    name: '07-boy-only-marco-load-in-crew',
    day: 10,
    contactId: 'marco',
    displayName: 'marco | velvet lantern',
    scripts: ['day10', 'loadInCrew'],
    until: [/thanks kid/, /same pay|i owe u a soda/],
    prefer: [/did they like my song/, /do i get the soda/],
    only: 'boy',
  },
  {
    name: '08-girl-only-jess-late-night',
    day: 8,
    contactId: 'jess',
    displayName: 'xX~JeSs~Xx :D',
    scripts: ['day8', 'lateNight'],
    until: [/I NEED A NEW SIGN/, /nite/],
    prefer: [/come to marcos show/, /im awake/, /\.\.\.maybe/],
    only: 'girl',
  },
];

for (const gender of ['girl', 'boy'] as const satisfies readonly Gender[]) {
  for (const s of SHOTS) {
    if (s.only && s.only !== gender) continue;
    test(`W1 gate: ${s.name} (${gender}) @review`, async ({ page }) => {
      test.setTimeout(120_000);
      const problems: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' || msg.type() === 'warning')
          problems.push(`console ${msg.type()}: ${msg.text()}`);
      });
      page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));

      await page.setViewportSize({ width: 1280, height: 800 });
      await seedStoryDay(page, s.day, { [s.contactId]: s.scripts });
      await logIn(page, 'Ada', { gender });
      await signInMessenger(page);
      for (const until of s.until)
        await playChat(page, s.contactId, s.displayName, until, s.prefer);

      // Reopened alone and maximized, so the thread fills the screen.
      await page.waitForTimeout(1500);
      await closeNudgeChats(page, { wait: false });
      await page
        .getByRole('group', { name: 'Contacts' })
        .locator(`[data-contact-id="${s.contactId}"]`)
        .dispatchEvent('dblclick');
      const chat = page.getByRole('region', { name: / - Conversation$/ });
      await expect(chat).toHaveCount(1);
      await chat
        .getByRole('button', { name: en.wm.maximize, exact: true })
        .dispatchEvent('click');
      const hide = page.getByRole('button', { name: en.assistant.hide });
      if (await hide.isVisible()) await hide.dispatchEvent('click');
      // Sign-in toasts would cover the display picture.
      const toasts = page.getByRole('button', { name: en.toast.close });
      for (let n = await toasts.count(); n > 0; n = await toasts.count()) {
        await toasts.first().dispatchEvent('click');
        await expect(toasts).toHaveCount(n - 1);
      }
      await page.mouse.move(1270, 790);
      await page.waitForTimeout(800);
      await page.screenshot({ path: `${DIR}/${s.name}-${gender}-en.png` });

      expect(problems).toEqual([]);
    });
  }
}
