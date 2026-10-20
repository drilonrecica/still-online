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

test('desktop icons drag onto the grid, stay after a reload and arrange back', async ({
  page,
}) => {
  await logIn(page);
  const desktop = page.getByTestId('desktop');
  const notepad = desktop.getByRole('option', { name: 'Notepad', exact: true });
  const box = await notepad.boundingBox();
  if (!box) throw new Error('no Notepad icon');
  const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  // Cell 6,3 starts at 455,230 (5 + 75 × n); aim a little off its centre so it snaps.
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(start.x + 40, start.y + 10, { steps: 4 });
  await page.mouse.move(500, 255, { steps: 6 });
  await page.mouse.up();
  await expect(notepad).toHaveCSS('left', '455px');
  await expect(notepad).toHaveCSS('top', '230px');
  // The drop didn't open it, and every other icon stayed put.
  await expect(page.getByRole('region', { name: /Notepad/ })).toHaveCount(0);
  await expect(desktop.getByRole('option', { name: 'My Documents' })).toHaveCSS(
    'left',
    '5px',
  );

  await page.reload();
  await page.getByTestId('boot-screen').click();
  await page.getByRole('button', { name: 'Log on as Ada' }).click();
  await expect(notepad).toHaveCSS('left', '455px');

  await desktop.click({ button: 'right', position: { x: 900, y: 500 } });
  await page.getByRole('menuitem', { name: /Arrange Icons By/ }).click();
  await expect(notepad).toHaveCSS('left', '80px');
});

test('a finger drags a desktop icon and a tap still opens it @phone', async ({
  page,
}) => {
  await logInTouch(page);
  // Stapley's first-login greeting sits over the right of a landscape screen.
  const balloon = page.locator('[data-assistant-balloon]');
  await expect(balloon).toBeVisible({ timeout: 10_000 });
  await tap(balloon.getByRole('button', { name: 'Hide Stapley' }));
  const notepad = page
    .getByTestId('desktop')
    .getByRole('option', { name: 'Notepad', exact: true });
  const box = await notepad.boundingBox();
  if (!box) throw new Error('no Notepad icon');
  const left = await notepad.evaluate((el) => (el as HTMLElement).offsetLeft);
  // The rightmost column is empty in portrait and in landscape.
  const width = page.viewportSize()?.width ?? 0;
  const target = { x: width - 50, y: box.y + box.height / 2 };
  await swipe(
    page,
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    target,
    40,
  );
  await expect(notepad).not.toHaveCSS('left', `${left}px`);
  await expect(page.getByRole('region', { name: /Notepad/ })).toHaveCount(0);

  // Chrome swallows a tap right after a fast swipe (it stops the fling; decisions M3-01), so
  // the drag above moves at a finger's pace and the tap waits a moment.
  await page.waitForTimeout(500);
  await tap(notepad);
  await expect(page.getByRole('region', { name: /Notepad/ })).toBeVisible();
});
