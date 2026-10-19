// v0.4.1 F-03 visual fixes, measured in the browser: survey bulletins stay in one column beside
// the sender picture, „1 obviously" keeps its space in the pixel font, a language flip keeps
// Kayla's last line in view, and Stapley's balloon folds away over a maximized browser.
import { expect, test, type Locator } from '@playwright/test';
import { go, logIn, openBrowserOnline, openMessenger } from './helpers';

// The e2e tsconfig has no DOM lib: the bits of the elements these checks read.
interface TextBox {
  firstChild: unknown;
  ownerDocument: {
    createRange(): {
      setStart(node: unknown, offset: number): void;
      setEnd(node: unknown, offset: number): void;
      getBoundingClientRect(): { left: number; right: number };
    };
  };
}
interface ScrollBox {
  scrollHeight: number;
  scrollTop: number;
  clientHeight: number;
}

test('F-03: a long survey bulletin stays beside the sender picture', async ({
  page,
}) => {
  await logIn(page);
  const web = await openBrowserOnline(page);
  await go(web, 'http://friendspace.example/bulletins');
  const survey = web
    .getByTestId('bulletin')
    .filter({ hasText: '20 qs about me' });
  const picture = (await survey
    .getByRole('img', { name: /picture/ })
    .boundingBox())!;
  const body = (await survey.locator('p').boundingBox())!;
  expect(body.height).toBeGreaterThan(picture.height);
  expect(body.x).toBeGreaterThanOrEqual(picture.x + picture.width);
});

test('F-03: „1 obviously" keeps its space; a language flip shows the last line', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await logIn(page);
  await openMessenger(page);
  await page
    .getByRole('group', { name: 'Contacts' })
    .locator('[data-contact-id="kayla"]')
    .dispatchEvent('dblclick');
  const chat = page.getByRole('region', {
    name: '~*Kayla*~ <3 - Conversation',
    exact: true,
  });
  // Her opening, with the first reply each time, until the status poll offers „1 obviously".
  const replies = chat
    .getByRole('group', { name: 'Replies' })
    .getByRole('button');
  const button = replies.filter({ hasText: '1 obviously' });
  for (let i = 0; i < 30 && !(await button.count()); i++) {
    if (await replies.count()) {
      await replies.first().dispatchEvent('click');
      await chat
        .getByRole('button', { name: 'Send', exact: true })
        .dispatchEvent('click');
    }
    await page.waitForTimeout(500);
  }
  await expect(button).toBeVisible();
  // The gap between the „1" and the „o" boxes is the rendered space.
  const gap = await button.evaluate((el) => {
    const { firstChild: text, ownerDocument: doc } = el as unknown as TextBox;
    const box = (from: number) => {
      const range = doc.createRange();
      range.setStart(text, from);
      range.setEnd(text, from + 1);
      return range.getBoundingClientRect();
    };
    return box(2).left - box(0).right;
  });
  expect(gap).toBeGreaterThanOrEqual(4);

  const fromBottom = (log: Locator) =>
    log.evaluate((el) => {
      const box = el as unknown as ScrollBox;
      return box.scrollHeight - box.scrollTop - box.clientHeight;
    });
  expect(await fromBottom(chat.getByRole('log'))).toBeLessThan(2);
  await page.getByTestId('tray-language').dispatchEvent('click');
  await page
    .getByRole('menuitemradio', { name: 'Deutsch' })
    .dispatchEvent('click');
  const log = page
    .getByRole('region', {
      name: '~*Kayla*~ <3 - Unterhaltung',
      exact: true,
    })
    .getByRole('log');
  await expect(log).toContainText('sagt:');
  expect(
    await log.evaluate((el) => {
      const box = el as unknown as ScrollBox;
      return box.scrollHeight > box.clientHeight;
    }),
  ).toBe(true);
  expect(await fromBottom(log)).toBeLessThan(2);
});

test('F-03: Stapley’s balloon folds away over a maximized browser', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toContainText("I'm Stapley", { timeout: 10_000 });

  const web = await openBrowserOnline(page);
  await web.getByRole('button', { name: 'Maximize' }).click();
  await expect(balloon).toHaveCount(0, { timeout: 12_000 });

  // A click on Stapley brings the tip back; Hide Stapley still works.
  await page.getByRole('button', { name: 'Stapley the stapler' }).click();
  await expect(balloon).toContainText("I'm Stapley");
  await balloon.getByRole('button', { name: 'Hide Stapley' }).click();
  await expect(page.locator('[data-assistant]')).toHaveCount(0);
});
