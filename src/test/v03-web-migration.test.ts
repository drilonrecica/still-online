// A v0.3 `web` save (src/test/fixtures/v03-web.json) loads unchanged under v0.4: the only changes
// are the Top 8 migrating to typed entries and the Spaceport → Friendspace favorite redirect
// (P0-01). No new v0.4 field appears until the player uses it.
import { beforeEach, describe, expect, it } from 'vitest';
import { useWebStore } from '@/apps/browser/store';
import save from './fixtures/v03-web.json';

const KEY = 'still-online:v1:web';
const v03 = save.state;

const expected = {
  ...v03,
  favorites: v03.favorites.map((f) => ({
    ...f,
    url: f.url.replace('spaceport.example', 'friendspace.example'),
  })),
  myProfile: {
    ...v03.myProfile,
    top8: v03.myProfile.top8.map((id) => ({ kind: 'contact', id })),
  },
};

const persisted = (s: ReturnType<typeof useWebStore.getState>) => ({
  favorites: s.favorites,
  counters: s.counters,
  guestbook: s.guestbook,
  votes: s.votes,
  myProfile: s.myProfile,
  bulletinsSeen: s.bulletinsSeen,
  top8Wall: s.top8Wall,
  pixlog: s.pixlog,
});

beforeEach(async () => {
  localStorage.clear();
  localStorage.setItem(KEY, JSON.stringify(save));
  await useWebStore.persist.rehydrate();
});

describe('v0.3 web save under v0.4', () => {
  it('loads unchanged except for the Top 8 migration and the favorite redirect', () => {
    const state = persisted(useWebStore.getState());
    expect(state).toEqual(expected);
    expect(state.bulletinsSeen).toBeUndefined();
    expect(state.top8Wall).toBeUndefined();
    expect(state.pixlog).toBeUndefined();
    expect(state.myProfile).not.toHaveProperty('layoutCode');
    expect(state.myProfile).not.toHaveProperty('autoplay');
    expect(state.myProfile).not.toHaveProperty('moodHistory');
  });

  it('writes back the same shape with no new keys', () => {
    useWebStore.setState({});
    const written = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    expect(written).toEqual({ state: expected, version: 1 });
  });

  it('a v0.4 save round-trips its new fields', async () => {
    const s = useWebStore.getState();
    s.markBulletinsSeen(3);
    s.appendTop8Wall({ contactId: 'kayla', kind: 'dropped', day: 3 });
    s.giveKudos('jess', 2);
    s.saveProfile({
      ...s.myProfile!,
      layoutCode: '[layout bg=starry]',
      autoplay: false,
      moodHistory: [{ text: 'bored', emoticon: ':P', day: 1 }],
    });
    const before = persisted(useWebStore.getState());
    await useWebStore.persist.rehydrate();
    expect(persisted(useWebStore.getState())).toEqual(before);
  });
});
