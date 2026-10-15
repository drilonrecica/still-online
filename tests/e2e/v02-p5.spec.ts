import { expect, test } from '@playwright/test';
import { logIn, openFromStart } from './helpers';

test('P5: Snapshot Booth cartoon fallback takes a photo into the strip', async ({
  page,
}) => {
  test.setTimeout(60_000);
  await logIn(page);
  await openFromStart(page, 'Snapshot Booth');
  const booth = page.getByRole('region', { name: /Snapshot Booth$/ });
  await expect(booth).toContainText('nothing is uploaded');
  await booth.getByRole('button', { name: /use a cartoon me/i }).click();
  await expect(
    booth.getByRole('img', { name: 'Cartoon preview' }),
  ).toBeVisible();
  await booth.getByRole('button', { name: 'Comic' }).click();
  await booth.getByRole('button', { name: 'Take Photo' }).click();
  await expect(
    booth.getByRole('list', { name: 'Photos' }).getByRole('listitem'),
  ).toHaveCount(1, { timeout: 15_000 });
});

test('P5: Amplifier skins cycle, EQ preset applies, windowshade toggles', async ({
  page,
}) => {
  await logIn(page);
  await page.getByRole('option', { name: 'Amplifier' }).dblclick();
  const amp = page.getByRole('group', { name: 'Amplifier' });
  await expect(amp).toHaveAttribute('data-skin', 'metal');
  await amp.getByRole('button', { name: /^Skin:/ }).click();
  await expect(amp).toHaveAttribute('data-skin', 'neon');
  await amp.getByRole('button', { name: /^Skin:/ }).click();
  await expect(amp).toHaveAttribute('data-skin', 'bubblegum');

  await amp.getByRole('button', { name: 'Equalizer', exact: true }).click();
  await amp.getByTestId('equalizer').getByLabel('Presets').selectOption('Rock');

  const full = (await amp.boundingBox())?.height ?? 0;
  await amp.getByTestId('titlebar').dblclick();
  await expect(amp).toHaveAttribute('data-shade', 'true');
  await expect
    .poll(async () => (await amp.boundingBox())?.height ?? 0)
    .toBeLessThan(full / 2);
  await amp.getByTestId('titlebar').dblclick();
  await expect(amp).toHaveAttribute('data-shade', 'false');
});
