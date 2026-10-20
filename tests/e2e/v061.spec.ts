// v0.6.1: pictures open in their own Picture Viewer window, by mouse and by touch.
import { expect, test } from '@playwright/test';
import { logIn, logInTouch, swipe, tap } from './helpers';

test('a picture opens in the Picture Viewer and the folder stays', async ({
  page,
}) => {
  await logIn(page);
  await page.getByRole('option', { name: 'My Pictures' }).dblclick();
  const pics = page.getByRole('region', { name: 'My Pictures' });
  await pics.getByRole('option', { name: 'summer_camp_2006.jpg' }).dblclick();

  const viewer = page.getByRole('region', {
    name: 'summer_camp_2006.jpg - Picture Viewer',
  });
  await expect(viewer).toBeVisible();
  await expect(viewer.getByText('6 of 6')).toBeVisible();
  await expect(pics.getByRole('listbox')).toBeVisible();

  await viewer.getByRole('button', { name: 'Next' }).click();
  await expect(
    page.getByRole('region', { name: 'beach_vacation.jpg - Picture Viewer' }),
  ).toBeVisible();

  // Opening another picture reuses the same window, and brings it back.
  await page
    .getByRole('region', { name: 'beach_vacation.jpg - Picture Viewer' })
    .getByRole('button', { name: 'Minimize' })
    .click();
  await pics.getByRole('option', { name: 'biscuit_the_dog.jpg' }).dblclick();
  await expect(
    page.getByRole('region', { name: /Picture Viewer$/ }),
  ).toHaveCount(1);
  await expect(
    page.getByRole('region', { name: 'biscuit_the_dog.jpg - Picture Viewer' }),
  ).toBeVisible();
});

test('a tap opens a picture and a swipe steps through them @phone', async ({
  page,
}) => {
  await logInTouch(page);
  await tap(
    page.getByTestId('desktop').getByRole('option', { name: 'My Pictures' }),
  );
  const pics = page.getByRole('region', { name: 'My Pictures' });
  await tap(pics.getByRole('option', { name: 'beach_vacation.jpg' }));
  const viewer = page.getByRole('region', {
    name: 'beach_vacation.jpg - Picture Viewer',
  });
  await expect(viewer.getByText('1 of 6')).toBeVisible();

  const stage = await viewer.getByTestId('picture-stage').boundingBox();
  if (!stage) throw new Error('no picture stage');
  const y = stage.y + stage.height / 2;
  await swipe(
    page,
    { x: stage.x + stage.width * 0.6, y },
    { x: stage.x + stage.width * 0.3, y },
  );
  await expect(
    page.getByRole('region', { name: 'biscuit_the_dog.jpg - Picture Viewer' }),
  ).toBeVisible();
});
