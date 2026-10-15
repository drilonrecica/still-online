import { expect, test } from '@playwright/test';
import { logIn, openFromStart } from './helpers';

const DIR = 'docs/review/P5';

test('P5 gate: Paint, Booth fallback, skins, EQ, windowshade @review', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const problems: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning')
      problems.push(`console ${msg.type()}: ${msg.text()}`);
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  await page.setViewportSize({ width: 1280, height: 800 });
  await logIn(page);

  // Paint with a drawing.
  await page.getByRole('button', { name: 'start' }).click();
  await page
    .getByRole('menuitem', { name: 'Paint', exact: true })
    .first()
    .click();
  const paint = page.getByRole('region', { name: /Paint$/ });
  const box = (await paint
    .getByRole('img', { name: 'Picture' })
    .boundingBox())!;
  const stroke = async (
    color: string,
    tool: string,
    fill: boolean,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) => {
    await paint.getByRole('button', { name: `Color ${color}` }).click();
    await paint.getByRole('button', { name: tool, exact: true }).click();
    if (fill) await paint.getByRole('button', { name: 'Fill only' }).click();
    await page.mouse.move(box.x + x1, box.y + y1);
    await page.mouse.down();
    await page.mouse.move(box.x + x2, box.y + y2, { steps: 6 });
    await page.mouse.up();
  };
  await stroke('#ff0000', 'Rectangle', true, 40, 60, 160, 140);
  await stroke('#0000ff', 'Ellipse', true, 200, 60, 320, 160);
  await stroke('#008000', 'Line', false, 40, 200, 340, 240);
  await page.mouse.move(1200, 780);
  await page.screenshot({ path: `${DIR}/paint.png` });
  await paint.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'No', exact: true }).click();
  await expect(paint).toBeHidden();

  // Booth fallback.
  await openFromStart(page, 'Snapshot Booth');
  const booth = page.getByRole('region', { name: /Snapshot Booth$/ });
  await booth.getByRole('button', { name: /use a cartoon me/i }).click();
  await expect(
    booth.getByRole('img', { name: 'Cartoon preview' }),
  ).toBeVisible();
  await booth.getByRole('button', { name: 'Comic' }).click();
  await page.mouse.move(1200, 780);
  await page.screenshot({ path: `${DIR}/booth-fallback.png` });
  await booth.getByRole('button', { name: 'Close' }).click();

  // Amplifier: each skin, EQ, windowshade.
  await page.getByRole('option', { name: 'Amplifier' }).dblclick();
  const amp = page.getByRole('group', { name: 'Amplifier' });
  await expect(amp).toBeVisible();
  for (const skin of ['metal', 'neon', 'bubblegum']) {
    await expect(amp).toHaveAttribute('data-skin', skin);
    await page.mouse.move(1200, 780);
    await page.screenshot({ path: `${DIR}/skin-${skin}.png` });
    await amp.getByRole('button', { name: /^Skin:/ }).click();
  }
  await amp.getByRole('button', { name: /^Skin:/ }).click(); // metal -> neon
  await amp.getByRole('button', { name: 'Equalizer', exact: true }).click();
  await amp
    .getByTestId('equalizer')
    .getByLabel('Presets')
    .selectOption("Kayla's Party");
  await page.mouse.move(1200, 780);
  await page.screenshot({ path: `${DIR}/eq.png` });
  await amp.getByTestId('titlebar').dblclick();
  await expect(amp).toHaveAttribute('data-shade', 'true');
  await page.mouse.move(1200, 780);
  await page.screenshot({ path: `${DIR}/windowshade.png` });

  expect(problems).toEqual([]);
});
