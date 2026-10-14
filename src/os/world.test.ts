import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { events } from '@/os/events';
import { storageKey } from '@/os/persist';
import {
  currentDay,
  localDateKey,
  useWorldStore,
  WORLD_DEFAULTS,
} from './world';

const world = () => useWorldStore.getState();
const at = (y: number, m: number, d: number, h = 12) =>
  new Date(y, m - 1, d, h);

let dayChanges: number[] = [];
let unlocked: string[] = [];
let offs: (() => void)[] = [];

beforeEach(() => {
  localStorage.clear();
  useWorldStore.setState({ ...WORLD_DEFAULTS, unlocks: [] });
  dayChanges = [];
  unlocked = [];
  offs = [
    events.on('world:dayChanged', ({ day }) => dayChanges.push(day)),
    events.on('world:unlock', ({ id }) => unlocked.push(id)),
  ];
});

afterEach(() => offs.forEach((off) => off()));

describe('localDateKey', () => {
  it('formats the local date with zero padding', () => {
    expect(localDateKey(at(2026, 3, 7))).toBe('2026-03-07');
    expect(localDateKey(at(2026, 12, 31, 23))).toBe('2026-12-31');
    expect(localDateKey(at(2026, 1, 1, 0))).toBe('2026-01-01');
  });
});

describe('world: days', () => {
  it('first boot sets day 1 and the date without announcing a new day', () => {
    const now = at(2026, 10, 15, 9);
    world().onBoot(now);
    expect(world()).toMatchObject({
      day: 1,
      lastRealDate: '2026-10-15',
      shutdownPending: false,
      dayStartedAt: now.getTime(),
    });
    expect(currentDay()).toBe(1);
    expect(dayChanges).toEqual([]);
  });

  it('keeps the day on a reboot the same date without a shutdown', () => {
    world().onBoot(at(2026, 10, 15, 9));
    const started = world().dayStartedAt;
    world().onBoot(at(2026, 10, 15, 22));
    world().onBoot(at(2026, 10, 15, 23));
    expect(world().day).toBe(1);
    expect(world().dayStartedAt).toBe(started);
    expect(dayChanges).toEqual([]);
  });

  it('advances after a shutdown on the same date', () => {
    world().onBoot(at(2026, 10, 15, 9));
    world().markShutdown();
    expect(world().shutdownPending).toBe(true);
    const now = at(2026, 10, 15, 10);
    world().onBoot(now);
    expect(world()).toMatchObject({
      day: 2,
      shutdownPending: false,
      dayStartedAt: now.getTime(),
    });
    expect(dayChanges).toEqual([2]);
  });

  it('advances when the real date changes, by 1 however many days passed', () => {
    world().onBoot(at(2026, 10, 15));
    world().onBoot(at(2026, 10, 16, 0));
    expect(world().day).toBe(2);
    expect(world().lastRealDate).toBe('2026-10-16');
    world().onBoot(at(2026, 12, 1));
    expect(world().day).toBe(3);
    expect(dayChanges).toEqual([2, 3]);
  });

  it('advances only once when a shutdown and a date change coincide', () => {
    world().onBoot(at(2026, 10, 15));
    world().markShutdown();
    world().markShutdown();
    world().onBoot(at(2026, 10, 17));
    expect(world().day).toBe(2);
    expect(dayChanges).toEqual([2]);
  });

  it('advances at most once per boot even when onBoot runs twice', () => {
    world().onBoot(at(2026, 10, 15));
    world().markShutdown();
    world().onBoot(at(2026, 10, 16));
    world().onBoot(at(2026, 10, 16));
    expect(world().day).toBe(2);
    expect(dayChanges).toEqual([2]);
  });

  it('defaults realNow to the current date', () => {
    world().onBoot();
    expect(world().lastRealDate).toBe(localDateKey(new Date()));
  });
});

describe('world: unlocks', () => {
  it('adds an id once, emits once, and reports it', () => {
    expect(world().hasUnlock('ponies')).toBe(false);
    world().unlock('ponies');
    world().unlock('ponies');
    world().unlock('konami');
    world().unlock('');
    expect(world().unlocks).toEqual(['ponies', 'konami']);
    expect(world().hasUnlock('ponies')).toBe(true);
    expect(unlocked).toEqual(['ponies', 'konami']);
  });
});

describe('world: persistence', () => {
  const rehydrate = async (raw: string) => {
    localStorage.setItem(storageKey('world'), raw);
    await useWorldStore.persist.rehydrate();
  };

  it('round-trips days and unlocks through localStorage', async () => {
    world().onBoot(at(2026, 10, 15));
    world().unlock('ponies');
    world().markShutdown();
    const raw = localStorage.getItem(storageKey('world'))!;
    expect(JSON.parse(raw).state).not.toHaveProperty('onBoot');
    useWorldStore.setState({ ...WORLD_DEFAULTS, unlocks: [] });
    await rehydrate(raw);
    expect(world()).toMatchObject({
      day: 1,
      lastRealDate: '2026-10-15',
      shutdownPending: true,
      unlocks: ['ponies'],
    });
    world().onBoot(at(2026, 10, 15));
    expect(world().day).toBe(2);
  });

  it('resets to day 1 on corrupt storage', async () => {
    await rehydrate('{not json');
    expect(world().day).toBe(1);
    await rehydrate(
      JSON.stringify({
        state: { day: -4, lastRealDate: '2026-10-15', unlocks: ['x'] },
        version: 1,
      }),
    );
    expect(world()).toMatchObject({ day: 1, lastRealDate: '', unlocks: [] });
    world().onBoot(at(2026, 10, 15));
    expect(world().day).toBe(1);
    expect(dayChanges).toEqual([]);
  });

  it('drops invalid fields but keeps a valid day', async () => {
    await rehydrate(
      JSON.stringify({
        state: {
          day: 3,
          lastRealDate: 'yesterday',
          shutdownPending: 'yes',
          unlocks: ['a', 7, 'a', null, 'b'],
          dayStartedAt: 'noon',
        },
        version: 1,
      }),
    );
    expect(world()).toMatchObject({
      day: 3,
      lastRealDate: '',
      shutdownPending: false,
      unlocks: ['a', 'b'],
      dayStartedAt: 0,
    });
    world().onBoot(at(2026, 10, 15));
    expect(world().day).toBe(3);
    expect(world().lastRealDate).toBe('2026-10-15');
  });
});
