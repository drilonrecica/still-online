import { expect, test, type Page } from '@playwright/test';
import { quietIdle, setLanguage } from './helpers';

const DIR = 'docs/review/P1/de';

// P1-08: open the shell and every desktop app in German at 1280×800, screenshot each, and flag
// elements whose text is clipped (scroll size exceeds client size while overflow is hidden/clipped)
// or that stick out of their window. Run with `npx playwright test --grep @review review-p1-layout`.
test.use({ locale: 'de-DE' });

/**
 * Page-side script (a string: the e2e tsconfig has no DOM lib). Returns a description of every
 * clipped/overflowing element under the elements matching `SEL`.
 */
const FIND_OVERFLOW = `(SEL) => {
const out = [];
    const roots = Array.from(document.querySelectorAll(SEL));
    for (const root of roots) {
      const rootBox = root.getBoundingClientRect();
      for (const el of Array.from(root.querySelectorAll('*'))) {
        const e = el;
        if (e.closest('canvas, svg, [data-allow-overflow]')) continue;
        const box = e.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        const cs = getComputedStyle(e);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const hidden = (v) => v === 'hidden' || v === 'clip';
        const clipX = hidden(cs.overflowX) && e.scrollWidth > e.clientWidth + 1;
        const clipY = hidden(cs.overflowY) && e.scrollHeight > e.clientHeight + 1;
        const hasText = Array.from(e.childNodes).some(
          (n) => n.nodeType === 3 && (n.textContent ?? '').trim() !== '',
        );
        const ellipsis = cs.textOverflow === 'ellipsis' && clipX;
        const sticksOut =
          hasText &&
          root.getAttribute('role') === 'region' &&
          (box.right > rootBox.right + 1 || box.bottom > rootBox.bottom + 1);
        if (clipX || clipY || ellipsis || sticksOut) {
          const text = (e.textContent ?? '').trim().replace(/\\s+/g, ' ').slice(0, 60);
          const cls = typeof e.className === 'string' ? e.className : '';
          out.push(
            \`<\${e.tagName.toLowerCase()} class="\${cls}"> \${clipX ? 'clipX ' : ''}\${clipY ? 'clipY ' : ''}\${sticksOut ? 'sticksOut ' : ''}"\${text}"\`,
          );
        }
      }
    }
    return out;
}`;

async function findOverflow(
  page: Page,
  rootSelector: string,
): Promise<string[]> {
  return page.evaluate(
    `(${FIND_OVERFLOW})(${JSON.stringify(rootSelector)})`,
  ) as Promise<string[]>;
}

test('P1-08 German layout pass @review', async ({ page }) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 1280, height: 800 });
  await quietIdle(page);
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await setLanguage(page, 'de');
  await page.getByLabel('Ihr Name').fill('Ada');
  await page.getByRole('button', { name: 'Als Ada anmelden' }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  const report: string[] = [];
  const note = async (name: string, sel: string) => {
    const found = await findOverflow(page, sel);
    await page.mouse.move(1000, 760);
    await page.screenshot({ path: `${DIR}/${name}.png` });
    for (const f of found) report.push(`[${name}] ${f}`);
  };

  await note('desktop', '[data-testid="desktop"]');

  const count = await page.getByTestId('desktop').getByRole('option').count();
  for (let i = 0; i < count; i++) {
    const icon = page.getByTestId('desktop').getByRole('option').nth(i);
    const label = ((await icon.textContent()) ?? `icon${i}`).trim();
    await icon.dblclick();
    await page.waitForTimeout(600);
    const slug = label.toLowerCase().replace(/[^a-z0-9äöüß]+/g, '-');
    await note(`app-${slug}`, '[role="region"]');
    // Full-screen overlays (Desktop Wrecker) end with Esc; then close every window again.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    for (let n = 0; n < 6; n++) {
      const close = page.getByRole('button', { name: /^(Close|Schließen)$/ });
      if ((await close.count()) === 0) break;
      await close.last().dispatchEvent('click');
      await page.waitForTimeout(100);
    }
  }

  const closeAll = async () => {
    await page.keyboard.press('Escape');
    for (let n = 0; n < 6; n++) {
      const close = page.getByRole('button', { name: /^(Close|Schließen)$/ });
      if ((await close.count()) === 0) break;
      await close.last().dispatchEvent('click');
      await page.waitForTimeout(100);
    }
  };

  // Display Properties: every tab (fixed-size window).
  await page.mouse.click(900, 300, { button: 'right' });
  await note('desktop-menu', '[role="menu"]');
  await page.getByRole('menuitem', { name: 'Eigenschaften' }).click();
  const display = page.getByRole('region', { name: /Anzeige/ });
  await expect(display).toBeVisible();
  const tabs = display.getByRole('tab');
  await expect(tabs.first()).toBeVisible();
  const tabCount = await tabs.count();
  for (let i = 0; i < tabCount; i++) {
    await tabs.nth(i).click();
    await note(`display-tab${i}`, '[role="region"]');
  }
  await closeAll();

  // Mines: open the menu and the best-times dialog.
  await page
    .getByTestId('desktop')
    .getByRole('option', { name: 'Minen' })
    .dblclick();
  await page.getByRole('menuitem', { name: 'Spiel' }).click();
  await note('mines-menu', '[role="region"], [role="menu"]');
  await closeAll();

  // Messenger signed in: contact list and a chat window.
  await page
    .getByTestId('desktop')
    .getByRole('option', { name: 'Messenger' })
    .dblclick();
  await page.getByRole('button', { name: 'Anmelden' }).click();
  const chats = page.getByRole('region', { name: /Unterhaltung$/ });
  await expect(chats.first()).toBeVisible({ timeout: 10_000 });
  for (let n = await chats.count(); n > 0; n = await chats.count()) {
    await chats
      .first()
      .getByRole('button', { name: 'Schließen' })
      .dispatchEvent('click');
    await expect(chats).toHaveCount(n - 1);
  }
  await note('messenger-contacts', '[role="region"]');
  const bar = page
    .getByRole('region', { name: 'Messenger' })
    .getByRole('menubar');
  const names = (await bar.getByRole('menuitem').allTextContents()).map((n) =>
    n.trim(),
  );
  for (const [i, name] of names.entries()) {
    await bar.getByRole('menuitem', { name, exact: true }).click();
    await note(`messenger-menu${i}`, '[role="region"], [role="menu"]');
    await page.keyboard.press('Escape');
  }
  await closeAll();

  // Web Explorer online: favorites pane + status bar.
  await page
    .getByTestId('desktop')
    .getByRole('option', { name: 'Web Explorer' })
    .dblclick();
  await page.waitForTimeout(6000);
  await note('browser-online', '[role="region"]');
  await closeAll();

  // Start menu → All Programs flyouts.
  await page.getByRole('button', { name: /start/i }).click();
  await page.getByRole('menuitem', { name: /Alle Programme/ }).click();
  await note('allprograms', '[role="menu"]');
  for (const folder of await page
    .getByRole('menu', { name: /Alle Programme/ })
    .getByRole('menuitem')
    .all()) {
    if (!(await folder.getAttribute('aria-haspopup'))) continue;
    await folder.hover();
    await note('allprograms-flyout', '[role="menu"]');
  }
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: /start/i })
    .click()
    .catch(() => {});

  await page.getByRole('button', { name: /start/i }).click();
  await note('startmenu', '[data-testid="start-menu"], [role="menu"]');

  console.log('\nOVERFLOW REPORT\n' + report.join('\n'));
  expect(report).toEqual([]);
});
