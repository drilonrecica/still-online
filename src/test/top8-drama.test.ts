// P0-03 end to end: saving a Top 8 without Kayla (Friendspace) makes her react in Messenger on
// the next day's sign-in and leaves a wall entry; putting her back runs her readded script once.
// Friendspace and Messenger only meet on the event bus, through the two boot routes.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WEB_DEFAULTS, useWebStore } from '@/apps/browser/store';
import { installTop8WallRoute } from '@/apps/browser/top8WallRoute';
import { effectiveProfile } from '@/apps/browser/sites/friendspace/logic';
import { FRIEND_IDS } from '@/apps/browser/sites/friendspace/people';
import { contactContent } from '@/apps/messenger/engine/test-helpers';
import {
  getMessengerEngine,
  setMessengerContentsForTests,
} from '@/apps/messenger/runtime';
import { useMessengerStore } from '@/apps/messenger/store';
import { installTop8Route } from '@/apps/messenger/top8Route';
import {
  kaylaTop8Dropped,
  kaylaTop8Readded,
} from '@/content/contacts/top8-reactions';
import { events } from '@/os/events';
import { useSettingsStore } from '@/os/store/settings';
import { useWindowsStore } from '@/os/store/windows';
import { useWorldStore, WORLD_DEFAULTS } from '@/os/world';

let stop: (() => void)[] = [];

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  useSettingsStore.setState({ playerName: 'Ann', muted: true });
  useMessengerStore.setState(useMessengerStore.getInitialState(), true);
  useWindowsStore.setState({ windows: [], topZ: 0 });
  useWorldStore.setState({ ...WORLD_DEFAULTS });
  useWebStore.setState({ ...WEB_DEFAULTS });
  setMessengerContentsForTests([
    contactContent('kayla', [kaylaTop8Dropped, kaylaTop8Readded]),
  ]);
  stop = [installTop8Route(), installTop8WallRoute()];
});

afterEach(() => {
  for (const s of stop) s();
  setMessengerContentsForTests([]);
  vi.useRealTimers();
});

const profile = () =>
  effectiveProfile(useWebStore.getState().myProfile, FRIEND_IDS);

async function saveTop8(withKayla: boolean) {
  const p = profile();
  const top8 = p.top8.filter(
    (e) => !(e.kind === 'contact' && e.id === 'kayla'),
  );
  useWebStore.getState().saveProfile({
    ...p,
    top8: withKayla ? [...top8, { kind: 'contact', id: 'kayla' }] : top8,
  });
  await vi.dynamicImportSettled();
}

async function play() {
  for (let i = 0; i < 10; i++) {
    vi.advanceTimersByTime(5000);
    getMessengerEngine().choose('kayla', 0);
  }
  await vi.dynamicImportSettled();
}

const kayla = () => useMessengerStore.getState().progress.contacts.kayla;
const wall = () => useWebStore.getState().top8Wall;

describe('Top 8 drama end to end', () => {
  it('emits one typed web:top8Changed with the diff, only when friends change', async () => {
    const seen: unknown[] = [];
    stop.push(events.on('web:top8Changed', (c) => seen.push(c)));
    await saveTop8(false);
    await saveTop8(false);
    await saveTop8(true);
    expect(seen).toEqual([
      { dropped: ['kayla'], added: [] },
      { dropped: [], added: ['kayla'] },
    ]);
  });

  it('drop → reaction the next day + wall entry; re-add → readded once', async () => {
    await saveTop8(false);
    expect(useMessengerStore.getState().progress.top8).toEqual({
      kayla: { state: 'dropped', day: 1 },
    });

    // Same day: nothing.
    getMessengerEngine().signIn();
    await play();
    expect(kayla()?.transcript ?? []).toEqual([]);
    getMessengerEngine().signOut();

    // Next day's sign-in: she noticed overnight.
    useWorldStore.setState({ day: 2 });
    getMessengerEngine().signIn();
    await play();
    const runs = () => kayla()?.scripts['top8-dropped']?.runs;
    expect(runs()).toBe(1);
    expect(wall()).toEqual([{ contactId: 'kayla', kind: 'dropped', day: 2 }]);

    // Put her back: she's online, so she answers at once.
    await saveTop8(true);
    await play();
    expect(kayla()?.scripts['top8-readded']?.runs).toBe(1);
    expect(wall()).toEqual([
      { contactId: 'kayla', kind: 'dropped', day: 2 },
      { contactId: 'kayla', kind: 'readded', day: 2 },
    ]);
    expect(useMessengerStore.getState().progress.top8).toBeUndefined();

    // Another sign-in or save changes nothing.
    getMessengerEngine().signOut();
    useWorldStore.setState({ day: 3 });
    await saveTop8(true);
    getMessengerEngine().signIn();
    await play();
    expect(runs()).toBe(1);
    expect(wall()).toHaveLength(2);
  });

  it('counts a drop from the never-saved default Top 8', async () => {
    expect(useWebStore.getState().myProfile).toBeNull();
    await saveTop8(false);
    expect(useMessengerStore.getState().progress.top8?.kayla?.state).toBe(
      'dropped',
    );
  });
});
