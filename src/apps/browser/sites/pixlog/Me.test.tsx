import { act, cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSeedFiles } from '@/content/locale';
import { PIXLOG_PROFILES } from '@/content/pixlog';
import { SURVEYS } from '@/content/pixlog/surveys';
import { PIXLOG_HOST } from '@/content/sites/pixlog';
import { putBlob } from '@/os/blobStore';
import { useFsStore } from '@/os/fs/store';
import { FS_FOLDERS, type FsNode } from '@/os/fs/types';
import { useNetworkStore } from '@/os/network';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore } from '@/os/world';
import '@/apps/registry';
import Browser from '../../Browser';
import { DEFAULT_FAVORITES, WEB_DEFAULTS, useWebStore } from '../../store';
import { WEB_LIMITS } from '../../webSanitize';
import { resolve } from '..';
import { albumPhotos, friendKudos, kudosReceived } from './logic';

const LOAD = 1400;
const jess = PIXLOG_PROFILES[0]!;
const survey = SURVEYS[0]!;

function open(path: string) {
  const url = `http://${PIXLOG_HOST}${path}`;
  const windowId = useWindowsStore.getState().openApp('browser', { url });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<Browser windowId={windowId} props={{ url }} />);
  return user;
}
const finishLoad = () => act(() => vi.advanceTimersByTimeAsync(LOAD));
const pixlog = () => useWebStore.getState().pixlog;
const addPicture = (name: string, extra: Partial<FsNode> = {}) =>
  useFsStore.getState().createFile(FS_FOLDERS.pics, {
    name,
    type: 'image',
    ...extra,
  });

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.clear();
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useFsStore.setState(useFsStore.getInitialState(), true);
  useSettingsStore.setState({
    connectAutomatically: true,
    muted: true,
    gender: 'girl',
    language: 'en',
    playerName: 'Robin',
  });
  useWebStore.setState({ ...WEB_DEFAULTS, favorites: [...DEFAULT_FAVORITES] });
  useWorldStore.setState({ day: 5 });
  useNetworkStore.setState({
    status: 'online',
    kbps: 56,
    phase: 'connected',
    connectedAt: null,
  });
});

afterEach(() => {
  cleanup();
  useNetworkStore.getState().cancel();
  vi.useRealTimers();
});

describe('pixlog kudos and album logic', () => {
  it('counts kudos received by day', () => {
    expect(kudosReceived(PIXLOG_PROFILES, 1)).toBe(0);
    expect(kudosReceived(PIXLOG_PROFILES, 5)).toBe(
      PIXLOG_PROFILES.flatMap((p) => p.kudosToPlayer).length,
    );
  });

  it('a friend’s count is seeded, grows by day and adds the player’s', () => {
    const base = friendKudos('jess', 3, []);
    expect(friendKudos('jess', 3, [])).toBe(base);
    expect(friendKudos('jess', 4, [])).toBeGreaterThanOrEqual(base);
    expect(friendKudos('jess', 3, [2, 3])).toBe(base + 2);
    expect(friendKudos('jess', 3, [4])).toBe(base);
  });

  it('drops entries whose file is gone, in the bin or not an image', () => {
    const nodes: Record<string, FsNode> = {
      a: {
        id: 'a',
        parentId: 'pics',
        name: 'a.jpg',
        type: 'image',
        createdAt: 0,
        modifiedAt: 0,
        photo: { scene: 'pet', seed: 1 },
      },
      b: {
        id: 'b',
        parentId: 'recycle',
        name: 'b.jpg',
        type: 'image',
        createdAt: 0,
        modifiedAt: 0,
        photo: { scene: 'pet', seed: 2 },
        deletedFrom: 'pics',
      },
      c: {
        id: 'c',
        parentId: 'docs',
        name: 'c.txt',
        type: 'txt',
        createdAt: 0,
        modifiedAt: 0,
      },
    };
    const album = ['a', 'b', 'c', 'gone'].map((fsNodeId) => ({
      fsNodeId,
      caption: fsNodeId,
    }));
    expect(albumPhotos(album, nodes).map((p) => p.fsNodeId)).toEqual(['a']);
  });
});

describe('kudos on a friend’s page', () => {
  it('can be given once per day', async () => {
    const before = friendKudos('jess', 5, []);
    const user = open('/jess');
    await finishLoad();
    await user.click(
      await screen.findByRole('button', { name: 'Give kudos ★' }),
    );
    expect(pixlog()?.kudosGiven.jess).toEqual([5]);
    const given = screen.getByRole('button', { name: 'Kudos given today!' });
    expect((given as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(`★ ${before + 1} kudos`)).toBeTruthy();
    expect(useWebStore.getState().giveKudos('jess', 5)).toBe(false);
    expect(pixlog()?.kudosGiven.jess).toEqual([5]);
    expect(localStorage.getItem('still-online:v1:web')).toContain('kudosGiven');

    act(() => useWorldStore.setState({ day: 6 }));
    expect(
      (
        screen.getByRole('button', {
          name: 'Give kudos ★',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
  });
});

describe('pixlog.example/me', () => {
  it('is its own page with name, picture, kudos received and visitors', async () => {
    expect(resolve(`http://${PIXLOG_HOST}/me`)?.key).toBe('/me');
    open('/me');
    await finishLoad();
    expect(await screen.findByRole('heading', { name: 'Robin' })).toBeTruthy();
    expect(screen.getByRole('img', { name: 'Your picture' })).toBeTruthy();
    expect(
      screen.getByText(`Kudos received: ${kudosReceived(PIXLOG_PROFILES, 5)}`),
    ).toBeTruthy();
    expect(
      screen.getByRole('region', { name: 'Who visited my profile' }),
    ).toBeTruthy();
  });

  it('defaults the skin by gender and saves a pick', async () => {
    const user = open('/me');
    await finishLoad();
    await screen.findByRole('heading', { name: 'Robin' });
    const frame = () =>
      document.querySelector('[data-skin]')?.getAttribute('data-skin');
    expect(frame()).toBe('bubblegum');
    act(() => useSettingsStore.setState({ gender: 'boy' }));
    expect(frame()).toBe('night');
    const skins = screen.getByRole('group', { name: 'My skin' });
    expect(within(skins).getAllByRole('button')).toHaveLength(6);
    await user.click(within(skins).getByRole('button', { name: 'Lime' }));
    expect(frame()).toBe('lime');
    expect(pixlog()?.skin).toBe('lime');
    expect(
      within(skins)
        .getByRole('button', { name: 'Lime' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('adds procedural and blob pictures, edits captions, removes, and drops deleted files', async () => {
    URL.createObjectURL = () => 'blob:test';
    URL.revokeObjectURL = () => undefined;
    const camp = addPicture('camp.jpg', { photo: { scene: 'camp', seed: 4 } });
    const key = await putBlob(new Blob(['x'], { type: 'image/png' }));
    const booth = addPicture('booth.png', { blobKey: key });
    const user = open('/me');
    await finishLoad();
    const box = await screen.findByRole('region', { name: 'My album' });
    expect(within(box).getByText(/Your album is empty/)).toBeTruthy();

    await user.click(within(box).getByRole('button', { name: 'Add photos' }));
    await user.click(within(box).getByRole('button', { name: 'Add camp.jpg' }));
    await user.click(
      within(box).getByRole('button', { name: 'Add booth.png' }),
    );
    expect(pixlog()?.album.map((e) => e.fsNodeId)).toEqual([camp, booth]);
    expect(within(box).getByText(/No new pictures/)).toBeTruthy();
    expect(within(box).getByRole('img', { name: 'Photo 1' })).toBeTruthy();
    expect(
      within(box)
        .getByRole('img', { name: 'Photo 2' })
        .querySelector('img')
        ?.getAttribute('src'),
    ).toBe('blob:test');

    await user.click(within(box).getByRole('button', { name: 'Edit album' }));
    const caption = within(box).getByRole('textbox', {
      name: 'Caption for photo 1',
    });
    expect(caption.getAttribute('maxlength')).toBe(String(WEB_LIMITS.caption));
    await user.type(caption, 'camp!!');
    expect(pixlog()?.album[0]?.caption).toBe('camp!!');
    await user.click(
      within(box).getByRole('button', { name: 'Remove photo 2' }),
    );
    expect(pixlog()?.album.map((e) => e.fsNodeId)).toEqual([camp]);
    await user.click(within(box).getByRole('button', { name: 'Done' }));
    expect(within(box).getByRole('img', { name: 'camp!!' })).toBeTruthy();
    expect(within(box).getByText('camp!!')).toBeTruthy();

    act(() => useFsStore.getState().remove(camp));
    expect(within(box).queryByRole('img', { name: 'camp!!' })).toBeNull();
    expect(within(box).getByText(/Your album is empty/)).toBeTruthy();
  });

  it('offers a boy his own seeded photos for the album', async () => {
    useSettingsStore.setState({ gender: 'boy' });
    useFsStore.getState().seed(getSeedFiles('en', 'boy'));
    const user = open('/me');
    await finishLoad();
    const box = await screen.findByRole('region', { name: 'My album' });
    await user.click(within(box).getByRole('button', { name: 'Add photos' }));
    for (const name of [
      'skatepark_wipeout.jpg',
      'lan_party_marcos.jpg',
      'dexs_ramp.jpg',
    ])
      expect(
        within(box).getByRole('button', { name: `Add ${name}` }),
      ).toBeTruthy();
    expect(
      within(box).queryByRole('button', { name: 'Add beach_holiday.jpg' }),
    ).toBeNull();
    await user.click(
      within(box).getByRole('button', { name: 'Add skatepark_wipeout.jpg' }),
    );
    expect(pixlog()?.album.map((e) => e.fsNodeId)).toEqual([
      'seed:school-trip-museum',
    ]);
  });

  it('stops adding at the album limit', async () => {
    const ids = Array.from({ length: WEB_LIMITS.album }, (_, i) =>
      addPicture(`p${i}.jpg`, { photo: { scene: 'pet', seed: i } }),
    );
    useWebStore.setState({
      pixlog: {
        album: ids.map((fsNodeId) => ({ fsNodeId, caption: '' })),
        surveys: {},
        kudosGiven: {},
      },
    });
    open('/me');
    await finishLoad();
    const box = await screen.findByRole('region', { name: 'My album' });
    expect(
      within(box).queryByRole('button', { name: 'Add photos' }),
    ).toBeNull();
    expect(within(box).getByText(/Your album is full/)).toBeTruthy();
  });

  it('fills in a survey, posts it, and edits it later', async () => {
    const user = open('/me');
    await finishLoad();
    const box = await screen.findByRole('region', { name: 'My surveys' });
    expect(within(box).getByText(/haven’t posted a survey/)).toBeTruthy();
    await user.click(
      within(box).getByRole('button', { name: 'Fill in a survey' }),
    );
    const first = within(box).getByRole('textbox', {
      name: survey.questions[0],
    });
    expect(first.getAttribute('maxlength')).toBe(
      String(WEB_LIMITS.surveyAnswer),
    );
    await user.type(first, 'pizza 4ever');
    await user.click(
      within(box).getByRole('button', { name: 'Post to my profile' }),
    );
    expect(pixlog()?.surveys[survey.id]?.[0]).toBe('pizza 4ever');
    expect(within(box).getByText('pizza 4ever')).toBeTruthy();
    expect(within(box).getByText(survey.questions[0]!)).toBeTruthy();

    await user.click(
      within(box).getByRole('button', { name: `Edit “${survey.title}”` }),
    );
    const again = within(box).getByRole('textbox', {
      name: survey.questions[0],
    });
    expect((again as HTMLInputElement).value).toBe('pizza 4ever');
    await user.clear(again);
    await user.type(again, 'burgers now');
    await user.click(
      within(box).getByRole('button', { name: 'Post to my profile' }),
    );
    expect(pixlog()?.surveys[survey.id]?.[0]).toBe('burgers now');
    expect(within(box).getByText('burgers now')).toBeTruthy();
    expect(localStorage.getItem('still-online:v1:web')).toContain(
      'burgers now',
    );
  });

  it('is German when the language is German', async () => {
    useSettingsStore.setState({ language: 'de' });
    const user = open('/me');
    await finishLoad();
    const box = await screen.findByRole('region', { name: 'Mein Album' });
    expect(within(box).getByText(/Dein Album ist leer/)).toBeTruthy();
    expect(screen.getByText(/Erhaltene Kudos:/)).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Mein Skin' })).toBeTruthy();
    const surveys = screen.getByRole('region', { name: 'Meine Umfragen' });
    await user.click(
      within(surveys).getByRole('button', { name: 'Umfrage ausfüllen' }),
    );
    expect(
      within(surveys).getByRole('button', { name: 'Auf mein Profil stellen' }),
    ).toBeTruthy();
  });

  it('German kudos button on a friend’s page', async () => {
    useSettingsStore.setState({ language: 'de' });
    const user = open(`/${jess.contactId}`);
    await finishLoad();
    await user.click(
      await screen.findByRole('button', { name: 'Kudos geben ★' }),
    );
    expect(
      screen.getByRole('button', { name: 'Heute schon Kudos gegeben!' }),
    ).toBeTruthy();
  });
});
