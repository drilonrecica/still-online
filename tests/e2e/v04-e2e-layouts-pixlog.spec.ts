// v0.4 P5-01 (flows 2, 6, 7, 8): copy a GlitterCodez code, paste it into the Friendspace editor and
// see it on /me; give kudos, add a Snapshot Booth picture to the Pixlog album and post a survey.
// Run for a girl in English, a girl in German and a boy in English (the boy also checks that the
// boyish layouts come first and that the Pixlog default skin is `night`).
import { expect, test, type Locator, type Page } from '@playwright/test';
import type { Gender } from '../../src/os/types';
import { pickGender, quietIdle } from './helpers';

interface Strings {
  locale: 'en-US' | 'de-DE';
  name: string;
  logOn: string;
  address: string;
  done: string;
  connect: string;
  editProfile: string;
  saveChanges: string;
  layoutCode: string;
  copy: string;
  kudosGive: string;
  kudosGiven: string;
  addPhotos: string;
  addPhoto: RegExp;
  editAlbum: string;
  caption: string;
  albumDone: string;
  fillIn: string;
  surveys: string;
  post: string;
  booth: string;
  cartoon: RegExp;
  takePhoto: string;
}

const EN: Strings = {
  locale: 'en-US',
  name: 'Your name',
  logOn: 'Log on as Ada',
  address: 'Address',
  done: 'Done',
  connect: 'Connect',
  editProfile: 'Edit Profile',
  saveChanges: 'Save Changes',
  layoutCode: 'Layout code:',
  copy: 'Copy code!!',
  kudosGive: 'Give kudos ★',
  kudosGiven: 'Kudos given today!',
  addPhotos: 'Add photos',
  addPhoto: /^Add (?!photos$).+/,
  editAlbum: 'Edit album',
  caption: 'Caption for photo 1',
  albumDone: 'Done',
  fillIn: 'Fill in a survey',
  surveys: 'My surveys',
  post: 'Post to my profile',
  booth: 'Snapshot Booth',
  cartoon: /use a cartoon me/i,
  takePhoto: 'Take Photo',
};

const DE: Strings = {
  locale: 'de-DE',
  name: 'Ihr Name',
  logOn: 'Als Ada anmelden',
  address: 'Adresse',
  done: 'Fertig',
  connect: 'Verbinden',
  editProfile: 'Profil bearbeiten',
  saveChanges: 'Änderungen speichern',
  layoutCode: 'Layout-Code:',
  copy: 'Code kopieren!!',
  kudosGive: 'Kudos geben ★',
  kudosGiven: 'Heute schon Kudos gegeben!',
  addPhotos: 'Fotos hinzufügen',
  addPhoto: /^.+ hinzufügen$(?<!^Fotos hinzufügen)/,
  editAlbum: 'Album bearbeiten',
  caption: 'Bildunterschrift für Foto 1',
  albumDone: 'Fertig',
  fillIn: 'Umfrage ausfüllen',
  surveys: 'Meine Umfragen',
  post: 'Auf mein Profil stellen',
  booth: 'Fotobox',
  cartoon: /Comic-Ich verwenden/,
  takePhoto: 'Foto aufnehmen',
};

const CASES: { title: string; gender: Gender; t: Strings }[] = [
  { title: 'girl, English', gender: 'girl', t: EN },
  { title: 'girl, German', gender: 'girl', t: DE },
  { title: 'boy, English', gender: 'boy', t: EN },
];

/** Logs on in the given language/gender, opens Web Explorer and dials in. */
async function start(page: Page, gender: Gender, t: Strings): Promise<Locator> {
  await quietIdle(page);
  await page.goto('./?speed=fast');
  await page.getByTestId('boot-screen').click();
  await page.getByLabel(t.name).fill('Ada');
  await pickGender(page, gender);
  await page.getByRole('button', { name: t.logOn }).click();
  await expect(page.getByTestId('desktop')).toBeVisible();

  await page
    .getByRole('option', { name: 'Web Explorer' })
    .dispatchEvent('dblclick');
  const web = page.getByRole('region', { name: /Web Explorer$/ }).first();
  await web
    .getByTestId('page-cannot-be-displayed')
    .getByRole('button')
    .first()
    .click();
  await expect(page.getByTestId('tray-network')).toHaveAttribute(
    'data-status',
    'online',
  );
  return web;
}

async function go(web: Locator, t: Strings, url: string) {
  const address = web.getByLabel(t.address);
  await address.fill(url);
  await address.press('Enter');
  await expect(web.getByRole('status').last()).toHaveText(t.done, {
    timeout: 10_000,
  });
}

for (const { title, gender, t } of CASES) {
  test.describe(title, () => {
    test.use({ locale: t.locale });

    test(`2: copy a GlitterCodez code, paste it in the editor, /me shows it (${title})`, async ({
      page,
      context,
    }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      const web = await start(page, gender, t);

      await go(web, t, 'http://glittercodez.example/');
      const first = web.locator('article').first();
      if (gender === 'boy') {
        // The boyish layouts are featured first.
        await expect(first).toContainText(/Skater Grunge|Gamer Green/);
      }
      await first.getByRole('button', { name: t.copy }).click();
      const code = await page.evaluate<string>(
        'navigator.clipboard.readText()',
      );
      expect(code).toContain('[layout');

      await go(web, t, 'http://friendspace.example/me');
      await web.getByRole('button', { name: t.editProfile }).click();
      await web.getByLabel(t.layoutCode).fill(code);
      await web.getByRole('button', { name: t.saveChanges }).click();
      await expect(
        web.getByRole('button', { name: t.editProfile }),
      ).toBeVisible();

      const profile = web.getByTestId('profile');
      await expect(profile).toBeVisible();
      await expect(profile.locator('[data-sticker]').first()).toBeVisible();
      await expect(profile).not.toHaveCSS('background-image', 'none');
    });

    test(`6: kudos, a Snapshot Booth picture in the album, and a survey (${title})`, async ({
      page,
    }) => {
      test.setTimeout(60_000);
      const web = await start(page, gender, t);

      // Kudos on Jess's page: the button is disabled once given.
      await go(web, t, 'http://pixlog.example/jess');
      await web.getByRole('button', { name: t.kudosGive }).click();
      await expect(
        web.getByRole('button', { name: t.kudosGiven }),
      ).toBeDisabled();

      // A Snapshot Booth picture (the cartoon fallback) lands in My Pictures.
      await web.getByRole('button', { name: /Minimize|Minimieren/ }).click();
      await page.getByRole('button', { name: 'start' }).click();
      await page
        .getByRole('menuitem', { name: /All Programs|Alle Programme/ })
        .click();
      await page
        .getByRole('menu', { name: /All Programs|Alle Programme/ })
        .getByRole('menuitem', {
          name: /Accessories|Zubehör|Multimedia|Unterhaltung|Entertainment/,
        })
        .first()
        .hover();
      await page
        .getByRole('menuitem', { name: t.booth, exact: true })
        .last()
        .click();
      const booth = page.getByRole('region', {
        name: new RegExp(`${t.booth}$`),
      });
      await booth.getByRole('button', { name: t.cartoon }).click();
      await booth.getByRole('button', { name: t.takePhoto }).click();
      await expect(booth.getByRole('list').getByRole('listitem')).toHaveCount(
        1,
        {
          timeout: 15_000,
        },
      );
      await booth
        .getByRole('button', { name: /Close|Schließen/ })
        .dispatchEvent('click');

      // /me: Pixlog's default skin follows the player's gender, then album and survey.
      await page.getByRole('button', { name: /Web Explorer$/ }).click();
      await go(web, t, 'http://pixlog.example/me');
      await expect(web.locator('[data-skin]').first()).toHaveAttribute(
        'data-skin',
        gender === 'boy' ? 'night' : 'bubblegum',
      );
      await web.getByRole('button', { name: t.addPhotos }).click();
      await web.getByRole('button', { name: t.addPhoto }).first().click();
      await web.getByRole('button', { name: t.editAlbum }).click();
      await web.getByLabel(t.caption).fill('my first pic');
      await web.getByRole('button', { name: t.albumDone, exact: true }).click();
      await expect(web.getByText('my first pic')).toBeVisible();

      await web.getByRole('button', { name: t.fillIn }).click();
      await web
        .getByRole('region', { name: t.surveys })
        .locator('input[type="text"]')
        .first()
        .fill('pizza');
      await web.getByRole('button', { name: t.post }).click();
      await expect(
        web
          .getByRole('region', { name: t.surveys })
          .getByText('pizza', { exact: true }),
      ).toBeVisible();
    });
  });
}
