// Friendspace band pages in week two (days 6–10, bible §6): Velvet Lantern books the rec hall (6),
// argues the setlist (7), plays the player's song with The Grip Tapes opening (8) and plays to 83
// people (10, after the show). Tinfoil Comets sell out Lakeview (8) and play it the same night (10).
// Shows that happened move to Past Shows (`until` / `past`); The Sugarcube Parade books the fall fair.
import { g } from '../gender';
import type { Band, BandId } from './types';

export type BandWeek = Pick<Band, 'shows' | 'blog'>;

export const TINFOIL_COMETS_WEEK2: BandWeek = {
  shows: [
    { day: 6, text: 'THIS SATURDAY - Lakeview Fairgrounds', until: 8 },
    {
      day: 8,
      text: 'Lakeview Fairgrounds - SOLD OUT in 9 minutes!!! we r as shocked as u',
      until: 10,
    },
    { day: 6, text: 'next week - The Rocket Room' },
    {
      day: 10,
      text: 'Lakeview Fairgrounds. windy. sold out. thank u ponchos',
      past: true,
    },
  ],
  blog: [
    {
      day: 10,
      title: 'lakeview!!!',
      body: 'outdoor show = WIND. buzz lost his tinfoil hat in song 2. we played the rest without it. if u find a hat, its his',
    },
  ],
};

export const VELVET_LANTERN_WEEK2: BandWeek = {
  shows: [
    {
      day: 6,
      text: 'the westfield rec hall. saturday. 80 people. all ages. for real this time',
      until: 10,
    },
    {
      day: 8,
      text: 'opener: the grip tapes. 3 songs. one about rain',
      until: 10,
    },
    {
      day: 10,
      text: 'played. 83 people. the mic was upside down. so were we',
      past: true,
    },
  ],
  blog: [
    {
      day: 7,
      title: 'setlist',
      body: 'setlist meeting. 3 hours. 8 songs. derek wanted the bucket in every song. the bucket is in 3. derek negotiated like a lawyer',
    },
    {
      day: 8,
      title: 'new song',
      body: `new song in the set. ${g('"lantern heart"', '"56k"')}. lyrics by my cousin. small letters. like the credits in dex's video. i changed one word. ok four`,
    },
    {
      day: 10,
      title: '83',
      body: 'i said like 12. i was off by 71. someone threw a pick. it was me. the bucket got kicked over in a 4th song. mr dalton poked it. thanks to all 83 of u',
    },
  ],
};

export const GRIP_TAPES_WEEK2: BandWeek = {
  shows: [
    {
      day: 8,
      text: 'saturday - opening 4 velvet lantern @ the rec hall. inside. no boards. we said ok',
      until: 10,
    },
    {
      day: 10,
      text: 'the rec hall. 3 songs. the one about rain. it did not rain. nobody fell',
      past: true,
    },
  ],
  blog: [],
};

export const SUGARCUBE_PARADE_WEEK2: BandWeek = {
  shows: [
    {
      day: 6,
      text: 'next month - the fall fair at the duck pond. bring a spoon (again)',
    },
  ],
  blog: [],
};

/** The week-two additions per band page. */
export const BANDS_WEEK2: Readonly<Record<BandId, BandWeek>> = {
  'tinfoil-comets': TINFOIL_COMETS_WEEK2,
  'velvet-lantern': VELVET_LANTERN_WEEK2,
  'grip-tapes': GRIP_TAPES_WEEK2,
  'sugarcube-parade': SUGARCUBE_PARADE_WEEK2,
};

/** `bands` with each one's `weeks` shows and posts appended (earlier ones keep their positions). */
export function withBandWeeks(
  bands: readonly Band[],
  weeks: Readonly<Record<BandId, BandWeek>>,
): readonly Band[] {
  return bands.map((b) => {
    const week = weeks[b.id];
    return week
      ? {
          ...b,
          shows: [...b.shows, ...week.shows],
          blog: [...b.blog, ...week.blog],
        }
      : b;
  });
}
