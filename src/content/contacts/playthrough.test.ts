// M2 gate: plays every path of every shipped script through the real engine with fake timers.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CONTACT_OVERLAYS } from '../de/bundle';
import { setup } from '@/apps/messenger/engine/test-helpers';
import { translate } from '@/i18n/t';
import { WALLPAPERS } from '@/os/wallpapers/registry';
import type { Locale } from '@/i18n/types';
import type { Gender } from '@/os/types';
import { GENDERS } from '../gender';
import { overlayFallbacks, rawContentFor } from '../locale';
import { PLAYLIST } from '../playlist';
import type { ContactContent, Script } from '../types';
import { contacts } from './index';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-14T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

/** Every choice-index sequence from `start` to an `end` node (cycles cut). */
function paths(script: Script): number[][] {
  const out: number[][] = [];
  const walk = (id: string, taken: number[], seen: string[]) => {
    const node = script.nodes[id];
    if (!node || seen.includes(id)) return;
    if ('choices' in node) {
      node.choices.forEach((c, i) =>
        walk(c.next, [...taken, i], [...seen, id]),
      );
    } else out.push(taken);
  };
  walk(script.start, [], []);
  return out;
}

function playPath(
  content: ContactContent,
  script: Script,
  picks: number[],
  onUnlock?: (id: string) => void,
  gender: Gender = 'girl',
) {
  const id = content.contact.id;
  localStorage.clear(); // each path is a fresh player: scripts run once per save
  const { trigger } = script;
  // A follow-up needs its target to have run: a stand-in that ends at once on sign-in.
  const target: Script[] =
    trigger.type === 'afterScript'
      ? [
          {
            id: trigger.scriptId,
            trigger: { type: 'onSignIn' },
            start: 'x',
            nodes: { x: { lines: [], end: true } },
          },
        ]
      : [];
  const solo: ContactContent = { ...content, scripts: [...target, script] };
  // A day script needs the world on its day before sign-in; a Top 8 drop reacts a day later.
  const day =
    trigger.type === 'onDay'
      ? trigger.day
      : trigger.type === 'onTop8Dropped'
        ? 2
        : 1;
  const t = setup([solo], {
    getDay: () => day,
    onUnlock,
    getGender: () => gender,
  });
  // Top 8 drama: dropped on day 1, and for a re-add already reacted to.
  if (trigger.type === 'onTop8Dropped' || trigger.type === 'onTop8Readded') {
    const state = trigger.type === 'onTop8Dropped' ? 'dropped' : 'reacted';
    const { progress } = t.store.getState();
    t.store.setState({
      progress: { ...progress, top8: { [id]: { state, day: 1 } } },
    });
  }
  t.engine.signIn();
  vi.advanceTimersByTime(content.contact.signInAfterMs + 1);

  if (trigger.type === 'afterMinutes' || trigger.type === 'afterScript') {
    vi.advanceTimersByTime(trigger.minutes * 60_000);
  } else if (trigger.type === 'onNowPlaying') {
    // A track-specific script only fires for its own track. `{artist}`/`{title}` render from
    // the playlist, so the track is a real one.
    const track =
      PLAYLIST.find((p) => p.id === trigger.trackId) ?? PLAYLIST[0]!;
    t.engine.nowPlaying({
      trackId: track.id,
      artist: track.artist,
      title: track.title,
    });
  } else if (trigger.type === 'onGameScore') {
    t.engine.gameScore(trigger.game, Math.max(trigger.minScore ?? 0, 420));
  } else if (trigger.type === 'onPlayerNudge') {
    t.engine.playerNudge(id);
  } else if (trigger.type === 'onTop8Readded') {
    t.engine.top8Changed({ dropped: [], added: [id] });
  }

  const visited: string[] = [];
  const settle = () => {
    for (let i = 0; i < 40 && !t.engine.getChoices(id)?.length; i++) {
      if (t.log.includes(`end ${id}/${script.id}`)) break;
      vi.advanceTimersByTime(5_000);
    }
  };
  settle();
  for (const pick of picks) {
    const node = t.progress(id).active?.nodeId;
    if (node) visited.push(node);
    expect(
      t.engine.getChoices(id)?.length,
      `choices at ${node}`,
    ).toBeGreaterThan(pick);
    t.engine.choose(id, pick);
    settle();
  }
  return { t, id, visited };
}

const LOCALES: readonly Locale[] = ['en', 'de'];
const COMBOS = LOCALES.flatMap((locale) =>
  GENDERS.map((gender) => [locale, gender] as const),
);

// The engine plays the raw content (variants unresolved) and resolves live lines and choices for
// the player's gender, as the app does.
describe.each(COMBOS)(
  'M2 gate (%s, %s): every script, every path, plays to its end',
  (locale, gender) => {
    for (const content of rawContentFor(locale).contacts) {
      for (const script of content.scripts) {
        const all = paths(script);
        // A gendered script (G2-03) plays for its gender and never starts for the other.
        if (script.forGender !== undefined && script.forGender !== gender) {
          it(`${content.contact.id}/${script.id}: never runs for a ${gender}`, () => {
            const { t, id } = playPath(content, script, [], undefined, gender);
            expect(t.log).not.toContain(`start ${id}/${script.id}`);
            expect(t.progress(id).scripts[script.id]).toBeUndefined();
          });
          continue;
        }
        it(`${content.contact.id}/${script.id}: ${all.length} path(s) end cleanly`, () => {
          expect(all.length).toBeGreaterThan(0);
          for (const picks of all) {
            const { t, id } = playPath(
              content,
              script,
              picks,
              undefined,
              gender,
            );
            expect(t.log, picks.join(',')).toContain(`end ${id}/${script.id}`);
            expect(t.progress(id).active).toBeNull();
            const said = t.said(id).join('\n');
            expect(said).not.toMatch(/\{[^}]*\}/);
            expect(said).not.toMatch(/[\uE000-\uE002]/);
            expect(t.log.join('\n')).not.toMatch(/[\uE000-\uE002]/);
            expect(said).toContain('<');
          }
        });
      }
    }
  },
);

describe('G-02: a chat line varies by gender', () => {
  const marco = rawContentFor('de').contacts.find(
    (c) => c.contact.id === 'marco',
  );
  const script = marco?.scripts.find((s) =>
    Object.values(s.nodes).some((n) =>
      n.lines.some((l) => l.text?.includes('siehste. deswegen')),
    ),
  );

  it.each([
    ['girl', 'meine lieblingscousine'],
    ['boy', 'mein lieblingscousin'],
  ] as const)('German Marco calls a %s „%s“', (gender, words) => {
    if (!marco || !script) throw new Error('marco line missing');
    const hit = paths(script).some((picks) => {
      const { t, id } = playPath(marco, script, picks, undefined, gender);
      return t.said(id).some((l) => l.includes(`deswegen bist du ${words}`));
    });
    expect(hit).toBe(true);
  });
});

/** Everything a script says and offers on every path, played for `locale` and `gender`. */
function playedAll(
  locale: Locale,
  gender: Gender,
  contactId: string,
  scriptId: string,
): string {
  const content = rawContentFor(locale).contacts.find(
    (c) => c.contact.id === contactId,
  );
  const script = content?.scripts.find((s) => s.id === scriptId);
  if (!content || !script) throw new Error(`${contactId}/${scriptId} missing`);
  return paths(script)
    .map((picks) => {
      const { t, id } = playPath(content, script, picks, undefined, gender);
      return [...t.said(id), ...t.log].join('\n');
    })
    .join('\n');
}

describe('G-04: chats about the player follow the gender', () => {
  it('Kayla gets movie night from a boy and a sleepover from a girl', () => {
    const boy = playedAll('en', 'boy', 'kayla', 'day3');
    expect(boy).toContain('Movie night');
    expect(boy).toContain('a COUNTER movie night. but better');
    expect(boy).not.toContain('Our own sleepover');
    expect(boy).not.toContain('face masks');
    const girl = playedAll('en', 'girl', 'kayla', 'day3');
    expect(girl).toContain('a COUNTER sleepover. but better');
    expect(playedAll('de', 'boy', 'kayla', 'day3')).toContain('Filmabend');
  });

  it("a boy's concert sign asks Ziggy for a drumstick, not marriage", () => {
    const boy = playedAll('en', 'boy', 'jess', 'followup1');
    expect(boy).toContain('Throw a drumstick');
    expect(boy).not.toMatch(/marry/i);
    expect(playedAll('en', 'girl', 'jess', 'followup1')).toContain(
      'Ziggy marry me',
    );
    expect(playedAll('de', 'boy', 'jess', 'followup1')).not.toMatch(/heirate/i);
  });

  it("Theo's bean line is buddy banter for a boy", () => {
    const boy = playedAll('en', 'boy', 'theo', 'followup1');
    expect(boy).toContain('beans r legit. bean cell');
    expect(boy).toMatch(/^< heh. ok :\)$/m);
    expect(boy).not.toMatch(/^< :\)$/m);
    expect(boy).not.toContain('thats cute');
    expect(playedAll('en', 'girl', 'theo', 'followup1')).toMatch(/^< :\)$/m);
  });

  it.each([
    ['girl', 'meine partnerin', 'die BESTE'],
    ['boy', 'mein partner', 'der BESTE'],
  ] as const)(
    'German friends use natural forms for a %s („%s“, „%s“)',
    (gender, partner, best) => {
      expect(playedAll('de', gender, 'theo', 'opening')).toContain(
        `du bist ${partner} fürs zell-referat`,
      );
      expect(playedAll('de', gender, 'theo', 'day5')).toContain(
        `danke, dass du ${partner} warst`,
      );
      expect(playedAll('de', gender, 'jess', 'day5')).toContain(
        `du bist ${best}`,
      );
    },
  );

  it('a boy has no crush in any chat', () => {
    for (const locale of LOCALES) {
      for (const content of rawContentFor(locale).contacts) {
        for (const script of content.scripts) {
          // Girl-only threads never run for him (checked in the M2 gate above).
          if (script.forGender === 'girl') continue;
          const said = playedAll(locale, 'boy', content.contact.id, script.id);
          expect(
            said,
            `${locale} ${content.contact.id}/${script.id}`,
          ).not.toMatch(/crush|marry me|schwarm|heirate mich/i);
        }
      }
    }
  });
});

describe('G2-03: boy-only threads', () => {
  const BOY_THREADS = [
    ['marco', 'lanParty', 'bring ur own cable. and chips. mostly chips'],
    ['dex', 'skateSession', 'bring the helmet ur mom bought. or dont tell her'],
    ['marco', 'cheatTrade', 'cheatcave.example'],
    ['dex', 'wrestling', 'THE MODEM MAULER? lol. ok ur in'],
    ['marco', 'roadie', 'pay: a crew shirt'],
    ['dex', 'videoNight', 'kickflipkings.example/video'],
    ['marco', 'lanRematch', 'u and me vs roommate and derek. derek yells'],
    ['dex', 'jamCourse', 'bring the dragon helmet'],
    ['marco', 'loadInCrew', 'then he ran out of shirt on CREW'],
  ] as const;

  it.each(BOY_THREADS)(
    '%s/%s is boy-only and says „%s“',
    (id, scriptId, words) => {
      const script = contacts
        .find((c) => c.contact.id === id)
        ?.scripts.find((s) => s.id === scriptId);
      expect(script?.forGender).toBe('boy');
      expect(playedAll('en', 'boy', id, scriptId)).toContain(words);
    },
  );

  it('German threads are real German', () => {
    expect(playedAll('de', 'boy', 'dex', 'wrestling')).toContain(
      'DER MODEM-MÄHDRESCHER? lol. ok du bist dabei',
    );
    expect(playedAll('de', 'boy', 'marco', 'lanParty')).toContain(
      'vor allem chips',
    );
  });

  it('each thread follows its day script, so it fires on that day', () => {
    const days = {
      lanParty: 'followup2',
      cheatTrade: 'day2',
      roadie: 'day4',
      lanRematch: 'day7',
      loadInCrew: 'day10',
    };
    const dexDays = {
      skateSession: 'day2',
      wrestling: 'day3',
      videoNight: 'day5',
      jamCourse: 'day8',
    };
    for (const [id, map] of [
      ['marco', days],
      ['dex', dexDays],
    ] as const) {
      const content = contacts.find((c) => c.contact.id === id);
      for (const [scriptId, after] of Object.entries(map)) {
        const t = content?.scripts.find((s) => s.id === scriptId)?.trigger;
        expect(t?.type === 'afterScript' && t.scriptId, scriptId).toBe(after);
      }
    }
  });

  // W1-03: the week-two threads start after their day script for a boy, never for a girl.
  it.each([
    ['marco', 'lanRematch', 'day7'],
    ['dex', 'jamCourse', 'day8'],
    ['marco', 'loadInCrew', 'day10'],
  ] as const)('%s/%s runs after %s only for a boy', (id, scriptId, after) => {
    for (const locale of LOCALES) {
      const content = rawContentFor(locale).contacts.find(
        (c) => c.contact.id === id,
      );
      const script = content?.scripts.find((s) => s.id === scriptId);
      if (!content || !script) throw new Error(`${id}/${scriptId} missing`);
      const boy = playPath(
        content,
        script,
        paths(script)[0]!,
        undefined,
        'boy',
      );
      expect(boy.t.log).toContain(`end ${boy.id}/${scriptId}`);
      const girl = playPath(content, script, [], undefined, 'girl');
      expect(girl.t.log).not.toContain(`start ${girl.id}/${scriptId}`);
      expect(girl.t.progress(girl.id).scripts[scriptId]).toBeUndefined();
      const t = script.trigger;
      expect(t.type === 'afterScript' && t.scriptId).toBe(after);
    }
  });
});

describe('W1: girl-only threads', () => {
  const GIRL_THREADS = [
    ['jess', 'lateNight', 'day8', 'theo says sorry to u in a CUTE way'],
    ['jess', 'signWorkshop', 'day9', 'its a SERIES now'],
    ['kayla', 'outfitPick', 'day9', 'destiny: sealed'],
  ] as const;

  it.each(GIRL_THREADS)(
    '%s/%s is girl-only, follows %s and says „%s“',
    (id, scriptId, after, words) => {
      const script = contacts
        .find((c) => c.contact.id === id)
        ?.scripts.find((s) => s.id === scriptId);
      expect(script?.forGender).toBe('girl');
      const t = script?.trigger;
      expect(t?.type === 'afterScript' && t.scriptId).toBe(after);
      expect(playedAll('en', 'girl', id, scriptId)).toContain(words);
    },
  );

  it('every late-night branch ends on „ok ok. nite (L)“', () => {
    const jess = contacts.find((c) => c.contact.id === 'jess')!;
    const script = jess.scripts.find((s) => s.id === 'lateNight')!;
    for (const picks of paths(script)) {
      const { t, id } = playPath(jess, script, picks, undefined, 'girl');
      expect(t.said(id).at(-1), picks.join(',')).toBe('< ok ok. nite (L)');
    }
  });
});

/** Friends whose German overlay is complete (all six since P2-04). */
const TRANSLATED = ['jess', 'kayla', 'dex', 'theo', 'marco', 'pia'];

describe('P2-02: German overlays have no English fallback', () => {
  it.each(TRANSLATED)('%s is fully German', (id) => {
    const content = contacts.find((c) => c.contact.id === id);
    if (!content) throw new Error(`${id} missing`);
    expect(overlayFallbacks(content, CONTACT_OVERLAYS[id])).toEqual([]);
  });
});

describe("P2-04: Pia's day-5 present", () => {
  it('unlocks Pony Paradise and points at the backgrounds on every path', () => {
    const pia = contacts.find((c) => c.contact.id === 'pia');
    const script = pia?.scripts.find((s) => s.id === 'day5');
    if (!pia || !script) throw new Error('pia/day5 missing');
    for (const picks of paths(script)) {
      const unlocks: string[] = [];
      const { t, id } = playPath(pia, script, picks, (u) => unlocks.push(u));
      expect(unlocks, picks.join(',')).toEqual(['ponies']);
      expect(t.said(id).join('\n')).toContain('look at the backrounds');
    }
    const ponies = WALLPAPERS.find((w) => w.unlock === 'ponies');
    expect(ponies && translate('en', ponies.nameKey)).toBe('Pony Paradise');
  });
});

describe("W1-02: Theo's day-10 poster", () => {
  it.each(COMBOS)(
    'unlocks the lantern poster once on every path (%s, %s)',
    (locale, gender) => {
      const theo = rawContentFor(locale).contacts.find(
        (c) => c.contact.id === 'theo',
      );
      const script = theo?.scripts.find((s) => s.id === 'day10');
      if (!theo || !script) throw new Error('theo/day10 missing');
      for (const picks of paths(script)) {
        const unlocks: string[] = [];
        const { t, id } = playPath(
          theo,
          script,
          picks,
          (u) => unlocks.push(u),
          gender,
        );
        expect(unlocks, picks.join(',')).toEqual(['lantern-poster']);
        if (locale === 'en')
          expect(t.said(id).join('\n')).toContain('pia said she knows how');
      }
    },
  );

  it('no other script unlocks it', () => {
    for (const { contact, scripts } of contacts)
      for (const s of scripts)
        for (const n of Object.values(s.nodes))
          for (const l of n.lines)
            if (l.unlock === 'lantern-poster')
              expect(`${contact.id}/${s.id}`).toBe('theo/day10');
  });
});

describe('P6-07: game reactions', () => {
  it('every friend reacts to at least one game', () => {
    for (const { contact, scripts } of contacts) {
      expect(
        scripts.some((s) => s.trigger.type === 'onGameScore'),
        contact.id,
      ).toBe(true);
    }
  });
});
