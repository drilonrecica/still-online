// Friendspace v0.4 content shapes (P0-02): bulletins, band pages, Top 8 reactions and the
// player's typed Top 8. Profiles keep their own types in ./profiles/types.ts.
// See docs/architecture-v0.4.md → "Content types".
import type { ContactId } from '../types';
import type { ProfileTheme } from './profiles/types';

/** A band page id (`/band/<id>`), e.g. `tinfoil-comets`. */
export type BandId = string;

/** A Friendspace bulletin; shows on `/bulletins` (and the newest 3 on `/me`) from `day` on. */
export interface Bulletin {
  id: string;
  day: number;
  /** A friend (links to their profile) or a Top 8 extra (pattern picture from `seed`). */
  from: { contactId: ContactId } | { extra: string; seed: string };
  subject: string;
  /** May use the `rich.tsx` inline markup and `{name}` (the player's name). */
  body: string;
  /** A `*.example` URL rendered as a link under the body. */
  link?: string;
}

export interface Band {
  id: BandId;
  name: string;
  genre: string;
  hometown: string;
  bio: string;
  /** Playlist track ids (`src/content/playlist.ts`) the band player lists, in order. */
  trackIds: readonly string[];
  /** Day-gated: shown from `day` on. */
  shows: readonly BandShow[];
  blog: readonly { day: number; title: string; body: string }[];
  theme: ProfileTheme;
}

/** A line under a band's shows, out from `day`. */
export interface BandShow {
  day: number;
  text: string;
  /** Hidden from this day on: the show happened, or a later line replaced it. */
  until?: number;
  /** A recap of a played show: listed under Past Shows instead of Upcoming Shows. */
  past?: true;
}

/** One friend's wall lines on the player's `/me` after a Top 8 drop and a re-add. */
export interface Top8Reaction {
  contactId: ContactId;
  /** May use `{name}`. */
  dropped: string;
  readded: string;
}

/** An entry in the player's Top 8 (`web.myProfile.top8`). */
export type PlayerTopEntry =
  | { kind: 'contact'; id: ContactId }
  | { kind: 'band'; id: BandId }
  | { kind: 'extra'; name: string; seed: string };
